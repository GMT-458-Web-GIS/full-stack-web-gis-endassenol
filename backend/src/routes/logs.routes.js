/**
 * @swagger
 * /logs:
 *   get:
 *     summary: Get recent request logs (MongoDB)
 *     tags: [Logs]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           example: 50
 *         description: Max number of logs to return (max 200)
 *       - in: query
 *         name: method
 *         schema:
 *           type: string
 *           example: GET
 *         description: Filter by HTTP method
 *       - in: query
 *         name: status
 *         schema:
 *           type: integer
 *           example: 200
 *         description: Filter by status code
 *       - in: query
 *         name: path
 *         schema:
 *           type: string
 *           example: /events
 *         description: Filter by path (contains match)
 *     responses:
 *       200:
 *         description: Logs list
 *         content:
 *           application/json:
 *             example:
 *               count: 1
 *               limit: 50
 *               filterApplied:
 *                 method: GET
 *                 statusCode: 200
 *                 path:
 *                   $regex: "/events"
 *                   $options: "i"
 *               logs:
 *                 - _id: "6695765d0e8c52fe5f677ceb"
 *                   method: "GET"
 *                   path: "/events"
 *                   statusCode: 200
 *                   durationMs: 163
 *                   ip: "::1"
 *                   userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"
 *                   createdAt: "2026-01-12T22:31:57.095Z"
 *       401:
 *         description: Missing/invalid token
 *       403:
 *         description: Forbidden (admin only)
 */

const express = require("express");
const router = express.Router();

const { RequestLog } = require("../db/mongo");
const { requireAuth } = require("../middleware/auth");
const { requireAdmin } = require("../middleware/requireAdmin");

/**
 * GET /logs
 * Admin only
 *
 * Optional query params:
 *  - limit=50 (max 200)
 *  - method=GET
 *  - status=200
 *  - path=/events   (contains match)
 */
router.get("/", requireAuth, requireAdmin, async (req, res) => {
  try {
    // ✅ safe limit
    let limit = parseInt(req.query.limit || "50", 10);
    if (!Number.isFinite(limit) || limit <= 0) limit = 50;
    limit = Math.min(limit, 200);

    // ✅ optional filters (nice for demo)
    const filter = {};
    if (req.query.method) filter.method = String(req.query.method).toUpperCase();
    if (req.query.status) {
      const s = parseInt(req.query.status, 10);
      if (Number.isFinite(s)) filter.statusCode = s;
    }
    if (req.query.path) {
      filter.path = { $regex: String(req.query.path), $options: "i" };
    }

    const logs = await RequestLog.find(filter)
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    res.json({
      count: logs.length,
      limit,
      filterApplied: filter,
      logs,
    });
  } catch (err) {
    console.error("❌ Error fetching logs:", err);
    res.status(500).json({ message: "Failed to fetch logs" });
  }
});

module.exports = router;

