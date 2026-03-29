import { describe, expect, it } from 'vitest';
import { buildApp } from '../src/app';

describe('GET /healthcheck', () => {
  it('returns OK text response', async () => {
    const app = buildApp();
    await app.ready();

    const response = await app.inject({
      method: 'GET',
      url: '/healthcheck'
    });

    expect(response.statusCode).toBe(200);
    expect(response.body).toBe('OK');

    await app.close();
  });
});
