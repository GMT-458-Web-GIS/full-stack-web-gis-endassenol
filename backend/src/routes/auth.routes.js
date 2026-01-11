const express = require("express");
const bcrypt = require("bcrypt");
const { pool } = require("../db/pg");
const { signToken } = require("../utils/jwt");

const router = express.Router();

/**
 * @swagger
 * tags:
 *   - name: Auth
 *     description: Authentication & user management
 */

/**
 * @swagger
 * /auth/register:
 *   post:
 *     tags: [Auth]
 *     summary: Register a new user
 *     description: Creates a new user and returns JWT token
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *             properties:
 *               name:
 *                 type: string
 *                 example: Enda
 *               email:
 *                 type: string
 *                 example: enda@test.com
 *               password:
 *                 type: string
 *                 example: "123456"
 *               role:
 *                 type: string
 *                 description: Optional (default is "user")
 *                 example: user
 *     responses:
 *       201:
 *         description: User registered successfully
 *         content:
 *           application/json:
 *             example:
 *               user:
 *                 id: 484e894f-f0d0-4d09-a903-3f8ab24b70c9
 *                 name: Enda
 *                 email: enda@test.com
 *                 role: user
 *               token: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *       400:
 *         description: Missing required fields
 *         content:
 *           application/json:
 *             example:
 *               message: Missing fields
 *       409:
 *         description: Email already exists
 *         content:
 *           application/json:
 *             example:
 *               message: Email already exists
 */
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

/**
 * @swagger
 * /auth/login:
 *   post:
 *     tags: [Auth]
 *     summary: Login
 *     description: Authenticates user and returns JWT token
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 example: enda@test.com
 *               password:
 *                 type: string
 *                 example: "123456"
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             example:
 *               user:
 *                 id: 484e894f-f0d0-4d09-a903-3f8ab24b70c9
 *                 name: Enda
 *                 email: enda@test.com
 *                 role: user
 *               token: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *       401:
 *         description: Invalid credentials
 *         content:
 *           application/json:
 *             example:
 *               message: Invalid credentials
 */
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
