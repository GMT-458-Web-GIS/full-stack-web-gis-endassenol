const express = require("express");
const { pool } = require("../db/pg");
const { requireAuth } = require("../middleware/auth");
const { requireRole } = require("../middleware/roles");

const router = express.Router();

/**
 * @swagger
 * tags:
 *   - name: Events
 *     description: Urban events & facilities (PostGIS)
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Event:
 *       type: object
 *       properties:
 *         id: { type: string, format: uuid }
 *         title: { type: string }
 *         description: { type: string, nullable: true }
 *         category: { type: string }
 *         start_time: { type: string, format: date-time }
 *         end_time: { type: string, format: date-time, nullable: true }
 *         price: { type: number, nullable: true }
 *         created_by: { type: string, format: uuid }
 *         geom:
 *           type: object
 *           description: GeoJSON geometry
 *           example:
 *             type: Point
 *             coordinates: [32.8597, 39.9228]
 *
 *     EventCreateRequest:
 *       type: object
 *       required: [title, category, start_time, lon, lat]
 *       properties:
 *         title: { type: string, example: "WebGIS Workshop" }
 *         description: { type: string, example: "PostGIS test event" }
 *         category: { type: string, example: "workshop" }
 *         start_time: { type: string, format: date-time, example: "2026-01-10T10:00:00+03:00" }
 *         end_time: { type: string, format: date-time, nullable: true }
 *         price: { type: number, nullable: true, example: 0 }
 *         lon: { type: number, example: 32.8597 }
 *         lat: { type: number, example: 39.9228 }
 *
 *     EventUpdateRequest:
 *       type: object
 *       description: Provide any fields you want to update. If you provide lon & lat together, geometry is updated.
 *       properties:
 *         title: { type: string }
 *         description: { type: string, nullable: true }
 *         category: { type: string }
 *         start_time: { type: string, format: date-time }
 *         end_time: { type: string, format: date-time, nullable: true }
 *         price: { type: number, nullable: true }
 *         lon: { type: number }
 *         lat: { type: number }
 */

/**
 * @swagger
 * /events:
 *   get:
 *     summary: List events (optionally filter by category or bbox)
 *     tags: [Events]
 *     parameters:
 *       - in: query
 *         name: category
 *         schema: { type: string }
 *         required: false
 *         description: Filter by event category (e.g., concert, workshop)
 *       - in: query
 *         name: bbox
 *         schema: { type: string }
 *         required: false
 *         description: Bounding box filter as "minLon,minLat,maxLon,maxLat" in EPSG:4326
 *         example: "32.80,39.85,32.95,40.00"
 *     responses:
 *       200:
 *         description: Array of events (GeoJSON geometry included)
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: "#/components/schemas/Event"
 */
router.get("/", async (req, res) => {
  const { category, bbox } = req.query;

  let where = [];
  let params = [];

  if (category) {
    params.push(category);
    where.push(`category = $${params.length}`);
  }

  // IMPORTANT: use bbox operator "&&" to benefit from GiST index
  if (bbox) {
    const parts = String(bbox).split(",").map(Number);
    if (parts.length === 4 && parts.every(Number.isFinite)) {
      const [minLon, minLat, maxLon, maxLat] = parts;
      params.push(minLon, minLat, maxLon, maxLat);
      where.push(`
        geom && ST_MakeEnvelope(
          $${params.length - 3}, $${params.length - 2},
          $${params.length - 1}, $${params.length},
          4326
        )
      `);
    } else {
      return res.status(400).json({ message: "Invalid bbox format. Use minLon,minLat,maxLon,maxLat" });
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
 * @swagger
 * /events:
 *   post:
 *     summary: Create a new event (admin/organizer)
 *     tags: [Events]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: "#/components/schemas/EventCreateRequest"
 *     responses:
 *       201:
 *         description: Created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id: { type: string, format: uuid }
 *       400:
 *         description: Missing fields
 *       401:
 *         description: Missing/invalid token
 *       403:
 *         description: Not allowed (role)
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
 * @swagger
 * /events/{id}:
 *   patch:
 *     summary: Update an event (admin any, owner only own)
 *     tags: [Events]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: "#/components/schemas/EventUpdateRequest"
 *     responses:
 *       200:
 *         description: Updated
 *       400:
 *         description: No fields to update
 *       401:
 *         description: Missing/invalid token
 *       403:
 *         description: Not allowed
 *       404:
 *         description: Event not found
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

  // geometry update (requires both)
  if (req.body.lon !== undefined && req.body.lat !== undefined) {
    params.push(req.body.lon, req.body.lat);
    set.push(`geom = ST_SetSRID(ST_MakePoint($${params.length - 1}, $${params.length}), 4326)`);
  }

  if (set.length === 0) return res.status(400).json({ message: "No fields to update" });

  params.push(id);
  const q = `UPDATE events SET ${set.join(", ")}, updated_at=now() WHERE id=$${params.length};`;
  await pool.query(q, params);

  res.json({ message: "Updated" });
});

/**
 * @swagger
 * /events/{id}:
 *   delete:
 *     summary: Delete an event (admin any, owner only own)
 *     tags: [Events]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Deleted
 *       401:
 *         description: Missing/invalid token
 *       403:
 *         description: Not allowed
 *       404:
 *         description: Event not found
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
