import { apiDir, findRoot, rendererDir } from "../project.js";
import { wrangler } from "../proc.js";
import { fail, ok } from "../ui.js";

export async function build(): Promise<void> {
  const root = findRoot();
  let code = await wrangler(["deploy", "--dry-run", "--outdir", "dist"], apiDir(root));
  if (code !== 0) {
    fail("API build failed.");
    process.exitCode = code;
    return;
  }
  code = await wrangler(["deploy", "--dry-run", "--outdir", "dist"], rendererDir(root));
  if (code !== 0) {
    fail("Renderer build failed.");
    process.exitCode = code;
    return;
  }
  ok("Both workers build clean.");
}
