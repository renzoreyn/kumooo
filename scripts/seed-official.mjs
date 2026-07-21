#!/usr/bin/env node
/**
 * Seed official Kumooo sites (marketing + docs) against a running API.
 *
 *   KUMOOO_API=http://127.0.0.1:8787 \
 *   KUMOOO_EMAIL=contact@renzoreyn.dev \
 *   KUMOOO_PASSWORD='your passphrase here' \
 *   node scripts/seed-official.mjs
 */
import { readFile, readdir } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const API = process.env.KUMOOO_API;
const EMAIL = process.env.KUMOOO_EMAIL;
const PASS = process.env.KUMOOO_PASSWORD;

if (!API || !EMAIL || !PASS) {
  console.error("Set KUMOOO_API, KUMOOO_EMAIL, and KUMOOO_PASSWORD.");
  process.exit(1);
}

let cookie = "";

async function req(method, path, body) {
  const headers = { "Content-Type": "application/json" };
  if (cookie) headers.Cookie = cookie;
  const res = await fetch(`${API}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  const set = res.headers.get("set-cookie");
  if (set?.includes("kumooo_session")) cookie = set.split(";")[0];
  const data = await res.json().catch(() => ({}));
  if (!res.ok && res.status !== 409) {
    throw new Error(`${method} ${path} -> ${res.status}: ${data?.error?.message ?? "unknown"}`);
  }
  return { data, status: res.status };
}

async function upsertPage(siteId, { slug, title, bodyMarkdown }) {
  const list = await req("GET", `/v1/sites/${siteId}/content?type=page&perPage=100`);
  const existing = (list.data.content ?? []).find((c) => c.slug === slug);
  const payload = {
    title,
    bodyMarkdown,
    status: "published",
    type: "page",
  };
  if (existing) {
    await req("PATCH", `/v1/sites/${siteId}/content/${existing.id}`, payload);
    console.log(`updated  /${slug}`);
  } else {
    await req("POST", `/v1/sites/${siteId}/content`, { ...payload, slug });
    console.log(`created  /${slug}`);
  }
}

console.log("Signing in…");
try {
  await req("POST", "/v1/auth/login", { email: EMAIL, password: PASS });
} catch {
  console.log("No account yet. Signing up…");
  await req("POST", "/v1/auth/signup", {
    email: EMAIL,
    password: PASS,
    name: "Ren",
  });
}

const { data: orgsData } = await req("GET", "/v1/orgs");
const orgId = orgsData.organizations?.[0]?.id;
if (!orgId) throw new Error("No org. Signup should have created one.");

async function ensureSite(slug, name, theme, description, nav) {
  const { data } = await req("GET", `/v1/orgs/${orgId}/sites`);
  let site = (data.sites ?? []).find((s) => s.slug === slug);
  if (!site) {
    const created = await req("POST", `/v1/orgs/${orgId}/sites`, {
      name,
      slug,
      theme,
      description,
    });
    site = created.data.site;
    console.log(`Created site ${slug} (${site.id})`);
  } else {
    await req("PATCH", `/v1/sites/${site.id}`, {
      theme,
      settings: { title: name, description, nav },
    });
    console.log(`Updated site ${slug} (${site.id})`);
  }
  return site;
}

const marketing = await ensureSite("kumooo", "Kumooo", "marketing", "Publishing without the babysitting.", [
  { title: "Features", url: "/features" },
  { title: "Pricing", url: "/pricing" },
  { title: "Docs", url: "https://docs.kumooo.dev" },
  { title: "About", url: "/about" },
]);

const marketingPages = [
  {
    slug: "features",
    title: "Features",
    bodyMarkdown: `## Fast by default

Pages render in a Worker a few milliseconds from your readers, then get cached hard.
You don't tune this. It's just how Kumooo works.

## A real CMS

Posts, pages, drafts, revisions, media, tags, custom fields.
Markdown in. HTML out.

## Themes with teeth

Ship plain HTML with zero required JavaScript.
Or hydrate React with Framer Motion, Lucide, and Radix when you want to show off.

## Your Cloudflare account

D1 for content. R2 for media. KV for sessions and cache versions.
Connect once. Kumooo handles the rest.

## Custom domains

Point a CNAME. Get automatic SSL when Cloudflare for SaaS is configured.
Renewals are someone else's problem.

## No PHP required

Take that however you want.
`,
  },
  {
    slug: "pricing",
    title: "Pricing",
    bodyMarkdown: `Kumooo is open source and self-hosted on **your** Cloudflare account.

## What you pay

You pay Cloudflare for what you use. The free tier is enough to start.
There is no Kumooo tax on top.

## What you get

Workers for the API and renderer. D1 for content. R2 for media. KV for sessions and cache versions.

## Hosted later?

Want a hosted option later? Maybe. Not today. Self-hosting is the product.
`,
  },
  {
    slug: "about",
    title: "About",
    bodyMarkdown: `Kumooo is built by [Ren](https://renzoreyn.dev).

## Why it exists

Publishing shouldn't require babysitting servers. WordPress gets used for a whole lot of nonsense. Fine. Kumooo gives you that freedom without PHP, plugin roulette, or a VPS you forgot existed.

## Where to find us

- Site: [renzoreyn.dev](https://renzoreyn.dev)
- Code: [github.com/renzoreyn/kumooo](https://github.com/renzoreyn/kumooo)
- Docs: [docs.kumooo.dev](https://docs.kumooo.dev)

Open an issue when something breaks. PRs welcome when they make the boring parts better.
`,
  },
];

for (const page of marketingPages) {
  await upsertPage(marketing.id, page);
}

const docs = await ensureSite(
  "documentation",
  "Kumooo Docs",
  "docs",
  "Clear docs. No fluff. Built for people who ship sites.",
  [
    { title: "Getting started", url: "/getting-started" },
    { title: "Installation", url: "/installation" },
    { title: "Architecture", url: "/architecture" },
    { title: "CLI", url: "/cli" },
    { title: "Themes", url: "/themes" },
    { title: "Authentication", url: "/authentication" },
    { title: "API", url: "/api-reference" },
    { title: "Writing", url: "/writing" },
  ],
);

const DOC_TITLES = {
  index: "Introduction",
  "getting-started": "Getting started",
  installation: "Installation",
  architecture: "Architecture",
  cli: "CLI",
  themes: "Themes",
  authentication: "Authentication",
  writing: "Writing",
  "api-reference": "API reference",
};

const docsDir = join(dirname(fileURLToPath(import.meta.url)), "..", "content", "docs");
const files = (await readdir(docsDir)).filter((f) => f.endsWith(".md")).sort();
// Prefer index.md over README.md (both would map to slug "index").
const docsFiles = files.includes("index.md") ? files.filter((f) => f !== "README.md") : files;
for (const file of docsFiles) {
  const markdown = await readFile(join(docsDir, file), "utf8");
  const slug = file === "README.md" ? "index" : file.replace(/\.md$/, "");
  const title = DOC_TITLES[slug] ?? markdown.match(/^#\s+(.+)$/m)?.[1] ?? slug;
  await upsertPage(docs.id, { slug, title, bodyMarkdown: markdown });
}

// Register custom hostnames locally when possible.
for (const [site, host] of [
  [marketing, "kumooo.dev"],
  [docs, "docs.kumooo.dev"],
]) {
  try {
    await req("POST", `/v1/sites/${site.id}/domains`, { hostname: host });
    console.log(`Domain ${host} registered.`);
  } catch (e) {
    console.log(`Domain ${host}: ${e.message}`);
  }
}

console.log(`
Done.
  Marketing: site ${marketing.id} (theme marketing)
  Docs:      site ${docs.id} (theme docs)

Locally, open http://127.0.0.1:8788 after kumooo migrate --local && kumooo dev.
`);
