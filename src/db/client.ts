import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema';

const DEFAULT_DATABASE_URL = 'postgresql://postgres:postgres@localhost:5432/nodejs_hw';

export function createDb(databaseUrl = process.env.DATABASE_URL) {
  const connectionString = databaseUrl ?? DEFAULT_DATABASE_URL;

  const pool = new Pool({ connectionString });
  const db = drizzle(pool, { schema });

  return { db, pool };
}
