// @vitest-environment jsdom
//
// Render tests for the `error-boundary` registry block (`A-C3`).
//
// Like `tree-view`, the block is registry source rather than package source: it
// is copied into a consumer app and imports the sibling `state-error` block,
// which in turn imports `@/components/ui/*`. Those specifiers resolve through
// the `resolve.alias` entries in `vitest.config.ts`, which point at the same
// registry-consumer fixture shims `npm run verify:registry-consumer` compiles
// the copied blocks against.
import * as React from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";

import { expectNoA11yViolations } from "../../src/testing/index.js";
import { ErrorBoundary } from "../../registry/blocks/feedback/error-boundary";

afterEach(cleanup);

/**
 * React logs a caught render throw to `console.error` regardless of what the
 * boundary does with it. Silence it per test so a passing suite stays readable,
 * and restore it afterwards so a genuine warning elsewhere is still visible.
 */
let consoleError: ReturnType<typeof vi.spyOn>;

beforeEach(() => {
  consoleError = vi.spyOn(console, "error").mockImplementation(() => undefined);
});

afterEach(() => {
  consoleError.mockRestore();
});

function Boom({ throws, message = "render exploded" }: { throws: boolean; message?: string }) {
  if (throws) throw new Error(message);
  return <p>healthy child</p>;
}

