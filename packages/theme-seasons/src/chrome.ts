import { html, raw, type Html, type ThemeSiteContext } from "@kumooo/theme-kit";

export const COLOR_SCHEME_CSS = `
html { color-scheme: light dark; }
html[data-theme="light"] { color-scheme: light; }
html[data-theme="dark"] { color-scheme: dark; }
.km-scheme {
  appearance: none; border: 1px solid var(--line); background: var(--card, var(--bg));
  color: var(--muted); border-radius: 999px; padding: 0.35rem 0.7rem;
  font: inherit; font-size: 0.75rem; cursor: pointer;
}
.km-scheme:hover { color: var(--fg); }
.km-badge {
  position: fixed; z-index: 40; right: 1rem; bottom: 1rem;
  display: inline-flex; align-items: center; gap: 0.4rem;
  padding: 0.45rem 0.7rem 0.45rem 0.55rem;
  border-radius: 999px;
  background: color-mix(in srgb, var(--fg) 92%, transparent);
  color: var(--bg);
  text-decoration: none;
  font-size: 0.72rem; font-weight: 600; letter-spacing: 0.02em;
  box-shadow: 0 8px 24px color-mix(in srgb, #000 28%, transparent);
}
.km-badge:hover { filter: none; opacity: 0.92; }
.km-badge-mark {
  display: inline-grid; place-items: center;
  width: 1.35rem; height: 1.35rem; border-radius: 999px;
  background: var(--accent); color: var(--bg);
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  font-size: 0.7rem; font-weight: 700;
}
`;

export function colorSchemeBootScript(): string {
  return `(() => {
  const KEY = "kumooo-color-scheme";
  const root = document.documentElement;
  const apply = (mode) => {
    const m = mode === "light" || mode === "dark" || mode === "system" ? mode : "system";
    if (m === "system") {
      root.removeAttribute("data-theme");
    } else {
      root.setAttribute("data-theme", m);
    }
    const btn = document.querySelector("[data-km-scheme]");
    if (btn) btn.textContent = m === "system" ? "Auto" : m === "dark" ? "Dark" : "Light";
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
  return html`<button type="button" class="km-scheme" data-km-scheme>Auto</button>`;
}

export function siteBrand(site: ThemeSiteContext): Html {
  if (site.logoUrl) {
    return html`<a class="logo logo-img" href="/"><img src="${site.logoUrl}" alt="${site.title}" /></a>`;
  }
  return html`<a class="logo" href="/">${site.title}</a>`;
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
<style>${raw(COLOR_SCHEME_CSS)}${raw(css)}</style>
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
