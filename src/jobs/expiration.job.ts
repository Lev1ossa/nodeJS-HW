import type { ShipmentRepository } from '../repositories/shipment.repository';
import type { PgBossLike } from './pg-boss';

export const EXPIRATION_JOB_NAME = 'shipment-expiration';
export const EXPIRATION_JOB_CRON = '0 3 * * *';
export const SHIPMENT_EXPIRATION_DAYS = 7;

export class ExpirationJob {
  constructor(
    private readonly shipmentRepository: ShipmentRepository,
    private readonly getNow = () => new Date()
  ) {}

  async register(boss: PgBossLike): Promise<void> {
    await boss.createQueue?.(EXPIRATION_JOB_NAME);

    await boss.work(EXPIRATION_JOB_NAME, async () => this.handle());
    await boss.schedule(EXPIRATION_JOB_NAME, EXPIRATION_JOB_CRON, null, { tz: 'UTC' });
  }

  async handle(): Promise<{ deletedShipments: number; expiredBefore: Date }> {
    const expiredBefore = new Date(this.getNow().getTime() - SHIPMENT_EXPIRATION_DAYS * 24 * 60 * 60 * 1000);
    const deletedShipments = await this.shipmentRepository.deleteShipmentsCreatedBefore(expiredBefore);

    return {
      deletedShipments,
      expiredBefore
    };
  }
}
