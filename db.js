const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }, // SSL required for Render
});

pool.connect((err, client, release) => {
  if (err) console.error('Error acquiring client', err.stack);
  else {
    console.log('PostgreSQL connected successfully');
    release();
  }
});

module.exports = pool;
