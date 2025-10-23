// index.js
const express = require('express')
const cors = require('cors')
const { Pool } = require('pg')
const bcrypt = require('bcryptjs')
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
      gender TEXT,
      looking_for TEXT,
      interests TEXT[],
      bio TEXT,
      location TEXT,
      profile_completed BOOLEAN DEFAULT false
    );
  `)
  console.log('✅ PostgreSQL connected & users table ready')
}
initDB()

// === Base route ===
app.get('/', (req, res) => {
  res.send('Hello from the secure backend!')
})

// === DB test route ===
app.get('/dbtest', async (req, res) => {
  try {
    await pool.query('SELECT NOW()')
    res.json({
      success: true,
      message: '✅ Backend connected to database successfully!',
      timestamp: new Date().toISOString(),
    })
  } catch (err) {
    console.error('DB test failed:', err.message)
    res.status(500).json({ success: false, message: '❌ Database connection failed.' })
  }
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

    const hashedPassword = await bcrypt.hash(password, 10)
    const result = await pool.query(
      'INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING *',
      [name, email, hashedPassword]
    )

    res.status(201).json({
      success: true,
      user: { id: result.rows[0].id, name, email },
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
    if (!user) return res.status(401).json({ success: false, message: 'Invalid credentials.' })

    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) return res.status(401).json({ success: false, message: 'Invalid credentials.' })

    res.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        gender: user.gender,
        looking_for: user.looking_for,
        bio: user.bio,
        location: user.location,
        interests: user.interests,
        profileCompleted: user.profile_completed,
      },
    })
  } catch (err) {
    console.error('Login error:', err.message)
    res.status(500).json({ success: false, message: 'Database error during login.' })
  }
})

// === NEW: Discovery route (core matching logic) ===
app.get('/discover/:id', async (req, res) => {
  const { id } = req.params

  try {
    //1️⃣ Fetch current user
    const current = await pool.query('SELECT gender, looking_for, interests FROM users WHERE id = $1', [id])
    if (current.rows.length === 0)
      return res.status(404).json({ success: false, message: 'User not found.' })

    const me = current.rows[0]

    // 2️⃣ Filter potential matches
    const result = await pool.query(
      `
      SELECT id, name, gender, looking_for, interests, bio, location
      FROM users
      WHERE id != $1
        AND gender = $2
        AND looking_for = $3
        AND profile_completed = true
      LIMIT 20;
      `,
      [id, me.looking_for, me.gender]
    )

    // 3️⃣ Compute a simple compatibility score (shared interests)
    const myInterests = me.interests || []
    const matches = result.rows.map((u) => {
      const shared = (u.interests || []).filter((x) => myInterests.includes(x))
      const score = myInterests.length ? (shared.length / myInterests.length).toFixed(2) : 0
      return { ...u, compatibility_score: parseFloat(score) }
    })

    res.json({ success: true, count: matches.length, users: matches })
  } catch (err) {
    console.error('Discover error:', err.message)
    res.status(500).json({ success: false, message: 'Error loading discovery feed.' })
  }
})

// === Start server ===
app.listen(PORT, () => {
  console.log(`🚀 Backend running securely on http://localhost:${PORT}`)
})
