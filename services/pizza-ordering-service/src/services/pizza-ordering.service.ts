import type { MadePizza } from '@nodejs-hw/pizza-contracts';

export class PizzaOrderingService {
  private readonly readyPizzas: MadePizza[] = [];

  markOrdersReady(pizzas: MadePizza[]) {
    const readyPizzas = pizzas.map((pizza) => ({
      type: pizza.type,
      amount: pizza.amount
    }));

    this.readyPizzas.push(...readyPizzas);

    return {
      readyPizzas,
      totalReady: readyPizzas.reduce((total, pizza) => total + pizza.amount, 0)
    };
  }

  getReadyPizzas(): MadePizza[] {
    return [...this.readyPizzas];
  }
}
