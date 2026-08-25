// @vitest-environment jsdom
//
// Render tests for the `state-*` registry blocks (`A-C5`).
//
// These four blocks had no dedicated render suite before this step —
// `error-boundary.test.tsx` only exercises `state-error` indirectly, as its
// default fallback. Two things are asserted for each, together rather than
// separately, because either alone would miss the other's regression:
//
// - **A11y baseline.** `axe` against the block's default render, through the
//   shared harness (`expectNoA11yViolations`, `@mano8/astro-ui-m8/testing`).
// - **Label-map drift.** Each block already ships its own local English
//   defaults as prop defaults; `src/lib/labels.ts` (`DEFAULT_KIT_LABELS`) is a
//   *second*, independent statement of the same strings, published so a host
//   can localize the kit in one place. Asserting the rendered text against
//   `DEFAULT_KIT_LABELS` here is what keeps the two from drifting apart
//   unnoticed — the `H9`/`H13`/`H16` shape this plan keeps finding, where a
//   duplicated fact silently stops matching its source.
//
// Like `error-boundary` and `tree-view`, these blocks are registry source
// copied into a consumer app: `state-error` and `state-unauthorized` import
// `@/components/ui/alert`, `state-error` also imports `@/components/ui/button`,
// and `state-loading` imports `@/components/ui/skeleton`. All three resolve
// through the same `resolve.alias` fixture shims `verify:registry-consumer`
// compiles the copied blocks against.
import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";

import { DEFAULT_KIT_LABELS } from "../../src/lib/labels";
import { expectNoA11yViolations } from "../../src/testing/index.js";
import { StateEmpty } from "../../registry/blocks/state/state-empty";
import { StateError } from "../../registry/blocks/state/state-error";
import { StateLoading } from "../../registry/blocks/state/state-loading";
import { StateUnauthorized } from "../../registry/blocks/state/state-unauthorized";

afterEach(cleanup);

describe("state-empty registry block", () => {
  it("renders the canonical default copy", () => {
    render(<StateEmpty />);

    expect(screen.getByText(DEFAULT_KIT_LABELS.stateEmpty.title)).toBeTruthy();
    expect(screen.getByText(DEFAULT_KIT_LABELS.stateEmpty.description)).toBeTruthy();
  });

  it("has no axe violations", async () => {
    const { container } = render(<StateEmpty />);
    await expectNoA11yViolations(container);
  });
});

describe("state-error registry block", () => {
  it("renders the canonical default copy, including the retry action", () => {
    render(<StateError onRetry={() => undefined} />);

    expect(screen.getByText(DEFAULT_KIT_LABELS.stateError.title)).toBeTruthy();
    expect(screen.getByText(DEFAULT_KIT_LABELS.stateError.description)).toBeTruthy();
    expect(
      screen.getByRole("button", { name: DEFAULT_KIT_LABELS.stateError.retryLabel }),
    ).toBeTruthy();
  });

  it("has no axe violations, with and without a retry action", async () => {
    const withRetry = render(<StateError onRetry={() => undefined} />);
    await expectNoA11yViolations(withRetry.container);
    withRetry.unmount();

    const withoutRetry = render(<StateError />);
    await expectNoA11yViolations(withoutRetry.container);
  });
});

describe("state-loading registry block", () => {
  it("renders the canonical default copy behind a polite status role", () => {
    render(<StateLoading />);

    const status = screen.getByRole("status");
    expect(status.textContent).toContain(DEFAULT_KIT_LABELS.stateLoading.title);
    expect(status.textContent).toContain(DEFAULT_KIT_LABELS.stateLoading.description);
  });

  it("has no axe violations", async () => {
    const { container } = render(<StateLoading />);
    await expectNoA11yViolations(container);
  });
});

describe("state-unauthorized registry block", () => {
  it("renders the canonical default copy", () => {
    render(<StateUnauthorized />);

    expect(screen.getByText(DEFAULT_KIT_LABELS.stateUnauthorized.title)).toBeTruthy();
    expect(screen.getByText(DEFAULT_KIT_LABELS.stateUnauthorized.description)).toBeTruthy();
  });

  it("has no axe violations", async () => {
    const { container } = render(<StateUnauthorized />);
    await expectNoA11yViolations(container);
  });
});
