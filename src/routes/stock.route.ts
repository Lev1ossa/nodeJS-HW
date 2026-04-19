import { buildFastifyRoute } from '@lokalise/fastify-api-contracts';
import { FastifyInstance } from 'fastify';
import { receiveIngredientShipmentContract } from '../contracts/stock.contract';

export async function registerStockRoute(app: FastifyInstance): Promise<void> {
  app.route(
    buildFastifyRoute(receiveIngredientShipmentContract, async ({ body }) => {
      return {
        message: 'Ingredient shipment received successfully' as const,
        data: body
      };
    })
  );
}
