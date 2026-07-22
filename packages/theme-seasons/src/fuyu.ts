import { html, joinHtml, raw } from "@kumooo/theme-kit";
import { buildSeasonTheme, countChip, pager, seasonHeader, tagChips } from "./shared.js";

const css = `
:root {
  --bg: #eef2f6;
  --fg: #0a0f16;
  --muted: #5b6b7c;
  --line: #c9d3e0;
  --accent: #1d5fa8;
  --card: #ffffff;
  --radius: 0.4rem;
  --mono: "IBM Plex Mono", ui-monospace, monospace;
  --display: "IBM Plex Sans", "Segoe UI", sans-serif;
  --background: var(--bg);
  --foreground: var(--fg);
  --muted-foreground: var(--muted);
  --border: var(--line);
  --primary: var(--accent);
  --primary-foreground: #ffffff;
}
@media (prefers-color-scheme: dark) {
  :root {
    --bg: #060a10;
    --fg: #f1f5fb;
    --muted: #8b9aab;
    --line: #202b3a;
    --accent: #6eb6ff;
    --card: #0d141d;
  }
}
html[data-theme="light"] {
  --bg: #eef2f6; --fg: #0a0f16; --muted: #5b6b7c; --line: #c9d3e0;
  --accent: #1d5fa8; --card: #ffffff;
}
html[data-theme="dark"] {
  --bg: #060a10; --fg: #f1f5fb; --muted: #8b9aab; --line: #202b3a;
  --accent: #6eb6ff; --card: #0d141d;
}
body.theme-fuyu {
  margin: 0;
  font: 15px/1.65 var(--display);
  color: var(--fg);
  background: var(--bg);
  min-height: 100vh;
  padding-bottom: 4rem;
}
a { color: var(--accent); }
.fuyu-header { --km-measure: 42rem; }
.logo {
  font-family: var(--mono); font-weight: 600; font-size: 0.95rem;
  color: var(--fg); text-decoration: none;
}
.logo::before { content: "> "; color: var(--accent); }
.logo-img img { display: block; height: 1.5rem; width: auto; }
.site-nav a {
  font-family: var(--mono); font-size: 0.78rem;
}
body.theme-fuyu main { max-width: 42rem; margin: 0 auto; padding: 1.75rem 1rem 3rem; }
.fuyu-status {
  display: flex; gap: 0.75rem; flex-wrap: wrap; align-items: center;
  font-family: var(--mono); font-size: 0.7rem; color: var(--muted);
  padding: 0.45rem 0.7rem; margin-bottom: 1.5rem;
  border: 1px dashed var(--border); border-radius: var(--radius);
  background: var(--card);
}
.fuyu-status .ok { color: var(--accent); }
.fuyu-status .ok::before { content: "\\25CF "; }
.fuyu-hero { padding: 0.1rem 0 1.5rem; }
.fuyu-hero .kicker {
  font-family: var(--mono); font-size: 0.72rem; color: var(--accent);
  letter-spacing: 0.1em; text-transform: uppercase; margin: 0 0 0.55rem;
}
.fuyu-hero h1 {
  font-size: clamp(1.55rem, 4vw, 2rem); margin: 0 0 0.5rem; letter-spacing: -0.02em;
  font-family: var(--mono); font-weight: 600;
}
.fuyu-hero .lede { color: var(--muted); margin: 0 0 0.9rem; }
.fuyu-list { border: 1px solid var(--border); border-radius: var(--radius); overflow: hidden; background: var(--card); }
.fuyu-item {
  display: grid; grid-template-columns: 1fr auto; gap: 0.75rem; align-items: baseline;
  padding: 0.85rem 1rem;
  border-top: 1px solid var(--border);
  text-decoration: none; color: inherit;
  transition: background .15s ease;
}
.fuyu-item:first-child { border-top: 0; }
.fuyu-item:hover { background: color-mix(in srgb, var(--accent) 10%, var(--card)); }
.fuyu-item strong { font-weight: 600; font-family: var(--mono); font-size: 0.92rem; }
.fuyu-item .meta {
  display: inline-flex; align-items: center; gap: 0.5rem;
  font-family: var(--mono); font-size: 0.7rem; color: var(--muted);
}
.fuyu-item .km-chips { justify-content: flex-end; }
.muted { color: var(--muted); }
.prose h1 { font-size: clamp(1.45rem, 3.5vw, 1.85rem); margin: 0 0 1rem; font-family: var(--mono); }
.prose pre {
  background: var(--card); border: 1px solid var(--border); padding: 0.9rem;
  overflow-x: auto; border-radius: var(--radius); font-family: var(--mono); font-size: 0.85em;
}
`;

export const fuyuTheme = buildSeasonTheme({
  name: "fuyu",
  label: "Fuyu - winter engineer diary",
  bodyClass: "theme-fuyu",
  fontHref:
    "https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;600&family=IBM+Plex+Sans:wght@400;600&display=swap",
  css,
  header: (site) => seasonHeader(site, "fuyu-header"),
  homeMain: (site, { posts, page, totalPages }) => {
    const list =
      posts.length === 0
        ? html`<p class="muted">Nothing published yet.</p>`
        : html`<div class="fuyu-list">${joinHtml(
            posts.map((p) => {
              const d = p.publishedAt
                ? p.publishedAt.toISOString().slice(0, 10)
                : "";
              return html`<a class="fuyu-item" href="${p.url}">
                <strong>${p.title}</strong>
                <span class="meta">${d}${tagChips(p, 1)}</span>
              </a>`;
            }),
          )}</div>`;
    return html`<div class="fuyu-status"><span class="ok">ready</span><span>theme=fuyu</span><span>posts=${String(posts.length)}</span></div>
    <section class="fuyu-hero">
      <p class="kicker">log</p>
      <h1>${site.title}</h1>
      ${site.description ? html`<p class="lede">${site.description}</p>` : raw("")}
      ${countChip(posts.length, "entry", "entries")}
    </section>${list}${pager(page, totalPages)}`;
  },
  articleMain: (title, body, excerpt) =>
    html`<article class="prose">
      <h1>${title}</h1>
      ${excerpt ? html`<p class="muted">${excerpt}</p>` : raw("")}
      ${body}
    </article>`,
  archiveMain: (title, posts) =>
    html`<h1 class="prose">${title}</h1>
      <div class="fuyu-list">${joinHtml(
        posts.map(
          (p) => html`<a class="fuyu-item" href="${p.url}"><strong>${p.title}</strong><span class="meta"></span></a>`,
        ),
      )}</div>`,
  notFoundMain: () =>
    html`<h1>Nothing here</h1><p class="muted">That page does not exist.</p>`,
});
