import { html, joinHtml, raw } from "@kumooo/theme-kit";
import { buildSeasonTheme, defaultNav, siteBrand } from "./shared.js";

const css = `
:root {
  --bg: #f3ebe1;
  --fg: #2a1f14;
  --muted: #7a6550;
  --line: #ddcbb6;
  --accent: #a14a12;
  --card: #faf4ec;
  --display: "Libre Baskerville", Palatino, serif;
  --body: "Source Sans 3", "Segoe UI", sans-serif;
  --measure: 36rem;
}
@media (prefers-color-scheme: dark) {
  :root {
    --bg: #1a1410;
    --fg: #f0e6d8;
    --muted: #b09a82;
    --line: #3a2e24;
    --accent: #e08a45;
    --card: #241c16;
  }
}
html[data-theme="light"] {
  --bg: #f3ebe1; --fg: #2a1f14; --muted: #7a6550; --line: #ddcbb6;
  --accent: #a14a12; --card: #faf4ec;
}
html[data-theme="dark"] {
  --bg: #1a1410; --fg: #f0e6d8; --muted: #b09a82; --line: #3a2e24;
  --accent: #e08a45; --card: #241c16;
}
* { box-sizing: border-box; }
body.theme-aki {
  margin: 0;
  font: 18px/1.8 var(--body);
  color: var(--fg);
  background:
    linear-gradient(180deg, color-mix(in srgb, var(--accent) 10%, var(--bg)), var(--bg) 32%),
    var(--bg);
  min-height: 100vh;
  padding-bottom: 4rem;
}
a { color: var(--accent); text-underline-offset: 0.18em; }
.aki-wrap { max-width: calc(var(--measure) + 2.5rem); margin: 0 auto; padding: 2rem 1.25rem 0; }
.aki-top {
  display: flex; justify-content: space-between; gap: 1rem; align-items: baseline; flex-wrap: wrap;
  padding-bottom: 1.25rem; border-bottom: 1px solid var(--line); margin-bottom: 2.5rem;
}
.logo { font-family: var(--display); font-weight: 700; font-size: 1.05rem; color: var(--fg); text-decoration: none; }
.logo-img img { display: block; height: 1.75rem; width: auto; }
.site-nav { display: flex; gap: 1.1rem; align-items: center; flex-wrap: wrap; }
.site-nav a { color: var(--muted); text-decoration: none; font-size: 0.95rem; }
.site-nav a:hover { color: var(--accent); }
main { max-width: calc(var(--measure) + 2.5rem); margin: 0 auto; padding: 0 1.25rem 3rem; }
.aki-hero h1 {
  font-family: var(--display); font-weight: 700;
  font-size: clamp(2.15rem, 5.2vw, 3rem); line-height: 1.22;
  margin: 0 0 1rem;
}
.aki-hero .lede { color: var(--muted); margin: 0 0 2.75rem; font-size: 1.12rem; max-width: 34rem; }
.aki-chapter {
  padding: 1.85rem 0 1.85rem 1.1rem;
  border-top: 1px solid var(--line);
  border-left: 2px solid transparent;
  margin-left: -1.1rem;
  transition: border-color .2s ease, background .2s ease;
}
.aki-chapter:first-of-type { border-top: 0; padding-top: 0; }
.aki-chapter:hover {
  border-left-color: var(--accent);
  background: color-mix(in srgb, var(--accent) 5%, transparent);
}
.aki-chapter h2 {
  font-family: var(--display); font-size: 1.5rem; margin: 0 0 0.5rem; line-height: 1.35;
}
.aki-chapter h2 a { color: var(--fg); text-decoration: none; }
.aki-chapter h2 a:hover { color: var(--accent); }
.muted { color: var(--muted); }
.prose h1 { font-family: var(--display); font-size: clamp(1.9rem, 4vw, 2.5rem); margin: 0 0 1.4rem; line-height: 1.3; }
.prose p { margin: 0 0 1.15rem; }
.prose p:first-of-type::first-letter {
  font-family: var(--display); font-size: 3.2em; float: left; line-height: 0.85;
  padding: 0.08em 0.12em 0 0; color: var(--accent); font-weight: 700;
}
.prose pre { background: var(--card); border: 1px solid var(--line); padding: 1rem; overflow-x: auto; border-radius: 4px; }
`;

export const akiTheme = buildSeasonTheme({
  name: "aki",
  label: "Aki - autumn long-form reading",
  bodyClass: "theme-aki",
  fontHref:
    "https://fonts.googleapis.com/css2?family=Libre+Baskerville:ital,wght@0,400;0,700;1,400&family=Source+Sans+3:ital,wght@0,400;0,600;1,400&display=swap",
  css,
  header: (site) =>
    html`<div class="aki-wrap"><header class="aki-top">${siteBrand(site)}${defaultNav(site)}</header></div>`,
  homeMain: (site, { posts, page, totalPages }) => {
    const list =
      posts.length === 0
        ? html`<p class="muted">Nothing published yet.</p>`
        : html`${joinHtml(
            posts.map(
              (p) => html`<article class="aki-chapter">
                <h2><a href="${p.url}">${p.title}</a></h2>
                ${p.excerpt ? html`<p class="muted">${p.excerpt}</p>` : raw("")}
              </article>`,
            ),
          )}`;
    const pager =
      totalPages > 1
        ? html`<p class="muted" style="margin-top:1.5rem">Page ${String(page)} of ${String(totalPages)}</p>`
        : raw("");
    return html`<section class="aki-hero">
      <h1>${site.title}</h1>
      ${site.description ? html`<p class="lede">${site.description}</p>` : raw("")}
    </section>${list}${pager}`;
  },
  articleMain: (title, body, excerpt) =>
    html`<article class="prose">
      <h1>${title}</h1>
      ${excerpt ? html`<p class="muted">${excerpt}</p>` : raw("")}
      ${body}
    </article>`,
  archiveMain: (title, posts) =>
    html`<h1 class="prose">${title}</h1>
      ${joinHtml(
        posts.map(
          (p) => html`<article class="aki-chapter"><h2><a href="${p.url}">${p.title}</a></h2></article>`,
        ),
      )}`,
  notFoundMain: () =>
    html`<h1>Nothing here</h1><p class="muted">That page does not exist.</p>`,
});
