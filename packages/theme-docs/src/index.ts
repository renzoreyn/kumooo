import { extractToc } from "@kumooo/core";
import {
  html,
  joinHtml,
  raw,
  type Html,
  type Theme,
  type ThemeSiteContext,
} from "@kumooo/theme-kit";

type NavItem = { slug: string; title: string; group: string; order: number };

const NAV_MAP: NavItem[] = [
  { slug: "index", title: "Introduction", group: "Getting started", order: 1 },
  { slug: "getting-started", title: "Getting started", group: "Getting started", order: 2 },
  { slug: "installation", title: "Installation", group: "Getting started", order: 3 },
  { slug: "architecture", title: "Architecture", group: "Guides", order: 10 },
  { slug: "cli", title: "CLI", group: "Guides", order: 11 },
  { slug: "themes", title: "Themes", group: "Guides", order: 12 },
  { slug: "authentication", title: "Authentication", group: "Guides", order: 13 },
  { slug: "writing", title: "Writing", group: "Guides", order: 14 },
  { slug: "api-reference", title: "API reference", group: "Reference", order: 20 },
];

const ORDERED = [...NAV_MAP].sort((a, b) => a.order - b.order);

function urlFor(slug: string): string {
  return slug === "index" ? "/" : `/${slug}`;
}

function navGroups(): { group: string; items: NavItem[] }[] {
  const groups: { group: string; items: NavItem[] }[] = [];
  for (const item of ORDERED) {
    const last = groups[groups.length - 1];
    if (!last || last.group !== item.group) groups.push({ group: item.group, items: [item] });
    else last.items.push(item);
  }
  return groups;
}

function findNav(slug: string): NavItem | undefined {
  return NAV_MAP.find((n) => n.slug === slug);
}

function prevNext(slug: string): { prev?: NavItem; next?: NavItem } {
  const i = ORDERED.findIndex((n) => n.slug === slug);
  if (i < 0) return {};
  return { prev: ORDERED[i - 1], next: ORDERED[i + 1] };
}

