import {
  html,
  joinHtml,
  raw,
  type Html,
  type Theme,
  type ThemeSiteContext,
} from "@kumooo/theme-kit";

/** Lucide-style icons as inline SVG. */
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
  --line: rgba(255,255,255,0.09);
  --accent: #6ee7b7;
  --accent-ink: #06261c;
  --card: #12151d;
  --panel: #161922;
  --glow: rgba(110,231,183,0.4);
  --max: 72rem;
  color-scheme: dark;
}
* { box-sizing: border-box; }
html { scroll-behavior: smooth; }
body {
  margin: 0;
  font: 16px/1.65 Sora, "Segoe UI", sans-serif;
  color: var(--fg);
  background:
    radial-gradient(ellipse 55% 45% at 90% -5%, rgba(110,231,183,.14), transparent 55%),
    radial-gradient(ellipse 45% 35% at 0% 30%, rgba(147,197,253,.06), transparent 50%),
    var(--bg);
  min-height: 100vh;
  overflow-x: hidden;
}
a { color: var(--accent); text-decoration: none; }
a:hover { text-decoration: underline; }
.i { width: 1.1rem; height: 1.1rem; display: inline-block; vertical-align: -0.15em; }
.wrap { max-width: var(--max); margin: 0 auto; padding: 0 1.5rem; }
@media (max-width: 640px) { .wrap { padding: 0 1rem; } }

.site-header {
  position: sticky; top: 0; z-index: 30;
  background: color-mix(in srgb, var(--bg) 92%, transparent);
  border-bottom: 1px solid var(--line);
}
.site-header .inner {
  display: flex; align-items: center; gap: 1rem; height: 3.75rem;
}
.logo {
  font-weight: 700; letter-spacing: -0.05em; color: var(--fg); font-size: 1.25rem;
}
.logo span { color: var(--accent); }
.nav { margin-left: auto; display: flex; gap: 1.15rem; align-items: center; }
.nav a { color: var(--muted); font-size: 0.9rem; white-space: nowrap; }
.nav a:hover { color: var(--fg); text-decoration: none; }
.nav-toggle {
  display: none; margin-left: auto;
  width: 2.4rem; height: 2.4rem; border-radius: 10px;
  border: 1px solid var(--line); background: var(--card); color: var(--fg);
  font: inherit; cursor: pointer;
}
.nav-drawer {
  display: none; position: fixed; inset: 0; z-index: 40;
  background: rgba(0,0,0,.72);
}
.nav-drawer[hidden] { display: none !important; }
.nav-drawer-panel {
  margin-left: auto; width: min(18rem, 86vw); height: 100%;
  background: var(--bg); border-left: 1px solid var(--line);
  padding: 1rem; display: flex; flex-direction: column; gap: .35rem;
}
.nav-drawer-panel a {
  display: block; padding: .7rem .85rem; border-radius: 10px;
  color: var(--fg); background: var(--card); border: 1px solid var(--line);
}
.nav-drawer-panel a:hover { border-color: var(--accent); text-decoration: none; }
@media (max-width: 800px) {
  .nav { display: none; }
  .nav-toggle { display: inline-flex; align-items: center; justify-content: center; }
  .nav-drawer:not([hidden]) { display: block; }
}

.btn {
  display: inline-flex; align-items: center; gap: 0.45rem;
  padding: 0.65rem 1.15rem; border-radius: 12px; font-weight: 600; font-size: 0.92rem;
  border: 1px solid var(--line); color: var(--fg); background: transparent;
  transition: transform .2s ease, border-color .2s ease, background .2s ease, box-shadow .2s ease;
  cursor: pointer;
}
.btn:hover { text-decoration: none; border-color: color-mix(in srgb, var(--accent) 55%, var(--line)); transform: translateY(-1px); }
.btn.primary {
  background: var(--accent); color: var(--accent-ink); border-color: var(--accent);
}
.btn.primary:hover { box-shadow: 0 0 28px var(--glow); }

