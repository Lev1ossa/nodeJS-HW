import { migrate } from 'drizzle-orm/node-postgres/migrator';
import path from 'node:path';
import { createDb } from '../../src/db/client';
import { shipmentsTable } from '../../src/db/schema';
import { DrizzleShipmentRepository } from '../../src/repositories/drizzle-shipment.repository';
import { ShipmentService } from '../../src/services/shipment.service';
import { createWarehouseShipmentStrategies } from '../../src/strategies/warehouse-shipment.strategy';

export function createPostgresTestContext() {
  const { db, pool } = createDb();
  const repository = new DrizzleShipmentRepository(db as never);

  return {
    db,
    pool,
    repository,
    shipmentService: new ShipmentService(repository, createWarehouseShipmentStrategies())
  };
}

export async function migrateTestDatabase(db: any) {
  await migrate(db, { migrationsFolder: path.resolve(process.cwd(), 'drizzle') });
}

export async function clearShipmentsTable(db: any) {
  await db.delete(shipmentsTable);
}
