const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:admin123@localhost:5432/generate_samp',
  ssl: process.env.DATABASE_URL ? { rejectUnauthorized: false } : false, // SSL only for Render
});

// Optional: test connection
pool.connect((err, client, release) => {
  if (err) console.error('Error acquiring client', err.stack);
  else {
    console.log('PostgreSQL connected successfully');
    release();
  }
});

module.exports = pool;
