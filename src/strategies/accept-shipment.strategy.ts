import { CreateShipmentData } from '../repositories/shipment.repository';
import { BaseShipmentProcessingStrategy, ShipmentProcessingContext } from './shipment-processing.strategy';

export class AcceptShipmentStrategy extends BaseShipmentProcessingStrategy {
  canHandle(context: ShipmentProcessingContext): boolean {
    return context.ingredient.units <= context.warehouseStrategy.getMaximumUnits();
  }

  buildShipments(context: ShipmentProcessingContext): CreateShipmentData[] {
    return [
      {
        targetWarehouse: context.targetWarehouse,
        ingredientId: context.ingredient.id,
        units: context.ingredient.units
      }
    ];
  }
}
