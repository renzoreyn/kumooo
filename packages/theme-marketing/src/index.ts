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
  refresh: `<svg class="i" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>`,
  search: `<svg class="i" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>`,
  github: `<svg class="i" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"/></svg>`,
};

const css = `
:root {
  --bg: #101218;
  --fg: #f3f1ea;
  --muted: #9a968c;
  --line: #262b37;
  --accent: #6ee7b7;
  --accent-ink: #06261c;
  --card: #12151d;
  --panel: #161922;
  --max: 72rem;
  color-scheme: dark;
}
* { box-sizing: border-box; }
html { scroll-behavior: smooth; }
body {
  margin: 0;
  font: 16px/1.6 "Sora", "Segoe UI", sans-serif;
  background:
    radial-gradient(ellipse 80% 60% at 90% -10%, rgba(110,231,183,.16), transparent 55%),
    radial-gradient(ellipse 60% 40% at 0% 20%, rgba(147,197,253,.08), transparent 50%),
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
  backdrop-filter: blur(14px);
  background: color-mix(in srgb, var(--bg) 82%, transparent);
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
  transition: transform .2s ease, border-color .2s ease, background .2s ease;
  cursor: pointer;
}
.btn:hover { text-decoration: none; border-color: var(--accent); transform: translateY(-1px); }
.btn.primary { background: var(--accent); color: var(--accent-ink); border-color: var(--accent); }
.hero {
  padding: 5rem 0 3.5rem;
  display: grid; gap: 2rem;
  grid-template-columns: 1.1fr .9fr;
  align-items: center;
}
@media (max-width: 900px) { .hero { grid-template-columns: 1fr; padding-top: 3rem; } }
.hero h1 {
  font-size: clamp(2.4rem, 6vw, 3.8rem);
  line-height: 1.05; letter-spacing: -0.045em; margin: 0 0 1rem;
  font-weight: 700;
}
.lead { color: var(--muted); font-size: 1.1rem; max-width: 34rem; margin: 0 0 1.5rem; }
.install {
  display: inline-flex; align-items: center; gap: 0.75rem;
  font-family: "IBM Plex Mono", ui-monospace, monospace;
  background: var(--card); border: 1px solid var(--line);
  border-radius: 12px; padding: 0.75rem 1rem; margin-bottom: 1.1rem;
  font-size: 0.92rem;
}
.install::before { content: "$"; color: var(--muted); }
.install button {
  margin-left: .35rem; border: 0; background: transparent; color: var(--accent);
  font: inherit; cursor: pointer; padding: 0;
}
.install button.copied { color: var(--fg); }
.kicker {
  text-transform: uppercase; letter-spacing: 0.12em; font-size: 0.72rem;
  font-weight: 700; color: var(--accent); margin-bottom: 0.6rem;
}
.dash {
  background: linear-gradient(160deg, #1a1e29, #0f1219);
  border: 1px solid var(--line); border-radius: 16px; padding: .85rem;
  box-shadow: 0 28px 70px rgba(0,0,0,.35);
}
.dash-label { font-size: .72rem; color: var(--muted); margin-bottom: .55rem; }
.dash-inner {
  display: grid; grid-template-columns: 2.4rem 1fr; gap: .55rem;
  background: #12151d; border-radius: 10px; padding: .7rem; min-height: 11rem;
}
.dash-rail { background: #0c0e14; border-radius: 8px; }
.dash-bar {
  height: .65rem; width: 58%; background: var(--accent); border-radius: 4px; margin-bottom: .55rem;
}
.dash-line {
  height: .45rem; background: #262b37; border-radius: 3px; margin-bottom: .35rem;
}
.dash-line.short { width: 72%; }
.dash-tiles { display: grid; grid-template-columns: 1fr 1fr; gap: .4rem; margin-top: .55rem; }
.dash-tile { height: 2.4rem; background: #0e1017; border-radius: 6px; border: 1px solid #1c2030; }
section.block { padding: 3.25rem 0; border-top: 1px solid var(--line); }
.stats { display: grid; gap: .75rem; grid-template-columns: repeat(4, 1fr); }
@media (max-width: 800px) { .stats { grid-template-columns: repeat(2, 1fr); } }
.stat {
  background: var(--panel); border: 1px solid var(--line); border-radius: 12px; padding: 1rem 1.1rem;
}
.stat b { display: block; font-size: 1.55rem; letter-spacing: -.03em; }
.stat span { color: var(--muted); font-size: .82rem; }
.tabs { display: flex; gap: .4rem; flex-wrap: wrap; margin-bottom: .85rem; }
.tab {
  border: 1px solid var(--line); background: transparent; color: var(--muted);
  border-radius: 8px; padding: .35rem .75rem; font: inherit; font-size: .9rem; cursor: pointer;
}
.tab.active, .tab:hover { color: var(--accent-ink); background: var(--accent); border-color: var(--accent); }
.tour-panel {
  background: var(--card); border: 1px solid var(--line); border-radius: 14px;
  padding: 1.25rem; min-height: 9rem;
}
.tour-panel[hidden] { display: none; }
.tour-panel h3 { margin: 0 0 .4rem; font-size: 1.05rem; }
.tour-panel p { margin: 0; color: var(--muted); font-size: .92rem; }
.grid { display: grid; gap: 1rem; grid-template-columns: repeat(auto-fit, minmax(14rem, 1fr)); }
.card {
  background: var(--card); border: 1px solid var(--line); border-radius: 14px; padding: 1.25rem;
  transition: transform .25s ease, border-color .25s ease;
}
.card:hover { transform: translateY(-3px); border-color: color-mix(in srgb, var(--accent) 40%, var(--line)); }
.card h3 { margin: 0.5rem 0 0.4rem; font-size: 1.05rem; }
.card p { margin: 0; color: var(--muted); font-size: 0.92rem; }
.cta-box {
  background: var(--card); border: 1px solid var(--line); border-radius: 16px;
  padding: 2rem 1.5rem; text-align: center;
}
.cta-box h2 { margin: 0 0 .4rem; letter-spacing: -.03em; font-size: 1.7rem; }
.muted { color: var(--muted); }
.prose { max-width: 44rem; }
.prose h1, .prose h2 { letter-spacing: -0.03em; }
.prose h1 { font-size: 2.2rem; margin: 0 0 1rem; }
.prose h2 { margin-top: 2rem; }
.prose pre {
  background: var(--card); border: 1px solid var(--line); padding: 1rem; border-radius: 10px; overflow-x: auto;
}
footer.site {
  border-top: 1px solid var(--line); padding: 2.5rem 0 3rem; margin-top: 2rem;
}
footer.site .fine { color: var(--muted); font-size: 0.85rem; }
[data-reveal-on-scroll] {
  opacity: 0; transform: translateY(14px);
  transition: opacity .55s ease, transform .55s ease;
}
[data-reveal-on-scroll].is-visible { opacity: 1; transform: none; }
`;

