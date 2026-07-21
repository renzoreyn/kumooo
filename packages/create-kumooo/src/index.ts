#!/usr/bin/env node
import { spawn } from "node:child_process";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
const here = dirname(fileURLToPath(import.meta.url));

let cliEntry: string;
try {
  const pkgJson = require.resolve("@kumooo/cli/package.json");
  cliEntry = join(dirname(pkgJson), "dist", "index.js");
} catch {
  cliEntry = join(here, "..", "..", "cli", "dist", "index.js");
}

const child = spawn(process.execPath, [cliEntry, "create", ...process.argv.slice(2)], {
  stdio: "inherit",
});
child.on("exit", (code) => process.exit(code ?? 1));
