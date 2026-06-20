import { buildRestContract } from '@lokalise/api-contracts';
import { z } from 'zod/v4';

export const madePizzaSchema = z.object({
  type: z.string().trim().min(1, 'type is required'),
  amount: z.number().int().positive('amount must be greater than 0')
});

export const markOrdersReadyBodySchema = z.object({
  pizzas: z.array(madePizzaSchema).min(1, 'pizzas are required')
});

export const pizzaOrderStatusSchema = z.enum(['received', 'ready', 'stale']);

export const pizzaOrderSchema = z.object({
  id: z.uuid(),
  type: z.string().trim().min(1, 'type is required'),
  amount: z.number().int().positive('amount must be greater than 0'),
  status: pizzaOrderStatusSchema,
  createdAt: z.iso.datetime(),
  finishedAt: z.iso.datetime().optional(),
  staleAt: z.iso.datetime().optional()
});

export const receiveOrderBodySchema = madePizzaSchema;

export const receiveOrderSuccessResponseSchema = z.object({
  message: z.literal('Order received'),
  data: z.object({
    order: pizzaOrderSchema
  })
});

export const receiveOrderBadRequestResponseSchema = z.object({
  message: z.string()
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

export const receiveOrderContract = buildRestContract({
  method: 'post',
  pathResolver: () => '/orders',
  description: 'Receive a new pizza order and schedule stale order check',
  requestBodySchema: receiveOrderBodySchema,
  successResponseBodySchema: receiveOrderSuccessResponseSchema,
  responseSchemasByStatusCode: {
    400: receiveOrderBadRequestResponseSchema
  }
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
export type PizzaOrderStatus = z.infer<typeof pizzaOrderStatusSchema>;
export type PizzaOrderResponse = z.infer<typeof pizzaOrderSchema>;
export type ReceiveOrderRequest = z.infer<typeof receiveOrderBodySchema>;
export type ReceiveOrderResponse = z.infer<typeof receiveOrderSuccessResponseSchema>;
export type MarkOrdersReadyRequest = z.infer<typeof markOrdersReadyBodySchema>;
export type MarkOrdersReadyResponse = z.infer<typeof markOrdersReadySuccessResponseSchema>;