const clientIsland = `
import { animate, stagger } from "https://esm.sh/framer-motion@11.15.0/dom";

const hero = document.querySelector("[data-motion-hero]");
if (hero) animate(hero, { opacity: [0, 1], y: [20, 0] }, { duration: 0.55, easing: "ease-out" });

const cards = document.querySelectorAll("[data-motion-card]");
if (cards.length) {
  animate(cards, { opacity: [0, 1], y: [16, 0] }, { delay: stagger(0.06), duration: 0.45, easing: "ease-out" });
}

for (const el of document.querySelectorAll("[data-copy]")) {
  el.addEventListener("click", async () => {
    const value = el.getAttribute("data-copy") || "";
    try { await navigator.clipboard.writeText(value); } catch {}
    const btn = el.querySelector("button") || el;
    const prev = btn.textContent;
    btn.textContent = "copied";
    btn.classList?.add("copied");
    setTimeout(() => { btn.textContent = prev; btn.classList?.remove("copied"); }, 1200);
  });
}

const tabs = [...document.querySelectorAll("[data-tour-tab]")];
const panels = [...document.querySelectorAll("[data-tour-panel]")];
function showTab(id) {
  for (const t of tabs) t.classList.toggle("active", t.getAttribute("data-tour-tab") === id);
  for (const p of panels) {
    const on = p.getAttribute("data-tour-panel") === id;
    p.hidden = !on;
    if (on) animate(p, { opacity: [0, 1], y: [8, 0] }, { duration: 0.28, easing: "ease-out" });
  }
}
for (const t of tabs) t.addEventListener("click", () => showTab(t.getAttribute("data-tour-tab")));
if (tabs[0]) showTab(tabs[0].getAttribute("data-tour-tab"));

const io = new IntersectionObserver((entries) => {
  for (const e of entries) if (e.isIntersecting) e.target.classList.add("is-visible");
}, { threshold: 0.12 });
for (const n of document.querySelectorAll("[data-reveal-on-scroll]")) io.observe(n);
`;

