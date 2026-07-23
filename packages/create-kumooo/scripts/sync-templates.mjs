import { cpSync, existsSync, mkdirSync, readdirSync, rmSync, statSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "..");
const starters = join(root, "starters");
const out = join(dirname(fileURLToPath(import.meta.url)), "..", "templates");

function copyDir(src, dest) {
  mkdirSync(dest, { recursive: true });
  for (const name of readdirSync(src)) {
    if (name === "node_modules" || name === ".next" || name === "dist") continue;
    const from = join(src, name);
    const to = join(dest, name);
    if (statSync(from).isDirectory()) copyDir(from, to);
    else cpSync(from, to);
  }
}

if (!existsSync(starters)) {
  console.error("starters/ not found at", starters);
  process.exit(1);
}

rmSync(out, { recursive: true, force: true });
mkdirSync(out, { recursive: true });
for (const name of ["blank", "blog", "shop"]) {
  copyDir(join(starters, name), join(out, name));
  console.log("synced", name);
}
