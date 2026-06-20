import Fastify, { FastifyError } from 'fastify';
import {
  hasZodFastifySchemaValidationErrors,
  serializerCompiler,
  validatorCompiler,
  ZodTypeProvider
} from 'fastify-type-provider-zod';
import { registerOrdersRoute } from './routes/orders.route';
import { PizzaOrderingService } from './services/pizza-ordering.service';

export function buildPizzaOrderingApp(orderingService = new PizzaOrderingService()) {
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

  app.register(registerOrdersRoute, { orderingService });

  return app;
}
