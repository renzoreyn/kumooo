import { html, joinHtml, raw } from "@kumooo/theme-kit";
import { buildSeasonTheme, countChip, pager, seasonHeader, tagChips } from "./shared.js";

const css = `
:root {
  --bg: #fff8f0;
  --fg: #1c1410;
  --muted: #7a6356;
  --line: #f0d9c4;
  --accent: #e85d04;
  --card: #ffffff;
  --bar: #ffba08;
  --radius: 1.1rem;
  --display: "Syne", "Avenir Next", sans-serif;
  --body: "Manrope", "Segoe UI", sans-serif;
  --background: var(--bg);
  --foreground: var(--fg);
  --muted-foreground: var(--muted);
  --border: var(--line);
  --primary: var(--accent);
  --primary-foreground: #fff8f0;
}
@media (prefers-color-scheme: dark) {
  :root {
    --bg: #140f0c;
    --fg: #f7ebe1;
    --muted: #b89a88;
    --line: #3a2a22;
    --accent: #ff7b29;
    --card: #1f1713;
    --bar: #f4a261;
  }
}
html[data-theme="light"] {
  --bg: #fff8f0; --fg: #1c1410; --muted: #7a6356; --line: #f0d9c4;
  --accent: #e85d04; --card: #ffffff; --bar: #ffba08;
}
html[data-theme="dark"] {
  --bg: #140f0c; --fg: #f7ebe1; --muted: #b89a88; --line: #3a2a22;
  --accent: #ff7b29; --card: #1f1713; --bar: #f4a261;
}
body.theme-natsu {
  margin: 0;
  font: 16px/1.65 var(--body);
  color: var(--fg);
  background:
    radial-gradient(ellipse 50% 40% at 100% 0%, color-mix(in srgb, var(--bar) 18%, transparent), transparent 55%),
    var(--bg);
  min-height: 100vh;
  padding-bottom: 4rem;
}
a { color: var(--accent); }
.natsu-header {
  --km-measure: 68rem;
  border-bottom: 3px solid transparent;
  border-image: linear-gradient(90deg, var(--accent), var(--bar), #ff6b35) 1;
}
.logo { font-family: var(--display); font-weight: 800; font-size: 1.4rem; color: var(--fg); text-decoration: none; letter-spacing: -0.04em; }
.logo-img img { display: block; height: 2rem; width: auto; }
.site-nav a { font-weight: 700; }
body.theme-natsu main { max-width: 68rem; margin: 0 auto; padding: 2.5rem 1.25rem 3rem; }
.natsu-hero {
  display: grid; gap: 0.9rem; margin-bottom: 2.5rem;
}
.natsu-hero .kicker {
  display: inline-flex; align-items: center; gap: 0.4rem;
  font-family: var(--display); font-weight: 700; font-size: 0.78rem; letter-spacing: 0.08em;
  text-transform: uppercase; color: var(--accent); margin: 0;
}
.natsu-hero h1 {
  font-family: var(--display); font-weight: 800;
  font-size: clamp(2.6rem, 9vw, 4.8rem); line-height: 0.92;
  margin: 0; letter-spacing: -0.05em; max-width: 12ch;
}
.natsu-hero .lede { color: var(--muted); font-size: 1.1rem; max-width: 36rem; margin: 0; }
.natsu-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(min(100%, 15.5rem), 1fr));
  gap: 1rem;
}
.natsu-card {
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 1.35rem 1.25rem 1.5rem;
  display: grid; gap: 0.55rem; align-content: start;
  min-height: 10.5rem;
  position: relative;
  overflow: hidden;
  transition: transform .2s ease, border-color .2s ease, box-shadow .2s ease;
}
.natsu-card::before {
  content: "";
  position: absolute; left: 0; top: 0; bottom: 0; width: 4px;
  background: linear-gradient(180deg, var(--accent), var(--bar));
}
.natsu-card:hover {
  transform: translateY(-3px);
  border-color: color-mix(in srgb, var(--accent) 40%, var(--border));
  box-shadow: 0 14px 28px color-mix(in srgb, var(--accent) 12%, transparent);
}
.natsu-card h2 { font-family: var(--display); font-size: 1.4rem; margin: 0; line-height: 1.15; letter-spacing: -0.03em; padding-left: 0.35rem; }
.natsu-card h2 a { color: var(--fg); text-decoration: none; }
.natsu-card h2 a:hover { color: var(--accent); }
.natsu-card p { padding-left: 0.35rem; margin: 0; }
.natsu-card .km-chips { padding-left: 0.35rem; }
.muted { color: var(--muted); }
.prose h1 { font-family: var(--display); font-size: clamp(2.2rem, 5vw, 3rem); margin: 0 0 1.25rem; letter-spacing: -0.04em; }
.prose pre { background: var(--card); border: 1px solid var(--border); padding: 1rem; overflow-x: auto; border-radius: var(--radius); }
`;

export const natsuTheme = buildSeasonTheme({
  name: "natsu",
  label: "Natsu - summer showcase grid",
  bodyClass: "theme-natsu",
  fontHref:
    "https://fonts.googleapis.com/css2?family=Manrope:wght@400;600;700&family=Syne:wght@700;800&display=swap",
  css,
  header: (site) => seasonHeader(site, "natsu-header"),
  homeMain: (site, { posts, page, totalPages }) => {
    const list =
      posts.length === 0
        ? html`<p class="muted">Nothing published yet. Drop in a project or a post.</p>`
        : html`<div class="natsu-grid">${joinHtml(
            posts.map(
              (p) => html`<article class="natsu-card">
                <h2><a href="${p.url}">${p.title}</a></h2>
                ${p.excerpt ? html`<p class="muted">${p.excerpt}</p>` : raw("")}
                ${tagChips(p)}
              </article>`,
            ),
          )}</div>`;
    return html`<div class="natsu-main">
      <section class="natsu-hero">
        <p class="kicker">Showcase</p>
        <h1>${site.title}</h1>
        ${site.description ? html`<p class="lede">${site.description}</p>` : raw("")}
        ${countChip(posts.length)}
      </section>
      ${list}${pager(page, totalPages)}
    </div>`;
  },
  articleMain: (title, body, excerpt) =>
    html`<div class="natsu-main"><article class="prose">
      <h1>${title}</h1>
      ${excerpt ? html`<p class="muted">${excerpt}</p>` : raw("")}
      ${body}
    </article></div>`,
  archiveMain: (title, posts) =>
    html`<div class="natsu-main">
      <h1 class="prose">${title}</h1>
      <div class="natsu-grid">${joinHtml(
        posts.map(
          (p) => html`<article class="natsu-card"><h2><a href="${p.url}">${p.title}</a></h2></article>`,
        ),
      )}</div>
    </div>`,
  notFoundMain: () =>
    html`<div class="natsu-main"><h1>Nothing here</h1><p class="muted">That page does not exist.</p></div>`,
});
