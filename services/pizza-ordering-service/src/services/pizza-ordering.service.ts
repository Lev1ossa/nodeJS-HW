import { randomUUID } from 'node:crypto';
import type { MadePizza, PizzaOrderStatus, ReceiveOrderRequest } from '@nodejs-hw/pizza-contracts';

export type PizzaOrder = {
  id: string;
  type: string;
  amount: number;
  status: PizzaOrderStatus;
  createdAt: Date;
  finishedAt?: Date;
  staleAt?: Date;
};

export type StaleOrderScheduler = {
  scheduleOrderCheck(orderId: string): Promise<void> | void;
};

export class PizzaOrderingService {
  private readonly readyPizzas: MadePizza[] = [];
  private readonly orders: PizzaOrder[] = [];

  constructor(
    private staleOrderScheduler?: StaleOrderScheduler,
    private readonly getNow = () => new Date()
  ) {}

  setStaleOrderScheduler(staleOrderScheduler: StaleOrderScheduler): void {
    this.staleOrderScheduler = staleOrderScheduler;
  }

  async receiveOrder(orderData: ReceiveOrderRequest): Promise<PizzaOrder> {
    const order: PizzaOrder = {
      id: randomUUID(),
      type: orderData.type,
      amount: orderData.amount,
      status: 'received',
      createdAt: this.getNow()
    };

    this.orders.push(order);
    await this.staleOrderScheduler?.scheduleOrderCheck(order.id);

    return this.copyOrder(order);
  }

  markOrdersReady(pizzas: MadePizza[]) {
    const readyPizzas = pizzas.map((pizza) => ({
      type: pizza.type,
      amount: pizza.amount
    }));

    this.readyPizzas.push(...readyPizzas);
    readyPizzas.forEach((pizza) => this.markWaitingOrdersReady(pizza));

    return {
      readyPizzas,
      totalReady: readyPizzas.reduce((total, pizza) => total + pizza.amount, 0)
    };
  }

  getReadyPizzas(): MadePizza[] {
    return [...this.readyPizzas];
  }

  getOrders(): PizzaOrder[] {
    return this.orders.map((order) => this.copyOrder(order));
  }

  getOrderById(orderId: string): PizzaOrder | null {
    const order = this.orders.find((currentOrder) => currentOrder.id === orderId);
    return order ? this.copyOrder(order) : null;
  }

  markOrderStaleIfNotFinished(orderId: string): PizzaOrder | null {
    const order = this.orders.find((currentOrder) => currentOrder.id === orderId);

    if (!order) {
      return null;
    }

    if (order.status === 'ready') {
      return this.copyOrder(order);
    }

    order.status = 'stale';
    order.staleAt = this.getNow();

    return this.copyOrder(order);
  }

  private markWaitingOrdersReady(pizza: MadePizza): void {
    let amountLeft = pizza.amount;

    for (const order of this.orders) {
      if (order.status === 'ready' || order.type !== pizza.type || order.amount > amountLeft) {
        continue;
      }

      order.status = 'ready';
      order.finishedAt = this.getNow();
      amountLeft -= order.amount;
    }
  }

  private copyOrder(order: PizzaOrder): PizzaOrder {
    return {
      ...order,
      createdAt: new Date(order.createdAt),
      finishedAt: order.finishedAt ? new Date(order.finishedAt) : undefined,
      staleAt: order.staleAt ? new Date(order.staleAt) : undefined
    };
  }
}
