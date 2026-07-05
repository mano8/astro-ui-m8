import {
  cpSync,
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { dirname, join, resolve } from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const FIXTURE_DIR = join(ROOT, "fixtures", "registry-consumer");
const REGISTRY_DIR = join(ROOT, "registry", "r");
const WORK_DIR = join(ROOT, ".tmp", "registry-consumer");

function assertDirectory(path, label) {
  if (!existsSync(path)) {
    throw new Error(`${label} does not exist: ${path}`);
  }
}

function installRegistryItems() {
  const installedTargets = new Set();
  for (const entry of readdirSync(REGISTRY_DIR)) {
    if (!entry.endsWith(".json") || entry === "registry.json") continue;
    const itemPath = join(REGISTRY_DIR, entry);
    const item = JSON.parse(readFileSync(itemPath, "utf8"));
    for (const file of item.files ?? []) {
      if (!file.target || typeof file.content !== "string") {
        throw new Error(`${entry} contains a file without inline content or target`);
      }
      const targetPath = join(WORK_DIR, file.target);
      mkdirSync(dirname(targetPath), { recursive: true });
      writeFileSync(targetPath, file.content);
      installedTargets.add(file.target);
    }
  }

  if (installedTargets.size === 0) {
    throw new Error("No registry item files were installed into the consumer fixture");
  }

  return installedTargets.size;
}

function runTsc() {
  const tscPath = join(ROOT, "node_modules", "typescript", "bin", "tsc");
  assertDirectory(tscPath, "TypeScript compiler");
  const result = spawnSync(process.execPath, [tscPath, "-p", "tsconfig.json", "--noEmit"], {
    cwd: WORK_DIR,
    stdio: "inherit",
    shell: false,
  });
  if (result.status !== 0) {
    throw new Error(`registry consumer fixture failed to compile (exit ${result.status})`);
  }
}

function main() {
  assertDirectory(FIXTURE_DIR, "Registry consumer fixture");
  assertDirectory(REGISTRY_DIR, "Generated registry");

  rmSync(WORK_DIR, { recursive: true, force: true });
  mkdirSync(WORK_DIR, { recursive: true });
  cpSync(FIXTURE_DIR, WORK_DIR, { recursive: true });

  const installed = installRegistryItems();
  runTsc();
  console.log(`[verify-registry-consumer] installed ${installed} copied file(s) and compiled the fixture`);
}

main();
