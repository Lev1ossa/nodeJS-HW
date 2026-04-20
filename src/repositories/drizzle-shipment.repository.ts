import { randomUUID } from 'node:crypto';
import { asc, eq } from 'drizzle-orm';
import { shipmentsTable } from '../db/schema';
import { CreateShipmentData, Shipment, ShipmentRepository } from './shipment.repository';

export class DrizzleShipmentRepository implements ShipmentRepository {
  constructor(private readonly db: any) {}

  async createShipment(data: CreateShipmentData): Promise<Shipment> {
    const [createdShipment] = await this.db
      .insert(shipmentsTable)
      .values({
        id: randomUUID(),
        targetWarehouse: data.targetWarehouse,
        ingredientId: data.ingredientId,
        units: data.units
      })
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
}
