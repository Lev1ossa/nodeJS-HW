import { z } from 'zod/v4';

export const ingredientShipmentBodySchema = z.object({
  ingredientName: z.string().trim().min(1, 'ingredientName is required'),
  quantity: z.number().positive('quantity must be greater than 0'),
  unit: z.enum(['kg', 'g', 'l', 'ml', 'pcs']),
  receivedAt: z.iso.datetime()
});

export const ingredientShipmentSuccessResponseSchema = z.object({
  message: z.literal('Ingredient shipment received successfully'),
  data: ingredientShipmentBodySchema
});

export const ingredientShipmentBadRequestResponseSchema = z.object({
  message: z.literal('Invalid request body')
});

export type IngredientShipmentBody = z.infer<typeof ingredientShipmentBodySchema>;
export type IngredientShipmentSuccessResponse = z.infer<typeof ingredientShipmentSuccessResponseSchema>;
export type IngredientShipmentBadRequestResponse = z.infer<typeof ingredientShipmentBadRequestResponseSchema>;
