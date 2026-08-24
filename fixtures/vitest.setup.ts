// Shared Vitest setup for the `astro-ui-m8` suite (`A-C5`).
//
// `jest-axe` ships a `toHaveNoViolations` matcher in Jest's `expect.extend`
// shape, which Vitest's `expect` accepts directly — this is the one place
// that registration happens, so every test file that renders markup can call
// `expect(await axe(container)).toHaveNoViolations()` without importing or
// wiring the matcher itself.
import { expect } from "vitest";
import { toHaveNoViolations } from "jest-axe";

expect.extend(toHaveNoViolations);
