// Resolution for the copied-sibling imports shared by the fixture toolchains.
//
// A registry block that composes another block imports it by the path it will
// have *after* `shadcn add` copies both into the consumer's
// `components/m8-ui/` directory — `./data-table`, `./state-error`, and so on.
// That specifier is deliberately wrong in this source tree, where the blocks
// live in separate directories under `registry/blocks/**` and
// `registry/recipes/**`, so anything that loads a block *from source* (the
// `/_preview` gallery, the render tests) has to be told where the sibling
// really is. `verify:registry-consumer` needs none of this: it compiles the
// blocks after copying them, which is when the specifier becomes true.
//
// The map is derived from the tree rather than written by hand, so adding a
// block cannot leave one of the two toolchains behind — which is how
// `preview:build` came to be broken for every `table-page` sibling without
// anything reporting it.
import { readdirSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

export interface RegistrySiblingAlias {
  find: RegExp;
  replacement: string;
}

const ROOT = fileURLToPath(new URL("..", import.meta.url));
const BLOCK_DIRS = ["registry/blocks", "registry/recipes"];

function collect(dir: string): string[] {
  const absolute = join(ROOT, dir);
  const found: string[] = [];
  for (const entry of readdirSync(absolute, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      found.push(...collect(`${dir}/${entry.name}`));
    } else if (entry.name.endsWith(".tsx")) {
      found.push(`${dir}/${entry.name}`);
    }
  }
  return found;
}

export function registrySiblingAliases(): RegistrySiblingAlias[] {
  const aliases: RegistrySiblingAlias[] = [];
  const claimed = new Map<string, string>();

  for (const file of BLOCK_DIRS.flatMap(collect)) {
    const name = file.slice(file.lastIndexOf("/") + 1, -".tsx".length);
    const previous = claimed.get(name);
    if (previous !== undefined) {
      // Two blocks copied to the same `components/m8-ui/<name>.tsx` target
      // would overwrite each other in a consumer app, so a duplicate basename
      // is a registry defect rather than something to resolve arbitrarily.
      throw new Error(
        `Duplicate registry block basename "${name}": ${previous} and ${file} both copy to the same consumer target.`,
      );
    }
    claimed.set(name, file);
    aliases.push({
      // Anchored: this rewrites the copied-sibling specifier and nothing else.
      find: new RegExp(`^\\./${name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`),
      replacement: join(ROOT, file),
    });
  }

  return aliases;
}
