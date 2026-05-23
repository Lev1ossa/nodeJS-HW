import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { buildApp } from '../src/app';
import {
  createPostgresTestContext,
  migrateTestDatabase
} from './helpers/postgres-test';

const describeIfDatabaseExists = process.env.DATABASE_URL ? describe : describe.skip;

describeIfDatabaseExists('GET /healthcheck', () => {
  let db: any;
  let pool: { end(): Promise<void> };
  let shipmentService: ReturnType<typeof createPostgresTestContext>['shipmentService'];

  beforeAll(async () => {
    ({ db, pool, shipmentService } = createPostgresTestContext());
    await migrateTestDatabase(db);
  });

  afterAll(async () => {
    await pool.end();
  });

  it('returns OK text response', async () => {
    const app = buildApp(shipmentService);
    await app.ready();

    const response = await app.inject({ method: 'GET', url: '/healthcheck' });

    expect(response.statusCode).toBe(200);
    expect(response.body).toBe('OK');

    await app.close();
  });
});
