import { buildApp } from './app';

async function start(): Promise<void> {
  const app = buildApp();

  try {
    await app.listen({
      port: 3000,
      host: '0.0.0.0'
    });

    console.log('Server is running on http://0.0.0.0:3000');
  } catch (error) {
    app.log.error(error);
    process.exit(1);
  }
}

void start();
