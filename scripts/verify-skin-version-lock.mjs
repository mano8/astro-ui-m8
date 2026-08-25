#!/usr/bin/env node
// Dev-mode skin/logic version-lock guard (`A-C6`).
//
// A copied astro-ui-m8 registry skin is a consumer-side artifact
// (`STANDALONE-CHILD-USABILITY`): `shadcn add <item>` writes it once into the
// consumer's own tree, and nothing re-copies it when the installed
// `@mano8/astro-ui-m8` version moves on afterwards. That silent drift is
// cheap to miss and, now that the package is `1.x` under strict semver, cheap
// to check: every copied `.ts`/`.tsx` file carries an
// `astro-ui-m8-skin-version:` stamp — written once, at generation time, by
// `scripts/build-registry.mjs` — recording the package version the copy came
// from. This walks a consumer's copied-skin directory, reads that stamp back
// out, and warns (never fails — see below) when it no longer matches the
// installed package.
//
// Usage from a consumer app: `npx astro-ui-m8-skin-lock [dir]`
// (`dir` defaults to `components/m8-ui`, the target shadcn writes to today).
//
// Deliberately non-fatal. A stamped version behind the installed one is not
// necessarily a real problem — under semver a minor/patch bump changes
// nothing about a skin whose shape and behaviour did not move — so this is a
// prompt to go look, not a build failure. It exits `0` in every case; read
// its output, don't gate CI on its exit code.

import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { createRequire } from "node:module";
import { join, resolve } from "node:path";

const STAMP_RE = /astro-ui-m8-skin-version:\s*(\S+)/;
const SOURCE_FILE_RE = /\.(tsx|ts)$/;

/** Read `data.match[1]` off the stamp, or `null` for a file that has none — a
 * consumer's own component sitting in the same directory, most likely. */
export function readStampedVersion(fileContent) {
  const match = fileContent.match(STAMP_RE);
  return match ? match[1] : null;
}

/** Resolve the installed `@mano8/astro-ui-m8` version as seen from `cwd`. */
export function resolveInstalledVersion(cwd) {
  const require = createRequire(join(resolve(cwd), "package.json"));
  try {
    return JSON.parse(
      readFileSync(require.resolve("@mano8/astro-ui-m8/package.json"), "utf8")
    ).version;
  } catch {
    return null;
  }
}

function walk(dir, out = []) {
  if (!existsSync(dir)) return out;
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) {
      walk(full, out);
    } else if (SOURCE_FILE_RE.test(entry)) {
      out.push(full);
    }
  }
  return out;
}

/** Pure comparison over already-read file text — the part unit tests exercise
 * without touching the filesystem. */
export function findDrift(filesToContent, installedVersion) {
  const drifted = [];
  let stamped = 0;
  for (const [file, content] of filesToContent) {
    const skinVersion = readStampedVersion(content);
    if (skinVersion === null) continue;
    stamped += 1;
    if (skinVersion !== installedVersion) {
      drifted.push({ file, skinVersion });
    }
  }
  return { drifted, stamped };
}

function main() {
  const cwd = process.cwd();
  const targetDir = resolve(cwd, process.argv[2] ?? "components/m8-ui");

  const installedVersion = resolveInstalledVersion(cwd);
  if (!installedVersion) {
    console.warn(
      "[astro-ui-m8-skin-lock] could not resolve an installed @mano8/astro-ui-m8 " +
        `package from ${cwd}; nothing to compare against.`
    );
    return;
  }

  const files = walk(targetDir);
  if (files.length === 0) {
    console.log(
      `[astro-ui-m8-skin-lock] no .ts/.tsx files found under ${targetDir}; nothing to check.`
    );
    return;
  }

  const filesToContent = files.map((file) => [file, readFileSync(file, "utf8")]);
  const { drifted, stamped } = findDrift(filesToContent, installedVersion);

  if (stamped === 0) {
    console.log(
      `[astro-ui-m8-skin-lock] ${files.length} file(s) checked under ${targetDir}; ` +
        "none carry an astro-ui-m8-skin-version stamp (nothing copied from this registry yet)."
    );
    return;
  }

  if (drifted.length === 0) {
    console.log(
      `[astro-ui-m8-skin-lock] ${stamped} copied skin(s) checked; all match the installed ` +
        `@mano8/astro-ui-m8@${installedVersion}.`
    );
    return;
  }

  console.warn(
    `[astro-ui-m8-skin-lock] ${drifted.length} of ${stamped} copied skin(s) predate the ` +
      `installed @mano8/astro-ui-m8@${installedVersion}:`
  );
  for (const { file, skinVersion } of drifted) {
    console.warn(`  - ${file} (copied from @${skinVersion})`);
  }
  console.warn(
    "  Re-run `npx shadcn add <item>` for each to pick up any shape or behaviour " +
      "change since, or check the registry changelog to see whether this one matters."
  );
}

main();
