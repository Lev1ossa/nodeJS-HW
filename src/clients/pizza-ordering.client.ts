import { buildClient, sendByPayloadRoute } from '@lokalise/backend-http-client';
import { markOrdersReadyContract } from '@nodejs-hw/pizza-contracts';
import type { MadePizza, MarkOrdersReadyResponse } from '@nodejs-hw/pizza-contracts';

type OrderingClientResponse = {
  result?: {
    body: MarkOrdersReadyResponse;
  };
  error?: unknown;
};

export class PizzaOrderingClient {
  private readonly client: ReturnType<typeof buildClient>;

  constructor(baseUrl: string) {
    this.client = buildClient(baseUrl);
  }

  async markOrdersReady(pizzas: MadePizza[]): Promise<MarkOrdersReadyResponse> {
    const response = await sendByPayloadRoute(
      this.client,
      markOrdersReadyContract as Parameters<typeof sendByPayloadRoute>[1],
      {
        pathParams: undefined,
        queryParams: undefined,
        headers: undefined,
        body: { pizzas }
      },
      {
        requestLabel: 'Mark pizza orders ready'
      }
    ) as OrderingClientResponse;

    if (response.error) {
      throw response.error instanceof Error ? response.error : new Error('Pizza Ordering Service request failed');
    }

    if (!response.result) {
      throw new Error('Pizza Ordering Service returned empty response');
    }

    return response.result.body;
  }
}
