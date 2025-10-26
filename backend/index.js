// index.js (Phase 3: Cultural Intelligence Matching + Image Upload Ready)
const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");
const bcrypt = require("bcryptjs");
require("dotenv").config();

const app = express();
app.use(cors());

// ✅ Allow larger JSON bodies (for base64 or image uploads)
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

const PORT = process.env.PORT || 4000;

/* ------------------------- PostgreSQL Connection ------------------------- */
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

/* --------------------------- Bootstrap / Migrations ---------------------- */
async function initDB() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      photo TEXT,
      gender TEXT,
      looking_for TEXT,
      bio TEXT,
      interests TEXT[],
      vibe TEXT[],
      lifestyle JSONB,
      culture TEXT[],
      faith JSONB,
      goals TEXT,
      region TEXT,
      city TEXT,
      languages TEXT[],
      faith_importance INTEGER DEFAULT 3,
      profile_completed BOOLEAN DEFAULT false,
      last_active_at TIMESTAMP DEFAULT NOW(),
      created_at TIMESTAMP DEFAULT NOW()
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS likes (
      id SERIAL PRIMARY KEY,
      liker_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      liked_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      created_at TIMESTAMP DEFAULT NOW(),
      UNIQUE (liker_id, liked_id)
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS matches (
      id SERIAL PRIMARY KEY,
      user1_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      user2_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      created_at TIMESTAMP DEFAULT NOW(),
      UNIQUE (user1_id, user2_id)
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS messages (
      id SERIAL PRIMARY KEY,
      match_id INTEGER REFERENCES matches(id) ON DELETE CASCADE,
      sender_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      body TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT NOW()
    );
  `);

  await pool.query(`CREATE INDEX IF NOT EXISTS idx_users_gender ON users(gender);`);
  await pool.query(`CREATE INDEX IF NOT EXISTS idx_users_looking_for ON users(looking_for);`);
  await pool.query(`CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at DESC);`);

  console.log("✅ PostgreSQL connected & all tables ready");
}
initDB();

/* --------------------------------- Utils -------------------------------- */
const safeArr = (v) => (Array.isArray(v) ? v : v ? [].concat(v) : []);
const arrOverlap = (a, b) => {
  const A = new Set(safeArr(a).map(String));
  const B = new Set(safeArr(b).map(String));
  let c = 0;
  A.forEach((x) => B.has(x) && c++);
  const denom = Math.max(A.size, B.size, 1);
  return c / denom;
};
const lifestyleSimilarity = (la = {}, lb = {}) => {
  const keys = ["sleep", "smoke", "drink", "activity"];
  let same = 0,
    total = 0;
  keys.forEach((k) => {
    if (la[k] || lb[k]) {
      total++;
      if (la[k] && lb[k] && String(la[k]).toLowerCase() === String(lb[k]).toLowerCase()) same++;
    }
  });
  return total ? same / total : 0.0;
};
const goalAlignment = (ga, gb) =>
  ga && gb && String(ga).toLowerCase() === String(gb).toLowerCase() ? 1 : 0;
const isNewWithin = (ts, hours = 24) =>
  ts ? new Date(ts) > new Date(Date.now() - hours * 3600 * 1000) : false;

/* --------------------------------- Routes -------------------------------- */
app.get("/", (_, res) => res.send("Hello from the secure backend!"));

app.get("/dbtest", async (_, res) => {
  try {
    await pool.query("SELECT NOW()");
    res.json({
      success: true,
      message: "✅ Backend connected to database successfully!",
      timestamp: new Date().toISOString(),
    });
  } catch {
    res.status(500).json({ success: false, message: "❌ Database connection failed." });
  }
});

/* ------------------------------ Auth ----------------------------- */
app.post("/signup", async (req, res) => {
  const { name, email, password, gender, looking_for } = req.body || {};
  if (!name || !email || !password)
    return res.status(400).json({ success: false, message: "All fields are required." });
  try {
    const exists = await pool.query("SELECT 1 FROM users WHERE email=$1", [email]);
    if (exists.rowCount) return res.status(409).json({ success: false, message: "User exists." });

    const hashed = await bcrypt.hash(password, 10);
    const result = await pool.query(
      `INSERT INTO users (name, email, password, gender, looking_for, profile_completed)
       VALUES ($1,$2,$3,$4,$5,$6) RETURNING id, name, email, profile_completed`,
      [name, email, hashed, gender || null, looking_for || null, false]
    );

    res.status(201).json({
      success: true,
      user: result.rows[0],
      needsProfileCompletion: true,
    });
  } catch {
    res.status(500).json({ success: false, message: "Database error during signup." });
  }
});

app.post("/login", async (req, res) => {
  const { email, password } = req.body || {};
  try {
    const q = await pool.query("SELECT * FROM users WHERE email=$1", [email]);
    const user = q.rows[0];
    if (!user) return res.status(401).json({ success: false, message: "Invalid credentials." });

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(401).json({ success: false, message: "Invalid credentials." });

    await pool.query("UPDATE users SET last_active_at=NOW() WHERE id=$1", [user.id]);
    res.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        profileCompleted: user.profile_completed,
      },
    });
  } catch {
    res.status(500).json({ success: false, message: "Database error during login." });
  }
});

/* ---------------------------- Profile CRUD ------------------------- */
app.put("/profile/update", async (req, res) => {
  const {
    id,
    name,
    photo, // can now be base64 or URL
    gender,
    looking_for,
    bio,
    interests,
    vibe,
    lifestyle,
    culture,
    faith,
    goals,
    region,
    city,
    languages,
    faith_importance,
    profile_completed,
  } = req.body || {};
  if (!id) return res.status(400).json({ success: false, message: "Missing user id." });

  try {
    const q = await pool.query(
      `UPDATE users SET
        name = COALESCE($2, name),
        photo = COALESCE($3, photo),
        gender = COALESCE($4, gender),
        looking_for = COALESCE($5, looking_for),
        bio = COALESCE($6, bio),
        interests = COALESCE($7, interests),
        vibe = COALESCE($8, vibe),
        lifestyle = COALESCE($9, lifestyle),
        culture = COALESCE($10, culture),
        faith = COALESCE($11, faith),
        goals = COALESCE($12, goals),
        region = COALESCE($13, region),
        city = COALESCE($14, city),
        languages = COALESCE($15, languages),
        faith_importance = COALESCE($16, faith_importance),
        profile_completed = COALESCE($17, profile_completed),
        last_active_at = NOW()
       WHERE id=$1
       RETURNING *`,
      [
        id,
        name || null,
        photo || null,
        gender || null,
        looking_for || null,
        bio || null,
        interests || null,
        vibe || null,
        lifestyle || null,
        culture || null,
        faith || null,
        goals || null,
        region || null,
        city || null,
        languages || null,
        faith_importance || null,
        typeof profile_completed === "boolean" ? profile_completed : null,
      ]
    );
    res.json({ success: true, user: q.rows[0] });
  } catch {
    res.status(500).json({ success: false, message: "Error updating profile." });
  }
});

/* --------------------------------- Start -------------------------------- */
app.listen(PORT, () => {
  console.log(`🚀 Backend running securely on http://localhost:${PORT}`);
});
