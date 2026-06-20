import type { PizzaOrderingService } from '../services/pizza-ordering.service';
import type { PgBossLike } from './pg-boss';

export const STALE_ORDER_JOB_NAME = 'stale-order';
export const STALE_ORDER_DELAY_SECONDS = 2 * 60 * 60;

export type StaleOrderJobData = {
  orderId: string;
};

export class StaleOrderJob {
  constructor(private readonly orderingService: PizzaOrderingService) {}

  async register(boss: PgBossLike): Promise<void> {
    await boss.createQueue?.(STALE_ORDER_JOB_NAME);

    await boss.work<StaleOrderJobData>(STALE_ORDER_JOB_NAME, async (jobs) => {
      for (const job of jobs) {
        this.handle(job.data);
      }
    });
  }

  async scheduleOrderCheck(boss: PgBossLike, orderId: string): Promise<void> {
    await boss.send(
      STALE_ORDER_JOB_NAME,
      { orderId },
      {
        startAfter: STALE_ORDER_DELAY_SECONDS,
        retryLimit: 1
      }
    );
  }

  handle(data: StaleOrderJobData) {
    return this.orderingService.markOrderStaleIfNotFinished(data.orderId);
  }
}
