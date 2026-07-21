import * as p from "@clack/prompts";
import { existsSync } from "node:fs";
import { join, resolve } from "node:path";
import { run } from "../proc.js";
import { cyan, fail, ok } from "../ui.js";

const REPO = "https://github.com/renzoreyn/kumooo.git";

/**
 * Guided installer. Answers a few questions. Ends with a project you can run.
 */
export async function create(nameArg?: string): Promise<void> {
  p.intro("kumooo create: a website without the babysitting");

  if (existsSync(join(process.cwd(), "pnpm-workspace.yaml"))) {
    p.log.info("Already inside a Kumooo checkout. Skipping clone.");
    p.outro(`Run ${cyan("pnpm install")} then ${cyan("kumooo migrate --local")} and ${cyan("kumooo dev")}.`);
    return;
  }

  const name =
    nameArg ??
    String(
      await p.text({
        message: "Project folder name",
        placeholder: "my-site",
        validate: (v) =>
          /^[a-z0-9][a-z0-9-]*$/.test(v ?? "") ? undefined : "Lowercase letters, numbers, hyphens.",
      }),
    );

  if (p.isCancel(name)) {
    p.cancel("Maybe later.");
    return;
  }

  const root = resolve(process.cwd(), name);
  if (existsSync(root)) {
    fail(`Folder ${name} already exists.`);
    process.exitCode = 1;
    return;
  }

  p.log.step(`Cloning ${REPO}`);
  const clone = await run("git", ["clone", "--depth", "1", REPO, root]);
  if (clone !== 0) {
    fail("Clone failed. Check your network and that the repo exists.");
    process.exitCode = 1;
    return;
  }

  p.log.step("Installing dependencies");
  const install = await run("pnpm", ["install"], { cwd: root });
  if (install !== 0) {
    fail("pnpm install failed.");
    process.exitCode = 1;
    return;
  }

  ok(`Project ready at ${root}`);
  p.outro(
    [
      `cd ${name}`,
      "kumooo migrate --local",
      "kumooo dev",
      "",
      "API on :8787, site on :8788, dashboard on :5173.",
      "When you're ready for Cloudflare: wrangler login && kumooo deploy",
    ].join("\n"),
  );
}
