import { ShipmentRepository, Shipment } from '../repositories/shipment.repository';
import {
  AcceptShipmentStrategy
} from '../strategies/accept-shipment.strategy';
import {
  ShipmentProcessingStrategy,
  ShipmentIngredient,
  ShipmentProcessingContext
} from '../strategies/shipment-processing.strategy';
import { SplitShipmentStrategy } from '../strategies/split-shipment.strategy';
import { WarehouseShipmentStrategy } from '../strategies/warehouse-shipment.strategy';
import { ShipmentValidationError } from './shipment.errors';

export type RegisterShipmentParams = {
  targetWarehouse: string;
  ingredients: Array<{
    id: string;
    units: number;
  }>;
  submittedAt?: string;
};

export class ShipmentService {
  private readonly processingStrategies: ShipmentProcessingStrategy[] = [
    new SplitShipmentStrategy(),
    new AcceptShipmentStrategy()
  ];

  constructor(
    private readonly shipmentRepository: ShipmentRepository,
    private readonly warehouseStrategies: WarehouseShipmentStrategy[]
  ) {
  }

  async registerShipment(params: RegisterShipmentParams): Promise<Shipment[]> {
    const warehouseStrategy = this.warehouseStrategies.find(
      (strategy) => strategy.getWarehouseName() === params.targetWarehouse
    );

    if (!warehouseStrategy) {
      throw new ShipmentValidationError(`Warehouse ${params.targetWarehouse} is not supported`);
    }

    const submittedAt = params.submittedAt ? new Date(params.submittedAt) : new Date();

    if (Number.isNaN(submittedAt.getTime())) {
      throw new ShipmentValidationError('submittedAt is invalid');
    }

    if (!warehouseStrategy.isWithinWorkingHours(submittedAt)) {
      throw new ShipmentValidationError(
        `Warehouse ${params.targetWarehouse} does not accept shipments outside working hours`
      );
    }

    const createdShipments: Shipment[] = [];

    for (const ingredient of params.ingredients) {
      this.validateIngredientAmount(ingredient, warehouseStrategy, params.targetWarehouse);

      const context: ShipmentProcessingContext = {
        targetWarehouse: params.targetWarehouse,
        ingredient,
        warehouseStrategy,
        shipmentRepository: this.shipmentRepository
      };

      const processingStrategy = this.processingStrategies.find((strategy) => strategy.canHandle(context));

      if (!processingStrategy) {
        throw new ShipmentValidationError(`No shipment strategy found for ingredient ${ingredient.id}`);
      }

      const shipments = await processingStrategy.process(context);
      createdShipments.push(...shipments);
    }

    return createdShipments;
  }

  private validateIngredientAmount(
    ingredient: ShipmentIngredient,
    warehouseStrategy: WarehouseShipmentStrategy,
    targetWarehouse: string
  ) {
    if (ingredient.units < warehouseStrategy.getMinimumUnits()) {
      throw new ShipmentValidationError(
        `Ingredient ${ingredient.id} has less than minimum amount of units for warehouse ${targetWarehouse}`
      );
    }
  }
}
