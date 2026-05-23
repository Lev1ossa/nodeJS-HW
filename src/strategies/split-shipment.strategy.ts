import { CreateShipmentData } from '../repositories/shipment.repository';
import { splitBatchIntoAmounts } from '../utils/usefulAlgorithms';
import { BaseShipmentProcessingStrategy, ShipmentProcessingContext } from './shipment-processing.strategy';

const MAX_SHIPMENT_UNITS = 1000;

export class SplitShipmentStrategy extends BaseShipmentProcessingStrategy {
  canHandle(context: ShipmentProcessingContext): boolean {
    return context.ingredient.units > context.warehouseStrategy.getMaximumUnits();
  }

  buildShipments(context: ShipmentProcessingContext): CreateShipmentData[] {
    const splitUnits = splitBatchIntoAmounts({ amount: context.ingredient.units }, MAX_SHIPMENT_UNITS);

    return splitUnits.map((units) => ({
      targetWarehouse: context.targetWarehouse,
      ingredientId: context.ingredient.id,
      units
    }));
  }
}
