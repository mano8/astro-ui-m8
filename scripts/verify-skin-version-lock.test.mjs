// Unit coverage for the pure comparison logic behind the skin/logic
// version-lock guard (`A-C6`). The filesystem/CLI shell around it
// (`resolveInstalledVersion`, `main`) is exercised end-to-end instead, via
// `npm run verify:skin-version-lock` against the real `verify:registry-consumer`
// fixture (see CI) — that is the only way to prove the stamp `build-registry.mjs`
// writes and the regex here actually agree.
import { describe, expect, it } from "vitest";

import { findDrift, readStampedVersion } from "./verify-skin-version-lock.mjs";

const STAMPED = (version) =>
  `// astro-ui-m8-skin-version: ${version} (A-C6 — run \`npx astro-ui-m8-skin-lock\`)\n"use client";\n`;

describe("readStampedVersion", () => {
  it("reads the version out of a stamped file", () => {
    expect(readStampedVersion(STAMPED("1.5.0"))).toBe("1.5.0");
  });

  it("returns null for a file with no stamp — a consumer's own component", () => {
    expect(readStampedVersion('"use client";\nexport function Foo() {}\n')).toBeNull();
  });
});

describe("findDrift", () => {
  it("reports nothing drifted when every stamp matches the installed version", () => {
    const files = [
      ["a.tsx", STAMPED("1.5.0")],
      ["b.tsx", STAMPED("1.5.0")]
    ];
    expect(findDrift(files, "1.5.0")).toEqual({ drifted: [], stamped: 2 });
  });

  it("flags a file whose stamp is behind the installed version", () => {
    const files = [
      ["current.tsx", STAMPED("1.5.0")],
      ["stale.tsx", STAMPED("1.4.0")]
    ];
    expect(findDrift(files, "1.5.0")).toEqual({
      drifted: [{ file: "stale.tsx", skinVersion: "1.4.0" }],
      stamped: 2
    });
  });

  it("flags a file whose stamp is ahead of the installed version too", () => {
    // Not just "behind" — any disagreement is worth a look, including a
    // consumer who copied a skin from a pre-release build.
    const files = [["ahead.tsx", STAMPED("1.6.0")]];
    expect(findDrift(files, "1.5.0")).toEqual({
      drifted: [{ file: "ahead.tsx", skinVersion: "1.6.0" }],
      stamped: 1
    });
  });

  it("ignores an unstamped file rather than reporting it as drift", () => {
    const files = [
      ["own-component.tsx", '"use client";\nexport function Foo() {}\n'],
      ["copied.tsx", STAMPED("1.5.0")]
    ];
    expect(findDrift(files, "1.5.0")).toEqual({ drifted: [], stamped: 1 });
  });
});
