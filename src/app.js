const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");

// routes
const healthRoutes = require("./routes/health.routes");
const authRoutes = require("./routes/auth.routes");
const eventsRoutes = require("./routes/events.routes");

const app = express();

// global middlewares
app.use(cors());
app.use(helmet());
app.use(morgan("dev"));
app.use(express.json());

// routes
app.use("/", healthRoutes);        // GET /health
app.use("/auth", authRoutes);      // POST /auth/register , POST /auth/login
app.use("/events", eventsRoutes);  // GET/POST/PATCH/DELETE /events

module.exports = app;
