// index.js
const express = require('express')
const cors = require('cors')
const { Pool } = require('pg')
require('dotenv').config()

const app = express()
app.use(cors())
app.use(express.json())

const PORT = process.env.PORT || 4000

// === Connect to PostgreSQL ===
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
})

// === Create users table if it doesn’t exist ===
async function initDB() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      profile_completed BOOLEAN DEFAULT false
    );
  `)
  console.log('✅ PostgreSQL connected & users table ready')
}
initDB()

// === Base route ===
app.get('/', (req, res) => {
  res.send('Hello from the live backend!')
})

// === Signup route ===
app.post('/signup', async (req, res) => {
  const { name, email, password } = req.body

  if (!name || !email || !password) {
    return res.status(400).json({ success: false, message: 'All fields are required.' })
  }

  try {
    const existing = await pool.query('SELECT * FROM users WHERE email = $1', [email])
    if (existing.rows.length > 0) {
      return res.status(409).json({ success: false, message: 'User already exists.' })
    }

    const result = await pool.query(
      'INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING *',
      [name, email, password]
    )

    res.status(201).json({
      success: true,
      user: result.rows[0],
      needsProfileCompletion: true,
    })
  } catch (err) {
    console.error('Signup error:', err.message)
    res.status(500).json({ success: false, message: 'Database error during signup.' })
  }
})

// === Login route ===
app.post('/login', async (req, res) => {
  const { email, password } = req.body

  try {
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email])
    const user = result.rows[0]

    if (!user || user.password !== password) {
      return res.status(401).json({ success: false, message: 'Invalid credentials.' })
    }

    res.json({
      success: true,
      user: {
        name: user.name,
        email: user.email,
        profileCompleted: user.profile_completed,
      },
    })
  } catch (err) {
    console.error('Login error:', err.message)
    res.status(500).json({ success: false, message: 'Database error during login.' })
  }
})

// === Start server ===
app.listen(PORT, () => {
  console.log(`🚀 Backend running on http://localhost:${PORT}`)
})
