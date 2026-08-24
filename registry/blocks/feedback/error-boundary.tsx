"use client";

// Canonical React error boundary for the M8 Astro plugin fleet (`A-C3`).
//
// A render-phase throw inside an island unmounts the whole island tree and
// leaves the host page with a blank region and a console trace. Every plugin
// mounts its views as islands, so the blast radius is one route's entire
// interactive surface. This block catches that throw and renders the canonical
// `state-error` block in its place, so a broken view degrades to the same
// surface a failed request already degrades to.
//
// It is a class on purpose: `getDerivedStateFromError` / `componentDidCatch`
// have no hook equivalent, and React still offers no function-component API for
// catching a render throw.

import * as React from "react";

import { StateError } from "./state-error";

export interface ErrorBoundaryFallbackProps {
  error: Error;
  reset: () => void;
}

export interface ErrorBoundaryProps {
  children: React.ReactNode;
  /**
   * Replaces the default `state-error` fallback. Receives the caught error and
   * a `reset` that clears the boundary and re-renders `children`.
   */
  fallback?: (props: ErrorBoundaryFallbackProps) => React.ReactNode;
  /**
   * Reporting hook. The boundary itself never logs: what a host does with a
   * caught error — console, Sentry, a toast — is the host's decision.
   */
  onError?: (error: Error, info: { componentStack: string }) => void;
  /**
   * Clears the boundary when any member changes, so navigating away from the
   * input that threw recovers without a reload. Compared by `Object.is`,
   * position by position, exactly as React compares a dependency array.
   */
  resetKeys?: readonly unknown[];
  title?: string;
  description?: string;
  retryLabel?: string;
}

interface ErrorBoundaryState {
  error: Error | null;
}

/**
 * A thrown value is not necessarily an `Error` — `throw "boom"` and
 * `throw {code:1}` are legal — so normalize before handing it on. Callers can
 * then rely on `error.message` without a type guard of their own.
 */
function toError(thrown: unknown): Error {
  if (thrown instanceof Error) return thrown;
  if (typeof thrown === "string") return new Error(thrown);
  return new Error("The view failed to render.");
}

function resetKeysChanged(
  previous: readonly unknown[] | undefined,
  next: readonly unknown[] | undefined,
): boolean {
  if (previous === undefined || next === undefined) return false;
  if (previous.length !== next.length) return true;
  return previous.some((value, index) => !Object.is(value, next[index]));
}

export class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  override state: ErrorBoundaryState = { error: null };

  static getDerivedStateFromError(thrown: unknown): ErrorBoundaryState {
    return { error: toError(thrown) };
  }

  override componentDidCatch(thrown: unknown, info: React.ErrorInfo): void {
    this.props.onError?.(toError(thrown), {
      componentStack: info.componentStack ?? "",
    });
  }

  override componentDidUpdate(previous: ErrorBoundaryProps): void {
    if (this.state.error === null) return;
    if (!resetKeysChanged(previous.resetKeys, this.props.resetKeys)) return;
    this.reset();
  }

  reset = (): void => {
    this.setState({ error: null });
  };

  override render(): React.ReactNode {
    const { error } = this.state;
    if (error === null) return this.props.children;

    if (this.props.fallback) {
      return this.props.fallback({ error, reset: this.reset });
    }

    // The caught message is deliberately *not* rendered. A render throw carries
    // whatever the failing code put in it — an id, a URL, a parse fragment —
    // and this fallback is a user-facing surface. A host that wants the detail
    // reads it from `onError` or renders its own `fallback`.
    return (
      <div data-m8-error-boundary="fallback">
        <StateError
          title={this.props.title ?? "This view stopped responding"}
          description={
            this.props.description ??
            "The page hit an unexpected error and could not finish rendering."
          }
          retryLabel={this.props.retryLabel ?? "Reload this view"}
          onRetry={this.reset}
        />
      </div>
    );
  }
}
