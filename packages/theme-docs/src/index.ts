import { extractToc } from "@kumooo/core";
import {
  html,
  joinHtml,
  raw,
  type Html,
  type Theme,
  type ThemeSiteContext,
} from "@kumooo/theme-kit";

const css = `
:root {
  --bg: #ffffff;
  --fg: #0f172a;
  --muted: #64748b;
  --line: #e2e8f0;
  --accent: #0d9488;
  --sidebar: #f8fafc;
  --card: #ffffff;
  --max: 90rem;
  color-scheme: light dark;
}
@media (prefers-color-scheme: dark) {
  :root {
    --bg: #0b1220;
    --fg: #e2e8f0;
    --muted: #94a3b8;
    --line: #1e293b;
    --accent: #2dd4bf;
    --sidebar: #0f172a;
    --card: #111827;
  }
}
* { box-sizing: border-box; }
body {
  margin: 0;
  font: 15px/1.7 "Inter", "Segoe UI", sans-serif;
  background: var(--bg);
  color: var(--fg);
}
a { color: var(--accent); text-decoration: none; }
a:hover { text-decoration: underline; }
.layout {
  display: grid;
  grid-template-columns: 16.5rem 1fr 14rem;
  min-height: 100vh;
}
@media (max-width: 1100px) { .layout { grid-template-columns: 15rem 1fr; } .toc { display: none; } }
@media (max-width: 800px) { .layout { grid-template-columns: 1fr; } .sidebar { display: none; } }
.sidebar {
  border-right: 1px solid var(--line);
  background: var(--sidebar);
  padding: 1.25rem 1rem 2rem;
  position: sticky; top: 0; height: 100vh; overflow: auto;
}
.brand {
  font-weight: 700; letter-spacing: -0.03em; color: var(--fg);
  display: flex; align-items: center; gap: 0.5rem; margin-bottom: 1.25rem;
  font-size: 1.05rem;
}
.brand span { color: var(--accent); }
.side-nav a {
  display: block; padding: 0.35rem 0.55rem; border-radius: 8px;
  color: var(--muted); font-size: 0.9rem; margin-bottom: 0.15rem;
}
.side-nav a:hover, .side-nav a.active {
  background: color-mix(in srgb, var(--accent) 12%, transparent);
  color: var(--fg); text-decoration: none;
}
.side-label {
  font-size: 0.7rem; text-transform: uppercase; letter-spacing: 0.08em;
  color: var(--muted); font-weight: 700; margin: 1rem 0.55rem 0.4rem;
}
.main { padding: 1.5rem 2rem 4rem; max-width: 52rem; }
.toc {
  border-left: 1px solid var(--line); padding: 1.5rem 1rem;
  position: sticky; top: 0; height: 100vh; overflow: auto;
}
.toc h4 { margin: 0 0 0.75rem; font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.08em; color: var(--muted); }
.toc a { display: block; color: var(--muted); font-size: 0.85rem; margin-bottom: 0.35rem; }
.toc a.l3 { padding-left: 0.75rem; }
.prose h1 { font-size: 2rem; letter-spacing: -0.03em; margin: 0 0 1rem; }
.prose h2 { margin-top: 2.2rem; letter-spacing: -0.02em; scroll-margin-top: 1rem; }
.prose h3 { scroll-margin-top: 1rem; }
.prose pre {
  background: var(--card); border: 1px solid var(--line);
  padding: 0.9rem 1rem; border-radius: 10px; overflow-x: auto;
}
.prose code { font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: 0.9em; }
.topbar {
  display: flex; justify-content: space-between; align-items: center;
  margin-bottom: 1.5rem; gap: 1rem; flex-wrap: wrap;
}
.search {
  flex: 1; max-width: 22rem;
  background: var(--card); border: 1px solid var(--line); border-radius: 10px;
  padding: 0.55rem 0.8rem; color: var(--muted); font-size: 0.9rem;
}
.muted { color: var(--muted); }
`;

