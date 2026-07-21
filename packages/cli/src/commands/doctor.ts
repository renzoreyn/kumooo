import { existsSync } from "node:fs";
import { join } from "node:path";
import { apiDir, findRoot, rendererDir } from "../project.js";
import { fail, ok } from "../ui.js";

export async function doctor(): Promise<void> {
  const root = findRoot();
  let bad = false;

  const nodeMajor = Number(process.versions.node.split(".")[0]);
  if (nodeMajor < 20) {
    fail(`Node ${process.versions.node} is too old. Need 20+.`);
    bad = true;
  } else ok(`Node ${process.versions.node}`);

  for (const p of [
    join(root, "pnpm-workspace.yaml"),
    join(apiDir(root), "wrangler.jsonc"),
    join(rendererDir(root), "wrangler.jsonc"),
    join(root, "packages", "db", "migrations", "0001_init.sql"),
  ]) {
    if (existsSync(p)) ok(p.replace(root, "."));
    else {
      fail(`Missing ${p}`);
      bad = true;
    }
  }

  if (bad) {
    fail("Doctor found problems. Fix those and try again.");
    process.exitCode = 1;
  } else {
    ok("Looks healthy. For Cloudflare login: wrangler login");
  }
}
