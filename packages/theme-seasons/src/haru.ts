import { html, joinHtml, raw } from "@kumooo/theme-kit";
import { buildSeasonTheme, defaultNav, siteBrand } from "./shared.js";

const css = `
:root {
  --bg: #f4f7f2;
  --fg: #1a2420;
  --muted: #5f6f66;
  --line: #d5e0d8;
  --accent: #2f7a5b;
  --card: #ffffff;
  --display: "Fraunces", Georgia, serif;
  --body: "DM Sans", "Segoe UI", sans-serif;
}
@media (prefers-color-scheme: dark) {
  :root {
    --bg: #121816;
    --fg: #e8f0ea;
    --muted: #9aaba1;
    --line: #2a3530;
    --accent: #6dba95;
    --card: #1a221e;
  }
}
html[data-theme="light"] {
  --bg: #f4f7f2; --fg: #1a2420; --muted: #5f6f66; --line: #d5e0d8;
  --accent: #2f7a5b; --card: #ffffff;
}
html[data-theme="dark"] {
  --bg: #121816; --fg: #e8f0ea; --muted: #9aaba1; --line: #2a3530;
  --accent: #6dba95; --card: #1a221e;
}
* { box-sizing: border-box; }
body.theme-haru {
  margin: 0;
  font: 17px/1.7 var(--body);
  color: var(--fg);
  background:
    radial-gradient(ellipse 70% 40% at 10% -10%, color-mix(in srgb, var(--accent) 22%, transparent), transparent),
    radial-gradient(ellipse 50% 30% at 100% 0%, color-mix(in srgb, #c4e0a8 35%, transparent), transparent),
    var(--bg);
  min-height: 100vh;
  padding-bottom: 4rem;
}
a { color: var(--accent); }
.haru-top {
  max-width: 44rem; margin: 0 auto; padding: 1.5rem 1.25rem 0;
  display: flex; justify-content: space-between; gap: 1rem; align-items: center; flex-wrap: wrap;
}
.logo { font-family: var(--display); font-weight: 700; font-size: 1.2rem; color: var(--fg); text-decoration: none; letter-spacing: -0.02em; }
.logo-img img { display: block; height: 2rem; width: auto; }
.site-nav { display: flex; gap: 0.85rem; align-items: center; flex-wrap: wrap; }
.site-nav a { color: var(--muted); text-decoration: none; font-size: 0.92rem; }
.site-nav a:hover { color: var(--accent); }
main { max-width: 44rem; margin: 0 auto; padding: 2.5rem 1.25rem 3rem; }
.haru-hero h1 {
  font-family: var(--display); font-weight: 700;
  font-size: clamp(2.4rem, 6vw, 3.4rem); line-height: 1.1;
  margin: 0 0 0.85rem; letter-spacing: -0.03em;
}
.haru-hero .lede { color: var(--muted); font-size: 1.15rem; max-width: 34rem; margin: 0 0 2.5rem; }
.haru-list { display: grid; gap: 0; }
.haru-row {
  display: grid; grid-template-columns: 6.5rem 1fr; gap: 1rem;
  padding: 1.35rem 0; border-top: 1px solid var(--line);
}
.haru-row:last-child { border-bottom: 1px solid var(--line); }
.haru-date { color: var(--muted); font-size: 0.82rem; padding-top: 0.35rem; }
.haru-row h2 { font-family: var(--display); font-size: 1.35rem; margin: 0 0 0.35rem; line-height: 1.3; }
.haru-row h2 a { color: var(--fg); text-decoration: none; }
.haru-row h2 a:hover { color: var(--accent); }
.muted { color: var(--muted); }
.prose h1 { font-family: var(--display); font-size: clamp(2rem, 4vw, 2.6rem); margin: 0 0 1.25rem; }
.prose pre { background: var(--card); border: 1px solid var(--line); padding: 1rem; overflow-x: auto; border-radius: 8px; }
`;

export const haruTheme = buildSeasonTheme({
  name: "haru",
  label: "Haru - soft spring notes",
  bodyClass: "theme-haru",
  fontHref:
    "https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,600;1,9..40,400&family=Fraunces:opsz,wght@9..144,600;9..144,700&display=swap",
  css,
  header: (site) =>
    html`<header class="haru-top">${siteBrand(site)}${defaultNav(site)}</header>`,
  homeMain: (site, { posts, page, totalPages }) => {
    const list =
      posts.length === 0
        ? html`<p class="muted">Nothing published yet. Write something when you are ready.</p>`
        : html`<div class="haru-list">${joinHtml(
            posts.map((p) => {
              const d = p.publishedAt
                ? p.publishedAt.toLocaleDateString(undefined, { month: "short", day: "numeric" })
                : "";
              return html`<article class="haru-row">
                <div class="haru-date">${d || "Draft"}</div>
                <div>
                  <h2><a href="${p.url}">${p.title}</a></h2>
                  ${p.excerpt ? html`<p class="muted">${p.excerpt}</p>` : raw("")}
                </div>
              </article>`;
            }),
          )}</div>`;
    const pager =
      totalPages > 1
        ? html`<p class="muted" style="margin-top:1.5rem">Page ${String(page)} of ${String(totalPages)}</p>`
        : raw("");
    return html`<section class="haru-hero">
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