describe("error-boundary registry block", () => {
  it("renders its children while nothing throws", () => {
    render(
      <ErrorBoundary>
        <Boom throws={false} />
      </ErrorBoundary>,
    );

    expect(screen.getByText("healthy child")).toBeTruthy();
    expect(document.querySelector("[data-m8-error-boundary]")).toBeNull();
  });

  it("catches a render throw and renders the canonical state-error fallback", () => {
    render(
      <ErrorBoundary>
        <Boom throws />
      </ErrorBoundary>,
    );

    expect(document.querySelector('[data-m8-error-boundary="fallback"]')).not.toBeNull();
    expect(screen.getByRole("alert")).toBeTruthy();
    expect(screen.getByText("This view stopped responding")).toBeTruthy();
    expect(screen.queryByText("healthy child")).toBeNull();
  });

  it("never renders the caught message, which may carry request detail", () => {
    render(
      <ErrorBoundary>
        <Boom throws message="token=super-secret-value" />
      </ErrorBoundary>,
    );

    expect(document.body.textContent).not.toContain("super-secret-value");
  });

  it("reports the error and its component stack through onError", () => {
    const onError = vi.fn();

    render(
      <ErrorBoundary onError={onError}>
        <Boom throws message="reported upward" />
      </ErrorBoundary>,
    );

    expect(onError).toHaveBeenCalledTimes(1);
    const [error, info] = onError.mock.calls[0] as [Error, { componentStack: string }];
    expect(error).toBeInstanceOf(Error);
    expect(error.message).toBe("reported upward");
    expect(typeof info.componentStack).toBe("string");
  });

  it("normalizes a non-Error throw so onError always receives an Error", () => {
    const onError = vi.fn();

    function ThrowString(): React.ReactNode {
      throw "thrown as a string";
    }
    function ThrowObject(): React.ReactNode {
      throw { code: 500 };
    }

    render(
      <ErrorBoundary onError={onError}>
        <ThrowString />
      </ErrorBoundary>,
    );
    render(
      <ErrorBoundary onError={onError}>
        <ThrowObject />
      </ErrorBoundary>,
    );

    const [stringError] = onError.mock.calls[0] as [Error];
    const [objectError] = onError.mock.calls[1] as [Error];
    expect(stringError).toBeInstanceOf(Error);
    expect(stringError.message).toBe("thrown as a string");
    expect(objectError).toBeInstanceOf(Error);
    expect(objectError.message).toBe("The view failed to render.");
  });

  it("renders a custom fallback with the error and a working reset", () => {
    function Harness() {
      const [throws, setThrows] = React.useState(true);
      return (
        <ErrorBoundary
          fallback={({ error, reset }) => (
            <div>
              <p>custom: {error.message}</p>
              <button
                type="button"
                onClick={() => {
                  setThrows(false);
                  reset();
                }}
              >
                recover
              </button>
            </div>
          )}
        >
          <Boom throws={throws} message="custom path" />
        </ErrorBoundary>
      );
    }

    render(<Harness />);
    expect(screen.getByText("custom: custom path")).toBeTruthy();

    fireEvent.click(screen.getByText("recover"));
    expect(screen.getByText("healthy child")).toBeTruthy();
  });

  it("re-renders children when the default fallback's retry is clicked", () => {
    function Harness() {
      const [throws, setThrows] = React.useState(true);
      return (
        <>
          <button type="button" onClick={() => setThrows(false)}>
            fix the child
          </button>
          <ErrorBoundary>
            <Boom throws={throws} />
          </ErrorBoundary>
        </>
      );
    }

    render(<Harness />);
    expect(screen.getByText("This view stopped responding")).toBeTruthy();

    fireEvent.click(screen.getByText("fix the child"));
    fireEvent.click(screen.getByText("Reload this view"));

    expect(screen.getByText("healthy child")).toBeTruthy();
  });

  it("clears itself when a resetKey changes, and holds while the keys are equal", () => {
    function Harness() {
      const [processId, setProcessId] = React.useState("p1");
      // The child throws only for the first process, so a key change is a real
      // recovery rather than a re-throw the boundary would catch again.
      return (
        <>
          <button type="button" onClick={() => setProcessId("p2")}>
            switch process
          </button>
          <button type="button" onClick={() => setProcessId("p1")}>
            same process
          </button>
          <ErrorBoundary resetKeys={[processId]}>
            <Boom throws={processId === "p1"} />
          </ErrorBoundary>
        </>
      );
    }

    render(<Harness />);
    expect(screen.getByText("This view stopped responding")).toBeTruthy();

    // Re-setting the same value keeps the boundary tripped: `Object.is` sees no
    // change, so there is nothing to recover from.
    fireEvent.click(screen.getByText("same process"));
    expect(screen.getByText("This view stopped responding")).toBeTruthy();

    fireEvent.click(screen.getByText("switch process"));
    expect(screen.getByText("healthy child")).toBeTruthy();
  });

  it("treats a changed resetKeys length as a change", () => {
    function Harness() {
      const [keys, setKeys] = React.useState<string[]>(["a"]);
      const [throws, setThrows] = React.useState(true);
      return (
        <>
          <button
            type="button"
            onClick={() => {
              setThrows(false);
              setKeys(["a", "b"]);
            }}
          >
            grow keys
          </button>
          <ErrorBoundary resetKeys={keys}>
            <Boom throws={throws} />
          </ErrorBoundary>
        </>
      );
    }

    render(<Harness />);
    expect(screen.getByText("This view stopped responding")).toBeTruthy();

    fireEvent.click(screen.getByText("grow keys"));
    expect(screen.getByText("healthy child")).toBeTruthy();
  });

  it("holds the fallback when resetKeys is absent on either render", () => {
    function Harness() {
      const [tick, setTick] = React.useState(0);
      return (
        <>
          <button type="button" onClick={() => setTick(tick + 1)}>
            re-render
          </button>
          <ErrorBoundary>
            <Boom throws />
          </ErrorBoundary>
        </>
      );
    }

    render(<Harness />);
    fireEvent.click(screen.getByText("re-render"));
    expect(screen.getByText("This view stopped responding")).toBeTruthy();
  });

  it("has no axe violations on the default fallback (`A-C5`)", async () => {
    const { container } = render(
      <ErrorBoundary>
        <Boom throws />
      </ErrorBoundary>,
    );

    await expectNoA11yViolations(container);
  });

  it("accepts overridden fallback copy", () => {
    render(
      <ErrorBoundary
        title="Prompt library unavailable"
        description="Reload to try again."
        retryLabel="Retry now"
      >
        <Boom throws />
      </ErrorBoundary>,
    );

    expect(screen.getByText("Prompt library unavailable")).toBeTruthy();
    expect(screen.getByText("Reload to try again.")).toBeTruthy();
    expect(screen.getByText("Retry now")).toBeTruthy();
  });
});
