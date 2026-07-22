import { apiDir, findRoot, rendererDir } from "../project.js";
import { wrangler } from "../proc.js";
import { fail, ok } from "../ui.js";

export async function deploy(): Promise<void> {
  const root = findRoot();
  ok("Applying migrations…");
  let code = await wrangler(["d1", "migrations", "apply", "DB", "--remote"], apiDir(root));
  if (code !== 0) {
    fail("Migration failed.");
    process.exitCode = code;
    return;
  }
  ok("Deploying renderer…");
  code = await wrangler(["deploy"], rendererDir(root));
  if (code !== 0) {
    fail("Renderer deploy failed.");
    process.exitCode = code;
    return;
  }
  ok("Deploying API…");
  code = await wrangler(["deploy"], apiDir(root));
  if (code !== 0) {
    fail("API deploy failed.");
    process.exitCode = code;
    return;
  }
  ok("Deployed. Go publish something.");
}
