// @vitest-environment jsdom
import { useMutation, useQuery } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import {
  createTestQueryClient,
  createTestRequestMock,
  createUnauthorizedError,
  expectNoA11yViolations,
  renderWithQueryClient
} from "./index.js";

function QueryProbe({
  request
}: {
  request: () => Promise<{ message: string }>;
}) {
  const result = useQuery({
    queryKey: ["probe"],
    queryFn: request
  });

  if (result.isLoading) {
    return <p>loading</p>;
  }

  if (result.isError) {
    return <p>{result.error.message}</p>;
  }

  if (result.data === undefined) {
    return <p>empty</p>;
  }

  return <p>{result.data.message}</p>;
}

function MutationProbe({
  request
}: {
  request: () => Promise<{ message: string }>;
}) {
  const mutation = useMutation({ mutationFn: request });

  return (
    <button type="button" onClick={() => mutation.mutate()}>
      {mutation.data?.message ?? mutation.error?.message ?? "submit"}
    </button>
  );
}

describe("testing harness", () => {
  it("renders a component with a no-retry QueryClient", async () => {
    const requestMock = createTestRequestMock().resolve({ message: "ready" });

    renderWithQueryClient(
      <QueryProbe request={() => requestMock.request({ path: "/items" })} />
    );

    expect(screen.getByText("loading")).toBeTruthy();
    expect(await screen.findByText("ready")).toBeTruthy();
    expect(requestMock.calls).toEqual([{ path: "/items", index: 0 }]);
  });

  it("supports mutation failure and resettable request queues", async () => {
    const requestMock = createTestRequestMock().reject(createUnauthorizedError());
    const rendered = renderWithQueryClient(
      <MutationProbe request={() => requestMock.request({ path: "/items", method: "POST" })} />,
      { client: createTestQueryClient() }
    );

    screen.getByRole("button").click();
    expect(await screen.findByText("Unauthorized")).toBeTruthy();
    expect(requestMock.calls).toHaveLength(1);

    requestMock.reset();
    requestMock.resolve({ message: "saved" });
    rendered.queryClient.clear();
    screen.getByRole("button").click();

    await waitFor(() => {
      expect(requestMock.calls).toEqual([{ path: "/items", method: "POST", index: 0 }]);
    });
  });

  // `A-C5`'s a11y baseline. A helper that never fails would be indistinguishable
  // from one that isn't wired up at all — the `H9`/`H13`/`H16` shape this plan
  // keeps running into — so both directions are asserted here, not just the
  // pass case a real consumer's suite would normally exercise.
  describe("expectNoA11yViolations", () => {
    it("resolves for accessible markup", async () => {
      const { container } = render(
        <button type="button" aria-label="Close">
          x
        </button>
      );

      await expect(expectNoA11yViolations(container)).resolves.toBeUndefined();
    });

    it("throws with the offending rule id for a real violation", async () => {
      const { container } = render(<img src="cat.png" />);

      await expect(expectNoA11yViolations(container)).rejects.toThrow(/image-alt/);
    });
  });
});
