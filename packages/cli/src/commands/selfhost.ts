import { readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { apiDir, dashboardDir, rendererDir } from "../project.js";
import { run, wrangler, wranglerCapture } from "../proc.js";
import { cyan, fail, ok } from "../ui.js";

export type SelfHostResources = {
  prefix: string;
  d1Name: string;
  d1Id: string;
  kvId: string;
  r2Name: string;
  apiWorker: string;
  rendererWorker: string;
  pagesProject: string;
};

function parseD1Id(out: string): string | null {
  const m =
    out.match(/database_id\s*=\s*"([^"]+)"/i) ||
    out.match(/database_id["']?\s*:\s*["']([^"']+)/i) ||
    out.match(/\b([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})\b/i);
  return m?.[1] ?? null;
}

function parseKvId(out: string): string | null {
  const m =
    out.match(/id\s*=\s*"([^"]+)"/i) ||
    out.match(/\bid["']?\s*[:=]\s*["']([a-f0-9]{32})["']/i) ||
    out.match(/\b([a-f0-9]{32})\b/i);
  return m?.[1] ?? null;
}

export async function provisionSelfHostResources(
  root: string,
  prefix: string,
): Promise<SelfHostResources | null> {
  const api = apiDir(root);
  const d1Name = `${prefix}-db`;
  const kvTitle = `${prefix}-kv`;
  const r2Name = `${prefix}-media`;
  const apiWorker = `${prefix}-api`;
  const rendererWorker = `${prefix}-renderer`;
  const pagesProject = `${prefix}-dashboard`;

  ok(`Creating D1 database ${d1Name}…`);
  const d1 = await wranglerCapture(["d1", "create", d1Name], api);
  if (d1.code !== 0) {
    fail(d1.stderr || d1.stdout || "D1 create failed.");
    return null;
  }
  const d1Id = parseD1Id(`${d1.stdout}\n${d1.stderr}`);
  if (!d1Id) {
    fail("Created D1 but could not parse database_id from wrangler output.");
    console.log(d1.stdout || d1.stderr);
    return null;
  }
  ok(`D1 ${d1Name} → ${d1Id}`);

  ok(`Creating KV namespace ${kvTitle}…`);
  const kv = await wranglerCapture(["kv", "namespace", "create", kvTitle], api);
  if (kv.code !== 0) {
    fail(kv.stderr || kv.stdout || "KV create failed.");
    return null;
  }
  const kvId = parseKvId(`${kv.stdout}\n${kv.stderr}`);
  if (!kvId) {
    fail("Created KV but could not parse id from wrangler output.");
    console.log(kv.stdout || kv.stderr);
    return null;
  }
  ok(`KV ${kvTitle} → ${kvId}`);

  ok(`Creating R2 bucket ${r2Name}…`);
  const r2 = await wranglerCapture(["r2", "bucket", "create", r2Name], api);
  // 0 = created; non-zero might mean already exists — try to continue if name looks fine
  if (r2.code !== 0 && !/already exists/i.test(`${r2.stdout}\n${r2.stderr}`)) {
    fail(r2.stderr || r2.stdout || "R2 create failed.");
    return null;
  }
  ok(`R2 ${r2Name}`);

  return { prefix, d1Name, d1Id, kvId, r2Name, apiWorker, rendererWorker, pagesProject };
}

export async function writeSelfHostConfigs(
  root: string,
  res: SelfHostResources,
  dashboardOrigin: string,
): Promise<void> {
  const migrationsDir = "../../packages/db/migrations";
  const apiConfig = {
    $schema: "node_modules/wrangler/config-schema.json",
    name: res.apiWorker,
    main: "src/index.ts",
    compatibility_date: "2024-12-05",
    observability: { enabled: true },
    d1_databases: [
      {
        binding: "DB",
        database_name: res.d1Name,
        database_id: res.d1Id,
        migrations_dir: migrationsDir,
      },
    ],
    kv_namespaces: [{ binding: "KV", id: res.kvId }],
    r2_buckets: [{ binding: "MEDIA", bucket_name: res.r2Name }],
    vars: {
      ENVIRONMENT: "production",
      PUBLIC_SITE_SUFFIX: "workers.dev",
      DASHBOARD_ORIGIN: dashboardOrigin,
      MAX_SITES_PER_ORG: "0",
    },
  };

  const rendererConfig = {
    $schema: "node_modules/wrangler/config-schema.json",
    name: res.rendererWorker,
    main: "src/index.ts",
    compatibility_date: "2024-12-05",
    observability: { enabled: true },
    services: [{ binding: "API", service: res.apiWorker }],
    d1_databases: [
      {
        binding: "DB",
        database_name: res.d1Name,
        database_id: res.d1Id,
      },
    ],
    kv_namespaces: [{ binding: "KV", id: res.kvId }],
    r2_buckets: [{ binding: "MEDIA", bucket_name: res.r2Name }],
    vars: {
      ENVIRONMENT: "production",
      PUBLIC_SITE_SUFFIX: "workers.dev",
    },
  };

  await writeFile(join(apiDir(root), "wrangler.jsonc"), `${JSON.stringify(apiConfig, null, 2)}\n`);
  await writeFile(
    join(rendererDir(root), "wrangler.jsonc"),
    `${JSON.stringify(rendererConfig, null, 2)}\n`,
  );
  ok("Wrote self-host wrangler configs (no kumooo.dev routes).");
}

