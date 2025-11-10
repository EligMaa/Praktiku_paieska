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
    
    // Execute all SQL files in the db_migrations directory in alphabetical order
    const migrationsDir = path.join(__dirname, 'db_migrations');
    const files = fs.readdirSync(migrationsDir)
      .filter(f => f.toLowerCase().endsWith('.sql'))
      .sort();

    for (const f of files) {
      const sqlFilePath = path.join(migrationsDir, f);
      console.log('Running migration:', f);
      const sql = fs.readFileSync(sqlFilePath, 'utf8');
      await pool.query(sql);
    }
    
    console.log('Migration completed successfully!');
  } catch (err) {
    console.error('Error running migration:', err);
  } finally {
    // Close pool
    await pool.end();
  }
}

runMigration();