const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");

// 🔥 DEBUG – app.js gerçekten yükleniyor mu?
console.log("🔥 APP.JS LOADED FROM:", __filename);

// ✅ Mongo (NoSQL logs)
const { RequestLog } = require("./db/mongo");

// Swagger
const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./docs/swagger");

// routes
const healthRoutes = require("./routes/health.routes");
const authRoutes = require("./routes/auth.routes");
const eventsRoutes = require("./routes/events.routes");
const logsRoutes = require("./routes/logs.routes");

const app = express();
console.log("✅ typeof app =", typeof app, " / keys:", Object.keys(app));
// =======================
// GLOBAL MIDDLEWARES
// =======================
app.use(cors());
app.use(helmet());
app.use(morgan("dev"));
app.use(express.json());

// =======================
// 🔥 REQUEST LOGGER (MongoDB)
// =======================
console.log("🟣 LOGGER MIDDLEWARE INSTALLED");

app.use((req, res, next) => {
  console.log("🟡 LOGGER HIT:", req.method, req.originalUrl);

  // swagger & favicon loglama
  const skip =
    req.path.startsWith("/docs") ||
    req.path.startsWith("/swagger") ||
    req.path === "/favicon.ico";

  if (skip) return next();

  const start = Date.now();

  res.on("finish", async () => {
    const durationMs = Date.now() - start;

    const log = {
      method: req.method,
      path: req.originalUrl,
      statusCode: res.statusCode,
      durationMs,
      ip: req.ip,
      userAgent: req.headers["user-agent"],
      query: req.query,
      user: req.user
        ? {
            id: req.user.id,
            role: req.user.role,
            email: req.user.email,
          }
        : undefined,
      createdAt: new Date(),
    };

    try {
      await RequestLog.create(log);
      console.log("🟢 LOG SAVED:", req.method, req.originalUrl);
    } catch (err) {
      console.error("❌ LOG SAVE ERROR:", err.message);
    }
  });

  next();
});

// =======================
// ROUTES
// =======================
app.use("/", healthRoutes);        // GET /health
app.use("/auth", authRoutes);      // register / login
app.use("/events", eventsRoutes);  // events CRUD
app.use("/logs", logsRoutes);      // admin logs

// =======================
// SWAGGER
// =======================
app.use(
  "/docs",
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec, {
    swaggerOptions: {
      persistAuthorization: true, // 🔑 token kaybolmasın
    },
  })
);

// =======================
// EXPORT
// =======================
module.exports = app;
