const { Pool } = require('pg');
require('dotenv').config();

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is not defined');
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

pool.connect()
  .then(client => {
    console.log("✅ Database connected successfully");
    client.release();
  })
  .catch(err => {
    console.error("❌ Database connection failed:", err.message);
  });

const query = (text, params) => pool.query(text, params);

module.exports = {
  pool,
  query,
};
