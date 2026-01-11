const { Pool } = require("pg");

const pool = new Pool({
  host: process.env.PG_HOST,
  port: Number(process.env.PG_PORT),
  database: process.env.PG_DB,
  user: process.env.PG_USER,
  password: process.env.PG_PASSWORD,
});

// Bağlantı testi (server açılırken log düşsün)
pool.query("SELECT NOW()", (err, res) => {
  if (err) console.error("❌ PostgreSQL connection error:", err.message);
  else console.log("✅ PostgreSQL connected at:", res.rows[0].now);
});

module.exports = { pool };
