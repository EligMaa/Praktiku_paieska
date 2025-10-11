const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  database: process.env.DATABASE_NAME,
  port: 5432,
  host: process.env.DATABASE_HOST,
  user: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD
});

async function runMigration() {
  try {
    console.log('Starting database migration...');
    
    // Read SQL file
    const sqlFilePath = path.join(__dirname, 'db_migrations', 'jobs_tables.sql');
    const sql = fs.readFileSync(sqlFilePath, 'utf8');
    
    // Execute SQL
    await pool.query(sql);
    
    console.log('Migration completed successfully!');
  } catch (err) {
    console.error('Error running migration:', err);
  } finally {
    // Close pool
    await pool.end();
  }
}

runMigration();