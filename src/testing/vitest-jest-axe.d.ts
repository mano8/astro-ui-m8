// `jest-axe`'s own types (`@types/jest-axe`) augment Jest's `expect`, not
// Vitest's. Without this, `expect(results).toHaveNoViolations()` fails to
// typecheck under `npm run typecheck` even though it runs correctly (Vitest
// transpiles tests without full type-checking). This is the module
// augmentation Vitest's own docs describe for a third-party Jest matcher:
// https://vitest.dev/guide/extending-matchers
import "vitest";

interface CustomMatchers<R = unknown> {
  toHaveNoViolations(): R;
}

// Merges the matcher onto Vitest's own assertion interfaces, exactly as
// Vitest's docs describe for a third-party Jest matcher — an interface with
// no members of its own beyond the merge, on both branches.
declare module "vitest" {
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  interface Assertion<T = unknown> extends CustomMatchers<T> {}
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  interface AsymmetricMatchersContaining extends CustomMatchers {}
}
