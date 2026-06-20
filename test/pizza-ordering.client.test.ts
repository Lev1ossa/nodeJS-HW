import { markOrdersReadyContract } from '@nodejs-hw/pizza-contracts';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { PizzaOrderingClient } from '../src/clients/pizza-ordering.client';

const httpClientMocks = vi.hoisted(() => ({
  buildClient: vi.fn(() => ({ service: 'pizza-ordering' })),
  sendByPayloadRoute: vi.fn()
}));

vi.mock('@lokalise/backend-http-client', () => httpClientMocks);

describe('PizzaOrderingClient', () => {
  beforeEach(() => {
    httpClientMocks.buildClient.mockClear();
    httpClientMocks.sendByPayloadRoute.mockReset();
  });

  it('calls Pizza Ordering Service with the shared contract', async () => {
    httpClientMocks.sendByPayloadRoute.mockResolvedValue({
      result: {
        body: {
          message: 'Orders marked ready',
          data: {
            readyPizzas: [{ type: 'margherita', amount: 2 }],
            totalReady: 2
          }
        }
      }
    });

    const client = new PizzaOrderingClient('http://pizza-ordering-service');
    const response = await client.markOrdersReady([{ type: 'margherita', amount: 2 }]);

    expect(httpClientMocks.buildClient).toHaveBeenCalledWith('http://pizza-ordering-service');
    expect(httpClientMocks.sendByPayloadRoute).toHaveBeenCalledWith(
      { service: 'pizza-ordering' },
      markOrdersReadyContract,
      {
        pathParams: undefined,
        queryParams: undefined,
        headers: undefined,
        body: {
          pizzas: [{ type: 'margherita', amount: 2 }]
        }
      },
      {
        requestLabel: 'Mark pizza orders ready'
      }
    );
    expect(response.data.totalReady).toBe(2);
  });

  it('throws when Pizza Ordering Service request fails', async () => {
    httpClientMocks.sendByPayloadRoute.mockResolvedValue({
      error: new Error('Ordering service is unavailable')
    });

    const client = new PizzaOrderingClient('http://pizza-ordering-service');

    await expect(client.markOrdersReady([{ type: 'margherita', amount: 2 }])).rejects.toThrow(
      'Ordering service is unavailable'
    );
  });
});
