import { html, joinHtml, raw } from "@kumooo/theme-kit";
import { buildSeasonTheme, countChip, formatDate, pager, seasonHeader, tagChips } from "./shared.js";

const css = `
:root {
  --bg: #f3f1ea;
  --fg: #201f1a;
  --muted: #6c6a60;
  --line: #ddd9cc;
  --accent: #2e5182;
  --card: #fbfaf5;
  --radius: 0.4rem;
  --measure: 36rem;
  --display: "Libre Baskerville", Palatino, serif;
  --body: "Source Sans 3", "Segoe UI", sans-serif;
  --background: var(--bg);
  --foreground: var(--fg);
  --muted-foreground: var(--muted);
  --border: var(--line);
  --primary: var(--accent);
  --primary-foreground: var(--bg);
}
@media (prefers-color-scheme: dark) {
  :root {
    --bg: #17191a;
    --fg: #ece8dc;
    --muted: #a3a094;
    --line: #34362f;
    --accent: #7fa8dd;
    --card: #1d1f1c;
  }
}
html[data-theme="light"] {
  --bg: #f3f1ea; --fg: #201f1a; --muted: #6c6a60; --line: #ddd9cc;
  --accent: #2e5182; --card: #fbfaf5;
}
html[data-theme="dark"] {
  --bg: #17191a; --fg: #ece8dc; --muted: #a3a094; --line: #34362f;
  --accent: #7fa8dd; --card: #1d1f1c;
}
body.theme-aki {
  margin: 0;
  font: 18px/1.8 var(--body);
  color: var(--fg);
  background: var(--bg);
  min-height: 100vh;
  padding-bottom: 4rem;
}
a { color: var(--accent); text-underline-offset: 0.18em; }
.aki-header { --km-measure: calc(var(--measure) + 2.5rem); }
.logo { font-family: var(--display); font-weight: 700; font-size: 1.05rem; color: var(--fg); text-decoration: none; }
.logo-img img { display: block; height: 1.75rem; width: auto; }
.site-nav a { text-transform: uppercase; font-size: 0.78rem; letter-spacing: 0.06em; }
body.theme-aki main { max-width: calc(var(--measure) + 2.5rem); margin: 0 auto; padding: 2.75rem 1.25rem 3rem; }
.aki-hero .kicker {
  display: block; font-size: 0.78rem; font-weight: 600; letter-spacing: 0.14em;
  text-transform: uppercase; color: var(--accent); margin: 0 0 0.9rem;
}
.aki-hero h1 {
  font-family: var(--display); font-weight: 700;
  font-size: clamp(2.15rem, 5.2vw, 3rem); line-height: 1.22;
  margin: 0 0 1rem;
}
.aki-hero .lede { color: var(--muted); margin: 0 0 1.25rem; font-size: 1.12rem; max-width: 34rem; }
.aki-chapter {
  padding: 1.85rem 0 1.85rem 1.1rem;
  border-top: 1px solid var(--border);
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
.aki-chapter .km-meta { margin-top: 0.6rem; }
.muted { color: var(--muted); }
.prose h1 { font-family: var(--display); font-size: clamp(1.9rem, 4vw, 2.5rem); margin: 0 0 1.4rem; line-height: 1.3; }
.prose p:first-of-type::first-letter {
  font-family: var(--display); font-size: 3.2em; float: left; line-height: 0.85;
  padding: 0.08em 0.12em 0 0; color: var(--accent); font-weight: 700;
}
.prose pre { background: var(--card); border: 1px solid var(--border); padding: 1rem; overflow-x: auto; border-radius: var(--radius); }
`;

export const akiTheme = buildSeasonTheme({
  name: "aki",
  label: "Aki - autumn long-form reading",
  bodyClass: "theme-aki",
  fontHref:
    "https://fonts.googleapis.com/css2?family=Libre+Baskerville:ital,wght@0,400;0,700;1,400&family=Source+Sans+3:ital,wght@0,400;0,600;1,400&display=swap",
  css,
  header: (site) => seasonHeader(site, "aki-header"),
  homeMain: (site, { posts, page, totalPages }) => {
    const list =
      posts.length === 0
        ? html`<p class="muted">Nothing published yet.</p>`
        : html`${joinHtml(
            posts.map((p) => {
              const d = formatDate(p.publishedAt);
              return html`<article class="aki-chapter">
                <h2><a href="${p.url}">${p.title}</a></h2>
                ${p.excerpt ? html`<p class="muted">${p.excerpt}</p>` : raw("")}
                <div class="km-meta">${d ? html`<span>${d}</span>` : raw("")}${tagChips(p)}</div>
              </article>`;
            }),
          )}`;
    return html`<section class="aki-hero">
      <p class="kicker">Chapters</p>
      <h1>${site.title}</h1>
      ${site.description ? html`<p class="lede">${site.description}</p>` : raw("")}
      ${countChip(posts.length, "chapter")}
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
      ${joinHtml(
        posts.map(
          (p) => html`<article class="aki-chapter"><h2><a href="${p.url}">${p.title}</a></h2></article>`,
        ),
      )}`,
  notFoundMain: () =>
    html`<h1>Nothing here</h1><p class="muted">That page does not exist.</p>`,
});
