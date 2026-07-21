import { apiDir, findRoot } from "../project.js";
import { wrangler } from "../proc.js";
import { fail, ok } from "../ui.js";

export async function migrate(args: string[]): Promise<void> {
  const root = findRoot();
  const local = args.includes("--local");
  const flags = local ? ["--local"] : ["--remote"];
  ok(local ? "Applying local migrations…" : "Applying remote migrations…");
  const code = await wrangler(["d1", "migrations", "apply", "kumooo", ...flags], apiDir(root));
  if (code !== 0) {
    fail("Migrate failed.");
    process.exitCode = code;
    return;
  }
  ok("Migrations applied.");
}
