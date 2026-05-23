import { buildRestContract } from '@lokalise/api-contracts';
import { z } from 'zod/v4';

export const madePizzaSchema = z.object({
  type: z.string().trim().min(1, 'type is required'),
  amount: z.number().int().positive('amount must be greater than 0')
});

export const markOrdersReadyBodySchema = z.object({
  pizzas: z.array(madePizzaSchema).min(1, 'pizzas are required')
});

export const markOrdersReadySuccessResponseSchema = z.object({
  message: z.literal('Orders marked ready'),
  data: z.object({
    readyPizzas: z.array(madePizzaSchema),
    totalReady: z.number().int().nonnegative()
  })
});

export const markOrdersReadyBadRequestResponseSchema = z.object({
  message: z.string()
});

export const markOrdersReadyContract = buildRestContract({
  method: 'post',
  pathResolver: () => '/orders/ready',
  description: 'Mark pizza orders as ready after production finishes pizzas',
  requestBodySchema: markOrdersReadyBodySchema,
  successResponseBodySchema: markOrdersReadySuccessResponseSchema,
  responseSchemasByStatusCode: {
    400: markOrdersReadyBadRequestResponseSchema
  }
});

export type MadePizza = z.infer<typeof madePizzaSchema>;
export type MarkOrdersReadyRequest = z.infer<typeof markOrdersReadyBodySchema>;
export type MarkOrdersReadyResponse = z.infer<typeof markOrdersReadySuccessResponseSchema>;
