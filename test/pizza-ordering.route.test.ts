import { injectByContract } from '@lokalise/fastify-api-contracts';
import { markOrdersReadyContract } from '@nodejs-hw/pizza-contracts';
import { describe, expect, it } from 'vitest';
import { buildPizzaOrderingApp } from '../services/pizza-ordering-service/src/app';
import { PizzaOrderingService } from '../services/pizza-ordering-service/src/services/pizza-ordering.service';

describe('pizza ordering orders route', () => {
  it('returns 400 for invalid made pizzas request', async () => {
    const app = buildPizzaOrderingApp();
    await app.ready();

    const response = await injectByContract(app, markOrdersReadyContract, {
      body: { pizzas: [] }
    });

    expect(response.statusCode).toBe(400);
    expect(response.json()).toEqual({ message: 'Invalid request body' });

    await app.close();
  });

  it('marks received pizza orders as ready', async () => {
    const orderingService = new PizzaOrderingService();
    const app = buildPizzaOrderingApp(orderingService);
    await app.ready();

    const response = await injectByContract(app, markOrdersReadyContract, {
      body: {
        pizzas: [
          { type: 'margherita', amount: 2 },
          { type: 'pepperoni', amount: 1 }
        ]
      }
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({
      message: 'Orders marked ready',
      data: {
        readyPizzas: [
          { type: 'margherita', amount: 2 },
          { type: 'pepperoni', amount: 1 }
        ],
        totalReady: 3
      }
    });
    expect(orderingService.getReadyPizzas()).toEqual([
      { type: 'margherita', amount: 2 },
      { type: 'pepperoni', amount: 1 }
    ]);

    await app.close();
  });
});
