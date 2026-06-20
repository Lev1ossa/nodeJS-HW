import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { clearShipmentsTable, createPostgresTestContext, migrateTestDatabase } from './helpers/postgres-test';

const describeIfDatabaseExists = process.env.DATABASE_URL ? describe : describe.skip;

describeIfDatabaseExists('DrizzleShipmentRepository', () => {
  let db: any;
  let pool: { end(): Promise<void> };
  let repository: ReturnType<typeof createPostgresTestContext>['repository'];

  beforeAll(async () => {
    ({ db, pool, repository } = createPostgresTestContext());
    await migrateTestDatabase(db);
  });

  beforeEach(async () => {
    await clearShipmentsTable(db);
  });

  afterAll(async () => {
    await clearShipmentsTable(db);
    await pool.end();
  });

  it('creates and gets shipment by id', async () => {
    const createdShipment = await repository.createShipment({
      targetWarehouse: 'berlin',
      ingredientId: 'flour',
      units: 300
    });

    const shipment = await repository.getShipmentById(createdShipment.id);

    expect(shipment).not.toBeNull();
    expect(shipment?.ingredientId).toBe('flour');
  });

  it('returns all shipments', async () => {
    await repository.createShipment({
      targetWarehouse: 'hamburg',
      ingredientId: 'cheese',
      units: 150
    });

    const shipments = await repository.getAllShipments();
    expect(shipments.length).toBeGreaterThan(0);
  });

  it('deletes shipment', async () => {
    const shipment = await repository.createShipment({
      targetWarehouse: 'munich',
      ingredientId: 'yeast',
      units: 50
    });

    await repository.deleteShipment(shipment.id);
    const deletedShipment = await repository.getShipmentById(shipment.id);

    expect(deletedShipment).toBeNull();
  });

  it('deletes shipments created before date', async () => {
    await repository.createShipment({
      targetWarehouse: 'berlin',
      ingredientId: 'flour',
      units: 100,
      createdAt: new Date('2026-06-01T10:00:00.000Z')
    });
    await repository.createShipment({
      targetWarehouse: 'berlin',
      ingredientId: 'cheese',
      units: 100,
      createdAt: new Date('2026-06-19T10:00:00.000Z')
    });

    const deletedCount = await repository.deleteShipmentsCreatedBefore(new Date('2026-06-13T10:00:00.000Z'));
    const shipments = await repository.getAllShipments();

    expect(deletedCount).toBe(1);
    expect(shipments).toHaveLength(1);
    expect(shipments[0].ingredientId).toBe('cheese');
  });
});
