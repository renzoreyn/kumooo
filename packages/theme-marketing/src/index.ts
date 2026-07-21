import { extractToc } from "@kumooo/core";
import {
  html,
  joinHtml,
  raw,
  type Html,
  type Theme,
  type ThemeSiteContext,
} from "@kumooo/theme-kit";

/** Lucide-style icons as inline SVG. No npm required at render time. */
const ic = {
  zap: `<svg class="i" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>`,
  cloud: `<svg class="i" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z"/></svg>`,
  feather: `<svg class="i" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.24 12.24a6 6 0 0 0-8.49-8.49L5 10.5V19h8.5z"/><line x1="16" y1="8" x2="2" y2="22"/><line x1="17.5" y1="15" x2="9" y2="15"/></svg>`,
  shield: `<svg class="i" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>`,
  github: `<svg class="i" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"/></svg>`,
};

const css = `
:root {
  --bg: #0b0c10;
  --fg: #f4f1ea;
  --muted: #9a968c;
  --line: #23252d;
  --accent: #6ee7b7;
  --accent-2: #93c5fd;
  --card: #12141a;
  --max: 72rem;
  color-scheme: dark;
}
* { box-sizing: border-box; }
html { scroll-behavior: smooth; }
body {
  margin: 0;
  font: 16px/1.6 "Sora", "Segoe UI", sans-serif;
  background:
    radial-gradient(ellipse 90% 60% at 80% -20%, rgba(110,231,183,.14), transparent 55%),
    radial-gradient(ellipse 70% 50% at 0% 0%, rgba(147,197,253,.1), transparent 50%),
    var(--bg);
  color: var(--fg);
  min-height: 100vh;
}
a { color: var(--accent); text-decoration: none; }
a:hover { text-decoration: underline; }
.i { width: 1.1rem; height: 1.1rem; display: inline-block; vertical-align: -0.15em; }
.wrap { max-width: var(--max); margin: 0 auto; padding: 0 1.5rem; }
.site-header {
  position: sticky; top: 0; z-index: 20;
  backdrop-filter: blur(12px);
  background: color-mix(in srgb, var(--bg) 80%, transparent);
  border-bottom: 1px solid var(--line);
}
.site-header .inner {
  display: flex; align-items: center; gap: 1.5rem; height: 3.75rem;
}
.logo {
  font-weight: 700; letter-spacing: -0.04em; color: var(--fg); font-size: 1.2rem;
}
.logo span { color: var(--accent); }
.nav { margin-left: auto; display: flex; gap: 1.25rem; align-items: center; flex-wrap: wrap; }
.nav a { color: var(--muted); font-size: 0.92rem; }
.nav a:hover { color: var(--fg); text-decoration: none; }
.btn {
  display: inline-flex; align-items: center; gap: 0.45rem;
  padding: 0.55rem 1.1rem; border-radius: 999px; font-weight: 600; font-size: 0.92rem;
  border: 1px solid var(--line); color: var(--fg); background: transparent;
}
.btn:hover { text-decoration: none; border-color: var(--accent); }
.btn.primary { background: var(--accent); color: #06261c; border-color: var(--accent); }
.hero {
  padding: 5.5rem 0 4rem;
  display: grid; gap: 2.5rem;
  grid-template-columns: 1.2fr 0.8fr;
  align-items: center;
}
@media (max-width: 860px) { .hero { grid-template-columns: 1fr; padding-top: 3.5rem; } }
.hero h1 {
  font-size: clamp(2.4rem, 6vw, 4rem);
  line-height: 1.05; letter-spacing: -0.045em; margin: 0 0 1rem;
  font-weight: 700;
}
.lead { color: var(--muted); font-size: 1.15rem; max-width: 34rem; margin: 0 0 1.75rem; }
.install {
  display: inline-flex; align-items: center; gap: 0.75rem;
  font-family: "IBM Plex Mono", ui-monospace, monospace;
  background: var(--card); border: 1px solid var(--line);
  border-radius: 12px; padding: 0.85rem 1.2rem; margin-bottom: 1.25rem;
}
.install::before { content: "$"; color: var(--muted); }
.hero-card {
  background: linear-gradient(160deg, #161922, #0f1117);
  border: 1px solid var(--line); border-radius: 18px; padding: 1.25rem;
  box-shadow: 0 30px 80px rgba(0,0,0,.35);
  transform-origin: center;
}
.hero-card pre {
  margin: 0; font-family: "IBM Plex Mono", ui-monospace, monospace;
  font-size: 0.82rem; color: #c8c5bb; overflow-x: auto;
}
.kicker {
  text-transform: uppercase; letter-spacing: 0.12em; font-size: 0.72rem;
  font-weight: 700; color: var(--accent); margin-bottom: 0.6rem;
}
section.block { padding: 3.5rem 0; border-top: 1px solid var(--line); }
.grid { display: grid; gap: 1rem; grid-template-columns: repeat(auto-fit, minmax(15rem, 1fr)); }
.card {
  background: var(--card); border: 1px solid var(--line); border-radius: 14px; padding: 1.25rem;
  transition: transform .25s ease, border-color .25s ease;
}
.card:hover { transform: translateY(-2px); border-color: color-mix(in srgb, var(--accent) 40%, var(--line)); }
.card h3 { margin: 0.5rem 0 0.4rem; font-size: 1.05rem; }
.card p { margin: 0; color: var(--muted); font-size: 0.92rem; }
.muted { color: var(--muted); }
.prose { max-width: 44rem; }
.prose h1, .prose h2 { letter-spacing: -0.03em; }
.prose pre {
  background: var(--card); border: 1px solid var(--line); padding: 1rem; border-radius: 10px; overflow-x: auto;
}
footer.site {
  border-top: 1px solid var(--line); padding: 2.5rem 0 3rem; margin-top: 2rem;
}
footer.site .fine { color: var(--muted); font-size: 0.85rem; }
[data-reveal] { opacity: 0; transform: translateY(12px); animation: rise .7s ease forwards; }
[data-reveal="2"] { animation-delay: .12s; }
[data-reveal="3"] { animation-delay: .22s; }
@keyframes rise { to { opacity: 1; transform: none; } }
`;