const clientIsland = `
import { animate } from "https://esm.sh/framer-motion@11.15.0/dom";
const main = document.querySelector("[data-docs-main]");
if (main) animate(main, { opacity: [0, 1], y: [8, 0] }, { duration: 0.35, easing: "ease-out" });
`;

function docsShell(
  site: ThemeSiteContext,
  body: Html,
  toc: { id: string; text: string; level: number }[] = [],
): Html {
  const nav = site.nav.length
    ? site.nav
    : [
        { title: "Getting started", url: "/getting-started" },
        { title: "Installation", url: "/installation" },
        { title: "Architecture", url: "/architecture" },
        { title: "CLI", url: "/cli" },
        { title: "Themes", url: "/themes" },
        { title: "API", url: "/api-reference" },
      ];

  return html`<!doctype html>
<html lang="${site.language}">
<head>
<meta charset="utf-8">
${site.head}
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap">
<style>${raw(css)}</style>
</head>
<body>
<div class="layout">
  <aside class="sidebar">
    <a class="brand" href="/">kumooo <span>docs</span></a>
    <div class="side-label">Guide</div>
    <nav class="side-nav">
      ${joinHtml(nav.map((n) => html`<a href="${n.url}">${n.title}</a>`))}
    </nav>
    <div class="side-label">Links</div>
    <nav class="side-nav">
      <a href="https://kumooo.dev">Marketing</a>
      <a href="https://github.com/renzoreyn/kumooo">GitHub</a>
      <a href="mailto:contact@renzoreyn.dev">Contact Ren</a>
    </nav>
  </aside>
  <main class="main" data-docs-main>
    <div class="topbar">
      <div class="search" role="search">Search is coming. For now, use your browser find.</div>
      <a href="https://kumooo.dev">kumooo.dev</a>
    </div>
    ${body}
  </main>
  <aside class="toc">
    <h4>On this page</h4>
    ${
      toc.length
        ? joinHtml(
            toc.map(
              (t) =>
                html`<a class="${t.level === 3 ? "l3" : ""}" href="#${t.id}">${t.text}</a>`,
            ),
          )
        : html`<p class="muted" style="font-size:.85rem">No sections.</p>`
    }
  </aside>
</div>
<script type="module">${raw(clientIsland)}</script>
</body>
</html>`;
}

export const docsTheme: Theme = {
  name: "docs",
  label: "Kumooo docs (Fumadocs-inspired)",
  home(site, { posts }) {
    const links =
      site.nav.length > 0
        ? site.nav
        : posts.map((p) => ({ title: p.title, url: p.url }));
    return docsShell(
      site,
      html`<article class="prose">
        <h1>${site.title}</h1>
        <p class="muted">${site.description || "Clear docs. No fluff. Built for people who ship sites."}</p>
        <h2 id="start-here">Start here</h2>
        <ul>
          ${joinHtml(links.map((l) => html`<li><a href="${l.url}">${l.title}</a></li>`))}
        </ul>
      </article>`,
    );
  },
  post(site, { post }) {
    const toc = extractToc(post.markdown);
    return docsShell(
      site,
      html`<article class="prose"><h1>${post.title}</h1>${raw(post.html)}</article>`,
      toc,
    );
  },
  page(site, { page }) {
    const toc = extractToc(page.markdown);
    return docsShell(
      site,
      html`<article class="prose"><h1>${page.title}</h1>${raw(page.html)}</article>`,
      toc,
    );
  },
  archive(site, d) {
    return docsShell(
      site,
      html`<h1>${d.title}</h1>${joinHtml(d.posts.map((p) => html`<p><a href="${p.url}">${p.title}</a></p>`))}`,
    );
  },
  notFound(site) {
    return docsShell(
      site,
      html`<h1>Nothing here</h1><p class="muted">That page doesn't exist. Check the sidebar.</p>`,
    );
  },
};
