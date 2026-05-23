import { z } from 'zod/v4';

export const shipmentIngredientSchema = z.object({
  id: z.string().trim().min(1, 'id is required'),
  units: z.number().int().positive('units must be greater than 0')
});

export const registerShipmentBodySchema = z.object({
  targetWarehouse: z.string().trim().min(1, 'targetWarehouse is required'),
  ingredients: z.array(shipmentIngredientSchema).min(1, 'ingredients are required'),
  submittedAt: z.iso.datetime().optional()
});

export const shipmentSchema = z.object({
  id: z.string(),
  targetWarehouse: z.string(),
  ingredientId: z.string(),
  units: z.number().int().positive(),
  createdAt: z.iso.datetime()
});

export const registerShipmentSuccessResponseSchema = z.object({
  message: z.literal('Shipment registered successfully'),
  data: z.object({
    shipments: z.array(shipmentSchema)
  })
});

export const registerShipmentBadRequestResponseSchema = z.object({
  message: z.string()
});