const clientIsland = `
import { animate, stagger } from "https://esm.sh/framer-motion@11.15.0/dom";
const cards = document.querySelectorAll("[data-motion-card]");
if (cards.length) {
  animate(cards, { opacity: [0, 1], y: [16, 0] }, { delay: stagger(0.06), duration: 0.45, easing: "ease-out" });
}
const hero = document.querySelector("[data-motion-hero]");
if (hero) animate(hero, { opacity: [0, 1], y: [20, 0] }, { duration: 0.55, easing: "ease-out" });
`;

function shell(site: ThemeSiteContext, body: Html, opts?: { fullBleed?: boolean }): Html {
  return html`<!doctype html>
<html lang="${site.language}">
<head>
<meta charset="utf-8">
${site.head}
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700&family=IBM+Plex+Mono:wght@400;500&display=swap">
<style>${raw(css)}</style>
</head>
<body>
<header class="site-header"><div class="wrap inner">
  <a class="logo" href="/">kumooo<span>.</span></a>
  <nav class="nav">
    ${joinHtml(
      (site.nav.length
        ? site.nav
        : [
            { title: "Features", url: "/features" },
            { title: "Docs", url: "https://docs.kumooo.dev" },
            { title: "Pricing", url: "/pricing" },
            { title: "About", url: "/about" },
          ]
      ).map((n) => html`<a href="${n.url}">${n.title}</a>`),
    )}
    <a class="btn primary" href="https://github.com/renzoreyn/kumooo">${raw(ic.github)} GitHub</a>
  </nav>
</div></header>
${opts?.fullBleed ? body : html`<main class="wrap">${body}</main>`}
<footer class="site"><div class="wrap">
  <p class="fine">Made by <a href="https://renzoreyn.dev">Ren</a>. Questions? <a href="mailto:contact@renzoreyn.dev">contact@renzoreyn.dev</a></p>
  <p class="fine">This marketing site runs on Kumooo. Yes, really.</p>
</div></footer>
<script type="module">${raw(clientIsland)}</script>
</body>
</html>`;
}

