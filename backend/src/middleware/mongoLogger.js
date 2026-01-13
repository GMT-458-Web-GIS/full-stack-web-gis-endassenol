// src/middleware/mongoLogger.js
app.use((req, res, next) => {
  console.log("🟡 LOGGER HIT:", req.method, req.originalUrl);

  const skip =
    req.path.startsWith("/docs") ||
    req.path.startsWith("/swagger") ||
    req.path === "/favicon.ico";

  if (skip) return next();

  const start = Date.now();

  res.on("finish", () => {
    const durationMs = Date.now() - start;
    console.log("🟣 LOG SAVING:", req.method, req.originalUrl, res.statusCode, durationMs);

    const log = {
      method: req.method,
      path: req.originalUrl,
      statusCode: res.statusCode,
      durationMs,
      ip: req.ip,
      userAgent: req.headers["user-agent"],
      query: req.query,
      user: req.user
        ? { id: req.user.id, role: req.user.role, email: req.user.email }
        : undefined,
      createdAt: new Date(),
    };

    RequestLog.create(log).catch((e) => console.log("🔴 Mongo write error:", e.message));
  });

  next();
});
const EventLog = require("../models/EventLog");

function sanitizeBody(body) {
  if (!body || typeof body !== "object") return body;
  const copy = { ...body };
  if (copy.password) copy.password = "***";
  return copy;
}

module.exports = function mongoLogger(req, res, next) {
  const start = Date.now();

  res.on("finish", async () => {
    try {
      // Mongo yoksa model save patlayabilir -> try/catch
      const duration = Date.now() - start;

      const user = req.user || {}; // auth middleware set ediyorsa
      await EventLog.create({
        method: req.method,
        path: req.originalUrl,
        status: res.statusCode,
        ip: req.ip,

        user_id: user.id || user.userId || user.sub || null,
        role: user.role || null,

        query: req.query,
        params: req.params,
        body: sanitizeBody(req.body),

        duration_ms: duration,
      });
    } catch (e) {
      // log yazılamadıysa API'yi bozmuyoruz
      // console.log istersen aç:
      // console.log("Mongo log write failed:", e.message);
    }
  });

  next();
};
