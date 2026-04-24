export async function up(pool) {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS journals (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      title VARCHAR(255) NOT NULL,
      content TEXT NOT NULL,
      mood VARCHAR(50),
      mood_emoji VARCHAR(10),
      mood_summary TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );
  `);
  console.log("✓ journals table created");
}

export async function down(pool) {
  await pool.query(`DROP TABLE IF EXISTS journals;`);
  console.log("✓ journals table dropped");
}
