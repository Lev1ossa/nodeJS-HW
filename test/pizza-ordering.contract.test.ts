import { describeContract } from '@lokalise/api-contracts';
import {
  madePizzaSchema,
  markOrdersReadyBodySchema,
  markOrdersReadyContract
} from '@nodejs-hw/pizza-contracts';
import { describe, expect, it } from 'vitest';

describe(describeContract(markOrdersReadyContract), () => {
  it('describes the ordering endpoint', () => {
    expect(markOrdersReadyContract.method).toBe('post');
    expect(markOrdersReadyContract.pathResolver(undefined)).toBe('/orders/ready');
  });

  it('validates pizzas that were made', () => {
    expect(madePizzaSchema.safeParse({ type: 'margherita', amount: 2 }).success).toBe(true);
    expect(madePizzaSchema.safeParse({ type: '', amount: 2 }).success).toBe(false);
    expect(madePizzaSchema.safeParse({ type: 'pepperoni', amount: 0 }).success).toBe(false);
  });

  it('requires at least one pizza batch', () => {
    expect(markOrdersReadyBodySchema.safeParse({ pizzas: [] }).success).toBe(false);
  });
});
