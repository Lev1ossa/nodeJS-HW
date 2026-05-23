import type { MadePizza, MarkOrdersReadyResponse } from '@nodejs-hw/pizza-contracts';

export type PizzaOrderingPort = {
  markOrdersReady(pizzas: MadePizza[]): Promise<MarkOrdersReadyResponse>;
};

export class PizzaProductionService {
  constructor(private readonly orderingClient: PizzaOrderingPort) {
  }

  async finishPizzas(pizzas: MadePizza[]): Promise<MarkOrdersReadyResponse> {
    return this.orderingClient.markOrdersReady(pizzas);
  }
}
