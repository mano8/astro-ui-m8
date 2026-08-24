/**
 * Fleet alignment gates for the canonical shared UI package.
 *
 * These checks were run by hand during the astro-ui-m8 adoption and never
 * automated, so nothing prevented a regression between reviews. They are static
 * and dependency-free on purpose: the repository must stay verifiable without a
 * parent workspace checkout.
 *
 * Gates:
 *   ui-owns-the-table     the canonical data table has exactly one source file
 *   no-business-plugin    no business plugin is imported from this package
 *   token-bridge-only     colour literals live in the token bridge alone
 *   no-inline-style       registry blocks and recipes style through classes
 */
import { readFileSync, readdirSync } from "node:fs";
import { join, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(fileURLToPath(new URL("..", import.meta.url)));

const SOURCE_DIRS = ["src", "registry/blocks", "registry/recipes"];
const SOURCE_EXTENSIONS = [".ts", ".tsx", ".mts", ".cts", ".js", ".mjs", ".astro"];
const CANONICAL_TABLE = "registry/blocks/data-table/data-table.tsx";
const TOKEN_BRIDGE = "src/lib/tokens.css";
const BUSINESS_PLUGIN = /^@mano8\/astro-(auth|media|prompt|reparto)-m8(\/|$)/;
const COLOUR_LITERAL = /#[0-9a-fA-F]{3,8}\b|\b(?:rgba?|hsla?|oklch|oklab|lab|lch)\(/;
const INLINE_STYLE = /\bstyle\s*=\s*(?:\{|")/;

/** Strip comments without disturbing string, template, or regex content. */
function stripComments(source) {
  let out = "";
  let quote = null;
  for (let i = 0; i < source.length; i += 1) {
    const char = source[i];
    const next = source[i + 1];
    if (quote) {
      out += char;
      if (char === "\\") {
        out += next ?? "";
        i += 1;
      } else if (char === quote) {
        quote = null;
      }
      continue;
    }
    if (char === '"' || char === "'" || char === "`") {
      quote = char;
      out += char;
      continue;
    }
    if (char === "/" && next === "/") {
      while (i < source.length && source[i] !== "\n") i += 1;
      out += "\n";
      continue;
    }
    if (char === "/" && next === "*") {
      i += 2;
      while (i < source.length && !(source[i] === "*" && source[i + 1] === "/")) i += 1;
      i += 1;
      out += " ";
      continue;
    }
    out += char;
  }
  return out;
}

/** Module specifiers this file actually loads, comments excluded. */
function importSpecifiers(source) {
  const code = stripComments(source);
  const patterns = [
    /\bfrom\s*["']([^"']+)["']/g,
    /\bimport\s*\(\s*["']([^"']+)["']\s*\)/g,
    /\brequire\s*\(\s*["']([^"']+)["']\s*\)/g,
    /\bimport\s+["']([^"']+)["']/g,
  ];
  const found = new Set();
  for (const pattern of patterns) {
    for (const match of code.matchAll(pattern)) found.add(match[1]);
  }
  return [...found];
}

function walk(dir, accept) {
  const absolute = join(ROOT, dir);
  let entries;
  try {
    entries = readdirSync(absolute, { withFileTypes: true });
  } catch {
    return [];
  }
  const files = [];
  for (const entry of entries) {
    const child = join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === "node_modules" || entry.name.startsWith(".")) continue;
      files.push(...walk(child, accept));
    } else if (accept(entry.name)) {
      files.push(child.split(sep).join("/"));
    }
  }
  return files;
}

const sourceFiles = SOURCE_DIRS.flatMap((dir) =>
  walk(dir, (name) => SOURCE_EXTENSIONS.some((extension) => name.endsWith(extension))),
);
const cssFiles = SOURCE_DIRS.flatMap((dir) => walk(dir, (name) => name.endsWith(".css")));
const read = (file) => readFileSync(join(ROOT, file), "utf8");

const failures = [];
const fail = (gate, file, detail) => failures.push({ gate, file, detail });

function gateUiOwnsTheTable() {
  const owners = sourceFiles.filter((file) => /\buseReactTable\b/.test(stripComments(read(file))));
  if (!owners.includes(CANONICAL_TABLE)) {
    fail("ui-owns-the-table", CANONICAL_TABLE, "the canonical data-table source is missing");
  }
  for (const owner of owners) {
    if (owner !== CANONICAL_TABLE) {
      fail("ui-owns-the-table", owner, "a second data-table implementation shadows the canonical one");
    }
  }
}

function gateNoBusinessPlugin() {
  for (const file of sourceFiles) {
    for (const specifier of importSpecifiers(read(file))) {
      if (BUSINESS_PLUGIN.test(specifier)) {
        fail("no-business-plugin", file, `imports the business plugin ${specifier}`);
      }
    }
  }
}

function gateTokenBridgeOnly() {
  for (const file of cssFiles) {
    if (file === TOKEN_BRIDGE) continue;
    read(file)
      .split("\n")
      .forEach((line, index) => {
        if (COLOUR_LITERAL.test(line)) {
          fail("token-bridge-only", `${file}:${index + 1}`, `colour literal outside ${TOKEN_BRIDGE}`);
        }
      });
  }
  // A colour belongs in the bridge wherever it is written, so the literal check
  // follows it into the blocks and recipes as well as the stylesheets.
  for (const file of sourceFiles) {
    stripComments(read(file))
      .split("\n")
      .forEach((line, index) => {
        if (COLOUR_LITERAL.test(line)) {
          fail("token-bridge-only", `${file}:${index + 1}`, `colour literal outside ${TOKEN_BRIDGE}`);
        }
      });
  }
}

function gateNoInlineStyle() {
  for (const file of sourceFiles) {
    if (!file.startsWith("registry/")) continue;
    read(file)
      .split("\n")
      .forEach((line, index) => {
        if (INLINE_STYLE.test(line)) {
          fail("no-inline-style", `${file}:${index + 1}`, "inline style attribute in a registry source");
        }
      });
  }
}

gateUiOwnsTheTable();
gateNoBusinessPlugin();
gateTokenBridgeOnly();
gateNoInlineStyle();

const scanned = `${sourceFiles.length} source file(s), ${cssFiles.length} stylesheet(s)`;
if (failures.length > 0) {
  console.error(`[verify-fleet-gates] ${failures.length} violation(s) across ${scanned}:`);
  for (const { gate, file, detail } of failures) {
    console.error(`  ${gate}: ${file} — ${detail}`);
  }
  process.exitCode = 1;
} else {
  console.log(`[verify-fleet-gates] 4 gate(s) green over ${scanned}`);
}
