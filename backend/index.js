// index.js
const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express(); // ✅ define app first
app.use(cors());
app.use(express.json()); // ✅ enable JSON parsing

const PORT = process.env.PORT || 4000;

// ===== Base Route =====
app.get('/', (req, res) => {
  res.send('Hello from the backend!');
});

// ===== Database Test Route =====
app.get('/dbtest', async (req, res) => {
  try {
    const { Pool } = require('pg');
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false }
    });

    const result = await pool.query('SELECT NOW()');
    res.send(`Database connected! Current time: ${result.rows[0].now}`);
    await pool.end();
  } catch (err) {
    res.status(500).send('Database error: ' + err.message);
  }
});

// ===== Simple Auth Routes =====

// Temporary in-memory store (replace with DB later)
const users = [];

// ===== Signup Route =====
app.post('/signup', (req, res) => {
  const { name, email, password } = req.body;

  // Basic validation
  if (!name || !email || !password) {
    return res.status(400).json({ success: false, message: 'All fields are required.' });
  }

  // Check if email already exists
  const existingUser = users.find(u => u.email === email);
  if (existingUser) {
    return res.status(409).json({ success: false, message: 'User already exists.' });
  }

  // ✅ Mark profile as incomplete by default
  const newUser = { name, email, password, profileCompleted: false };
  users.push(newUser);

  // ✅ Tell frontend to show the profile completion screen
  res.status(201).json({
    success: true,
    user: newUser,
    needsProfileCompletion: true
  });
});

// ===== Login Route =====
app.post('/login', (req, res) => {
  const { email, password } = req.body;

  // Find user
  const user = users.find(u => u.email === email && u.password === password);
  if (!user) {
    return res.status(401).json({ success: false, message: 'Invalid credentials.' });
  }

  // ✅ Return user's profileCompleted status
  res.json({
    success: true,
    user: {
      name: user.name,
      email: user.email,
      profileCompleted: user.profileCompleted
    }
  });
});

// ===== Start Server =====
app.listen(PORT, () => {
  console.log(`🚀 Backend server running on http://localhost:${PORT}`);
});
