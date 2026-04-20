import { migrate } from 'drizzle-orm/node-postgres/migrator';
import path from 'node:path';
import { createDb } from './client';

async function runMigrations() {
  const { db, pool } = createDb();

  try {
    await migrate(db, { migrationsFolder: path.resolve(process.cwd(), 'drizzle') });
    console.log('Migrations completed successfully');
  } finally {
    await pool.end();
  }
}

void runMigrations();
