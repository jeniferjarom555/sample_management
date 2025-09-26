const { Pool } = require('pg');

const isRender = !!process.env.DATABASE_URL; // Detect Render environment

const pool = new Pool({
  connectionString: isRender 
    ? process.env.DATABASE_URL 
    : 'postgresql://postgres:admin123@localhost:5432/generate_samp',
  ...(isRender && { ssl: { rejectUnauthorized: false } }), // Only enable SSL on Render
});

// Optional: test connection
pool.connect((err, client, release) => {
  if (err) {
    console.error('Error acquiring client', err.stack);
  } else {
    console.log('PostgreSQL connected successfully');
    release();
  }
});

module.exports = pool;
