import { spawn } from "node:child_process";
import { apiDir, dashboardDir, findRoot, rendererDir } from "../project.js";
import { ok } from "../ui.js";

export async function dev(): Promise<void> {
  const root = findRoot();
  ok("Starting API (:8787), renderer (:8788), dashboard (:5173)");
  const kids = [
    spawn("pnpm", ["exec", "wrangler", "dev", "--port", "8787", "--persist-to", "../../.wrangler/state"], {
      cwd: apiDir(root),
      stdio: "inherit",
      shell: true,
    }),
    spawn("pnpm", ["exec", "wrangler", "dev", "--port", "8788", "--persist-to", "../../.wrangler/state"], {
      cwd: rendererDir(root),
      stdio: "inherit",
      shell: true,
    }),
    spawn("pnpm", ["exec", "vite", "--port", "5173"], {
      cwd: dashboardDir(root),
      stdio: "inherit",
      shell: true,
    }),
  ];

  const stop = () => {
    for (const k of kids) k.kill("SIGTERM");
    process.exit(0);
  };
  process.on("SIGINT", stop);
  process.on("SIGTERM", stop);

  await Promise.race(kids.map((k) => new Promise<void>((resolve) => k.on("exit", () => resolve()))));
}
