import { markOrdersReadyContract, receiveOrderContract } from '@nodejs-hw/pizza-contracts';
import { buildFastifyRoute } from '@lokalise/fastify-api-contracts';
import { FastifyInstance } from 'fastify';
import { PizzaOrderingService } from '../services/pizza-ordering.service';
import type { PizzaOrder } from '../services/pizza-ordering.service';

type RegisterOrdersRouteOptions = {
  orderingService: PizzaOrderingService;
};

export async function registerOrdersRoute(
  app: FastifyInstance,
  options: RegisterOrdersRouteOptions
): Promise<void> {
  const { orderingService } = options;

  app.route(
    buildFastifyRoute(receiveOrderContract, async ({ body }) => {
      const order = await orderingService.receiveOrder(body);

      return {
        message: 'Order received' as const,
        data: {
          order: serializeOrder(order)
        }
      };
    })
  );

  app.route(
    buildFastifyRoute(markOrdersReadyContract, async ({ body }) => {
      const result = orderingService.markOrdersReady(body.pizzas);

      return {
        message: 'Orders marked ready' as const,
        data: result
      };
    })
  );
}

function serializeOrder(order: PizzaOrder) {
  return {
    ...order,
    createdAt: order.createdAt.toISOString(),
    finishedAt: order.finishedAt?.toISOString(),
    staleAt: order.staleAt?.toISOString()
  };
}
