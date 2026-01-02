const express = require("express");
const bcrypt = require("bcrypt");
const { pool } = require("../db/pg");
const { signToken } = require("../utils/jwt");

const router = express.Router();

router.post("/register", async (req, res) => {
  const { name, email, password, role } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: "Missing fields" });
  }

  const password_hash = await bcrypt.hash(password, 10);
  const userRole = role || "user";

  try {
    const r = await pool.query(
      `INSERT INTO users (name, email, password_hash, role)
       VALUES ($1,$2,$3,$4)
       RETURNING id, name, email, role`,
      [name, email, password_hash, userRole]
    );

    const user = r.rows[0];
    const token = signToken({ id: user.id, role: user.role, email: user.email });

    res.status(201).json({ user, token });
  } catch (e) {
    return res.status(409).json({ message: "Email already exists" });
  }
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  const r = await pool.query("SELECT * FROM users WHERE email=$1", [email]);
  if (r.rowCount === 0) return res.status(401).json({ message: "Invalid credentials" });

  const user = r.rows[0];
  const ok = await bcrypt.compare(password, user.password_hash);
  if (!ok) return res.status(401).json({ message: "Invalid credentials" });

  const token = signToken({ id: user.id, role: user.role, email: user.email });

  res.json({
    user: { id: user.id, name: user.name, email: user.email, role: user.role },
    token,
  });
});

module.exports = router;
