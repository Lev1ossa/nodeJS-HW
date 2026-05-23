import Fastify, { FastifyError } from 'fastify';
import {
  hasZodFastifySchemaValidationErrors,
  serializerCompiler,
  validatorCompiler,
  ZodTypeProvider
} from 'fastify-type-provider-zod';
import { createDb } from './db/client';
import { DrizzleShipmentRepository } from './repositories/drizzle-shipment.repository';
import { registerHealthcheckRoute } from './routes/healthcheck.route';
import { registerStockRoute } from './routes/stock.route';
import { ShipmentService } from './services/shipment.service';
import { createWarehouseShipmentStrategies } from './strategies/warehouse-shipment.strategy';

export function buildApp(shipmentService?: ShipmentService) {
  const app = Fastify({ logger: false }).withTypeProvider<ZodTypeProvider>();

  app.setValidatorCompiler(validatorCompiler);
  app.setSerializerCompiler(serializerCompiler);

  app.setErrorHandler((error, _request, reply) => {
    if (hasZodFastifySchemaValidationErrors(error)) {
      return reply.status(400).send({ message: 'Invalid request body' });
    }

    const fastifyError = error as FastifyError;

    if (fastifyError.statusCode === 400) {
      return reply.status(400).send({ message: fastifyError.message || 'Invalid request body' });
    }

    return reply.status(fastifyError.statusCode ?? 500).send({
      message: fastifyError.message || 'Internal Server Error'
    });
  });

  const service =
    shipmentService ??
    new ShipmentService(new DrizzleShipmentRepository(createDb().db), createWarehouseShipmentStrategies());

  app.register(registerHealthcheckRoute);
  app.register(registerStockRoute, { shipmentService: service });

  return app;
}
