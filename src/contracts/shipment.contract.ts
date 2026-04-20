import { buildRestContract } from '@lokalise/api-contracts';
import {
  registerShipmentBadRequestResponseSchema,
  registerShipmentBodySchema,
  registerShipmentSuccessResponseSchema
} from '../schemas/shipment.schema';

export const registerShipmentContract = buildRestContract({
  method: 'post',
  pathResolver: () => '/stock/ingredients/shipments',
  description: 'Register a shipment for a warehouse',
  requestBodySchema: registerShipmentBodySchema,
  successResponseBodySchema: registerShipmentSuccessResponseSchema,
  responseSchemasByStatusCode: {
    400: registerShipmentBadRequestResponseSchema
  }
});
