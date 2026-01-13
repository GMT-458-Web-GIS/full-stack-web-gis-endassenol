const mongoose = require("mongoose");

const MONGO_URL = process.env.MONGO_URL || process.env.MONGO_URI;

async function connectMongo() {
  if (!MONGO_URL) {
    console.log("⚠️  MONGO_URL is not set in .env");
    return;
  }
  try {
    await mongoose.connect(MONGO_URL);
    console.log("✅ MongoDB connected");
  } catch (err) {
    console.log("❌ MongoDB connection error:", err.message);
  }
}

const requestLogSchema = new mongoose.Schema(
  {
    method: String,
    path: String,
    statusCode: Number,
    durationMs: Number,
    ip: String,
    userAgent: String,
    query: Object,
    createdAt: { type: Date, default: Date.now },
  },
  { versionKey: false }
);

// ✅ collection adını zorla: events_logs
const RequestLog = mongoose.model("RequestLog", requestLogSchema, "events_logs");

module.exports = { connectMongo, RequestLog };