function shell(site: ThemeSiteContext, body: Html, opts?: { fullBleed?: boolean }): Html {
  const nav =
    site.nav.length > 0
      ? site.nav
      : [
          { title: "Features", url: "/features" },
          { title: "Docs", url: "https://docs.kumooo.dev" },
          { title: "Pricing", url: "/pricing" },
          { title: "About", url: "/about" },
        ];

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
    ${joinHtml(nav.map((n) => html`<a href="${n.url}">${n.title}</a>`))}
    <a class="btn primary" href="https://github.com/renzoreyn/kumooo">${raw(ic.github)} GitHub</a>
  </nav>
</div></header>
${opts?.fullBleed ? body : html`<main class="wrap">${body}</main>`}
<footer class="site"><div class="wrap">
  <p class="fine">Made by <a href="https://renzoreyn.dev">Ren</a>. <a href="https://github.com/renzoreyn/kumooo">GitHub</a> · <a href="https://docs.kumooo.dev">Docs</a></p>
  <p class="fine">This marketing site runs on Kumooo. Yes, really.</p>
</div></footer>
<script type="module">${raw(clientIsland)}</script>
</body>
</html>`;
}

function feature(icon: string, title: string, body: string): Html {
  return html`<div class="card" data-motion-card>
    ${raw(icon)}
    <h3>${title}</h3>
    <p>${body}</p>
  </div>`;
}

function marketingHome(site: ThemeSiteContext): Html {
  return shell(
    site,
    html`<div class="wrap">
<section class="hero">
  <div data-motion-hero>
    <div class="kicker">Publishing on Cloudflare</div>
    <h1>Websites shouldn't need babysitting.</h1>
    <p class="lead">Write, publish, ship themes with as much React as you want. Readers get HTML. You get your evenings back.</p>
    <div class="install" data-copy="npx create-kumooo">npx create-kumooo <button type="button">copy</button></div>
    <div style="display:flex;gap:.75rem;flex-wrap:wrap">
      <a class="btn primary" href="https://docs.kumooo.dev">Read the docs</a>
      <a class="btn" href="https://github.com/renzoreyn/kumooo">Live on GitHub</a>
    </div>
  </div>
  <div class="dash" data-reveal-on-scroll>
    <div class="dash-label">Dashboard, live</div>
    <div class="dash-inner">
      <div class="dash-rail"></div>
      <div>
        <div class="dash-bar"></div>
        <div class="dash-line"></div>
        <div class="dash-line short"></div>
        <div class="dash-tiles"><div class="dash-tile"></div><div class="dash-tile"></div></div>
      </div>
    </div>
  </div>
</section>

<section class="block" data-reveal-on-scroll>
  <div class="kicker">Live numbers</div>
  <div class="stats">
    <div class="stat"><b>41ms</b><span>edge TTFB</span></div>
    <div class="stat"><b>0kb</b><span>required JS</span></div>
    <div class="stat"><b>330+</b><span>edge cities</span></div>
    <div class="stat"><b>$0</b><span>to start</span></div>
  </div>
</section>

<section class="block" data-reveal-on-scroll>
  <div class="kicker">A real CMS, tabbed</div>
  <h2 style="letter-spacing:-.03em;margin:0 0 1rem;font-size:1.7rem">Touch the product before you install it.</h2>
  <div class="tabs" role="tablist">
    <button type="button" class="tab" data-tour-tab="editor">Editor</button>
    <button type="button" class="tab" data-tour-tab="media">Media</button>
    <button type="button" class="tab" data-tour-tab="domains">Domains</button>
    <button type="button" class="tab" data-tour-tab="themes">Themes</button>
  </div>
  <div class="tour-panel" data-tour-panel="editor">
    <h3>Markdown in. HTML out.</h3>
    <p>Drafts, publish, revisions. The editor is boring on purpose. Your content is the point.</p>
  </div>
  <div class="tour-panel" data-tour-panel="media" hidden>
    <h3>Media that lives in your R2.</h3>
    <p>Upload once. Serve from the edge. No third-party CDN tax unless you want one.</p>
  </div>
  <div class="tour-panel" data-tour-panel="domains" hidden>
    <h3>Custom domains without the ticket queue.</h3>
    <p>Point a CNAME. SSL shows up when Cloudflare for SaaS is wired. Renewals are someone else's problem.</p>
  </div>
  <div class="tour-panel" data-tour-panel="themes" hidden>
    <h3>Themes with teeth.</h3>
    <p>Plain HTML, or hydrate React with Framer Motion, Lucide, and Radix. Same platform. Your call.</p>
  </div>
</section>

<section class="block" data-reveal-on-scroll>
  <div class="kicker">Everything you'd expect</div>
  <div class="grid">
    ${feature(ic.zap, "Fast by default", "Workers a few milliseconds from your readers, then cached hard.")}
    ${feature(ic.feather, "Themes with teeth", "Ship plain HTML, or hydrate React when you want to show off.")}
    ${feature(ic.cloud, "Your Cloudflare", "D1, R2, KV. Content stays in your account.")}
    ${feature(ic.shield, "Boring security", "Hashed passwords, HttpOnly sessions, escaped templates.")}
    ${feature(ic.refresh, "Revisions", "Every save keeps history. Roll back when you mess up.")}
    ${feature(ic.search, "SEO handled", "Titles, meta, sitemap, RSS. Not a plugin graveyard.")}
  </div>
</section>

<section class="block" data-reveal-on-scroll>
  <div class="cta-box">
    <h2>Ship your first site tonight.</h2>
    <p class="muted" style="margin:0 0 1rem">Deploy once. Go outside.</p>
    <a class="btn primary" href="https://docs.kumooo.dev/getting-started">npx create-kumooo</a>
  </div>
</section>
</div>`,
    { fullBleed: true },
  );
}

export const marketingTheme: Theme = {
  name: "marketing",
  label: "Kumooo marketing (interactive)",
  home: (site) => marketingHome(site),
  post: (site, { post }) =>
    shell(site, html`<article class="prose" style="padding:3rem 0"><h1>${post.title}</h1>${raw(post.html)}</article>`),
  page: (site, { page }) => {
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
