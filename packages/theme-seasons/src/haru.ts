import { html, joinHtml, raw } from "@kumooo/theme-kit";
import { buildSeasonTheme, countChip, formatDate, pager, seasonHeader, tagChips } from "./shared.js";

const css = `
:root {
  --bg: #f8f7f3;
  --fg: #1c211d;
  --muted: #6a7268;
  --line: #dde3d8;
  --accent: #3f7d55;
  --card: #ffffff;
  --radius: 0.85rem;
  --display: "Fraunces", Georgia, serif;
  --body: "DM Sans", "Segoe UI", sans-serif;
  --background: var(--bg);
  --foreground: var(--fg);
  --muted-foreground: var(--muted);
  --border: var(--line);
  --primary: var(--accent);
  --primary-foreground: var(--bg);
}
@media (prefers-color-scheme: dark) {
  :root {
    --bg: #141815;
    --fg: #eaeee7;
    --muted: #9aa596;
    --line: #2b332c;
    --accent: #79c295;
    --card: #1a1f1b;
  }
}
html[data-theme="light"] {
  --bg: #f8f7f3; --fg: #1c211d; --muted: #6a7268; --line: #dde3d8;
  --accent: #3f7d55; --card: #ffffff;
}
html[data-theme="dark"] {
  --bg: #141815; --fg: #eaeee7; --muted: #9aa596; --line: #2b332c;
  --accent: #79c295; --card: #1a1f1b;
}
body.theme-haru {
  margin: 0;
  font: 17px/1.7 var(--body);
  color: var(--fg);
  background: var(--bg);
  min-height: 100vh;
  padding-bottom: 4rem;
}
a { color: var(--accent); }
.haru-header { --km-measure: 46rem; }
.haru-header .logo::before {
  content: "";
  display: inline-block;
  width: 0.5rem; height: 0.5rem; border-radius: 50%;
  margin-right: 0.5rem; vertical-align: middle;
  background: linear-gradient(135deg, #f2a6c0, var(--accent));
}
.logo { font-family: var(--display); font-weight: 600; font-size: 1.2rem; color: var(--fg); text-decoration: none; letter-spacing: -0.01em; display: inline-flex; align-items: center; }
.logo-img img { display: block; height: 2rem; width: auto; }
body.theme-haru main { max-width: 46rem; margin: 0 auto; padding: 3rem 1.25rem 3rem; }
.haru-hero { margin-bottom: 2.75rem; }
.haru-hero .kicker {
  display: inline-block; font-size: 0.78rem; font-weight: 600; letter-spacing: 0.06em;
  text-transform: uppercase; color: var(--accent); margin: 0 0 0.75rem;
}
.haru-hero h1 {
  font-family: var(--display); font-weight: 600;
  font-size: clamp(2.3rem, 6vw, 3.2rem); line-height: 1.1;
  margin: 0 0 0.85rem; letter-spacing: -0.02em;
}
.haru-hero .lede { color: var(--muted); font-size: 1.1rem; max-width: 34rem; margin: 0 0 1.25rem; }
.haru-list { display: grid; gap: 0; }
.haru-row {
  display: grid; grid-template-columns: 6.5rem 1fr; gap: 1.25rem;
  padding: 1.5rem 0; border-top: 1px solid var(--border);
  transition: background .2s ease;
}
.haru-row:last-child { border-bottom: 1px solid var(--border); }
.haru-row:hover { background: color-mix(in srgb, var(--accent) 5%, transparent); }
@media (max-width: 560px) {
  .haru-row { grid-template-columns: 1fr; gap: 0.4rem; }
  .haru-date { padding-top: 0; }
}
.haru-date {
  color: var(--muted); font-size: 0.78rem; padding-top: 0.45rem;
  font-variant-numeric: tabular-nums; letter-spacing: 0.02em;
}
.haru-row h2 { font-family: var(--display); font-weight: 600; font-size: 1.4rem; margin: 0 0 0.4rem; line-height: 1.3; letter-spacing: -0.01em; }
.haru-row h2 a { color: var(--fg); text-decoration: none; }
.haru-row h2 a:hover { color: var(--accent); }
.haru-row .km-meta { margin-top: 0.6rem; }
.muted { color: var(--muted); }
.prose h1 { font-family: var(--display); font-weight: 600; font-size: clamp(2rem, 4vw, 2.6rem); margin: 0 0 1.25rem; letter-spacing: -0.02em; }
.prose pre { background: var(--card); border: 1px solid var(--border); padding: 1rem; overflow-x: auto; border-radius: var(--radius); }
`;

export const haruTheme = buildSeasonTheme({
  name: "haru",
  label: "Haru - soft spring journal",
  bodyClass: "theme-haru",
  fontHref:
    "https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,600;1,9..40,400&family=Fraunces:opsz,wght@9..144,600;9..144,700&display=swap",
  css,
  header: (site) => seasonHeader(site, "haru-header"),
  homeMain: (site, { posts, page, totalPages }) => {
    const list =
      posts.length === 0
        ? html`<p class="muted">Nothing published yet. Write something when you are ready.</p>`
        : html`<div class="haru-list">${joinHtml(
            posts.map((p) => {
              const d = formatDate(p.publishedAt, { month: "short", day: "numeric" });
              return html`<article class="haru-row">
                <div class="haru-date">${d || "Draft"}</div>
                <div>
                  <h2><a href="${p.url}">${p.title}</a></h2>
                  ${p.excerpt ? html`<p class="muted">${p.excerpt}</p>` : raw("")}
                  ${tagChips(p)}
                </div>
              </article>`;
            }),
          )}</div>`;
    return html`<section class="haru-hero">
      <p class="kicker">Journal</p>
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
      <div class="haru-list">${joinHtml(
        posts.map(
          (p) => html`<article class="haru-row">
            <div class="haru-date"></div>
            <div><h2><a href="${p.url}">${p.title}</a></h2></div>
          </article>`,
        ),
      )}</div>`,
  notFoundMain: () =>
    html`<h1>Nothing here</h1><p class="muted">That page does not exist.</p>`,
});
