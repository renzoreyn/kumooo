import { html, joinHtml, raw, type Html, type Theme, type ThemeSiteContext } from "@kumooo/theme-kit";

const css = `
:root {
  --bg: #faf9f6;
  --fg: #1a1a18;
  --muted: #6b6a64;
  --line: #e6e4dc;
  --accent: #0f6b5c;
  --card: #ffffff;
  --max: 42rem;
  color-scheme: light dark;
}
@media (prefers-color-scheme: dark) {
  :root {
    --bg: #121310;
    --fg: #f2f1ec;
    --muted: #9d9c94;
    --line: #2a2a26;
    --accent: #5ecfba;
    --card: #1a1b17;
  }
}
* { box-sizing: border-box; }
body {
  margin: 0;
  font: 17px/1.65 "IBM Plex Sans", "Segoe UI", sans-serif;
  background:
    radial-gradient(ellipse 80% 50% at 10% -10%, color-mix(in srgb, var(--accent) 12%, transparent), transparent),
    var(--bg);
  color: var(--fg);
}
a { color: var(--accent); text-decoration: none; }
a:hover { text-decoration: underline; }
.wrap { max-width: var(--max); margin: 0 auto; padding: 2rem 1.25rem 4rem; }
header {
  display: flex; justify-content: space-between; align-items: baseline;
  gap: 1rem; margin-bottom: 2.5rem; flex-wrap: wrap;
}
.logo { font-weight: 700; color: var(--fg); letter-spacing: -0.03em; font-size: 1.15rem; }
nav { display: flex; gap: 1rem; flex-wrap: wrap; }
nav a { color: var(--muted); font-size: 0.95rem; }
h1 { font-size: clamp(2rem, 5vw, 2.75rem); letter-spacing: -0.03em; line-height: 1.15; }
h2 { letter-spacing: -0.02em; }
.muted { color: var(--muted); }
article + article { margin-top: 1.75rem; padding-top: 1.75rem; border-top: 1px solid var(--line); }
.prose pre {
  background: var(--card); border: 1px solid var(--line);
  padding: 1rem; overflow-x: auto; border-radius: 8px;
}
.prose code { font-family: "IBM Plex Mono", ui-monospace, monospace; font-size: 0.9em; }
footer { margin-top: 4rem; color: var(--muted); font-size: 0.9rem; border-top: 1px solid var(--line); padding-top: 1.5rem; }
`;

function shell(site: ThemeSiteContext, body: Html): Html {
  return html`<!doctype html>
<html lang="${site.language}">
<head>
<meta charset="utf-8">
${site.head}
<style>${raw(css)}</style>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;600;700&family=IBM+Plex+Mono:wght@400;500&display=swap">
</head>
<body>
<div class="wrap">
<header>
  <a class="logo" href="/">${site.title}</a>
  <nav>
    ${joinHtml(site.nav.map((n) => html`<a href="${n.url}">${n.title}</a>`), "")}
  </nav>
</header>
${body}
<footer>
  <p>${site.title}. Built with <a href="https://kumooo.dev">Kumooo</a>.</p>
</footer>
</div>
</body>
</html>`;
}

export const defaultTheme: Theme = {
  name: "default",
  label: "Default, readable SSR theme",
  home(site, { posts, page, totalPages }) {
    const list =
      posts.length === 0
        ? html`<p class="muted">Nothing here yet. Publish something.</p>`
        : joinHtml(
            posts.map(
              (p) => html`<article>
                <h2><a href="${p.url}">${p.title}</a></h2>
                ${p.excerpt ? html`<p class="muted">${p.excerpt}</p>` : raw("")}
              </article>`,
            ),
          );
    const pager =
      totalPages > 1
        ? html`<p class="muted">Page ${String(page)} of ${String(totalPages)}</p>`
        : raw("");
    return shell(
      site,
      html`<h1>${site.title}</h1>
        ${site.description ? html`<p class="muted">${site.description}</p>` : raw("")}
        ${list}${pager}`,
    );
  },
  post(site, { post }) {
    return shell(
      site,
      html`<article class="prose">
        <h1>${post.title}</h1>
        ${raw(post.html)}
      </article>`,
    );
  },
  page(site, { page }) {
    return shell(
      site,
      html`<article class="prose">
        <h1>${page.title}</h1>
        ${raw(page.html)}
      </article>`,
    );
  },
  archive(site, { title, posts }) {
    return shell(
      site,
      html`<h1>${title}</h1>
        ${joinHtml(
          posts.map((p) => html`<article><h2><a href="${p.url}">${p.title}</a></h2></article>`),
        )}`,
    );
  },
  notFound(site) {
    return shell(site, html`<h1>Nothing here</h1><p class="muted">That page doesn't exist. Or it used to.</p>`);
  },
};
