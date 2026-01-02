const express = require("express");
const { pool } = require("../db/pg");
const { requireAuth } = require("../middleware/auth");
const { requireRole } = require("../middleware/roles");

const router = express.Router();

/**
 * GET /events
 * Optional query:
 *  - category=concert
 *  - bbox=minLon,minLat,maxLon,maxLat
 */
router.get("/", async (req, res) => {
  const { category, bbox } = req.query;

  let where = [];
  let params = [];

  if (category) {
    params.push(category);
    where.push(`category = $${params.length}`);
  }

  if (bbox) {
    const parts = String(bbox).split(",").map(Number);
    if (parts.length === 4 && parts.every(Number.isFinite)) {
      const [minLon, minLat, maxLon, maxLat] = parts;
      params.push(minLon, minLat, maxLon, maxLat);
      where.push(`
        ST_Within(
          geom,
          ST_MakeEnvelope($${params.length-3}, $${params.length-2}, $${params.length-1}, $${params.length}, 4326)
        )
      `);
    }
  }

  const whereSql = where.length ? `WHERE ${where.join(" AND ")}` : "";
  const q = `
    SELECT
      id, title, description, category, start_time, end_time, price, created_by,
      ST_AsGeoJSON(geom)::json AS geom
    FROM events
    ${whereSql}
    ORDER BY start_time DESC
    LIMIT 200;
  `;
  const r = await pool.query(q, params);
  res.json(r.rows);
});

/**
 * POST /events
 * Body: {title, description?, category, start_time, end_time?, price?, lon, lat}
 * Only admin/organizer
 */
router.post("/", requireAuth, requireRole("admin", "organizer"), async (req, res) => {
  const { title, description, category, start_time, end_time, price, lon, lat } = req.body;

  if (!title || !category || !start_time || lon === undefined || lat === undefined) {
    return res.status(400).json({ message: "Missing fields" });
  }

  const q = `
    INSERT INTO events (title, description, category, start_time, end_time, price, created_by, geom)
    VALUES ($1,$2,$3,$4,$5,$6,$7, ST_SetSRID(ST_MakePoint($8,$9), 4326))
    RETURNING id;
  `;

  const r = await pool.query(q, [
    title,
    description || null,
    category,
    start_time,
    end_time || null,
    price ?? null,
    req.user.id,
    lon,
    lat,
  ]);

  res.status(201).json({ id: r.rows[0].id });
});

/**
 * PATCH /events/:id
 * Admin can update any. Organizer can update only own.
 * (If lon/lat provided together -> geometry updates)
 */
router.patch("/:id", requireAuth, async (req, res) => {
  const { id } = req.params;

  const ownerQ = await pool.query("SELECT created_by FROM events WHERE id=$1", [id]);
  if (ownerQ.rowCount === 0) return res.status(404).json({ message: "Event not found" });

  const createdBy = ownerQ.rows[0].created_by;
  const isAdmin = req.user.role === "admin";
  const isOwner = req.user.id === createdBy;

  if (!isAdmin && !isOwner) return res.status(403).json({ message: "Not allowed" });

  const allowed = ["title", "description", "category", "start_time", "end_time", "price"];
  let set = [];
  let params = [];

  for (const key of allowed) {
    if (req.body[key] !== undefined) {
      params.push(req.body[key]);
      set.push(`${key}=$${params.length}`);
    }
  }

  // geometry update
  if (req.body.lon !== undefined && req.body.lat !== undefined) {
    params.push(req.body.lon, req.body.lat);
    set.push(`geom = ST_SetSRID(ST_MakePoint($${params.length-1}, $${params.length}), 4326)`);
  }

  if (set.length === 0) return res.status(400).json({ message: "No fields to update" });

  params.push(id);
  const q = `UPDATE events SET ${set.join(", ")}, updated_at=now() WHERE id=$${params.length};`;
  await pool.query(q, params);

  res.json({ message: "Updated" });
});

/**
 * DELETE /events/:id
 * Admin can delete any. Organizer can delete only own.
 */
router.delete("/:id", requireAuth, async (req, res) => {
  const { id } = req.params;

  const r = await pool.query("SELECT created_by FROM events WHERE id=$1", [id]);
  if (r.rowCount === 0) return res.status(404).json({ message: "Event not found" });

  const createdBy = r.rows[0].created_by;
  const isAdmin = req.user.role === "admin";
  const isOwner = req.user.id === createdBy;

  if (!isAdmin && !isOwner) return res.status(403).json({ message: "Not allowed" });

  await pool.query("DELETE FROM events WHERE id=$1", [id]);
  res.json({ message: "Deleted" });
});

module.exports = router;
