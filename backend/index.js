// index.js
const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");
const bcrypt = require("bcryptjs");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 4000;

// === Connect to PostgreSQL ===
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

// === Initialize database tables ===
async function initDB() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      gender TEXT,
      looking_for TEXT,
      city TEXT,
      region TEXT,
      photo_url TEXT,
      profile_completed BOOLEAN DEFAULT false
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS likes (
      id SERIAL PRIMARY KEY,
      liker_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      liked_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      created_at TIMESTAMP DEFAULT NOW(),
      UNIQUE(liker_id, liked_id)
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS matches (
      id SERIAL PRIMARY KEY,
      user1_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      user2_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      created_at TIMESTAMP DEFAULT NOW(),
      UNIQUE(user1_id, user2_id)
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS messages (
      id SERIAL PRIMARY KEY,
      match_id INTEGER REFERENCES matches(id) ON DELETE CASCADE,
      sender_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      text TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT NOW()
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS notifications (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      type TEXT,  -- 'like' | 'match' | 'message'
      reference_id INTEGER,
      created_at TIMESTAMP DEFAULT NOW(),
      read BOOLEAN DEFAULT false
    );
  `);

  console.log("✅ PostgreSQL connected & tables ready");
}
initDB();

// === Base route ===
app.get("/", (req, res) => {
  res.send("Hello from Habesha Connect backend!");
});

// === DB test route ===
app.get("/dbtest", async (req, res) => {
  try {
    await pool.query("SELECT NOW()");
    res.json({
      success: true,
      message: "✅ Backend connected to database successfully!",
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    console.error("DB test failed:", err.message);
    res.status(500).json({ success: false, message: "❌ Database connection failed." });
  }
});

// === Secure Signup route ===
app.post("/signup", async (req, res) => {
  const { name, email, password, gender, looking_for, city, region } = req.body;

  if (!name || !email || !password)
    return res.status(400).json({ success: false, message: "All fields are required." });

  try {
    const existing = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
    if (existing.rows.length > 0)
      return res.status(409).json({ success: false, message: "User already exists." });

    const hashed = await bcrypt.hash(password, 10);
    const result = await pool.query(
      `INSERT INTO users (name, email, password, gender, looking_for, city, region)
       VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
      [name, email, hashed, gender, looking_for, city, region]
    );

    res.status(201).json({
      success: true,
      user: { id: result.rows[0].id, name, email },
      needsProfileCompletion: true,
    });
  } catch (err) {
    console.error("Signup error:", err.message);
    res.status(500).json({ success: false, message: "Database error during signup." });
  }
});

// === Login route ===
app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const result = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
    const user = result.rows[0];
    if (!user) return res.status(401).json({ success: false, message: "Invalid credentials." });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ success: false, message: "Invalid credentials." });

    res.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        gender: user.gender,
        looking_for: user.looking_for,
        profileCompleted: user.profile_completed,
      },
    });
  } catch (err) {
    console.error("Login error:", err.message);
    res.status(500).json({ success: false, message: "Database error during login." });
  }
});

// === LIKE system ===
app.post("/like/:id", async (req, res) => {
  const { user_id } = req.body;
  const liked_id = parseInt(req.params.id);
  try {
    await pool.query("INSERT INTO likes (liker_id, liked_id) VALUES ($1, $2) ON CONFLICT DO NOTHING", [user_id, liked_id]);

    // Check for mutual like → create match
    const mutual = await pool.query(
      "SELECT * FROM likes WHERE liker_id = $1 AND liked_id = $2",
      [liked_id, user_id]
    );

    if (mutual.rows.length > 0) {
      await pool.query(
        "INSERT INTO matches (user1_id, user2_id) VALUES ($1, $2) ON CONFLICT DO NOTHING",
        [user_id, liked_id]
      );

      await pool.query(
        "INSERT INTO notifications (user_id, type, reference_id) VALUES ($1, 'match', $2)",
        [user_id, liked_id]
      );

      return res.json({ success: true, message: "It's a match!" });
    }

    await pool.query(
      "INSERT INTO notifications (user_id, type, reference_id) VALUES ($1, 'like', $2)",
      [liked_id, user_id]
    );

    res.json({ success: true, message: "User liked successfully." });
  } catch (err) {
    console.error("Like error:", err.message);
    res.status(500).json({ success: false, message: "Error liking user." });
  }
});

// === MATCHES ===
app.get("/matches/:userId", async (req, res) => {
  const userId = parseInt(req.params.userId);
  try {
    const result = await pool.query(
      `SELECT * FROM matches 
       WHERE user1_id = $1 OR user2_id = $1`,
      [userId]
    );
    res.json({ success: true, matches: result.rows });
  } catch (err) {
    console.error("Matches error:", err.message);
    res.status(500).json({ success: false, message: "Error fetching matches." });
  }
});

// === MESSAGES ===
app.get("/messages/:matchId", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM messages WHERE match_id = $1 ORDER BY created_at ASC", [req.params.matchId]);
    res.json({ success: true, messages: result.rows });
  } catch (err) {
    console.error("Messages error:", err.message);
    res.status(500).json({ success: false, message: "Error fetching messages." });
  }
});

app.post("/messages", async (req, res) => {
  const { match_id, sender_id, text } = req.body;
  if (!text) return res.status(400).json({ success: false, message: "Text required." });
  try {
    const result = await pool.query(
      "INSERT INTO messages (match_id, sender_id, text) VALUES ($1,$2,$3) RETURNING *",
      [match_id, sender_id, text]
    );

    // Notify the other user
    const match = await pool.query("SELECT * FROM matches WHERE id = $1", [match_id]);
    if (match.rows.length) {
      const otherUser = match.rows[0].user1_id === sender_id ? match.rows[0].user2_id : match.rows[0].user1_id;
      await pool.query(
        "INSERT INTO notifications (user_id, type, reference_id) VALUES ($1, 'message', $2)",
        [otherUser, result.rows[0].id]
      );
    }

    res.json({ success: true, message: "Message sent.", data: result.rows[0] });
  } catch (err) {
    console.error("Message send error:", err.message);
    res.status(500).json({ success: false, message: "Error sending message." });
  }
});

// === NOTIFICATIONS ===
app.get("/notifications/:userId", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM notifications WHERE user_id = $1 ORDER BY created_at DESC",
      [req.params.userId]
    );
    res.json({ success: true, notifications: result.rows });
  } catch (err) {
    console.error("Notification error:", err.message);
    res.status(500).json({ success: false, message: "Error fetching notifications." });
  }
});

// === Start server ===
app.listen(PORT, () => {
  console.log(`🚀 Backend running securely on http://localhost:${PORT}`);
});
