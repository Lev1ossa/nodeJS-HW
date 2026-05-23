import { describe, expect, it, vi } from 'vitest';
import { PizzaProductionService } from '../src/services/pizza-production.service';

describe('PizzaProductionService', () => {
  it('sends made pizzas to Pizza Ordering Service', async () => {
    const markOrdersReady = vi.fn().mockResolvedValue({
      message: 'Orders marked ready',
      data: {
        readyPizzas: [{ type: 'margherita', amount: 2 }],
        totalReady: 2
      }
    });
    const service = new PizzaProductionService({ markOrdersReady });

    const result = await service.finishPizzas([{ type: 'margherita', amount: 2 }]);

    expect(markOrdersReady).toHaveBeenCalledWith([{ type: 'margherita', amount: 2 }]);
    expect(result.data.totalReady).toBe(2);
  });
});
