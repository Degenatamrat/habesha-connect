// index.js
const express = require('express')
const cors = require('cors')
const { Pool } = require('pg')
const bcrypt = require('bcryptjs') // ✅ using bcryptjs for compatibility
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
      phone TEXT,
      otp TEXT,
      otp_expires TIMESTAMP,
      profile_completed BOOLEAN DEFAULT false
    );
  `)
  console.log('✅ PostgreSQL connected & users table ready')
}
initDB()

// === Health check route for frontend/backend connection ===
app.get('/dbtest', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()')
    res.json({
      success: true,
      message: '✅ Backend connected to database successfully!',
      timestamp: result.rows[0].now,
    })
  } catch (err) {
    console.error('❌ DB Test Error:', err.message)
    res.status(500).json({ success: false, message: 'Database connection failed.' })
  }
})

// === Base route ===
app.get('/', (req, res) => {
  res.send('Hello from the secure backend!')
})

// === Secure Signup route ===
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

    // 🔒 Hash password before saving
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

// === Secure Login route ===
app.post('/login', async (req, res) => {
  const { email, password } = req.body

  try {
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email])
    const user = result.rows[0]
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials.' })
    }

    // 🔒 Compare typed password with hashed one
    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials.' })
    }

    res.json({
      success: true,
      user: {
        id: user.id,
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

// === Mock OTP routes (for TinderFlow testing) ===
app.post('/send-otp', async (req, res) => {
  const { phone } = req.body
  if (!phone) {
    return res.status(400).json({ success: false, message: 'Phone number required.' })
  }

  try {
    const otp = '123456'
    const expires = new Date(Date.now() + 5 * 60 * 1000) // expires in 5 minutes

    await pool.query(
      `UPDATE users SET otp = $1, otp_expires = $2 WHERE phone = $3`,
      [otp, expires, phone]
    )

    console.log(`📩 Mock OTP sent to ${phone}: ${otp}`)
    res.json({ success: true, message: 'Mock OTP sent successfully.' })
  } catch (err) {
    console.error('OTP send error:', err.message)
    res.status(500).json({ success: false, message: 'Error sending OTP.' })
  }
})

app.post('/verify-otp', async (req, res) => {
  const { phone, otp } = req.body
  if (!phone || !otp) {
    return res.status(400).json({ success: false, message: 'Phone and OTP required.' })
  }

  try {
    const result = await pool.query('SELECT otp, otp_expires FROM users WHERE phone = $1', [phone])
    const user = result.rows[0]

    if (!user || !user.otp) {
      return res.status(400).json({ success: false, message: 'No OTP found. Please request again.' })
    }

    if (new Date() > new Date(user.otp_expires)) {
      return res.status(400).json({ success: false, message: 'OTP expired. Please request again.' })
    }

    if (user.otp !== otp) {
      return res.status(400).json({ success: false, message: 'Invalid OTP.' })
    }

    // ✅ OTP verified successfully
    await pool.query(
      `UPDATE users SET otp = NULL, otp_expires = NULL, profile_completed = TRUE WHERE phone = $1`,
      [phone]
    )
    res.json({ success: true, message: 'OTP verified successfully.' })
  } catch (err) {
    console.error('OTP verify error:', err.message)
    res.status(500).json({ success: false, message: 'Error verifying OTP.' })
  }
})

// === Start server ===
app.listen(PORT, () => {
  console.log(`🚀 Backend running securely on http://localhost:${PORT}`)
})
