import { html, raw, type Html, type ThemeSiteContext } from "@kumooo/theme-kit";

const ICON_SUN = `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/></svg>`;
const ICON_MOON = `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>`;
const ICON_MONITOR = `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/></svg>`;

export const COLOR_SCHEME_CSS = `
html { color-scheme: light dark; }
html[data-theme="light"] { color-scheme: light; }
html[data-theme="dark"] { color-scheme: dark; }
.km-scheme {
  appearance: none; border: 1px solid var(--border, var(--line)); background: var(--card, var(--bg));
  color: var(--muted-foreground, var(--muted)); border-radius: 999px;
  width: 2.15rem; height: 2.15rem; padding: 0;
  display: inline-grid; place-items: center;
  cursor: pointer;
  flex: none;
}
.km-scheme:hover { color: var(--foreground, var(--fg)); border-color: color-mix(in srgb, var(--foreground, var(--fg)) 20%, var(--border, var(--line))); }
.km-scheme svg { display: block; }
.km-badge {
  position: fixed; z-index: 40; right: 1rem; bottom: 1rem;
  display: inline-flex; align-items: center; gap: 0.4rem;
  padding: 0.45rem 0.7rem 0.45rem 0.55rem;
  border-radius: 999px;
  background: color-mix(in srgb, var(--foreground, var(--fg)) 92%, transparent);
  color: var(--background, var(--bg));
  text-decoration: none;
  font-size: 0.72rem; font-weight: 600; letter-spacing: 0.02em;
  box-shadow: 0 8px 24px color-mix(in srgb, #000 28%, transparent);
}
.km-badge:hover { filter: none; opacity: 0.92; }
.km-badge-mark {
  display: inline-grid; place-items: center;
  width: 1.35rem; height: 1.35rem; border-radius: 999px;
  background: var(--primary, var(--accent)); color: var(--primary-foreground, var(--bg));
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  font-size: 0.7rem; font-weight: 700;
}
`;

/**
 * Shared modern shell primitives applied under every season theme:
 * sticky bordered header, nav link pills, focus rings, chip badges and
 * sane prose defaults. Seasonal CSS layers on top of this (loaded after,
 * and with equal-or-higher specificity) to give each season its own
 * art direction while sharing the same structural bones.
 */
export const BASE_UI_CSS = `
*, *::before, *::after { box-sizing: border-box; }
html { -webkit-text-size-adjust: 100%; }
body { text-rendering: optimizeLegibility; -webkit-font-smoothing: antialiased; }
:focus-visible {
  outline: 2px solid var(--primary, var(--accent, #3b82c4));
  outline-offset: 2px;
  border-radius: calc(var(--radius, 0.6rem) - 2px);
}
img, svg { max-width: 100%; }

.km-header {
  position: sticky;
  top: 0;
  z-index: 30;
  border-bottom: 1px solid var(--border, var(--line));
  background: var(--background, var(--bg));
}
.km-header-inner {
  max-width: var(--km-measure, 64rem);
  margin: 0 auto;
  padding: 0.85rem 1.25rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  flex-wrap: wrap;
}
.site-nav { display: flex; align-items: center; gap: 0.15rem; flex-wrap: wrap; }
.site-nav a {
  display: inline-flex;
  align-items: center;
  padding: 0.4rem 0.75rem;
  border-radius: calc(var(--radius, 0.6rem) - 0.15rem);
  text-decoration: none;
  font-weight: 500;
  color: var(--muted-foreground, var(--muted));
  transition: background-color .15s ease, color .15s ease;
}
.site-nav a:hover {
  color: var(--foreground, var(--fg));
  background: color-mix(in srgb, var(--foreground, var(--fg)) 7%, transparent);
}
.km-scheme { margin-left: 0.2rem; }

.km-chips { display: inline-flex; flex-wrap: wrap; gap: 0.35rem; }
.km-chip {
  display: inline-flex; align-items: center; gap: 0.35rem;
  padding: 0.24rem 0.6rem;
  border-radius: 999px;
  border: 1px solid var(--border, var(--line));
  background: var(--card, var(--bg));
  color: var(--muted-foreground, var(--muted));
  font-size: 0.74rem;
  font-weight: 500;
  line-height: 1.4;
  white-space: nowrap;
}
.km-chip-solid {
  border-color: transparent;
  background: color-mix(in srgb, var(--primary, var(--accent)) 14%, transparent);
  color: var(--primary, var(--accent));
}
.km-meta {
  display: flex; align-items: center; gap: 0.55rem; flex-wrap: wrap;
  color: var(--muted-foreground, var(--muted));
  font-size: 0.82rem;
}
.km-pager {
  display: flex; align-items: center; justify-content: space-between; gap: 1rem;
  margin-top: 2.25rem; padding-top: 1.25rem;
  border-top: 1px solid var(--border, var(--line));
  color: var(--muted-foreground, var(--muted));
  font-size: 0.85rem;
}

.prose { line-height: 1.75; }
.prose :where(p, ul, ol, blockquote, table) { margin: 0 0 1.15rem; }
.prose :where(h2, h3, h4) { line-height: 1.3; margin: 2rem 0 0.75rem; font-weight: 700; }
.prose ul, .prose ol { padding-left: 1.35rem; }
.prose blockquote {
  margin: 0 0 1.15rem; padding: 0.1rem 0 0.1rem 1rem;
  border-left: 2px solid var(--border, var(--line));
  color: var(--muted-foreground, var(--muted));
}
.prose img { border-radius: calc(var(--radius, 0.6rem) - 0.1rem); }
.prose code { font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; font-size: 0.9em; }
.prose :not(pre) > code {
  background: color-mix(in srgb, var(--foreground, var(--fg)) 8%, transparent);
  padding: 0.15em 0.4em; border-radius: 0.3em;
}
.prose a { color: var(--primary, var(--accent)); text-underline-offset: 0.18em; }

@media (max-width: 640px) {
  .km-header-inner { padding: 0.7rem 1rem; }
  .site-nav a { padding: 0.35rem 0.55rem; }
}
`;

