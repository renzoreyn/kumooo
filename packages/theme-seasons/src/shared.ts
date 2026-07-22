import { html, joinHtml, raw, type Html, type Theme, type ThemeSiteContext } from "@kumooo/theme-kit";

export type SeasonThemeOptions = {
  name: string;
  label: string;
  css: string;
  fontStylesheet: string;
};

export function createSeasonTheme(opts: SeasonThemeOptions): Theme {
  const shell = (site: ThemeSiteContext, body: Html): Html => html`<!doctype html>
<html lang="${site.language}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
${site.head}
<style>${raw(opts.css)}</style>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="${opts.fontStylesheet}">
</head>
<body>
<div class="wrap">
<header class="site-header">
  <a class="logo" href="/">${site.title}</a>
  <nav>
    ${joinHtml(
      site.nav.map((n) => html`<a href="${n.url}">${n.title}</a>`),
      "",
    )}
  </nav>
</header>
<main>
${body}
</main>
<footer class="site-footer">
  <p>${site.title}. Built with <a href="https://kumooo.dev">Kumooo</a>.</p>
</footer>
</div>
</body>
</html>`;

  return {
    name: opts.name,
    label: opts.label,
    home(site, { posts, page, totalPages }) {
      const list =
        posts.length === 0
          ? html`<p class="muted">Nothing published yet.</p>`
          : html`<div class="post-list">${joinHtml(
              posts.map(
                (p) => html`<article class="post-card">
                  <h2><a href="${p.url}">${p.title}</a></h2>
                  ${p.excerpt ? html`<p class="muted">${p.excerpt}</p>` : raw("")}
                </article>`,
              ),
            )}</div>`;
      const pager =
        totalPages > 1
          ? html`<p class="muted pager">Page ${String(page)} of ${String(totalPages)}</p>`
          : raw("");
      return shell(
        site,
        html`<section class="hero">
          <p class="eyebrow">${opts.name}</p>
          <h1>${site.title}</h1>
          ${site.description ? html`<p class="lede muted">${site.description}</p>` : raw("")}
        </section>
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
          <div class="post-list">${joinHtml(
            posts.map(
              (p) => html`<article class="post-card">
                <h2><a href="${p.url}">${p.title}</a></h2>
              </article>`,
            ),
          )}</div>`,
      );
    },
    notFound(site) {
      return shell(
        site,
        html`<h1>Nothing here</h1><p class="muted">That page does not exist.</p>`,
      );
    },
  };
}
