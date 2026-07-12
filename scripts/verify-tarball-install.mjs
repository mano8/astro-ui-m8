import {
  cpSync,
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  rmSync
} from "node:fs";
import { spawnSync } from "node:child_process";
import { createRequire } from "node:module";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const FIXTURE_DIR = join(ROOT, "fixtures", "tarball-consumer");
const TMP_DIR = join(ROOT, ".tmp", "tarball-install");
const PACK_DIR = join(TMP_DIR, "pack");
const WORK_DIR = join(TMP_DIR, "workspace");
const NPM_CACHE_DIR = join(ROOT, ".tmp", "npm-cache");
const EXPECTED_REGISTRY_ITEMS = [
  "data-table.json",
  "data-table-column-header.json",
  "data-table-pagination.json",
  "data-table-server-faceted-filter.json",
  "data-table-server-toolbar.json",
  "data-table-view-options.json",
  "dialog-form.json",
  "state-empty.json",
  "state-error.json",
  "state-loading.json",
  "state-unauthorized.json",
  "table-page.json"
];
const EXPECTED_PACKAGE_FILES = [
  "LICENSE",
  "README.md",
  "registry.json",
  "src/lib/tokens.css",
  "dist/src/index.js",
  "dist/src/index.d.ts",
  "dist/src/testing/index.js",
  "dist/src/testing/index.d.ts",
  "registry/README.md",
  "registry/blocks/data-table/data-table.tsx",
  "registry/recipes/dialog-form/dialog-form.tsx"
];

function assertExists(path, label) {
  if (!existsSync(path)) {
    throw new Error(`${label} does not exist: ${path}`);
  }
}

function runCommand(command, args, cwd) {
  const isWindowsCmd = command.toLowerCase().endsWith(".cmd");
  const executable = isWindowsCmd ? (process.env.ComSpec ?? "cmd.exe") : command;
  const executableArgs = isWindowsCmd ? ["/d", "/s", "/c", command, ...args] : args;
  const result = spawnSync(executable, executableArgs, {
    cwd,
    encoding: "utf8",
    stdio: "pipe",
    shell: false,
    env: {
      ...process.env,
      npm_config_cache: NPM_CACHE_DIR
    }
  });

  if (result.status !== 0) {
    const stdout = result.stdout?.trim();
    const stderr = result.stderr?.trim();
    throw new Error(
      [
        `${command} ${args.join(" ")} failed in ${cwd} (exit ${result.status})`,
        stdout ? `stdout:\n${stdout}` : "",
        stderr ? `stderr:\n${stderr}` : ""
      ]
        .filter(Boolean)
        .join("\n\n")
    );
  }

  return result;
}

function packTarball() {
  mkdirSync(PACK_DIR, { recursive: true });
  runCommand("npm.cmd", ["pack", "--pack-destination", PACK_DIR], ROOT);

  const tarballs = readdirSync(PACK_DIR).filter((entry) => entry.endsWith(".tgz"));
  if (tarballs.length !== 1) {
    throw new Error(`Expected exactly one tarball in ${PACK_DIR}, found ${tarballs.length}`);
  }

  return join(PACK_DIR, tarballs[0]);
}

function installTarball(tarballPath) {
  cpSync(FIXTURE_DIR, WORK_DIR, { recursive: true });
  runCommand("npm.cmd", ["install", "--ignore-scripts", "--no-package-lock", tarballPath], WORK_DIR);
}

function readInstalledPackageJson(installedRoot) {
  return JSON.parse(readFileSync(join(installedRoot, "package.json"), "utf8"));
}

function verifyPackageContents(installedRoot) {
  for (const relativePath of EXPECTED_PACKAGE_FILES) {
    assertExists(join(installedRoot, relativePath), `Installed package file ${relativePath}`);
  }

  const registryDir = join(installedRoot, "registry", "r");
  const registryItems = new Set(readdirSync(registryDir));
  for (const registryItem of EXPECTED_REGISTRY_ITEMS) {
    if (!registryItems.has(registryItem)) {
      throw new Error(`Missing generated registry item in tarball install: ${registryItem}`);
    }
  }
}

function verifyExports(installedRoot) {
  const fixtureRequire = createRequire(join(WORK_DIR, "package.json"));
  const rootEntry = fixtureRequire.resolve("@mano8/astro-ui-m8");
  const testingEntry = fixtureRequire.resolve("@mano8/astro-ui-m8/testing");
  const packageJson = readInstalledPackageJson(installedRoot);

  if (!rootEntry.endsWith("dist\\src\\index.js")) {
    throw new Error(`Unexpected root export resolution: ${rootEntry}`);
  }

  if (!testingEntry.endsWith("dist\\src\\testing\\index.js")) {
    throw new Error(`Unexpected testing export resolution: ${testingEntry}`);
  }

  if (packageJson.exports?.["./testing"] === undefined) {
    throw new Error("Installed package is missing the ./testing export");
  }
}

function verifyTypeScriptImport() {
  const tscPath = join(ROOT, "node_modules", "typescript", "bin", "tsc");
  assertExists(tscPath, "TypeScript compiler");
  runCommand(process.execPath, [tscPath, "-p", "tsconfig.json", "--noEmit"], WORK_DIR);
}

function main() {
  assertExists(FIXTURE_DIR, "Tarball consumer fixture");

  rmSync(TMP_DIR, { recursive: true, force: true });
  mkdirSync(WORK_DIR, { recursive: true });

  const tarballPath = packTarball();
  installTarball(tarballPath);

  const installedRoot = join(WORK_DIR, "node_modules", "@mano8", "astro-ui-m8");
  assertExists(installedRoot, "Installed tarball package root");

  verifyPackageContents(installedRoot);
  verifyExports(installedRoot);
  verifyTypeScriptImport();

  console.log(`[verify-tarball-install] installed ${tarballPath} and validated packaged exports/files`);
}

main();
