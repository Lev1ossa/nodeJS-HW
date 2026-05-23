import { describeContract } from '@lokalise/api-contracts';
import { injectByContract } from '@lokalise/fastify-api-contracts';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { buildApp } from '../src/app';
import { registerShipmentContract } from '../src/contracts/shipment.contract';
import {
  clearShipmentsTable,
  createPostgresTestContext,
  migrateTestDatabase
} from './helpers/postgres-test';

const describeIfDatabaseExists = process.env.DATABASE_URL ? describe : describe.skip;

describeIfDatabaseExists(describeContract(registerShipmentContract), () => {
  let db: any;
  let pool: { end(): Promise<void> };
  let shipmentService: ReturnType<typeof createPostgresTestContext>['shipmentService'];

  beforeAll(async () => {
    ({ db, pool, shipmentService } = createPostgresTestContext());
    await migrateTestDatabase(db);
  });

  beforeEach(async () => {
    await clearShipmentsTable(db);
  });

  afterAll(async () => {
    await clearShipmentsTable(db);
    await pool.end();
  });

  it('returns 400 for invalid request', async () => {
    const app = buildApp(shipmentService);
    await app.ready();

    const response = await injectByContract(app, registerShipmentContract, {
      body: { targetWarehouse: '', ingredients: [] }
    });

    expect(response.statusCode).toBe(400);
    expect(response.json()).toEqual({ message: 'Invalid request body' });

    await app.close();
  });

  it('returns 200 for valid request', async () => {
    const app = buildApp(shipmentService);
    await app.ready();

    const response = await injectByContract(app, registerShipmentContract, {
      body: {
        targetWarehouse: 'berlin',
        ingredients: [{ id: 'mozzarella', units: 10 }],
        submittedAt: '2026-03-29T10:00:00Z'
      }
    });

    expect(response.statusCode).toBe(200);
    const responseBody = response.json();

    expect(responseBody.message).toBe('Shipment registered successfully');
    expect(responseBody.data.shipments).toHaveLength(1);
    expect(responseBody.data.shipments[0]).toMatchObject({
      targetWarehouse: 'berlin',
      ingredientId: 'mozzarella',
      units: 10
    });
    expect(responseBody.data.shipments[0].id).toEqual(expect.any(String));
    expect(responseBody.data.shipments[0].createdAt).toEqual(expect.any(String));

    await app.close();
  });

  it('returns 400 when shipment is outside working hours', async () => {
    const app = buildApp(shipmentService);
    await app.ready();

    const response = await injectByContract(app, registerShipmentContract, {
      body: {
        targetWarehouse: 'berlin',
        ingredients: [{ id: 'mozzarella', units: 10 }],
        submittedAt: '2026-03-29T20:00:00Z'
      }
    });

    expect(response.statusCode).toBe(400);
    expect(response.json()).toEqual({
      message: 'Warehouse berlin does not accept shipments outside working hours'
    });

    await app.close();
  });
});