const css = `
:root, .fd-root {
  --bg: #ffffff;
  --fg: #0f172a;
  --muted: #64748b;
  --line: #e2e8f0;
  --accent: #0d9488;
  --accent-ink: #042f2e;
  --sidebar: #f8fafc;
  --card: #ffffff;
  --header-h: 3.5rem;
  color-scheme: light;
}
html[data-theme="dark"],
.fd-root[data-theme="dark"],
html[data-theme="system"] .fd-root[data-theme="system"] {
  --bg: #0b1220;
  --fg: #e2e8f0;
  --muted: #94a3b8;
  --line: #1e293b;
  --accent: #2dd4bf;
  --accent-ink: #042f2e;
  --sidebar: #0f172a;
  --card: #111827;
  color-scheme: dark;
}
@media (prefers-color-scheme: dark) {
  html[data-theme="system"],
  .fd-root[data-theme="system"] {
    --bg: #0b1220;
    --fg: #e2e8f0;
    --muted: #94a3b8;
    --line: #1e293b;
    --accent: #2dd4bf;
    --accent-ink: #042f2e;
    --sidebar: #0f172a;
    --card: #111827;
    color-scheme: dark;
  }
}
* { box-sizing: border-box; }
html { scroll-behavior: smooth; }
html, body {
  margin: 0;
  min-height: 100%;
  background: var(--bg);
  color: var(--fg);
}
body {
  font: 15px/1.7 "Inter", "Segoe UI", sans-serif;
}
.fd-root {
  min-height: 100vh;
  background: var(--bg);
  color: var(--fg);
}
a { color: var(--accent); text-decoration: none; }
a:hover { text-decoration: underline; }
.fd-header {
  position: sticky; top: 0; z-index: 40; height: var(--header-h);
  display: flex; align-items: center; gap: .75rem;
  padding: 0 1rem; border-bottom: 1px solid var(--line);
  background: color-mix(in srgb, var(--bg) 88%, transparent);
  backdrop-filter: blur(10px);
}
.fd-brand {
  font-weight: 700; letter-spacing: -0.03em; color: var(--fg); font-size: 1rem;
  display: inline-flex; align-items: center; gap: .35rem; margin-right: .5rem;
}
.fd-brand span { color: var(--accent); }
.fd-header-actions { margin-left: auto; display: flex; align-items: center; gap: .45rem; }
.fd-icon-btn, .fd-search-btn {
  border: 1px solid var(--line); background: var(--card); color: var(--muted);
  border-radius: 10px; padding: .4rem .7rem; font: inherit; font-size: .85rem; cursor: pointer;
  display: inline-flex; align-items: center; gap: .4rem;
}
.fd-icon-btn:hover, .fd-search-btn:hover { color: var(--fg); border-color: var(--accent); }
.fd-icon-btn { width: 2.2rem; height: 2.2rem; justify-content: center; padding: 0; }
.fd-icon-btn svg { width: 1rem; height: 1rem; }
.fd-search-btn { min-width: 12.5rem; text-align: left; color: var(--muted); }
.fd-search-btn kbd {
  margin-left: auto; font-size: .7rem; border: 1px solid var(--line);
  border-radius: 4px; padding: 0 .3rem; color: var(--muted);
}
.fd-header a.link { color: var(--muted); font-size: .88rem; padding: .35rem .55rem; border-radius: 8px; }
.fd-header a.link:hover { color: var(--fg); text-decoration: none; background: color-mix(in srgb, var(--accent) 10%, transparent); }
.fd-menu { display: none; }
@media (max-width: 800px) {
  .fd-menu { display: inline-flex; }
  .fd-search-btn { min-width: 0; }
  .fd-search-btn span.label { display: none; }
}
.fd-layout {
  display: grid;
  grid-template-columns: 16rem minmax(0, 1fr) 14rem;
  min-height: calc(100vh - var(--header-h));
  background: var(--bg);
}
@media (max-width: 1100px) {
  .fd-layout { grid-template-columns: 15rem minmax(0, 1fr); }
  .fd-toc { display: none; }
}
@media (max-width: 800px) {
  .fd-layout { grid-template-columns: 1fr; }
  .fd-sidebar { display: none; }
}
.fd-sidebar {
  border-right: 1px solid var(--line);
  background: var(--sidebar);
  padding: 1rem .85rem 2rem;
  position: sticky; top: var(--header-h); height: calc(100vh - var(--header-h)); overflow: auto;
}
.fd-side-label {
  font-size: .7rem; text-transform: uppercase; letter-spacing: .08em;
  color: var(--muted); font-weight: 700; margin: .9rem .55rem .35rem;
}
.fd-side-nav a {
  display: block; padding: .4rem .6rem; border-radius: .5rem;
  color: var(--muted); font-size: .9rem; margin-bottom: .1rem;
  transition: background .15s ease, color .15s ease;
}
.fd-side-nav a:hover { background: color-mix(in srgb, var(--accent) 10%, transparent); color: var(--fg); text-decoration: none; }
.fd-side-nav a.active {
  background: color-mix(in srgb, var(--accent) 14%, transparent);
  color: var(--fg); font-weight: 600;
}
.fd-main {
  padding: 1.25rem 1.75rem 3.5rem; max-width: 48rem;
  background: var(--bg);
}
.fd-breadcrumbs {
  display: flex; flex-wrap: wrap; gap: .35rem; align-items: center;
  font-size: .8rem; color: var(--muted); margin-bottom: .85rem;
}
.fd-breadcrumbs a { color: var(--muted); }
.fd-breadcrumbs a:hover { color: var(--accent); }
.fd-breadcrumbs .sep { opacity: .5; }
.fd-toc {
  border-left: 1px solid var(--line);
  background: var(--bg);
  padding: 1.25rem 1rem;
  position: sticky; top: var(--header-h); height: calc(100vh - var(--header-h)); overflow: auto;
}
.fd-toc h4 {
  margin: 0 0 .75rem; font-size: .75rem; text-transform: uppercase;
  letter-spacing: .08em; color: var(--muted);
}
.fd-toc a {
  display: block; color: var(--muted); font-size: .85rem; margin-bottom: .35rem;
  border-left: 2px solid transparent; padding-left: .55rem;
}
.fd-toc a.l3 { padding-left: 1.1rem; }
.fd-toc a.active { color: var(--fg); border-left-color: var(--accent); }
.fd-toc a:hover { color: var(--fg); text-decoration: none; }
.prose h1 { font-size: 2rem; letter-spacing: -0.03em; margin: 0 0 1rem; }
.prose h2 { margin-top: 2.2rem; letter-spacing: -0.02em; scroll-margin-top: 4.5rem; }
.prose h3 { scroll-margin-top: 4.5rem; }
.prose pre {
  position: relative;
  background: var(--card); border: 1px solid var(--line);
  padding: .9rem 1rem; border-radius: 10px; overflow-x: auto;
}
.prose code { font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: .9em; }
.fd-copy-code {
  position: absolute; top: .45rem; right: .45rem;
  border: 1px solid var(--line); background: var(--bg); color: var(--muted);
  border-radius: 6px; font-size: .72rem; padding: .2rem .45rem; cursor: pointer;
}
.fd-pager {
  display: grid; grid-template-columns: 1fr 1fr; gap: .75rem;
  margin-top: 2.5rem; padding-top: 1.25rem; border-top: 1px solid var(--line);
}
.fd-pager a {
  display: block; border: 1px solid var(--line); border-radius: 12px;
  padding: .85rem 1rem; color: var(--fg); background: var(--card);
}
.fd-pager a:hover { border-color: var(--accent); text-decoration: none; }
.fd-pager .label { display: block; font-size: .75rem; color: var(--muted); margin-bottom: .2rem; }
.fd-pager .next { text-align: right; }
.fd-drawer {
  position: fixed; inset: 0; z-index: 50; background: rgba(15,23,42,.45);
}
.fd-drawer[hidden] { display: none; }
.fd-drawer-panel {
  width: min(18rem, 88vw); height: 100%; background: var(--sidebar);
  border-right: 1px solid var(--line); padding: 1rem; overflow: auto;
}
.fd-search {
  position: fixed; inset: 0; z-index: 60; background: rgba(15,23,42,.5);
  display: flex; align-items: flex-start; justify-content: center; padding-top: 12vh;
}
.fd-search[hidden] { display: none; }
.fd-search-box {
  width: min(36rem, 92vw); background: var(--card); border: 1px solid var(--line);
  border-radius: 14px; overflow: hidden; box-shadow: 0 24px 80px rgba(0,0,0,.35);
}
.fd-search-box input {
  width: 100%; border: 0; border-bottom: 1px solid var(--line);
  background: transparent; color: var(--fg); font: inherit; padding: .9rem 1rem; outline: none;
}
.fd-search-results { max-height: 18rem; overflow: auto; }
.fd-search-results a {
  display: block; padding: .7rem 1rem; color: var(--fg); border-bottom: 1px solid var(--line);
}
.fd-search-results a:hover, .fd-search-results a.active {
  background: color-mix(in srgb, var(--accent) 12%, transparent); text-decoration: none;
}
.fd-search-results .meta { display: block; font-size: .75rem; color: var(--muted); }
.muted { color: var(--muted); }
.toc-pop {
  display: none; margin-bottom: 1rem; border: 1px solid var(--line);
  border-radius: 10px; padding: .65rem .8rem; background: var(--card);
}
@media (max-width: 1100px) { .toc-pop { display: block; } }
.docs-hero { margin-bottom: 1.5rem; }
.docs-hero h1 { font-size: 2.2rem; letter-spacing: -0.04em; margin: 0 0 .6rem; }
.docs-hero .lead { margin: 0; color: var(--muted); max-width: 38rem; font-size: 1.05rem; }
.docs-actions { display: flex; flex-wrap: wrap; gap: .6rem; margin: 1.15rem 0 0; }
.docs-actions a {
  display: inline-flex; align-items: center; gap: .35rem;
  border: 1px solid var(--line); border-radius: 999px; padding: .45rem .9rem;
  color: var(--fg); background: var(--card); font-size: .9rem; font-weight: 600;
}
.docs-actions a:hover { border-color: var(--accent); text-decoration: none; }
.docs-actions a.primary { background: var(--accent); color: var(--accent-ink); border-color: var(--accent); }
.next-steps {
  display: grid; gap: .75rem; margin-top: 1rem;
  grid-template-columns: repeat(2, minmax(0, 1fr));
}
@media (max-width: 700px) { .next-steps { grid-template-columns: 1fr; } }
.next-steps a {
  display: block; border: 1px solid var(--line); border-radius: 14px;
  padding: 1rem 1.1rem; background: var(--card); color: var(--fg);
}
.next-steps a:hover { border-color: var(--accent); text-decoration: none; }
.next-steps strong { display: block; margin-bottom: .2rem; }
.next-steps span { display: block; color: var(--muted); font-size: .88rem; }
.stack-list { list-style: none; padding: 0; margin: 0 0 1rem; }
.stack-list li {
  display: grid; grid-template-columns: 7rem 1fr; gap: .75rem;
  padding: .7rem 0; border-top: 1px solid var(--line); color: var(--muted);
}
.stack-list li:last-child { border-bottom: 1px solid var(--line); }
.stack-list b { color: var(--fg); font-weight: 600; }
.prose p { margin: 0 0 1rem; }
.prose ul, .prose ol { margin: 0 0 1rem; padding-left: 1.25rem; }
.prose li { margin: .25rem 0; }
.prose a { font-weight: 500; }
.prose blockquote {
  margin: 1.2rem 0; padding: .85rem 1rem; border-left: 3px solid var(--accent);
  background: color-mix(in srgb, var(--accent) 8%, transparent); border-radius: 0 10px 10px 0;
  color: var(--fg);
}
.prose table { width: 100%; border-collapse: collapse; margin: 1rem 0 1.4rem; font-size: .92rem; }
.prose th, .prose td { border: 1px solid var(--line); padding: .55rem .7rem; text-align: left; }
.prose th { background: var(--sidebar); }
`;

