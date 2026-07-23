import {
  html,
  joinHtml,
  raw,
  brandBadgeMarkSvg,
  type Html,
  type ThemeSiteContext,
} from "@kumooo/theme-kit";
import { ic } from "./icons.js";
import { yukinoCss } from "./css.js";
import { yukinoClient } from "./client.js";

export function shell(site: ThemeSiteContext, opts: { main: Html }): Html {
  const links =
    site.nav.length > 0
      ? site.nav
      : [
          { title: "Shop", url: "/shop" },
          { title: "About", url: "/about" },
        ];
  const nav = joinHtml(
    links.map((n) => html`<a href="${n.url}">${n.title}</a>`),
    "",
  );

  return html`<!doctype html>
<html lang="${site.language}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  ${site.head}
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=Figtree:wght@400;500;600;700&display=swap">
  <style>${raw(yukinoCss)}</style>
</head>
<body class="theme-yukino">
  <header class="yk-nav">
    <a class="yk-logo" href="/">YUKINO</a>
    <nav class="yk-nav-links">${nav}</nav>
    <button type="button" class="yk-bag-btn" data-yukino-bag-open aria-label="Open bag">
      ${raw(ic.bag!)} <span data-yukino-bag-count>0</span>
    </button>
  </header>
  ${opts.main}
  <div class="yk-drawer-scrim" data-yukino-scrim hidden></div>
  <aside class="yk-drawer" data-yukino-drawer hidden>
    <div class="yk-drawer-head">
      <strong class="yk-display">Bag</strong>
      <button type="button" data-yukino-bag-close aria-label="Close">${raw(ic.close!)}</button>
    </div>
    <div data-yukino-bag-lines></div>
    <p class="yk-drawer-note">Demo only - no payment.</p>
    <button type="button" class="yk-btn yk-btn-primary" data-yukino-checkout>Checkout (Demo only)</button>
  </aside>
  <footer class="yk-footer">
    <a class="km-badge" href="https://kumooo.dev" rel="noopener" title="Made with Kumooo">
      <span class="km-badge-mark" aria-hidden="true">${raw(brandBadgeMarkSvg())}</span>
      <span>Made with Kumooo</span>
    </a>
    <p class="yk-credit">Photos via <a href="https://unsplash.com" rel="noopener">Unsplash</a> (free license). Demo storefront only.</p>
  </footer>
  <div data-yukino-bag hidden></div>
  <script type="module">${raw(yukinoClient)}</script>
</body>
</html>`;
}
