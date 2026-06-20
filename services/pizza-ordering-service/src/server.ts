import { buildPizzaOrderingApp } from './app';
import { createPgBoss } from './jobs/pg-boss';
import { StaleOrderJob } from './jobs/stale-order.job';
import { PizzaOrderingService } from './services/pizza-ordering.service';

const DEFAULT_DATABASE_URL = 'postgresql://postgres:postgres@localhost:5432/nodejs_hw';

async function start(): Promise<void> {
  const databaseUrl = process.env.DATABASE_URL ?? DEFAULT_DATABASE_URL;
  const orderingService = new PizzaOrderingService();
  const staleOrderJob = new StaleOrderJob(orderingService);
  const boss = await createPgBoss(databaseUrl);
  const app = buildPizzaOrderingApp(orderingService);
  const port = Number(process.env.PIZZA_ORDERING_SERVICE_PORT ?? 3001);

  orderingService.setStaleOrderScheduler({
    scheduleOrderCheck: (orderId) => staleOrderJob.scheduleOrderCheck(boss, orderId)
  });
  boss.on?.('error', (error) => app.log.error(error));

  try {
    await boss.start();
    await staleOrderJob.register(boss);

    await app.listen({
      port,
      host: '0.0.0.0'
    });

    console.log(`Pizza Ordering Service is running on http://0.0.0.0:${port}`);
  } catch (error) {
    app.log.error(error);
    await boss.stop();
    process.exit(1);
  }

  const stop = async () => {
    await boss.stop();
    await app.close();
    process.exit(0);
  };

  process.on('SIGINT', () => void stop());
  process.on('SIGTERM', () => void stop());
}

void start();
