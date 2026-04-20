import { buildFastifyRoute } from '@lokalise/fastify-api-contracts';
import { FastifyInstance } from 'fastify';
import { registerShipmentContract } from '../contracts/shipment.contract';
import { ShipmentService } from '../services/shipment.service';

type RegisterStockRouteOptions = {
  shipmentService: ShipmentService;
};

export async function registerStockRoute(
  app: FastifyInstance,
  options: RegisterStockRouteOptions
): Promise<void> {
  const { shipmentService } = options;

  app.route(
    buildFastifyRoute(registerShipmentContract, async ({ body }) => {
      const shipments = await shipmentService.registerShipment(body);

      return {
        message: 'Shipment registered successfully' as const,
        data: {
          shipments: shipments.map((shipment) => ({
            ...shipment,
            createdAt: shipment.createdAt.toISOString()
          }))
        }
      };
    })
  );
}
