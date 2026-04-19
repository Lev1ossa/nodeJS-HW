import { describeContract } from '@lokalise/api-contracts';
import { injectByContract } from '@lokalise/fastify-api-contracts';
import { describe, expect, it } from 'vitest';
import { buildApp } from '../src/app';
import { receiveIngredientShipmentContract } from '../src/contracts/stock.contract';

describe(describeContract(receiveIngredientShipmentContract), () => {
  it('returns 400 for invalid request', async () => {
    const app = buildApp();
    await app.ready();

    const response = await injectByContract(app, receiveIngredientShipmentContract, {
      body: {
        ingredientName: '',
        quantity: -1,
        unit: 'kg',
        receivedAt: 'not-a-date'
      }
    });

    expect(response.statusCode).toBe(400);
    expect(response.json()).toEqual({
      message: 'Invalid request body'
    });

    await app.close();
  });

  it('returns 200 for valid request', async () => {
    const app = buildApp();
    await app.ready();

    const payload = {
      ingredientName: 'mozzarella',
      quantity: 10,
      unit: 'kg',
      receivedAt: '2026-03-29T10:00:00Z'
    } as const;

    const response = await injectByContract(app, receiveIngredientShipmentContract, {
      body: payload
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({
      message: 'Ingredient shipment received successfully',
      data: payload
    });

    await app.close();
  });
});
