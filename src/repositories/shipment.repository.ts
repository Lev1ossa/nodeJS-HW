export type Shipment = {
  id: string;
  targetWarehouse: string;
  ingredientId: string;
  units: number;
  createdAt: Date;
};

export type CreateShipmentData = {
  targetWarehouse: string;
  ingredientId: string;
  units: number;
};

export interface ShipmentRepository {
  createShipment(data: CreateShipmentData): Promise<Shipment>;
  getShipmentById(id: string): Promise<Shipment | null>;
  getAllShipments(): Promise<Shipment[]>;
  deleteShipment(id: string): Promise<void>;
}
