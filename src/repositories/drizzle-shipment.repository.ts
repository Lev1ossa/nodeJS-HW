import { randomUUID } from 'node:crypto';
import { asc, eq, lt } from 'drizzle-orm';
import { shipmentsTable } from '../db/schema';
import { CreateShipmentData, Shipment, ShipmentRepository } from './shipment.repository';

export class DrizzleShipmentRepository implements ShipmentRepository {
  constructor(private readonly db: any) {}

  async createShipment(data: CreateShipmentData): Promise<Shipment> {
    const shipmentData = {
      id: randomUUID(),
      targetWarehouse: data.targetWarehouse,
      ingredientId: data.ingredientId,
      units: data.units,
      ...(data.createdAt ? { createdAt: data.createdAt } : {})
    };

    const [createdShipment] = await this.db
      .insert(shipmentsTable)
      .values(shipmentData)
      .returning();

    return createdShipment;
  }

  async getShipmentById(id: string): Promise<Shipment | null> {
    const [shipment] = await this.db.select().from(shipmentsTable).where(eq(shipmentsTable.id, id));
    return shipment ?? null;
  }

  async getAllShipments(): Promise<Shipment[]> {
    return this.db.select().from(shipmentsTable).orderBy(asc(shipmentsTable.createdAt), asc(shipmentsTable.id));
  }

  async deleteShipment(id: string): Promise<void> {
    await this.db.delete(shipmentsTable).where(eq(shipmentsTable.id, id));
  }

  async deleteShipmentsCreatedBefore(createdBefore: Date): Promise<number> {
    const deletedShipments = await this.db
      .delete(shipmentsTable)
      .where(lt(shipmentsTable.createdAt, createdBefore))
      .returning({ id: shipmentsTable.id });

    return deletedShipments.length;
  }
}
