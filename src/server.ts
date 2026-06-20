import { buildApp } from './app';
import { createDb, DEFAULT_DATABASE_URL } from './db/client';
import { ExpirationJob } from './jobs/expiration.job';
import { createPgBoss } from './jobs/pg-boss';
import { DrizzleShipmentRepository } from './repositories/drizzle-shipment.repository';
import { ShipmentService } from './services/shipment.service';
import { createWarehouseShipmentStrategies } from './strategies/warehouse-shipment.strategy';

async function start(): Promise<void> {
  const databaseUrl = process.env.DATABASE_URL ?? DEFAULT_DATABASE_URL;
  const { db, pool } = createDb(databaseUrl);
  const shipmentRepository = new DrizzleShipmentRepository(db);
  const shipmentService = new ShipmentService(shipmentRepository, createWarehouseShipmentStrategies());
  const app = buildApp(shipmentService);
  const boss = await createPgBoss(databaseUrl);
  const expirationJob = new ExpirationJob(shipmentRepository);

  boss.on?.('error', (error) => app.log.error(error));

  try {
    await boss.start();
    await expirationJob.register(boss);

    await app.listen({
      port: 3000,
      host: '0.0.0.0'
    });

    console.log('Server is running on http://0.0.0.0:3000');
  } catch (error) {
    app.log.error(error);
    await boss.stop();
    await pool.end();
    process.exit(1);
  }

  const stop = async () => {
    await boss.stop();
    await app.close();
    await pool.end();
    process.exit(0);
  };

  process.on('SIGINT', () => void stop());
  process.on('SIGTERM', () => void stop());
}

void start();
