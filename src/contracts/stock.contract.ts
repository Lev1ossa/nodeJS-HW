import { buildRestContract } from '@lokalise/api-contracts';
import {
  ingredientShipmentBadRequestResponseSchema,
  ingredientShipmentBodySchema,
  ingredientShipmentSuccessResponseSchema
} from '../schemas/ingredient-shipment.schema';

export const receiveIngredientShipmentContract = buildRestContract({
  method: 'post',
  pathResolver: () => '/stock/ingredients/shipments',
  description: 'Receive a shipment of pizza ingredients into stock',
  requestBodySchema: ingredientShipmentBodySchema,
  successResponseBodySchema: ingredientShipmentSuccessResponseSchema,
  responseSchemasByStatusCode: {
    400: ingredientShipmentBadRequestResponseSchema
  }
});
