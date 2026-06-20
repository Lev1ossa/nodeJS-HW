import { describe, expect, it, vi } from 'vitest';
import { EXPIRATION_JOB_CRON, EXPIRATION_JOB_NAME, ExpirationJob } from '../src/jobs/expiration.job';
import { ShipmentRepository } from '../src/repositories/shipment.repository';

function createRepositoryMock(): ShipmentRepository {
  return {
    createShipment: vi.fn(),
    getShipmentById: vi.fn(),
    getAllShipments: vi.fn(),
    deleteShipment: vi.fn(),
    deleteShipmentsCreatedBefore: vi.fn().mockResolvedValue(2)
  };
}

describe('ExpirationJob', () => {
  it('deletes shipments older than one week', async () => {
    const repository = createRepositoryMock();
    const now = new Date('2026-06-20T12:00:00.000Z');
    const job = new ExpirationJob(repository, () => now);

    const result = await job.handle();

    expect(repository.deleteShipmentsCreatedBefore).toHaveBeenCalledWith(
      new Date('2026-06-13T12:00:00.000Z')
    );
    expect(result.deletedShipments).toBe(2);
  });

  it('registers daily pg-boss schedule and worker', async () => {
    const repository = createRepositoryMock();
    const boss = {
      createQueue: vi.fn().mockResolvedValue(undefined),
      work: vi.fn().mockResolvedValue(undefined),
      schedule: vi.fn().mockResolvedValue(undefined)
    };
    const job = new ExpirationJob(repository);

    await job.register(boss as never);

    expect(boss.createQueue).toHaveBeenCalledWith(EXPIRATION_JOB_NAME);
    expect(boss.work).toHaveBeenCalledWith(EXPIRATION_JOB_NAME, expect.any(Function));
    expect(boss.schedule).toHaveBeenCalledWith(EXPIRATION_JOB_NAME, EXPIRATION_JOB_CRON, null, {
      tz: 'UTC'
    });
  });
});
