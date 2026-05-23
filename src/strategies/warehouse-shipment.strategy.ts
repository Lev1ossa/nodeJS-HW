export type WarehouseWorkingHours = {
  startHour: number;
  endHour: number;
};

export interface WarehouseShipmentStrategy {
  getWarehouseName(): string;
  getMinimumUnits(): number;
  getMaximumUnits(): number;
  isWithinWorkingHours(submittedAt: Date): boolean;
}

export class BaseWarehouseShipmentStrategy implements WarehouseShipmentStrategy {
  constructor(
    private readonly warehouseName: string,
    private readonly minimumUnits: number,
    private readonly maximumUnits: number,
    private readonly workingHours: WarehouseWorkingHours
  ) {}

  getWarehouseName(): string {
    return this.warehouseName;
  }

  getMinimumUnits(): number {
    return this.minimumUnits;
  }

  getMaximumUnits(): number {
    return this.maximumUnits;
  }

  isWithinWorkingHours(submittedAt: Date): boolean {
    const hour = submittedAt.getUTCHours();
    return hour >= this.workingHours.startHour && hour < this.workingHours.endHour;
  }
}

export class BerlinWarehouseShipmentStrategy extends BaseWarehouseShipmentStrategy {
  constructor() {
    super('berlin', 10, 1200, { startHour: 8, endHour: 17 });
  }
}

export class HamburgWarehouseShipmentStrategy extends BaseWarehouseShipmentStrategy {
  constructor() {
    super('hamburg', 20, 1500, { startHour: 6, endHour: 15 });
  }
}

export class MunichWarehouseShipmentStrategy extends BaseWarehouseShipmentStrategy {
  constructor() {
    super('munich', 5, 2000, { startHour: 9, endHour: 18 });
  }
}

export function createWarehouseShipmentStrategies(): WarehouseShipmentStrategy[] {
  return [
    new BerlinWarehouseShipmentStrategy(),
    new HamburgWarehouseShipmentStrategy(),
    new MunichWarehouseShipmentStrategy()
  ];
}
