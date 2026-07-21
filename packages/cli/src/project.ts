import { existsSync } from "node:fs";
import { join } from "node:path";

export function findRoot(from = process.cwd()): string {
  let dir = from;
  for (;;) {
    if (existsSync(join(dir, "pnpm-workspace.yaml"))) return dir;
    const parent = join(dir, "..");
    if (parent === dir) throw new Error("Not inside a Kumooo project. Run this from the repo root.");
    dir = parent;
  }
}

export function apiDir(root: string) {
  return join(root, "apps", "api");
}

export function rendererDir(root: string) {
  return join(root, "apps", "renderer");
}

export function dashboardDir(root: string) {
  return join(root, "apps", "dashboard");
}