.hero {
  position: relative;
  padding: 2.5rem 0 0;
  isolation: isolate;
  width: 100%;
  overflow: clip;
  min-height: min(92vh, 54rem);
  display: flex;
  flex-direction: column;
}
.hero-inner {
  position: relative;
  z-index: 1;
  max-width: var(--max);
  margin: 0 auto;
  padding: 0 1.5rem;
  min-width: 0;
  width: 100%;
  display: grid;
  gap: 2rem;
  flex: 1;
}
@media (min-width: 960px) {
  .hero-inner {
    grid-template-columns: minmax(0, 0.95fr) minmax(0, 1.15fr);
    align-items: end;
    gap: 2.5rem;
    padding-bottom: 0;
  }
}
@media (max-width: 640px) { .hero-inner { padding: 0 1rem; } }
.hero-copy { min-width: 0; padding-bottom: 1rem; }
@media (min-width: 960px) {
  .hero-copy { padding-bottom: 3.5rem; align-self: center; }
}
.hero-pixels {
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 0;
  opacity: 0.45;
  background-image:
    radial-gradient(ellipse 50% 40% at 70% 20%, rgba(110,231,183,.16), transparent 55%),
    radial-gradient(rgba(110,231,183,.12) 1px, transparent 1.2px);
  background-size: auto, 8px 8px;
  mask-image: linear-gradient(180deg, #000 0%, #000 55%, transparent 100%);
  -webkit-mask-image: linear-gradient(180deg, #000 0%, #000 55%, transparent 100%);
}
@media (max-width: 700px) {
  .hero-pixels { display: none; }
}
.hero-brand {
  display: block;
  font-size: clamp(2.8rem, 10vw, 5.5rem);
  font-weight: 700;
  letter-spacing: -0.07em;
  line-height: 0.9;
  margin: 0 0 1.1rem;
  color: var(--fg);
}
.hero-brand span { color: var(--accent); }
.hero h1 {
  font-size: clamp(1.45rem, 4.2vw, 2.35rem);
  line-height: 1.18; letter-spacing: -0.04em; margin: 0 0 0.85rem;
  font-weight: 700; max-width: 16ch;
}
.hero h1 em {
  font-style: normal; color: var(--accent);
}
.lead { color: var(--muted); font-size: 1.05rem; max-width: 32rem; margin: 0 0 1.35rem; }
.hero-actions {
  display: flex; gap: 0.75rem; flex-wrap: wrap; margin-bottom: 0;
}
.install {
  display: flex; align-items: center; gap: 0.75rem;
  width: 100%; max-width: 28rem;
  font-family: "IBM Plex Mono", ui-monospace, monospace;
  background: var(--card); border: 1px solid var(--line);
  border-radius: 12px; padding: 0.7rem 1rem; margin-bottom: 1rem;
  font-size: 0.85rem; color: var(--muted);
  min-width: 0;
}
.install code, .install { overflow-wrap: anywhere; }
.install button {
  margin-left: auto; flex-shrink: 0; border: 0; background: transparent; color: var(--accent);
  font: inherit; cursor: pointer; font-weight: 600;
}
.install button.copied { color: var(--fg); }
@media (max-width: 640px) {
  .hero-actions { flex-direction: column; align-items: stretch; }
  .hero-actions .btn { justify-content: center; width: 100%; }
  .lead { font-size: 0.98rem; }
}

.hero-stage {
  position: relative;
  min-width: 0;
  display: flex;
  align-items: flex-end;
}
@media (min-width: 960px) {
  .hero-stage {
    margin-right: calc(-1 * max(0px, (100vw - var(--max)) / 2 + 1.5rem));
  }
}
.product-mock {
  position: relative;
  border: 1px solid var(--line);
  border-radius: 18px 18px 0 0;
  background: linear-gradient(180deg, #171a22, #0c0e14);
  box-shadow:
    0 0 0 1px rgba(110,231,183,.08),
    0 24px 64px rgba(0,0,0,.55);
  overflow: hidden;
  min-height: 18rem;
  width: 100%;
  max-width: 100%;
}
@media (min-width: 960px) {
  .product-mock {
    border-radius: 18px 0 0 0;
    min-height: 26rem;
  }
}
.product-mock .mock-top {
  display: flex; align-items: center; gap: 0.4rem;
  padding: 0.7rem 0.9rem; border-bottom: 1px solid var(--line);
  background: rgba(255,255,255,.03);
  min-width: 0;
}
.product-mock .dot {
  width: 0.55rem; height: 0.55rem; border-radius: 50%; background: #3a3a3e; flex-shrink: 0;
}
.product-mock .dot:nth-child(1) { background: #ff5f57; }
.product-mock .dot:nth-child(2) { background: #febc2e; }
.product-mock .dot:nth-child(3) { background: #28c840; }
.product-mock .mock-url {
  margin-left: 0.5rem; font: 0.68rem/1.2 "IBM Plex Mono", monospace; color: var(--muted);
  overflow: hidden; text-overflow: ellipsis; white-space: nowrap; min-width: 0;
}
.product-mock .mock-body {
  display: grid; grid-template-columns: 11.5rem 1fr; min-height: 16rem;
}
@media (min-width: 960px) {
  .product-mock .mock-body { min-height: 22rem; }
}
.product-mock .mock-side {
  border-right: 1px solid var(--line); padding: 1rem 0.85rem;
  background: rgba(0,0,0,.28);
  display: flex; flex-direction: column; gap: 0.35rem;
}
.product-mock .mock-side .nav-label {
  font: 0.62rem/1 "IBM Plex Mono", monospace;
  letter-spacing: 0.08em; text-transform: uppercase;
  color: rgba(255,255,255,.35); margin: 0.55rem 0 0.25rem;
}
.product-mock .mock-side .nav-label:first-child { margin-top: 0; }
.product-mock .mock-side .nav-item {
  font-size: 0.78rem; color: rgba(255,255,255,.55);
  padding: 0.35rem 0.5rem; border-radius: 8px;
}
.product-mock .mock-side .nav-item.on {
  background: color-mix(in srgb, var(--accent) 18%, transparent);
  color: var(--accent); font-weight: 600;
}
.product-mock .mock-main { padding: 1.25rem 1.35rem; min-width: 0; }
.product-mock .mock-main .crumb {
  font: 0.72rem/1.2 "IBM Plex Mono", monospace; color: var(--muted); margin: 0 0 0.85rem;
}
.product-mock .mock-main h3 {
  margin: 0 0 0.85rem; font-size: 1.25rem; letter-spacing: -0.03em;
}
.product-mock .mock-main .para {
  height: 0.5rem; border-radius: 4px; background: rgba(255,255,255,.07);
  margin-bottom: 0.45rem;
}
.product-mock .mock-main .para.short { width: 62%; }
.product-mock .mock-main .code-block {
  margin-top: 1.1rem; padding: 0.85rem 1rem; border-radius: 12px;
  border: 1px solid var(--line); background: rgba(0,0,0,.35);
  font: 0.72rem/1.55 "IBM Plex Mono", monospace; color: #c8c5bb;
}
.product-mock .mock-main .code-block .g { color: #6ee7b7; }
.product-mock .mock-main .code-block .y { color: #fbbf24; }
@media (max-width: 700px) {
  .product-mock .mock-body { grid-template-columns: 1fr; min-height: 12rem; }
  .product-mock .mock-side { display: none; }
  .product-mock { min-height: 12rem; border-radius: 14px; }
  .hero-stage { margin-top: 0.5rem; }
}

.accent-lead {
  padding: 4rem 0 2rem;
  font-size: clamp(1.35rem, 3.2vw, 2rem);
  line-height: 1.35; letter-spacing: -0.03em;
  max-width: 48rem; margin: 0;
  color: var(--muted);
}
.accent-lead strong { color: var(--accent); font-weight: 700; }

.block { padding: 3.5rem 0; }
.kicker {
  color: var(--accent); font-size: 0.78rem; font-weight: 600;
  letter-spacing: 0.08em; text-transform: uppercase; margin: 0 0 0.75rem;
}
.section-title {
  font-size: clamp(1.6rem, 3.5vw, 2.2rem);
  letter-spacing: -0.04em; margin: 0 0 1.5rem; line-height: 1.15;
}

.bento {
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  gap: 0.85rem;
}
.bento-card {
  grid-column: span 4;
  background: var(--card);
  border: 1px solid var(--line);
  border-radius: 16px;
  padding: 1.25rem 1.2rem 1.35rem;
  min-height: 11rem;
  transition: transform .25s ease, border-color .25s ease, box-shadow .25s ease;
  position: relative; overflow: hidden;
}
.bento-card:hover {
  transform: translateY(-4px);
  border-color: color-mix(in srgb, var(--accent) 40%, var(--line));
  box-shadow: 0 16px 40px rgba(0,0,0,.35), 0 0 24px rgba(110,231,183,.1);
}
.bento-card.wide { grid-column: span 8; min-height: 14rem; }
.bento-card.tall { min-height: 16rem; }
.bento-card .halftone {
  position: absolute; inset: auto -10% -30% auto; width: 12rem; height: 12rem;
  border-radius: 50%;
  background:
    radial-gradient(circle at 50% 50%, rgba(110,231,183,.3), transparent 65%),
    radial-gradient(rgba(0,0,0,.55) 1.1px, transparent 1.3px);
  background-size: auto, 4px 4px;
  opacity: 0.5; pointer-events: none; z-index: 0;
}
.bento-card > *:not(.halftone) { position: relative; z-index: 1; }
.bento-card h3 {
  margin: 0.65rem 0 0.4rem; font-size: 1.15rem; letter-spacing: -0.03em;
}
.bento-card p { margin: 0; color: var(--muted); font-size: 0.92rem; }
.bento-card .code {
  margin-top: 1rem;
  font: 0.78rem/1.5 "IBM Plex Mono", monospace;
  background: #0a0a0b; border: 1px solid var(--line); border-radius: 10px;
  padding: 0.85rem 1rem; color: #c8c5bb; overflow: auto;
}
.bento-card .code .g { color: #7dcea0; }
.bento-card .code .y { color: var(--accent); }
@media (max-width: 900px) {
  .bento-card, .bento-card.wide { grid-column: span 12; }
}

.split {
  display: grid; grid-template-columns: 1.05fr 0.95fr; gap: 2rem; align-items: center;
  padding: 2rem 0 1rem;
}
@media (max-width: 900px) { .split { grid-template-columns: 1fr; } }
.split ul { margin: 1rem 0 0; padding: 0; list-style: none; display: grid; gap: 0.65rem; }
.split li {
  display: flex; gap: 0.65rem; align-items: flex-start; color: var(--muted);
}
.split li::before {
  content: ""; width: 0.55rem; height: 0.55rem; margin-top: 0.45rem;
  border-radius: 50%; background: var(--accent); flex-shrink: 0;
}

.cta-box {
  text-align: center;
  border: 1px solid var(--line);
  border-radius: 20px;
  padding: 2.5rem 1.5rem;
  background:
    radial-gradient(ellipse 60% 80% at 50% 0%, rgba(110,231,183,.12), transparent 55%),
    var(--card);
}
.cta-box h2 {
  margin: 0 0 0.75rem; font-size: clamp(1.5rem, 3vw, 2rem); letter-spacing: -0.04em;
}

.page-hero { padding: 4rem 0 2rem; max-width: 42rem; }
.page-hero h1 {
  font-size: clamp(2rem, 5vw, 2.8rem); letter-spacing: -0.045em;
  line-height: 1.12; margin: 0 0 1rem;
}
.feature-row {
  display: grid; grid-template-columns: 1fr 1fr; gap: 2rem;
  align-items: center; padding: 2.5rem 0; border-top: 1px solid var(--line);
}
.feature-row.reverse { direction: rtl; }
.feature-row.reverse > * { direction: ltr; }
@media (max-width: 900px) {
  .feature-row, .feature-row.reverse { grid-template-columns: 1fr; direction: ltr; }
}
.feature-copy h2 { letter-spacing: -0.03em; margin: 0 0 0.75rem; }
.feature-copy p { color: var(--muted); }
.feature-copy ul { margin: 1rem 0 0; padding-left: 1.1rem; color: var(--muted); }
.feature-visual {
  border: 1px solid var(--line); border-radius: 16px; padding: 1.25rem;
  background: var(--card); min-height: 12rem;
}
.dash-label { font-size: 0.72rem; color: var(--accent); margin-bottom: 0.75rem; font-family: "IBM Plex Mono", monospace; }
.dash-bar { height: 0.55rem; border-radius: 4px; background: color-mix(in srgb, var(--accent) 50%, transparent); width: 78%; margin-bottom: 0.65rem; }
.dash-line { height: 0.4rem; border-radius: 4px; background: rgba(255,255,255,.08); margin-bottom: 0.45rem; }
.dash-line.short { width: 55%; }
.dash-tiles { display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem; margin-top: 0.85rem; }
.dash-tile { height: 3.2rem; border-radius: 10px; background: rgba(255,255,255,.04); border: 1px solid var(--line); }

.price-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
@media (max-width: 800px) { .price-grid { grid-template-columns: 1fr; } }
.price-card {
  border: 1px solid var(--line); border-radius: 16px; padding: 1.5rem;
  background: var(--card);
}
.price-card.featured {
  border-color: color-mix(in srgb, var(--accent) 45%, var(--line));
  box-shadow: 0 0 40px rgba(110,231,183,.08);
}
.price-card .amount { font-size: 2.4rem; letter-spacing: -0.04em; margin: 0.35rem 0 0.75rem; font-weight: 700; }
.price-card .amount span { font-size: 1rem; color: var(--muted); font-weight: 500; }
.price-card ul { margin: 1rem 0 1.25rem; padding-left: 1.1rem; color: var(--muted); }

.table-wrap { overflow-x: auto; border: 1px solid var(--line); border-radius: 14px; }
.compare { width: 100%; border-collapse: collapse; font-size: 0.92rem; }
.compare th, .compare td { padding: 0.85rem 1rem; border-bottom: 1px solid var(--line); text-align: left; }
.compare th { color: var(--muted); font-weight: 600; background: rgba(255,255,255,.02); }
.compare .yes { color: var(--accent); font-weight: 600; }

.grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 0.85rem; }
@media (max-width: 900px) { .grid { grid-template-columns: 1fr; } }
.card {
  border: 1px solid var(--line); border-radius: 16px; padding: 1.2rem;
  background: var(--card);
  transition: transform .25s ease, border-color .25s ease, box-shadow .25s ease;
}
.card:hover {
  transform: translateY(-3px);
  border-color: color-mix(in srgb, var(--accent) 35%, var(--line));
}
.card h3 { margin: 0.5rem 0 0.35rem; letter-spacing: -0.02em; }
.card p { margin: 0; color: var(--muted); font-size: 0.92rem; }

.muted { color: var(--muted); }
.prose { max-width: 42rem; }
.prose h1 { letter-spacing: -0.04em; }

footer.site {
  border-top: 1px solid var(--line); padding: 2.5rem 0 3rem; margin-top: 2rem;
}
footer.site .fine { color: var(--muted); font-size: 0.85rem; }

.cf-deploy-dialog {
  border: 1px solid var(--line); border-radius: 16px; padding: 0;
  background: var(--panel); color: var(--fg); max-width: 28rem; width: calc(100% - 2rem);
}
.cf-deploy-dialog::backdrop { background: rgba(0,0,0,.7); }
.cf-deploy-inner { padding: 1.35rem; }
.cf-deploy-inner h2 { margin: 0 0 0.5rem; letter-spacing: -0.03em; }
.cf-deploy-inner > p { color: var(--muted); margin: 0 0 1rem; }
.cf-deploy-choices { display: grid; gap: 0.65rem; }
.cf-deploy-choice {
  display: grid; gap: 0.25rem; padding: 0.9rem 1rem; border-radius: 12px;
  border: 1px solid var(--line); background: var(--card); color: inherit; text-decoration: none;
}
.cf-deploy-choice:hover { border-color: var(--accent); text-decoration: none; }
.cf-deploy-choice span { color: var(--muted); font-size: 0.88rem; }
.cf-deploy-actions { margin-top: 1rem; display: flex; justify-content: flex-end; }

[data-reveal-on-scroll] {
  opacity: 0; transform: translateY(12px);
  transition: opacity .45s ease, transform .45s ease;
}
[data-reveal-on-scroll].is-visible { opacity: 1; transform: none; }

@media (prefers-reduced-motion: reduce) {
  html { scroll-behavior: auto; }
  [data-reveal-on-scroll] { opacity: 1; transform: none; transition: none; }
  .btn, .bento-card, .card { transition: none; }
}
`;

const clientIsland = `
const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

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

const io = new IntersectionObserver((entries) => {
  for (const e of entries) if (e.isIntersecting) {
    e.target.classList.add("is-visible");
    io.unobserve(e.target);
  }
}, { threshold: 0.08, rootMargin: "0px 0px -8% 0px" });
for (const n of document.querySelectorAll("[data-reveal-on-scroll]")) {
  if (reduce) n.classList.add("is-visible");
  else io.observe(n);
}

const drawer = document.querySelector("[data-nav-drawer]");
document.querySelector("[data-nav-open]")?.addEventListener("click", () => { if (drawer) drawer.hidden = false; });
document.querySelector("[data-nav-close]")?.addEventListener("click", () => { if (drawer) drawer.hidden = true; });
drawer?.addEventListener("click", (e) => { if (e.target === drawer) drawer.hidden = true; });
window.addEventListener("keydown", (e) => { if (e.key === "Escape" && drawer) drawer.hidden = true; });

const deployDialog = document.querySelector("[data-cf-deploy]");
for (const openBtn of document.querySelectorAll("[data-cf-deploy-open]")) {
  openBtn.addEventListener("click", () => {
    if (deployDialog && typeof deployDialog.showModal === "function") deployDialog.showModal();
  });
}
deployDialog?.querySelector("[data-cf-deploy-close]")?.addEventListener("click", () => {
  if (typeof deployDialog.close === "function") deployDialog.close();
});
deployDialog?.addEventListener("click", (e) => {
  if (e.target === deployDialog && typeof deployDialog.close === "function") deployDialog.close();
});
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
  <nav class="nav" aria-label="Primary">
    ${joinHtml(nav.map((n) => html`<a href="${n.url}">${n.title}</a>`))}
    <a class="btn primary" href="https://dash.kumooo.dev/signup">Open dashboard</a>
  </nav>
  <button type="button" class="nav-toggle" data-nav-open aria-label="Open menu">☰</button>
</div></header>
<div class="nav-drawer" data-nav-drawer hidden>
  <div class="nav-drawer-panel">
    <button type="button" class="btn" data-nav-close style="align-self:flex-end">Close</button>
    ${joinHtml(nav.map((n) => html`<a href="${n.url}">${n.title}</a>`))}
    <a class="btn primary" href="https://dash.kumooo.dev/signup">Open dashboard</a>
    <a class="btn" href="https://github.com/renzoreyn/kumooo">${raw(ic.github)} GitHub</a>
  </div>
</div>
${opts?.fullBleed ? body : html`<main class="wrap">${body}</main>`}
${cfDeployDialog()}
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

function cfDeployDialog(): Html {
  return html`<dialog class="cf-deploy-dialog" data-cf-deploy>
  <div class="cf-deploy-inner">
    <h2>Deploy on Cloudflare</h2>
    <p>Two paths. Managed on Kumooo (2 sites free), or self-host the full multi-org stack on your Cloudflare.</p>
    <div class="cf-deploy-choices">
      <a class="cf-deploy-choice" href="https://dash.kumooo.dev/signup">
        <strong>Host on Kumooo</strong>
        <span>We run the platform. Free plan: 2 sites, {slug}.kumooo.dev. Sign up and publish.</span>
      </a>
      <a class="cf-deploy-choice" href="https://docs.kumooo.dev/deploy-on-cloudflare">
        <strong>Self-host on Cloudflare</strong>
        <span>npx create-kumooo → full stack on your account. Orgs, multiple sites, one dashboard.</span>
      </a>
    </div>
    <div class="cf-deploy-actions">
      <button type="button" class="btn" data-cf-deploy-close>Cancel</button>
    </div>
  </div>
</dialog>`;
}

function deployCta(title: string, lead: string): Html {
  return html`<section class="block" data-reveal-on-scroll>
  <div class="cta-box">
    <h2>${title}</h2>
    <p class="muted" style="margin:0 0 1rem">${lead}</p>
    <div style="display:flex;gap:.75rem;justify-content:center;flex-wrap:wrap">
      <button type="button" class="btn primary" data-cf-deploy-open>Deploy on Cloudflare</button>
      <a class="btn" href="https://docs.kumooo.dev">Read the docs</a>
    </div>
  </div>
</section>`;
}

function marketingHome(site: ThemeSiteContext): Html {
  return shell(
    site,
    html`<section class="hero">
  <div class="hero-pixels" aria-hidden="true"></div>
  <div class="hero-inner">
  <div class="hero-copy">
  <div class="hero-brand" data-hero-bit>kumooo<span>.</span></div>
  <h1 data-hero-bit>kumooo.js on <em>Next.js</em>. Any site shape.</h1>
  <p class="lead" data-hero-bit>Blank, blog, or shop starters. @kumooo/ui with Kibo, Radix Icons, and motion. The Cloudflare CMS is sunset. Open source first; hosted later.</p>
  <div class="install" data-hero-bit data-copy="npx create-kumooo">npx create-kumooo <button type="button">copy</button></div>
  <div class="hero-actions" data-hero-bit>
    <a class="btn primary" href="https://docs.kumooo.dev/getting-started">Get started</a>
    <a class="btn" href="https://github.com/renzoreyn/kumooo">GitHub</a>
  </div>
  </div>
  <div class="hero-stage" data-hero-mock>
  <div class="product-mock">
    <div class="mock-top">
      <span class="dot"></span><span class="dot"></span><span class="dot"></span>
      <span class="mock-url">docs.kumooo.dev/getting-started</span>
    </div>
    <div class="mock-body">
      <aside class="mock-side" aria-hidden="true">
        <div class="nav-label">Start</div>
        <div class="nav-item">Introduction</div>
        <div class="nav-item on">Getting started</div>
        <div class="nav-item">Installation</div>
        <div class="nav-label">Guides</div>
        <div class="nav-item">Season themes</div>
        <div class="nav-item">Theme Studio</div>
        <div class="nav-item">Deploy</div>
      </aside>
      <div class="mock-main">
        <p class="crumb">Docs / Getting started</p>
        <h3>Getting started</h3>
        <div class="para"></div>
        <div class="para"></div>
        <div class="para short"></div>
        <div class="para" style="margin-top:1rem"></div>
        <div class="para short"></div>
        <div class="code-block"><span class="g"># publish</span>
<span class="y">POST</span> /v1/sites/:id/content
x-kumooo-cache: miss → hit</div>
      </div>
    </div>
  </div>
  </div>
  </div>
</section>

<div class="wrap">
<p class="accent-lead" data-reveal-on-scroll>
  Built for people who write in <strong>Markdown</strong>, ship on <strong>Cloudflare</strong>, and want the <strong>edge</strong> to do the heavy lifting.
</p>

<section class="block" data-reveal-on-scroll>
  <p class="kicker">Why Kumooo</p>
  <h2 class="section-title">A publishing stack that feels finished.</h2>
  <div class="bento">
    <article class="bento-card wide tall">
      <div class="halftone" aria-hidden="true"></div>
      <p class="kicker">Edge HTML</p>
      <h3>Readers get HTML. You keep your nights.</h3>
      <p>Workers render close to your audience. Cache bumps on publish. Default themes need zero client JS.</p>
      <pre class="code"><span class="g"># publish</span>
<span class="y">POST</span> /v1/sites/:id/content/:id
x-kumooo-cache: miss → hit</pre>
    </article>
    <article class="bento-card">
      <p class="kicker">Seasons</p>
      <h3>Four real themes</h3>
      <p>Different layouts, light and dark. Preview live: <a href="https://haru.kumooo.dev">haru</a>, <a href="https://natsu.kumooo.dev">natsu</a>, <a href="https://aki.kumooo.dev">aki</a>, <a href="https://fuyu.kumooo.dev">fuyu</a>.</p>
    </article>
    <article class="bento-card">
      <p class="kicker">Studio</p>
      <h3>Theme Studio</h3>
      <p>Edit HTML, CSS, and a little client JS. Publish when it looks right.</p>
    </article>
    <article class="bento-card">
      <p class="kicker">CF Deploy</p>
      <h3>Managed or self-host</h3>
      <p>Host on Kumooo (2 sites free), or run create-kumooo on your Cloudflare for unlimited sites on your bill.</p>
    </article>
    <article class="bento-card">
      <p class="kicker">Media</p>
      <h3>150 MB per site</h3>
      <p>Upload to R2. Logo and favicon from Branding. No mystery CDN tax.</p>
    </article>
    <article class="bento-card">
      <p class="kicker">SEO</p>
      <h3>Meta, sitemap, RSS</h3>
      <p>The boring SEO bits ship with the product. Not a plugin graveyard.</p>
    </article>
  </div>
</section>

<section class="split" data-reveal-on-scroll>
  <div class="product-mock">
    <div class="mock-top">
      <span class="dot"></span><span class="dot"></span><span class="dot"></span>
      <span class="mock-url">dash.kumooo.dev · editor</span>
    </div>
    <div class="mock-body">
      <aside class="mock-side" aria-hidden="true">
        <div class="line on"></div>
        <div class="line" style="width:70%"></div>
        <div class="line" style="width:60%"></div>
      </aside>
      <div class="mock-main">
        <h3>Draft → Publish</h3>
        <div class="para"></div>
        <div class="para"></div>
        <div class="para short"></div>
        <div class="para" style="margin-top:1rem;background:color-mix(in srgb,var(--accent) 25%,transparent)"></div>
      </div>
    </div>
  </div>
  <div>
    <p class="kicker">Anybody can publish</p>
    <h2 class="section-title">Write. Ship. Walk away.</h2>
    <p class="muted">The editor is boring on purpose. Your content is the point.</p>
    <ul>
      <li>Markdown posts and pages with revisions</li>
      <li>Season themes or your own Theme Studio tree</li>
      <li>Deploy dialog: managed Kumooo or self-host on your Cloudflare</li>
    </ul>
  </div>
</section>

${deployCta("Ship your first site tonight.", "Host on Kumooo, or self-host on your Cloudflare with create-kumooo. Then go outside.")}
</div>`,
    { fullBleed: true },
  );
}

function marketingFeatures(site: ThemeSiteContext): Html {
  return shell(
    site,
    html`<div class="wrap">
<section class="page-hero" data-hero-bit>
  <div class="kicker">Features</div>
  <h1>Everything a publishing platform needs. Nothing you have to babysit.</h1>
  <p class="lead">Content, themes, media, domains, and edge caching. Built on Cloudflare so the boring infrastructure is someone else's problem.</p>
  <div style="display:flex;gap:.75rem;flex-wrap:wrap">
    <a class="btn primary" href="https://docs.kumooo.dev">Read the docs</a>
    <a class="btn" href="/pricing">See pricing</a>
  </div>
</section>

<section class="feature-row" data-reveal-on-scroll>
  <div class="feature-copy">
    <div class="kicker">Edge rendering</div>
    <h2>Fast by default</h2>
    <p>Pages render in a Worker a few milliseconds from your readers, then get cached hard. You don't tune this. It's just how Kumooo works.</p>
    <ul>
      <li>SSR HTML at the edge</li>
      <li>Cache version bumps on publish</li>
      <li>Zero required client JS for default themes</li>
    </ul>
  </div>
  <div class="feature-visual">
    <div class="dash-label">Cache hit</div>
    <div class="dash-bar" style="width:72%"></div>
    <div class="dash-line"></div>
    <div class="dash-line short"></div>
    <p class="muted" style="margin:.8rem 0 0;font-size:.85rem;font-family:IBM Plex Mono,monospace">x-kumooo-cache: hit · 41ms</p>
  </div>
</section>

<section class="feature-row reverse" data-reveal-on-scroll>
  <div class="feature-copy">
    <div class="kicker">CMS</div>
    <h2>A real editor, not a paste bin</h2>
    <p>Posts, pages, drafts, revisions, tags, custom fields. Markdown in. HTML out. The dashboard does the boring parts so you can ship.</p>
    <ul>
      <li>Draft → publish without ceremony</li>
      <li>Revision history on every save</li>
      <li>Media in your own R2 bucket</li>
    </ul>
  </div>
  <div class="feature-visual">
    <div class="dash-label">Editor</div>
    <div class="dash-bar"></div>
    <div class="dash-line"></div>
    <div class="dash-line"></div>
    <div class="dash-line short"></div>
    <div class="dash-tiles"><div class="dash-tile"></div><div class="dash-tile"></div></div>
  </div>
</section>

<section class="feature-row" data-reveal-on-scroll>
  <div class="feature-copy">
    <div class="kicker">Themes</div>
    <h2>Themes with teeth</h2>
    <p>Four free seasons. Preview them live before you pick. Theme Studio when you want your own HTML and CSS.</p>
    <ul>
      <li><a href="https://haru.kumooo.dev">haru.kumooo.dev</a>: spring journal</li>
      <li><a href="https://natsu.kumooo.dev">natsu.kumooo.dev</a>: summer cards</li>
      <li><a href="https://aki.kumooo.dev">aki.kumooo.dev</a>: autumn chapters</li>
      <li><a href="https://fuyu.kumooo.dev">fuyu.kumooo.dev</a>: winter log</li>
    </ul>
  </div>
  <div class="feature-visual">
    <div class="dash-label">live previews</div>
    <p style="margin:.6rem 0 0;font-family:IBM Plex Mono,monospace;font-size:.82rem;color:#c8c5bb">haru · natsu · aki · fuyu</p>
    <div class="dash-tiles" style="margin-top:1rem"><div class="dash-tile"></div><div class="dash-tile"></div></div>
  </div>
</section>

<section class="block" data-reveal-on-scroll>
  <div class="kicker">And the rest</div>
  <div class="grid">
    ${feature(ic.cloud, "Your Cloudflare", "D1 for content. R2 for media. KV for sessions and cache versions.")}
    ${feature(ic.shield, "Boring security", "PBKDF2 passwords, HttpOnly sessions, escaped templates.")}
    ${feature(ic.refresh, "Revisions", "Every save keeps history. Roll back when you mess up.")}
    ${feature(ic.search, "SEO handled", "Titles, meta, sitemap, RSS. Not a plugin graveyard.")}
    ${feature(ic.zap, "CF Deploy", "Managed on Kumooo, or self-host on your Cloudflare with create-kumooo.")}
    ${feature(ic.feather, "Org + sites", "Workspaces, roles, multiple sites. Grow without migrating.")}
  </div>
</section>

${deployCta("Try it on Cloudflare tonight.", "Managed hosting or your own account. Same product.")}
</div>`,
    { fullBleed: true },
  );
}

function marketingPricing(site: ThemeSiteContext): Html {
  return shell(
    site,
    html`<div class="wrap">
<section class="page-hero" data-hero-bit>
  <div class="kicker">Pricing</div>
  <h1>Two paths. Zero Kumooo tax.</h1>
  <p class="lead">Host on Kumooo for managed orgs and sites, or self-host on your Cloudflare with create-kumooo. You pay Cloudflare for usage either way.</p>
  <div style="display:flex;gap:.75rem;flex-wrap:wrap;margin-top:1rem">
    <button type="button" class="btn primary" data-cf-deploy-open>Deploy on Cloudflare</button>
    <a class="btn" href="https://docs.kumooo.dev/getting-started">Getting started</a>
  </div>
</section>

<section data-reveal-on-scroll>
  <div class="price-grid">
    <div class="price-card featured" data-motion-card>
      <div class="kicker">Host on Kumooo</div>
      <div class="amount">$0 <span>/ free</span></div>
      <p class="muted" style="margin:0">We run the platform. Orgs, up to 2 sites, {slug}.kumooo.dev. More sites and storage come with paid plans later.</p>
      <ul>
        <li>2 sites on the free plan</li>
        <li>Dashboard, editor, media, themes</li>
        <li>Four free season themes</li>
        <li>150 MB media per site</li>
      </ul>
      <a class="btn primary" href="https://dash.kumooo.dev/signup">Open the dashboard</a>
    </div>
    <div class="price-card" data-motion-card>
      <div class="kicker">Self-host on Cloudflare</div>
      <div class="amount" style="font-size:1.6rem">Your account</div>
      <p class="muted" style="margin:0 0 1rem">npx create-kumooo. Full multi-org stack on your Cloudflare: orgs, many sites, one dashboard. Your bill, no Kumooo SaaS fee.</p>
      <ul>
        <li>Guided create → deploy</li>
        <li>Orgs + unlimited sites (default)</li>
        <li>Your D1, R2, KV</li>
        <li>No Kumooo SaaS fee</li>
      </ul>
      <a class="btn" href="https://docs.kumooo.dev/deploy-on-cloudflare">Self-host guide</a>
    </div>
  </div>
</section>

<section class="block" data-reveal-on-scroll>
  <div class="kicker">What you actually get</div>
  <h2 class="section-title">Included either way</h2>
  <div class="table-wrap">
  <table class="compare">
    <thead>
      <tr><th>Capability</th><th>Kumooo hosted</th><th>Self-host (your CF)</th></tr>
    </thead>
    <tbody>
      <tr><td>Sites &amp; content</td><td class="yes">2 on free</td><td class="yes">Unlimited orgs/sites</td></tr>
      <tr><td>Media library</td><td class="yes">Yes</td><td class="yes">Your R2</td></tr>
      <tr><td>Managed *.kumooo.dev</td><td class="yes">Yes</td><td>Your domain / workers.dev</td></tr>
      <tr><td>Who runs Workers</td><td>Kumooo</td><td class="yes">You</td></tr>
      <tr><td>Interactive themes</td><td class="yes">Yes</td><td class="yes">Yes</td></tr>
      <tr><td>Dashboard</td><td class="yes">Yes</td><td class="yes">Yes</td></tr>
      <tr><td>Kumooo SaaS fee</td><td class="yes">$0</td><td class="yes">$0</td></tr>
    </tbody>
  </table>
  </div>
</section>

<section class="block" data-reveal-on-scroll>
  <div class="kicker">Honest costs</div>
  <div class="grid">
    <div class="card" data-motion-card>
      <h3>Workers</h3>
      <p>API and renderer. Free tier covers early traffic. You scale on Cloudflare's meter, not ours.</p>
    </div>
    <div class="card" data-motion-card>
      <h3>D1 + KV</h3>
      <p>Content and sessions. Cheap at small scale. You see the bill in your Cloudflare dashboard.</p>
    </div>
    <div class="card" data-motion-card>
      <h3>R2</h3>
      <p>Media storage. No egress fees to the usual suspects. Upload once, serve from the edge.</p>
    </div>
  </div>
</section>

<section class="block" data-reveal-on-scroll>
  <div class="cta-box">
    <h2>Ship a site before you open a spreadsheet.</h2>
    <p class="muted" style="margin:0 0 1rem">Pick a Cloudflare path, then deploy.</p>
    <div style="display:flex;gap:.75rem;justify-content:center;flex-wrap:wrap">
      <button type="button" class="btn primary" data-cf-deploy-open>Deploy on Cloudflare</button>
      <a class="btn" href="/features">Features</a>
    </div>
  </div>
</section>
</div>`,
    { fullBleed: true },
  );
}

function marketingAbout(site: ThemeSiteContext): Html {
  return shell(
    site,
    html`<div class="wrap">
<section class="page-hero" data-hero-bit>
  <div class="kicker">About</div>
  <h1>Built by Ren. Dogfooded on Cloudflare.</h1>
  <p class="lead">Kumooo exists because publishing shouldn't require babysitting servers, PHP plugins, or a VPS you forgot existed.</p>
</section>

<section class="block" data-reveal-on-scroll>
  <div class="grid">
    <div class="card" data-motion-card>
      <h3>Who</h3>
      <p>Made by <a href="https://renzoreyn.dev">Ren</a>. Code lives on <a href="https://github.com/renzoreyn/kumooo">GitHub</a>.</p>
    </div>
    <div class="card" data-motion-card>
      <h3>Why</h3>
      <p>WordPress gets used for a whole lot of nonsense. Fine. Kumooo gives you that freedom on the edge.</p>
    </div>
    <div class="card" data-motion-card>
      <h3>How we ship</h3>
      <p>This site and the docs are real Kumooo sites. If the product is broken, we feel it first.</p>
    </div>
  </div>
</section>

<section class="block" data-reveal-on-scroll>
  <div class="cta-box">
    <h2>Talk via GitHub.</h2>
    <p class="muted" style="margin:0 0 1rem">Issues and PRs beat cold emails.</p>
    <a class="btn primary" href="https://github.com/renzoreyn/kumooo">github.com/renzoreyn/kumooo</a>
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
    if (page.slug === "features") return marketingFeatures(site);
    if (page.slug === "pricing") return marketingPricing(site);
    if (page.slug === "about") return marketingAbout(site);
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
      html`<section style="padding:3rem 0"><h1>${d.title}</h1></section>`,
    ),
  notFound: (site) =>
    shell(
      site,
      html`<section class="page-hero"><h1>Nothing here</h1><p class="lead">That page does not exist.</p><a class="btn primary" href="/">Home</a></section>`,
    ),
};
