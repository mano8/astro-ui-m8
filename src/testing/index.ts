import { QueryClient, QueryClientProvider, type QueryClientConfig } from "@tanstack/react-query";
import { render, type RenderOptions, type RenderResult } from "@testing-library/react";
import { createElement, type ReactElement, type ReactNode } from "react";

export interface TestRequestInput {
  path: string;
  method?: string;
  body?: unknown;
  headers?: Record<string, string>;
}

export interface TestRequestCall extends TestRequestInput {
  index: number;
}

export type TestRequest = <TResponse>(input: TestRequestInput) => Promise<TResponse>;

interface QueuedResult {
  type: "resolve" | "reject";
  value: unknown;
}

export interface TestRequestMock {
  request: TestRequest;
  calls: TestRequestCall[];
  resolve(value: unknown): TestRequestMock;
  reject(error: unknown): TestRequestMock;
  reset(): void;
}

export interface RenderWithQueryClientOptions extends Omit<RenderOptions, "wrapper"> {
  client?: QueryClient;
  queryClientConfig?: QueryClientConfig;
}

export class UnauthorizedTestError extends Error {
  readonly status = 401;

  constructor(message = "Unauthorized") {
    super(message);
    this.name = "UnauthorizedTestError";
  }
}

export function createTestQueryClient(config: QueryClientConfig = {}): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        ...config.defaultOptions?.queries
      },
      mutations: {
        retry: false,
        ...config.defaultOptions?.mutations
      }
    },
    ...config
  });
}

export function createQueryClientWrapper(queryClient = createTestQueryClient()) {
  return function QueryClientWrapper({ children }: { children: ReactNode }): ReactElement {
    return createElement(QueryClientProvider, { client: queryClient }, children);
  };
}

export function renderWithQueryClient(
  ui: ReactElement,
  options: RenderWithQueryClientOptions = {}
): RenderResult & { queryClient: QueryClient } {
  const queryClient = options.client ?? createTestQueryClient(options.queryClientConfig);
  const { client: _client, queryClientConfig: _queryClientConfig, ...renderOptions } = options;
  const result = render(ui, {
    ...renderOptions,
    wrapper: createQueryClientWrapper(queryClient)
  });

  return Object.assign(result, { queryClient });
}

export function createTestRequestMock(): TestRequestMock {
  const calls: TestRequestCall[] = [];
  const queue: QueuedResult[] = [];

  const mock: TestRequestMock = {
    calls,
    request: async <TResponse>(input: TestRequestInput): Promise<TResponse> => {
      calls.push({ ...input, index: calls.length });
      const next = queue.shift();

      if (next === undefined) {
        throw new Error(`No test response queued for ${input.method ?? "GET"} ${input.path}`);
      }

      if (next.type === "reject") {
        throw next.value;
      }

      return next.value as TResponse;
    },
    resolve(value: unknown): TestRequestMock {
      queue.push({ type: "resolve", value });
      return mock;
    },
    reject(error: unknown): TestRequestMock {
      queue.push({ type: "reject", value: error });
      return mock;
    },
    reset(): void {
      calls.splice(0, calls.length);
      queue.splice(0, queue.length);
    }
  };

  return mock;
}

export function createUnauthorizedError(message?: string): UnauthorizedTestError {
  return new UnauthorizedTestError(message);
}
