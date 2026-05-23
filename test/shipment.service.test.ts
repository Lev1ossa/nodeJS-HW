import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { ShipmentValidationError } from '../src/services/shipment.errors';
import {
  clearShipmentsTable,
  createPostgresTestContext,
  migrateTestDatabase
} from './helpers/postgres-test';

const describeIfDatabaseExists = process.env.DATABASE_URL ? describe : describe.skip;

describeIfDatabaseExists('ShipmentService', () => {
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

  it('rejects shipment outside working hours', async () => {
    await expect(
      shipmentService.registerShipment({
        targetWarehouse: 'berlin',
        ingredients: [{ id: 'flour', units: 100 }],
        submittedAt: '2026-04-20T20:00:00.000Z'
      })
    ).rejects.toBeInstanceOf(ShipmentValidationError);
  });

  it('rejects shipment with less than minimum units', async () => {
    await expect(
      shipmentService.registerShipment({
        targetWarehouse: 'hamburg',
        ingredients: [{ id: 'tomato', units: 10 }],
        submittedAt: '2026-04-20T10:00:00.000Z'
      })
    ).rejects.toThrow('less than minimum');
  });

  it('splits shipment into parts of up to 1000 units', async () => {
    const result = await shipmentService.registerShipment({
      targetWarehouse: 'berlin',
      ingredients: [{ id: 'flour', units: 2500 }],
      submittedAt: '2026-04-20T10:00:00.000Z'
    });

    expect(result.map((shipment) => shipment.units)).toEqual([1000, 1000, 500]);
  });

  it('supports multiple warehouses with different minimum and maximum limits', async () => {
    const berlinResult = await shipmentService.registerShipment({
      targetWarehouse: 'berlin',
      ingredients: [{ id: 'cheese', units: 1100 }],
      submittedAt: '2026-04-20T10:00:00.000Z'
    });

    const munichResult = await shipmentService.registerShipment({
      targetWarehouse: 'munich',
      ingredients: [{ id: 'basil', units: 1100 }],
      submittedAt: '2026-04-20T10:00:00.000Z'
    });

    expect(berlinResult).toHaveLength(1);
    expect(munichResult).toHaveLength(1);
    expect(berlinResult[0].units).toBe(1100);
    expect(munichResult[0].units).toBe(1100);
    expect(berlinResult[0].targetWarehouse).toBe('berlin');
    expect(munichResult[0].targetWarehouse).toBe('munich');
  });

  it('uses different maximum limits for different warehouses', async () => {
    const berlinResult = await shipmentService.registerShipment({
      targetWarehouse: 'berlin',
      ingredients: [{ id: 'sauce', units: 1400 }],
      submittedAt: '2026-04-20T10:00:00.000Z'
    });

    const munichResult = await shipmentService.registerShipment({
      targetWarehouse: 'munich',
      ingredients: [{ id: 'sauce', units: 1400 }],
      submittedAt: '2026-04-20T10:00:00.000Z'
    });

    expect(berlinResult).toHaveLength(2);
    expect(munichResult).toHaveLength(1);
    expect(berlinResult.map((shipment) => shipment.units)).toEqual([1000, 400]);
    expect(munichResult[0].units).toBe(1400);
  });

  it('rejects unsupported warehouse', async () => {
    await expect(
      shipmentService.registerShipment({
        targetWarehouse: 'rome',
        ingredients: [{ id: 'olive-oil', units: 100 }],
        submittedAt: '2026-04-20T10:00:00.000Z'
      })
    ).rejects.toThrow('not supported');
  });
});
