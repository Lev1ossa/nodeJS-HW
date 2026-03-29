import Fastify, { FastifyError } from 'fastify';
import {
  hasZodFastifySchemaValidationErrors,
  serializerCompiler,
  validatorCompiler,
  ZodTypeProvider
} from 'fastify-type-provider-zod';
import { registerHealthcheckRoute } from './routes/healthcheck.route';
import { registerStockRoute } from './routes/stock.route';

export function buildApp() {
  const app = Fastify({
    logger: false
  }).withTypeProvider<ZodTypeProvider>();

  app.setValidatorCompiler(validatorCompiler);
  app.setSerializerCompiler(serializerCompiler);

  app.setErrorHandler((error, _request, reply) => {
    if (hasZodFastifySchemaValidationErrors(error)) {
      return reply.status(400).send({
        message: 'Invalid request body'
      });
    }

    const fastifyError = error as FastifyError;

    if (fastifyError.statusCode === 400) {
      return reply.status(400).send({
        message: 'Invalid request body'
      });
    }

    return reply.status(fastifyError.statusCode ?? 500).send({
      message: 'Internal Server Error'
    });
  });

  app.register(registerHealthcheckRoute);
  app.register(registerStockRoute);

  return app;
}
