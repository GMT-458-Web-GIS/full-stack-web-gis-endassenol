// src/models/EventLog.js
const mongoose = require("mongoose");

const EventLogSchema = new mongoose.Schema(
  {
    method: { type: String },
    path: { type: String },
    status: { type: Number },
    ip: { type: String },

    // kim yaptı?
    user_id: { type: String },     // JWT'den
    role: { type: String },        // JWT'den

    // istek detayları
    query: { type: Object },
    params: { type: Object },

    // body bazen büyük/şifre içerebilir -> sanitize edeceğiz
    body: { type: Object },

    // performans
    duration_ms: { type: Number },

    // hata mesajı
    error: { type: String },
  },
  { timestamps: true, collection: "events_logs" } // sende oluşan collection adı
);

module.exports = mongoose.model("EventLog", EventLogSchema);
