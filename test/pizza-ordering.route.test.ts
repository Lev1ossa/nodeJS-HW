import { injectByContract } from '@lokalise/fastify-api-contracts';
import { markOrdersReadyContract, receiveOrderContract } from '@nodejs-hw/pizza-contracts';
import { describe, expect, it, vi } from 'vitest';
import { buildPizzaOrderingApp } from '../services/pizza-ordering-service/src/app';
import { PizzaOrderingService } from '../services/pizza-ordering-service/src/services/pizza-ordering.service';

describe('pizza ordering orders route', () => {
  it('receives a new pizza order and schedules stale check', async () => {
    const scheduler = {
      scheduleOrderCheck: vi.fn().mockResolvedValue(undefined)
    };
    const orderingService = new PizzaOrderingService(scheduler);
    const app = buildPizzaOrderingApp(orderingService);
    await app.ready();

    const response = await injectByContract(app, receiveOrderContract, {
      body: { type: 'margherita', amount: 2 }
    });

    const responseBody = response.json();

    expect(response.statusCode).toBe(200);
    expect(responseBody.message).toBe('Order received');
    expect(responseBody.data.order).toMatchObject({
      type: 'margherita',
      amount: 2,
      status: 'received'
    });
    expect(responseBody.data.order.id).toEqual(expect.any(String));
    expect(responseBody.data.order.createdAt).toEqual(expect.any(String));
    expect(scheduler.scheduleOrderCheck).toHaveBeenCalledWith(responseBody.data.order.id);

    await app.close();
  });

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