function marketingHome(site: ThemeSiteContext): Html {
  return shell(
    site,
    html`<div class="wrap">
<section class="hero">
  <div data-motion-hero>
    <div class="kicker">Publishing on Cloudflare</div>
    <h1>Websites shouldn't need babysitting.</h1>
    <p class="lead">Kumooo is a publishing platform that runs on Cloudflare's edge.
    Write, publish, ship themes with as much React as you want.
    Your readers get HTML. You get your evenings back.</p>
    <div class="install">npx create-kumooo</div>
    <div style="display:flex;gap:.75rem;flex-wrap:wrap">
      <a class="btn primary" href="https://docs.kumooo.dev">Read the docs</a>
      <a class="btn" href="https://github.com/renzoreyn/kumooo">Star on GitHub</a>
    </div>
  </div>
  <div class="hero-card" data-reveal="2">
<pre>curl -sI https://demo.kumooo.dev | grep -i cache
x-kumooo-cache: hit

# Most pages are cached automatically.
# You don't have to think about it.</pre>
  </div>
</section>

<section class="block">
  <div class="kicker">Why people switch</div>
  <h2 style="letter-spacing:-.03em;margin:0 0 1.25rem;font-size:1.8rem">A real CMS. On the edge. No servers to patch.</h2>
  <div class="grid">
    ${feature(ic.zap, "Fast by default", "Pages render in a Worker a few milliseconds from your readers, then get cached hard.")}
    ${feature(ic.feather, "Themes with teeth", "Ship plain HTML, or hydrate React with Framer Motion, Lucide, and Radix. Your call.")}
    ${feature(ic.cloud, "Your Cloudflare account", "D1, R2, KV. Content stays in your account. Connect once. Kumooo handles the rest.")}
    ${feature(ic.shield, "Boring security", "Hashed passwords, HttpOnly sessions, escaped templates. The unsexy stuff done right.")}
  </div>
</section>

<section class="block">
  <div class="kicker">Honest take</div>
  <p class="lead" style="max-width:40rem">WordPress gets used for a whole lot of nonsense.
  Fine. Kumooo gives you that freedom without PHP, plugins that break on Tuesdays, or a VPS you forgot existed.</p>
  <p class="muted">If you enjoy configuring nginx at 2 AM, Kumooo might not be for you.</p>
</section>
</div>`,
    { fullBleed: true },
  );
}

function feature(icon: string, title: string, body: string): Html {
  return html`<div class="card" data-motion-card>
    ${raw(icon)}
    <h3>${title}</h3>
    <p>${body}</p>
  </div>`;
}

export const marketingTheme: Theme = {
  name: "marketing",
  label: "Kumooo marketing (interactive)",
  home: (site) => marketingHome(site),
  post: (site, { post }) =>
    shell(site, html`<article class="prose"><h1>${post.title}</h1>${raw(post.html)}</article>`),
  page: (site, { page }) => {
    // Homepage-like pages by slug for marketing routes.
    if (page.slug === "index" || page.slug === "home") return marketingHome(site);
    return shell(
      site,
      html`<article class="prose" style="padding:3rem 0">
        <h1>${page.title}</h1>
        ${raw(page.html)}
      </article>`,
    );
  },
  archive: (site, d) =>
    shell(
      site,
      html`<h1>${d.title}</h1>${joinHtml(d.posts.map((p) => html`<p><a href="${p.url}">${p.title}</a></p>`))}`,
    ),
  notFound: (site) =>
    shell(site, html`<h1>Nothing here</h1><p class="muted">That page doesn't exist.</p>`),
  clientScript: "marketing-island",
};

// silence unused import warning if extractToc unused in marketing
void extractToc;
