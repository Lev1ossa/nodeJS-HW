import { buildPizzaOrderingApp } from './app';

async function start(): Promise<void> {
  const app = buildPizzaOrderingApp();
  const port = Number(process.env.PIZZA_ORDERING_SERVICE_PORT ?? 3001);

  try {
    await app.listen({
      port,
      host: '0.0.0.0'
    });

    console.log(`Pizza Ordering Service is running on http://0.0.0.0:${port}`);
  } catch (error) {
    app.log.error(error);
    process.exit(1);
  }
}

void start();
