const express = require("express");
const router = express.Router();

/**
 * @swagger
 * /health:
 *   get:
 *     summary: Health check endpoint
 *     description: Returns API server health status
 *     responses:
 *       200:
 *         description: API is running
 *         content:
 *           application/json:
 *             example:
 *               ok: true
 */
router.get("/health", (req, res) => {
  res.json({ ok: true });
});

module.exports = router;