const themeIcon = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>`;

const clientIsland = `
const root = document.querySelector(".fd-root");
const htmlEl = document.documentElement;
const stored = localStorage.getItem("kumooo-docs-theme") || "system";
function applyTheme(mode) {
  root?.setAttribute("data-theme", mode);
  htmlEl.setAttribute("data-theme", mode);
  localStorage.setItem("kumooo-docs-theme", mode);
}
applyTheme(stored);

const themeBtn = document.querySelector("[data-theme-toggle]");
themeBtn?.addEventListener("click", () => {
  const cur = root?.getAttribute("data-theme") || "system";
  const next = cur === "system" ? "light" : cur === "light" ? "dark" : "system";
  applyTheme(next);
});

const drawer = document.querySelector("[data-drawer]");
document.querySelector("[data-drawer-open]")?.addEventListener("click", () => { if (drawer) drawer.hidden = false; });
document.querySelector("[data-drawer-close]")?.addEventListener("click", () => { if (drawer) drawer.hidden = true; });
drawer?.addEventListener("click", (e) => { if (e.target === drawer) drawer.hidden = true; });

const search = document.querySelector("[data-search]");
const searchInput = document.querySelector("[data-search-input]");
const searchResults = document.querySelector("[data-search-results]");
const index = window.__KUMOOO_SEARCH__ || { pages: [], currentHeadings: [] };

