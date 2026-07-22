import * as p from "@clack/prompts";
import { existsSync } from "node:fs";
import { join, resolve } from "node:path";
import { run } from "../proc.js";
import { cyan, fail, ok } from "../ui.js";
import {
  deploySelfHost,
  printSelfHostNextSteps,
  provisionSelfHostResources,
  writeSelfHostConfigs,
} from "./selfhost.js";

const REPO = "https://github.com/renzoreyn/kumooo.git";

/**
 * Guided installer. Local dev or deploy one site to your Cloudflare.
 */
export async function create(nameArg?: string): Promise<void> {
  p.intro("kumooo create: a website without the babysitting");

  if (existsSync(join(process.cwd(), "pnpm-workspace.yaml"))) {
    p.log.info("Already inside a Kumooo checkout. Skipping clone.");
    p.outro(
      `Run ${cyan("pnpm install")} then ${cyan("kumooo migrate --local")} and ${cyan("kumooo dev")}.\nOr ${cyan("kumooo deploy")} after you wire Cloudflare resources.`,
    );
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

  const mode = await p.select({
    message: "How do you want to run this?",
    options: [
      {
        value: "cloudflare",
        label: "Self-host on my Cloudflare",
        hint: "Workers + D1 + KV + R2 + dashboard. One site.",
      },
      {
        value: "local",
        label: "Local first",
        hint: "migrate --local && kumooo dev",
      },
    ],
  });
  if (p.isCancel(mode)) {
    p.cancel("Maybe later.");
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

  p.log.step("Building CLI");
  await run("pnpm", ["--filter", "@kumooo/cli", "build"], { cwd: root });

  if (mode === "local") {
    ok(`Project ready at ${root}`);
    p.outro(
      [
        `cd ${name}`,
        "kumooo migrate --local",
        "kumooo dev",
        "",
        "API on :8787, site on :8788, dashboard on :5173.",
        "When you want Cloudflare: wrangler login, then re-run create flow bits or follow docs.kumooo.dev/deploy-on-cloudflare",
      ].join("\n"),
    );
    return;
  }

  // Self-host on Cloudflare
  p.log.step("Checking Cloudflare login");
  const who = await run("pnpm", ["exec", "wrangler", "whoami"], { cwd: root });
  if (who !== 0) {
    p.log.warn("Not logged in. Opening wrangler login…");
    const login = await run("pnpm", ["exec", "wrangler", "login"], { cwd: root });
    if (login !== 0) {
      fail("wrangler login failed. Run it yourself, then follow docs.kumooo.dev/deploy-on-cloudflare");
      process.exitCode = 1;
      return;
    }
  }

  const prefixRaw = await p.text({
    message: "Cloudflare resource prefix (Workers, D1, KV, R2, Pages)",
    initialValue: String(name).slice(0, 20),
    validate: (v) =>
      /^[a-z0-9][a-z0-9-]{1,28}$/.test(v ?? "")
        ? undefined
        : "2–29 chars: lowercase, numbers, hyphens.",
  });
  if (p.isCancel(prefixRaw)) {
    p.cancel("Project is on disk. Deploy later from the docs.");
    return;
  }
  const prefix = String(prefixRaw);

  const resources = await provisionSelfHostResources(root, prefix);
  if (!resources) {
    process.exitCode = 1;
    return;
  }

  // Temporary origin until Pages URL is known
  await writeSelfHostConfigs(root, resources, "http://127.0.0.1:5173");

  const urls = await deploySelfHost(root, resources);
  if (!urls) {
    process.exitCode = 1;
    p.outro(`Project is at ${root}. Fix the error above, then retry deploy from docs.`);
    return;
  }

  ok(`Project ready at ${root}`);
  printSelfHostNextSteps({
    folder: name,
    apiUrl: urls.apiUrl,
    siteUrl: urls.siteUrl,
    dashboardUrl: urls.dashboardUrl,
  });
  p.outro("No PHP. No plugin roulette. Your Cloudflare. Your site.");
}
