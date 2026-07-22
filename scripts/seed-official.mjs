#!/usr/bin/env node
/**
 * Seed official Kumooo sites (marketing + docs + season demos) against a running API.
 *
 *   KUMOOO_API=https://api.kumooo.dev \
 *   KUMOOO_EMAIL=… \
 *   KUMOOO_PASSWORD=… \
 *   node scripts/seed-official.mjs
 */
import { readFile, readdir } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const API = process.env.KUMOOO_API;
const EMAIL = process.env.KUMOOO_EMAIL;
const PASS = process.env.KUMOOO_PASSWORD;
const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");

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

function titleFromMarkdown(markdown, fallback) {
  return markdown.match(/^#\s+(.+)$/m)?.[1]?.trim() ?? fallback;
}

function bodyWithoutH1(markdown) {
  return markdown.replace(/^#\s+.+\r?\n+/, "");
}

async function upsertContent(siteId, { slug, title, bodyMarkdown, type }) {
  const list = await req("GET", `/v1/sites/${siteId}/content?type=${type}&perPage=100`);
  const existing = (list.data.content ?? []).find((c) => c.slug === slug);
  const payload = {
    title,
    bodyMarkdown,
    status: "published",
    type,
  };
  if (existing) {
    await req("PATCH", `/v1/sites/${siteId}/content/${existing.id}`, payload);
    console.log(`updated  ${type} /${slug}`);
  } else {
    await req("POST", `/v1/sites/${siteId}/content`, { ...payload, slug });
    console.log(`created  ${type} /${slug}`);
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
  }
  await req("PATCH", `/v1/sites/${site.id}`, {
    theme,
    settings: { title: name, description, nav },
  });
  console.log(`Updated site ${slug} (${site.id})`);
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

Four free seasons with live previews:
[haru](https://haru.kumooo.dev), [natsu](https://natsu.kumooo.dev), [aki](https://aki.kumooo.dev), [fuyu](https://fuyu.kumooo.dev).
Or Theme Studio for your own HTML and CSS.

## Your Cloudflare account

D1 for content. R2 for media. KV for sessions and cache versions.

## Hosting

Host on Kumooo for orgs and multiple sites, or self-host on your Cloudflare with \`npx create-kumooo\`.

## No PHP required

Take that however you want.
`,
  },
  {
    slug: "pricing",
    title: "Pricing",
    bodyMarkdown: `Kumooo is open source.

## Host on Kumooo

Managed platform. Orgs, multiple sites, dashboard. You get {slug}.kumooo.dev.

## Self-host on Cloudflare

\`npx create-kumooo\`. Your Workers, D1, KV, R2, dashboard. Your site. There is no Kumooo tax either way.

## What you pay

You pay Cloudflare for what you use. The free tier is enough to start.
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
  await upsertContent(marketing.id, { ...page, type: "page" });
}

const docs = await ensureSite(
  "documentation",
  "Kumooo Docs",
  "docs",
  "Clear docs. No fluff. Built for people who ship sites.",
  [
    { title: "Getting started", url: "/getting-started" },
    { title: "Season themes", url: "/season-themes" },
    { title: "Theme Studio", url: "/theme-studio" },
    { title: "API", url: "/api-reference" },
  ],
);

const DOC_TITLES = {
  index: "Introduction",
  "getting-started": "Getting started",
  installation: "Installation",
  architecture: "Architecture",
  cli: "CLI",
  themes: "Themes",
  "season-themes": "Season themes",
  authentication: "Authentication",
  "custom-domains": "Custom domains",
  "drafts-and-revisions": "Drafts & revisions",
  "publishing-your-first-post": "Your first post",
  "building-a-theme": "Building a theme",
  "media-and-branding": "Media & branding",
  "theme-studio": "Theme Studio",
  "deploy-on-cloudflare": "Deploy on Cloudflare",
  "api-reference": "API reference",
};

const docsDir = join(ROOT, "content", "docs");
const files = (await readdir(docsDir)).filter((f) => f.endsWith(".md")).sort();
const docsFiles = files
  .filter((f) => f !== "writing.md")
  .filter((f) => (files.includes("index.md") ? f !== "README.md" : true));
for (const file of docsFiles) {
  const markdown = await readFile(join(docsDir, file), "utf8");
  const slug = file === "README.md" ? "index" : file.replace(/\.md$/, "");
  const title = DOC_TITLES[slug] ?? titleFromMarkdown(markdown, slug);
  await upsertContent(docs.id, { slug, title, bodyMarkdown: markdown, type: "page" });
}

const SEASONS = [
  {
    slug: "haru",
    name: "Haru",
    description: "Spring journal theme. Soft lists, calm type, dated notes.",
  },
  {
    slug: "natsu",
    name: "Natsu",
    description: "Summer cards theme. Punchy posts, bold accent, release energy.",
  },
  {
    slug: "aki",
    name: "Aki",
    description: "Autumn chapters. Editorial essays and long reading.",
  },
  {
    slug: "fuyu",
    name: "Fuyu",
    description: "Winter log. Cold clarity, status bars, short entries.",
  },
];

const seasonSites = [];
for (const season of SEASONS) {
  const site = await ensureSite(season.slug, season.name, season.slug, season.description, [
    { title: "About", url: "/about" },
    { title: "Docs", url: "https://docs.kumooo.dev/season-themes" },
    { title: "Get started", url: "https://dash.kumooo.dev" },
  ]);
  seasonSites.push(site);

  const dir = join(ROOT, "content", "seasons", season.slug);
  const aboutMd = await readFile(join(dir, "about.md"), "utf8");
  await upsertContent(site.id, {
    slug: "about",
    title: titleFromMarkdown(aboutMd, `About ${season.name}`),
    bodyMarkdown: bodyWithoutH1(aboutMd),
    type: "page",
  });

  const postFiles = (await readdir(dir))
    .filter((f) => f.startsWith("post-") && f.endsWith(".md"))
    .sort();
  for (const file of postFiles) {
    const markdown = await readFile(join(dir, file), "utf8");
    const slug = file.replace(/\.md$/, "");
    const title = titleFromMarkdown(markdown, slug);
    await upsertContent(site.id, {
      slug,
      title,
      bodyMarkdown: bodyWithoutH1(markdown),
      type: "post",
    });
  }
}

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
  Marketing: site ${marketing.id} (theme marketing) → https://kumooo.dev
  Docs:      site ${docs.id} (theme docs) → https://docs.kumooo.dev
  Seasons:   ${seasonSites.map((s, i) => `${SEASONS[i].slug}.kumooo.dev`).join(", ")}
`);
