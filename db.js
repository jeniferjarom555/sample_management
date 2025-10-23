import pkg from 'pg';
const { Pool } = pkg;
import dotenv from 'dotenv';
dotenv.config();

const isRender = !!process.env.DATABASE_URL; // Detect Render environment

const pool = new Pool({
  connectionString: isRender 
    ? process.env.DATABASE_URL 
    : 'postgresql://postgres:admin123@localhost:5432/generate_samp',
  ...(isRender && { ssl: { rejectUnauthorized: false } }),
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

// Export as default for ES modules
export default pool;
