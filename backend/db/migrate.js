import dotenv from "dotenv";
dotenv.config();

import pg from "pg";
const { Pool } = pg;

const pool = new Pool({
  host: process.env.PGHOST,
  port: process.env.PGPORT,
  database: process.env.PGDATABASE,
  user: process.env.PGUSER,
  password: process.env.PGPASSWORD,
});

// track applied migrations in a table
async function ensureMigrationsTable() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS migrations (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) UNIQUE NOT NULL,
      applied_at TIMESTAMPTZ DEFAULT NOW()
    );
  `);
}

async function getApplied() {
  const { rows } = await pool.query(`SELECT name FROM migrations ORDER BY id`);
  return rows.map((r) => r.name);
}

const migrations = [
  { name: "001_create_users", file: "./migrations/001_create_users.js" },
  { name: "002_create_journals", file: "./migrations/002_create_journals.js" },
];

async function run() {
  await ensureMigrationsTable();
  const applied = await getApplied();

  for (const migration of migrations) {
    if (applied.includes(migration.name)) {
      console.log(`— skipping ${migration.name} (already applied)`);
      continue;
    }
    const mod = await import(migration.file);
    await mod.up(pool);
    await pool.query(`INSERT INTO migrations (name) VALUES ($1)`, [migration.name]);
    console.log(`✓ applied ${migration.name}`);
  }

  console.log("\nAll migrations complete.");
  await pool.end();
}

run().catch((err) => {
  console.error("Migration failed:", err.message);
  process.exit(1);
});