export async function deploySelfHost(
  root: string,
  res: SelfHostResources,
): Promise<{ apiUrl: string; siteUrl: string; dashboardUrl: string } | null> {
  const api = apiDir(root);
  const renderer = rendererDir(root);
  const dash = dashboardDir(root);

  ok("Applying D1 migrations…");
  let code = await wrangler(["d1", "migrations", "apply", "DB", "--remote"], api);
  if (code !== 0) {
    fail("Remote migrate failed.");
    return null;
  }

  ok("Deploying API Worker…");
  code = await wrangler(["deploy"], api);
  if (code !== 0) {
    fail("API deploy failed.");
    return null;
  }

  ok("Deploying renderer Worker…");
  code = await wrangler(["deploy"], renderer);
  if (code !== 0) {
    fail("Renderer deploy failed.");
    return null;
  }

  // Best-effort URLs (workers.dev subdomain = <name>.<account>.workers.dev; print name for user)
  const apiUrl = `https://${res.apiWorker}.workers.dev`;
  const siteUrl = `https://${res.rendererWorker}.workers.dev`;

  ok("Building dashboard…");
  code = await run("pnpm", ["--filter", "@kumooo/dashboard", "build"], {
    cwd: root,
    env: { ...process.env, VITE_API_URL: apiUrl },
  });
  if (code !== 0) {
    fail("Dashboard build failed. Workers are up; build the dashboard later with VITE_API_URL set.");
    return { apiUrl, siteUrl, dashboardUrl: "(build failed)" };
  }

  ok(`Deploying dashboard Pages project ${res.pagesProject}…`);
  code = await run(
    "pnpm",
    ["exec", "wrangler", "pages", "deploy", "dist", "--project-name", res.pagesProject],
    { cwd: dash },
  );
  if (code !== 0) {
    fail("Pages deploy failed. Workers are up; deploy apps/dashboard/dist manually.");
    return { apiUrl, siteUrl, dashboardUrl: "(pages deploy failed)" };
  }

  // Patch API CORS to the likely pages.dev URL pattern; user may need to set exact URL
  const dashboardUrl = `https://${res.pagesProject}.pages.dev`;
  try {
    const apiCfgPath = join(api, "wrangler.jsonc");
    const raw = await readFile(apiCfgPath, "utf8");
    const next = raw.replace(
      /"DASHBOARD_ORIGIN"\s*:\s*"[^"]*"/,
      `"DASHBOARD_ORIGIN": "${dashboardUrl}"`,
    );
    if (next !== raw) {
      await writeFile(apiCfgPath, next);
      ok("Updating API DASHBOARD_ORIGIN and redeploying API…");
      await wrangler(["deploy"], api);
    }
  } catch {
    // non-fatal
  }

  return { apiUrl, siteUrl, dashboardUrl };
}

export function printSelfHostNextSteps(opts: {
  folder: string;
  apiUrl: string;
  siteUrl: string;
  dashboardUrl: string;
}): void {
  console.log(
    [
      "",
      cyan("Self-host is live. Next:"),
      `  1. Open ${opts.dashboardUrl}`,
      "  2. Sign up",
      "  3. Create orgs and sites (full multi-site launcher on your Cloudflare)",
      `  4. Visit ${opts.siteUrl} (workers.dev serves your first site until you attach domains)`,
      "  5. Attach your own domains in Cloudflare when you want them",
      "",
      `API: ${opts.apiUrl}`,
      `Project: cd ${opts.folder}`,
      "",
      "Same product as managed Kumooo: orgs, multiple sites, one dashboard.",
      "You run the Workers. Cloudflare bills you for usage.",
    ].join("\n"),
  );
}
