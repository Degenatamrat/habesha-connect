
// index.js
const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());

const PORT = process.env.PORT || 4000;

app.get('/', (req, res) => {
  res.send('Hello from the backend!');
});

// ===== Add this route for testing your database connection =====
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
// ===== End of new route =====

app.listen(PORT, () => {
  console.log(`🚀 Backend server running on http://localhost:${PORT}`);
});