function openSearch() {
  if (!search) return;
  search.hidden = false;
  searchInput?.focus();
  renderSearch(searchInput?.value || "");
}
function closeSearch() { if (search) search.hidden = true; }
document.querySelectorAll("[data-search-open]").forEach((el) => el.addEventListener("click", openSearch));
document.querySelector("[data-search-close]")?.addEventListener("click", closeSearch);
search?.addEventListener("click", (e) => { if (e.target === search) closeSearch(); });
window.addEventListener("keydown", (e) => {
  if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") { e.preventDefault(); openSearch(); }
  if (e.key === "Escape") { closeSearch(); if (drawer) drawer.hidden = true; }
});

function renderSearch(q) {
  if (!searchResults) return;
  const query = q.trim().toLowerCase();
  const items = [
    ...index.pages.map((p) => ({ title: p.title, url: p.url, meta: p.group })),
    ...index.currentHeadings.map((h) => ({ title: h.text, url: h.url, meta: "On this page" })),
  ].filter((i) => !query || i.title.toLowerCase().includes(query));
  searchResults.innerHTML = items.slice(0, 12).map((i, idx) =>
    \`<a href="\${i.url}" class="\${idx === 0 ? "active" : ""}"><span>\${i.title}</span><span class="meta">\${i.meta || ""}</span></a>\`
  ).join("") || \`<p class="muted" style="padding:1rem">No matches.</p>\`;
}
searchInput?.addEventListener("input", () => renderSearch(searchInput.value));

const headings = [...document.querySelectorAll(".prose h2[id], .prose h3[id]")];
const tocLinks = [...document.querySelectorAll("[data-toc] a[href^='#']")];
if (headings.length && tocLinks.length) {
  const spy = new IntersectionObserver((entries) => {
    const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
    if (!visible) return;
    const id = visible.target.getAttribute("id");
    for (const a of tocLinks) a.classList.toggle("active", a.getAttribute("href") === "#" + id);
  }, { rootMargin: "-20% 0px -65% 0px", threshold: 0 });
  for (const h of headings) spy.observe(h);
}

for (const pre of document.querySelectorAll(".prose pre")) {
  if (pre.querySelector("[data-copy-code]")) continue;
  const btn = document.createElement("button");
  btn.type = "button";
  btn.className = "fd-copy-code";
  btn.setAttribute("data-copy-code", "");
  btn.textContent = "Copy";
  pre.style.position = "relative";
  pre.appendChild(btn);
  btn.addEventListener("click", async () => {
    const text = pre.innerText.replace(/\\n?Copy$/, "").trim();
    try { await navigator.clipboard.writeText(text); } catch {}
    btn.textContent = "Copied";
    setTimeout(() => { btn.textContent = "Copy"; }, 1000);
  });
}
`;

function sidebarNav(currentSlug: string): Html {
  return joinHtml(
    navGroups().map(
      (g) => html`
        <div class="fd-side-label">${g.group}</div>
        <nav class="fd-side-nav">
          ${joinHtml(
            g.items.map(
              (n) =>
                html`<a class="${n.slug === currentSlug ? "active" : ""}" href="${urlFor(n.slug)}">${n.title}</a>`,
            ),
          )}
        </nav>`,
    ),
  );
}

function tocHtml(toc: { id: string; text: string; level: number }[]): Html {
  if (!toc.length) return html`<p class="muted" style="font-size:.85rem">No sections.</p>`;
  return joinHtml(
    toc.map(
      (t) =>
        html`<a class="${t.level === 3 ? "l3" : ""}" href="#${t.id}">${t.text}</a>`,
    ),
  );
}

function pager(slug: string): Html {
  const { prev, next } = prevNext(slug);
  return html`<nav class="fd-pager">
    ${
      prev
        ? html`<a href="${urlFor(prev.slug)}"><span class="label">Previous</span>${prev.title}</a>`
        : html`<div></div>`
    }
    ${
      next
        ? html`<a class="next" href="${urlFor(next.slug)}"><span class="label">Next</span>${next.title}</a>`
        : html`<div></div>`
    }
  </nav>`;
}

function breadcrumbs(slug: string, title: string): Html {
  const item = findNav(slug);
  const group = item?.group ?? "Docs";
  return html`<nav class="fd-breadcrumbs" aria-label="Breadcrumb">
    <a href="/">Docs</a><span class="sep">/</span>
    <span>${group}</span><span class="sep">/</span>
    <span>${title}</span>
  </nav>`;
}

function docsShell(
  site: ThemeSiteContext,
  body: Html,
  opts: {
    currentSlug: string;
    title: string;
    toc?: { id: string; text: string; level: number }[];
    showPager?: boolean;
  },
): Html {
  const toc = opts.toc ?? [];
  const searchBoot = {
    pages: ORDERED.map((n) => ({
      title: n.title,
      url: urlFor(n.slug),
      group: n.group,
    })),
    currentHeadings: toc.map((t) => ({ text: t.text, url: `#${t.id}` })),
  };

  return html`<!doctype html>
<html lang="${site.language}" data-theme="system">
<head>
<meta charset="utf-8">
${site.head}
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap">
<style>${raw(css)}</style>
<script>
(() => {
  const mode = localStorage.getItem("kumooo-docs-theme") || "system";
  document.documentElement.setAttribute("data-theme", mode);
  document.addEventListener("DOMContentLoaded", () => {
    document.querySelector(".fd-root")?.setAttribute("data-theme", mode);
  });
})();
</script>
</head>
<body>
<div class="fd-root" data-theme="system">
  <header class="fd-header">
    <button type="button" class="fd-icon-btn fd-menu" data-drawer-open aria-label="Open menu">☰</button>
    <a class="fd-brand" href="/">kumooo <span>docs</span></a>
    <button type="button" class="fd-search-btn" data-search-open><span class="label">Search docs…</span> <kbd>⌘K</kbd></button>
    <div class="fd-header-actions">
      <button type="button" class="fd-icon-btn" data-theme-toggle aria-label="Toggle theme" title="Theme">${raw(themeIcon)}</button>
      <a class="link" href="https://kumooo.dev">Site</a>
      <a class="link" href="https://github.com/renzoreyn/kumooo">GitHub</a>
    </div>
  </header>
  <div class="fd-layout">
    <aside class="fd-sidebar">${sidebarNav(opts.currentSlug)}</aside>
    <main class="fd-main" data-docs-main>
      ${breadcrumbs(opts.currentSlug, opts.title)}
      <div class="toc-pop" data-toc>
        <h4 style="margin:0 0 .5rem;font-size:.75rem;text-transform:uppercase;letter-spacing:.08em;color:var(--muted)">On this page</h4>
        ${tocHtml(toc)}
      </div>
      ${body}
      ${opts.showPager === false ? html`` : pager(opts.currentSlug)}
    </main>
    <aside class="fd-toc" data-toc>
      <h4>On this page</h4>
      ${tocHtml(toc)}
    </aside>
  </div>
  <div class="fd-drawer" data-drawer hidden>
    <div class="fd-drawer-panel">
      <button type="button" class="fd-icon-btn" data-drawer-close style="margin-bottom:1rem" aria-label="Close">✕</button>
      ${sidebarNav(opts.currentSlug)}
    </div>
  </div>
  <div class="fd-search" data-search hidden>
    <div class="fd-search-box">
      <input data-search-input placeholder="Search docs…" aria-label="Search docs" />
      <div class="fd-search-results" data-search-results></div>
      <button type="button" class="fd-icon-btn" data-search-close style="margin:.6rem" aria-label="Close search">✕</button>
    </div>
  </div>
</div>
<script>window.__KUMOOO_SEARCH__ = ${raw(JSON.stringify(searchBoot))};</script>
<script type="module">${raw(clientIsland)}</script>
</body>
</html>`;
}

function docsHomeBody(): Html {
  return html`<article class="prose">
    <div class="docs-hero">
      <h1>Introduction</h1>
      <p class="lead">Kumooo is a publishing platform on Cloudflare. Content in D1. Media in R2. Pages render in a Worker a few milliseconds from your readers.</p>
      <div class="docs-actions">
        <a class="primary" href="/getting-started">Get started</a>
        <a href="/architecture">How it works</a>
        <a href="https://github.com/renzoreyn/kumooo">GitHub</a>
      </div>
    </div>

    <h2 id="what-you-get">What you get</h2>
    <p>A real CMS without a VPS to babysit. Write Markdown, publish sites, ship themes with as much React as you want. Readers get HTML.</p>
    <ul>
      <li>Sites, pages, posts, drafts, and revisions</li>
      <li>Custom domains on your Cloudflare account</li>
      <li>SSR themes, with optional client islands</li>
      <li>A dashboard for the boring parts</li>
    </ul>

    <h2 id="the-stack">The stack</h2>
    <ul class="stack-list">
      <li><b>API</b><span>Auth, orgs, sites, content, media, domains</span></li>
      <li><b>Renderer</b><span>Hostname → theme → HTML, cached at the edge</span></li>
      <li><b>Dashboard</b><span>React admin for editing and publishing</span></li>
      <li><b>D1 / R2 / KV</b><span>Content, media, sessions, cache versions</span></li>
    </ul>

    <h2 id="where-to-next">Where to next</h2>
    <p>Pick a path. The sidebar has the full tree when you need it.</p>
    <div class="next-steps">
      <a href="/getting-started"><strong>Getting started</strong><span>Ten minutes to a published page.</span></a>
      <a href="/installation"><strong>Installation</strong><span>What create-kumooo sets up locally.</span></a>
      <a href="/architecture"><strong>Architecture</strong><span>Two workers, one database, no drama.</span></a>
      <a href="/themes"><strong>Themes</strong><span>SSR HTML or hydrate React when you want.</span></a>
    </div>
  </article>`;
}

function docsHomeOpts() {
  return {
    currentSlug: "index",
    title: "Introduction",
    toc: [
      { id: "what-you-get", text: "What you get", level: 2 },
      { id: "the-stack", text: "The stack", level: 2 },
      { id: "where-to-next", text: "Where to next", level: 2 },
    ],
    showPager: true as const,
  };
}

export const docsTheme: Theme = {
  name: "docs",
  label: "Kumooo docs (Fumadocs-inspired)",
  home(site) {
    return docsShell(site, docsHomeBody(), docsHomeOpts());
  },
  post(site, { post }) {
    const toc = extractToc(post.markdown);
    return docsShell(
      site,
      html`<article class="prose"><h1>${post.title}</h1>${raw(post.html)}</article>`,
      { currentSlug: post.slug, title: post.title, toc },
    );
  },
  page(site, { page }) {
    if (page.slug === "index") return docsShell(site, docsHomeBody(), docsHomeOpts());
    const toc = extractToc(page.markdown);
    return docsShell(
      site,
      html`<article class="prose"><h1>${page.title}</h1>${raw(page.html)}</article>`,
      { currentSlug: page.slug, title: page.title, toc },
    );
  },
  archive(site, d) {
    return docsShell(
      site,
      html`<article class="prose"><h1>${d.title}</h1>${joinHtml(d.posts.map((p) => html`<p><a href="${p.url}">${p.title}</a></p>`))}</article>`,
      { currentSlug: "", title: d.title, showPager: false },
    );
  },
  notFound(site) {
    return docsShell(
      site,
      html`<article class="prose"><h1>Nothing here</h1><p class="muted">That page doesn't exist. Check the sidebar.</p></article>`,
      { currentSlug: "", title: "Not found", showPager: false },
    );
  },
};
