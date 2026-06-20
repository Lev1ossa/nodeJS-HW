import { describe, expect, it, vi } from 'vitest';
import {
  STALE_ORDER_DELAY_SECONDS,
  STALE_ORDER_JOB_NAME,
  StaleOrderJob
} from '../services/pizza-ordering-service/src/jobs/stale-order.job';
import { PizzaOrderingService } from '../services/pizza-ordering-service/src/services/pizza-ordering.service';

describe('StaleOrderJob', () => {
  it('schedules stale check when order is received', async () => {
    const scheduler = {
      scheduleOrderCheck: vi.fn().mockResolvedValue(undefined)
    };
    const service = new PizzaOrderingService(scheduler, () => new Date('2026-06-20T10:00:00.000Z'));

    const order = await service.receiveOrder({ type: 'margherita', amount: 1 });

    expect(order.status).toBe('received');
    expect(scheduler.scheduleOrderCheck).toHaveBeenCalledWith(order.id);
  });

  it('marks unfinished order as stale', async () => {
    const service = new PizzaOrderingService(undefined, () => new Date('2026-06-20T12:00:00.000Z'));
    const order = await service.receiveOrder({ type: 'pepperoni', amount: 2 });
    const job = new StaleOrderJob(service);

    const staleOrder = job.handle({ orderId: order.id });

    expect(staleOrder?.status).toBe('stale');
    expect(staleOrder?.staleAt).toEqual(new Date('2026-06-20T12:00:00.000Z'));
    expect(service.getOrderById(order.id)?.status).toBe('stale');
  });

  it('does not mark finished order as stale', async () => {
    const service = new PizzaOrderingService(undefined, () => new Date('2026-06-20T12:00:00.000Z'));
    const order = await service.receiveOrder({ type: 'margherita', amount: 1 });
    const job = new StaleOrderJob(service);

    service.markOrdersReady([{ type: 'margherita', amount: 1 }]);
    const result = job.handle({ orderId: order.id });

    expect(result?.status).toBe('ready');
    expect(result?.staleAt).toBeUndefined();
  });

  it('registers pg-boss worker and sends delayed job for two hours', async () => {
    const service = new PizzaOrderingService();
    const boss = {
      createQueue: vi.fn().mockResolvedValue(undefined),
      work: vi.fn().mockResolvedValue(undefined),
      send: vi.fn().mockResolvedValue('job-1')
    };
    const job = new StaleOrderJob(service);

    await job.register(boss as never);
    await job.scheduleOrderCheck(boss as never, 'order-1');

    expect(boss.work).toHaveBeenCalledWith(STALE_ORDER_JOB_NAME, expect.any(Function));
    expect(boss.send).toHaveBeenCalledWith(
      STALE_ORDER_JOB_NAME,
      { orderId: 'order-1' },
      {
        startAfter: STALE_ORDER_DELAY_SECONDS,
        retryLimit: 1
      }
    );
  });
});