export function colorSchemeBootScript(): string {
  return `(() => {
  const KEY = "kumooo-color-scheme";
  const ICONS = {
    system: ${JSON.stringify(ICON_MONITOR)},
    light: ${JSON.stringify(ICON_SUN)},
    dark: ${JSON.stringify(ICON_MOON)},
  };
  const LABELS = { system: "Color scheme: system", light: "Color scheme: light", dark: "Color scheme: dark" };
  const root = document.documentElement;
  const apply = (mode) => {
    const m = mode === "light" || mode === "dark" || mode === "system" ? mode : "system";
    if (m === "system") {
      root.removeAttribute("data-theme");
    } else {
      root.setAttribute("data-theme", m);
    }
    const btn = document.querySelector("[data-km-scheme]");
    if (btn) {
      btn.innerHTML = ICONS[m];
      btn.setAttribute("aria-label", LABELS[m]);
      btn.setAttribute("title", LABELS[m]);
    }
    try { localStorage.setItem(KEY, m); } catch (_) {}
  };
  let mode = "system";
  try { mode = localStorage.getItem(KEY) || "system"; } catch (_) {}
  apply(mode);
  document.addEventListener("click", (e) => {
    const t = e.target;
    if (!(t instanceof Element)) return;
    const btn = t.closest("[data-km-scheme]");
    if (!btn) return;
    const cur = (() => { try { return localStorage.getItem(KEY) || "system"; } catch (_) { return "system"; } })();
    const next = cur === "system" ? "light" : cur === "light" ? "dark" : "system";
    apply(next);
  });
})();`;
}

export function madeWithBadge(): Html {
  return html`<a class="km-badge" href="https://kumooo.dev" rel="noopener" title="Made with Kumooo">
    <span class="km-badge-mark" aria-hidden="true">k.</span>
    <span>Made with Kumooo</span>
  </a>`;
}

export function schemeToggle(): Html {
  return html`<button type="button" class="km-scheme" data-km-scheme aria-label="Color scheme: system" title="Color scheme: system">${raw(ICON_MONITOR)}</button>`;
}

export function siteBrand(site: ThemeSiteContext): Html {
  if (site.logoUrl) {
    return html`<a class="logo logo-img" href="/"><img src="${site.logoUrl}" alt="${site.title}" /></a>`;
  }
  return html`<a class="logo" href="/">${site.title}</a>`;
}

/**
 * Shared shadcn-adjacent sticky header shell: border-bottom, solid
 * background, max-width container, logo left, nav + scheme toggle right.
 * Pass a `className` to hang seasonal flourishes off (e.g. an accent
 * underline) without forking the markup.
 */
export function stickyHeader(
  site: ThemeSiteContext,
  nav: Html,
  opts?: { className?: string },
): Html {
  const cls = opts?.className ? `km-header ${opts.className}` : "km-header";
  return html`<header class="${cls}"><div class="km-header-inner">${siteBrand(site)}${nav}</div></header>`;
}

export function documentShell(opts: {
  site: ThemeSiteContext;
  css: string;
  fontHref: string;
  bodyClass: string;
  header: Html;
  main: Html;
}): Html {
  const { site, css, fontHref, bodyClass, header, main } = opts;
  return html`<!doctype html>
<html lang="${site.language}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
${site.head}
<style>${raw(COLOR_SCHEME_CSS)}${raw(BASE_UI_CSS)}${raw(css)}</style>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="${fontHref}">
<script>${raw(colorSchemeBootScript())}</script>
</head>
<body class="${bodyClass}">
${header}
<main>
${main}
</main>
${madeWithBadge()}
</body>
</html>`;
}
