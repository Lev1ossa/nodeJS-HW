import { CreateShipmentData, Shipment, ShipmentRepository } from '../repositories/shipment.repository';
import { WarehouseShipmentStrategy } from './warehouse-shipment.strategy';

export type ShipmentIngredient = {
  id: string;
  units: number;
};

export type ShipmentProcessingContext = {
  targetWarehouse: string;
  ingredient: ShipmentIngredient;
  warehouseStrategy: WarehouseShipmentStrategy;
  shipmentRepository: ShipmentRepository;
};

export interface ShipmentProcessingStrategy {
  canHandle(context: ShipmentProcessingContext): boolean;
  process(context: ShipmentProcessingContext): Promise<Shipment[]>;
}

export abstract class BaseShipmentProcessingStrategy implements ShipmentProcessingStrategy {
  abstract canHandle(context: ShipmentProcessingContext): boolean;

  abstract buildShipments(context: ShipmentProcessingContext): CreateShipmentData[];

  async process(context: ShipmentProcessingContext): Promise<Shipment[]> {
    const shipmentsToCreate = this.buildShipments(context);
    const createdShipments: Shipment[] = [];

    for (const shipment of shipmentsToCreate) {
      const createdShipment = await context.shipmentRepository.createShipment(shipment);
      createdShipments.push(createdShipment);
    }

    return createdShipments;
  }
}
