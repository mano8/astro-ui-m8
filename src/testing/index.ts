import { QueryClient, QueryClientProvider, type QueryClientConfig } from "@tanstack/react-query";
import { render, type RenderOptions, type RenderResult } from "@testing-library/react";
import { createElement, type ReactElement, type ReactNode } from "react";
import type { JestAxe } from "jest-axe";

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

/**
 * The kit's a11y baseline (`A-C5`). Every consuming repository — the four
 * business plugins and this package's own registry render tests — runs the
 * same `axe-core` ruleset through this one entry point, rather than each
 * pinning its own `jest-axe`/`axe-core` version and rule config.
 *
 * `jest-axe` is imported lazily, on first call, rather than at module load.
 * `renderWithQueryClient` and friends already give every consumer of this
 * harness an unavoidable `@testing-library/react` + `@tanstack/react-query`
 * requirement; a static top-level `import "jest-axe"` here would add a third
 * one for every caller of *any* helper in this file, including the many that
 * never touch accessibility. A lazy import keeps that cost scoped to callers
 * of this function.
 *
 * Accepts `RenderResult["container"]` directly so a call site reads as one
 * line after `render(...)`, matching `renderWithQueryClient`'s ergonomics.
 * Reports the offending rule id, its impact and the affected node's HTML on
 * failure — detail a bare boolean assertion would throw away.
 */
export async function expectNoA11yViolations(
  container: Element,
  options?: Parameters<JestAxe>[1]
): Promise<void> {
  const { axe } = await import("jest-axe");
  const results = await axe(container, options);

  if (results.violations.length === 0) {
    return;
  }

  const report = results.violations
    .map((violation) => {
      const nodes = violation.nodes.map((node) => node.html).join("\n    ");
      return `- ${violation.id} (${violation.impact ?? "unknown"}): ${violation.help}\n    ${nodes}`;
    })
    .join("\n");

  throw new Error(`axe found ${results.violations.length} accessibility violation(s):\n${report}`);
}
