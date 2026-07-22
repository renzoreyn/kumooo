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
  backdrop-filter: blur(16px);
  background: color-mix(in srgb, var(--bg) 78%, transparent);
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
  padding: 4.5rem 0 2rem;
  isolation: isolate;
  /* Full viewport width so the glow is not cropped by .wrap */
  width: 100vw;
  margin-left: calc(50% - 50vw);
  margin-right: calc(50% - 50vw);
  overflow: visible;
}
.hero-inner {
  position: relative;
  z-index: 1;
  max-width: var(--max);
  margin: 0 auto;
  padding: 0 1.5rem;
}
@media (max-width: 640px) { .hero-inner { padding: 0 1rem; } }
.hero-orb {
  position: absolute;
  right: max(-6rem, -8vw); top: -12%;
  width: min(48rem, 70vw); height: min(48rem, 70vw);
  border-radius: 50%;
  pointer-events: none;
  z-index: 0;
  animation: orb-drift 14s ease-in-out infinite alternate;
  background: radial-gradient(circle at 40% 40%, rgba(110,231,183,.48), rgba(52,180,140,.14) 42%, transparent 68%);
  filter: blur(12px);
}
.hero-pixels {
  position: absolute;
  right: max(-4rem, -5vw); top: -8%;
  width: min(42rem, 62vw); height: min(42rem, 62vw);
  border-radius: 50%;
  pointer-events: none;
  z-index: 0;
  background-image: radial-gradient(rgba(110,231,183,.28) 1.15px, transparent 1.35px);
  background-size: 6px 6px;
  mask-image: radial-gradient(circle at 45% 45%, #000 0%, #000 42%, transparent 72%);
  -webkit-mask-image: radial-gradient(circle at 45% 45%, #000 0%, #000 42%, transparent 72%);
  opacity: 0.9;
  animation: orb-drift 14s ease-in-out infinite alternate;
}
@keyframes orb-drift {
  from { transform: translate(0, 0) scale(1); }
  to { transform: translate(-3%, 4%) scale(1.06); }
}
.hero-brand {
  display: block;
  font-size: clamp(3.5rem, 12vw, 6.5rem);
  font-weight: 700;
  letter-spacing: -0.07em;
  line-height: 0.9;
  margin: 0 0 1.25rem;
  color: var(--fg);
}
.hero-brand span { color: var(--accent); }
.hero h1 {
  font-size: clamp(1.85rem, 4.5vw, 3rem);
  line-height: 1.12; letter-spacing: -0.04em; margin: 0 0 1rem;
  font-weight: 700; max-width: 18ch;
}
.hero h1 em {
  font-style: normal; color: var(--accent);
}
.lead { color: var(--muted); font-size: 1.08rem; max-width: 34rem; margin: 0 0 1.5rem; }
.hero-actions { display: flex; gap: 0.75rem; flex-wrap: wrap; margin-bottom: 2.75rem; }
.install {
  display: inline-flex; align-items: center; gap: 0.75rem;
  font-family: "IBM Plex Mono", ui-monospace, monospace;
  background: var(--card); border: 1px solid var(--line);
  border-radius: 12px; padding: 0.7rem 1rem; margin-bottom: 1rem;
  font-size: 0.88rem; color: var(--muted);
}
.install button {
  margin-left: auto; border: 0; background: transparent; color: var(--accent);
  font: inherit; cursor: pointer; font-weight: 600;
}
.install button.copied { color: var(--fg); }

.product-mock {
  position: relative;
  border: 1px solid var(--line);
  border-radius: 18px;
  background: linear-gradient(180deg, #151518, #0c0c0e);
  box-shadow:
    0 30px 80px rgba(0,0,0,.55),
    0 0 0 1px rgba(255,255,255,.03) inset;
  overflow: hidden;
  min-height: 18rem;
}
.product-mock .mock-top {
  display: flex; align-items: center; gap: 0.4rem;
  padding: 0.75rem 1rem; border-bottom: 1px solid var(--line);
  background: rgba(255,255,255,.02);
}
.product-mock .dot {
  width: 0.55rem; height: 0.55rem; border-radius: 50%; background: #3a3a3e;
}
.product-mock .dot:nth-child(1) { background: #ff5f57; }
.product-mock .dot:nth-child(2) { background: #febc2e; }
.product-mock .dot:nth-child(3) { background: #28c840; }
.product-mock .mock-url {
  margin-left: 0.75rem; font: 0.72rem/1 "IBM Plex Mono", monospace; color: var(--muted);
}
.product-mock .mock-body {
  display: grid; grid-template-columns: 11rem 1fr; min-height: 16rem;
}
.product-mock .mock-side {
  border-right: 1px solid var(--line); padding: 1rem 0.85rem;
  background: rgba(0,0,0,.25);
}
.product-mock .mock-side .line {
  height: 0.45rem; border-radius: 4px; background: rgba(255,255,255,.08);
  margin-bottom: 0.55rem;
}
.product-mock .mock-side .line.on { background: color-mix(in srgb, var(--accent) 55%, transparent); width: 70%; }
.product-mock .mock-main { padding: 1.25rem 1.35rem; }
.product-mock .mock-main h3 {
  margin: 0 0 0.75rem; font-size: 1.15rem; letter-spacing: -0.03em;
}
.product-mock .mock-main .para {
  height: 0.5rem; border-radius: 4px; background: rgba(255,255,255,.07);
  margin-bottom: 0.45rem;
}
.product-mock .mock-main .para.short { width: 62%; }
@media (max-width: 700px) {
  .product-mock .mock-body { grid-template-columns: 1fr; }
  .product-mock .mock-side { display: none; }
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
  opacity: 0; transform: translateY(18px);
  transition: opacity .65s ease, transform .65s ease;
}
[data-reveal-on-scroll].is-visible { opacity: 1; transform: none; }
[data-reveal-on-scroll].is-visible .bento-card {
  animation: card-in .55s ease backwards;
}
[data-reveal-on-scroll].is-visible .bento-card:nth-child(1) { animation-delay: .04s; }
[data-reveal-on-scroll].is-visible .bento-card:nth-child(2) { animation-delay: .1s; }
[data-reveal-on-scroll].is-visible .bento-card:nth-child(3) { animation-delay: .16s; }
[data-reveal-on-scroll].is-visible .bento-card:nth-child(4) { animation-delay: .22s; }
[data-reveal-on-scroll].is-visible .bento-card:nth-child(5) { animation-delay: .28s; }
[data-reveal-on-scroll].is-visible .bento-card:nth-child(6) { animation-delay: .34s; }
@keyframes card-in {
  from { opacity: 0; transform: translateY(12px); }
  to { opacity: 1; transform: none; }
}

@media (prefers-reduced-motion: reduce) {
  html { scroll-behavior: auto; }
  .hero-orb, .hero-pixels { animation: none; }
  [data-reveal-on-scroll] { opacity: 1; transform: none; transition: none; }
  [data-reveal-on-scroll].is-visible .bento-card { animation: none; }
  .btn, .bento-card, .card { transition: none; }
}
`;

const clientIsland = `
import { animate, stagger } from "https://esm.sh/framer-motion@11.15.0/dom";

const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const heroBits = document.querySelectorAll("[data-hero-bit]");
if (heroBits.length && !reduce) {
  animate(heroBits, { opacity: [0, 1], y: [22, 0] }, { delay: stagger(0.08), duration: 0.55, easing: [0.22, 1, 0.36, 1] });
} else {
  for (const el of heroBits) el.style.opacity = "1";
}

const mock = document.querySelector("[data-hero-mock]");
if (mock && !reduce) {
  animate(mock, { opacity: [0, 1], y: [28, 0] }, { delay: 0.28, duration: 0.7, easing: [0.22, 1, 0.36, 1] });
} else if (mock) {
  mock.style.opacity = "1";
}

const cards = document.querySelectorAll("[data-motion-card]");
if (cards.length && !reduce) {
  animate(cards, { opacity: [0, 1], y: [14, 0] }, { delay: stagger(0.05), duration: 0.4, easing: "ease-out" });
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

const io = new IntersectionObserver((entries) => {
  for (const e of entries) if (e.isIntersecting) e.target.classList.add("is-visible");
}, { threshold: 0.12 });
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
    <p>Pick how you want to run Kumooo. No OAuth into your account. You choose the path.</p>
    <div class="cf-deploy-choices">
      <a class="cf-deploy-choice" href="https://dash.kumooo.dev/signup">
        <strong>Host on Kumooo</strong>
        <span>We run the Worker. You get {slug}.kumooo.dev in minutes.</span>
      </a>
      <a class="cf-deploy-choice" href="https://docs.kumooo.dev/getting-started">
        <strong>Host on your Cloudflare</strong>
        <span>Own the Worker and your domain. Same stack. CLI + wrangler deploy.</span>
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
  <div class="hero-orb" aria-hidden="true"></div>
  <div class="hero-pixels" aria-hidden="true"></div>
  <div class="hero-inner">
  <div class="hero-brand" data-hero-bit>kumooo<span>.</span></div>
  <h1 data-hero-bit>Publish on <em>Cloudflare</em>. Keep your evenings.</h1>
  <p class="lead" data-hero-bit>Markdown in. HTML out at the edge. Themes, media, and a dashboard that does not need babysitting.</p>
  <div class="install" data-hero-bit data-copy="npx create-kumooo">npx create-kumooo <button type="button">copy</button></div>
  <div class="hero-actions" data-hero-bit>
    <button type="button" class="btn primary" data-cf-deploy-open>Deploy on Cloudflare</button>
    <a class="btn" href="https://docs.kumooo.dev">Read the docs</a>
  </div>
  <div class="product-mock" data-hero-mock style="opacity:0">
    <div class="mock-top">
      <span class="dot"></span><span class="dot"></span><span class="dot"></span>
      <span class="mock-url">docs.kumooo.dev/getting-started</span>
    </div>
    <div class="mock-body">
      <aside class="mock-side" aria-hidden="true">
        <div class="line on"></div>
        <div class="line" style="width:88%"></div>
        <div class="line" style="width:72%"></div>
        <div class="line" style="width:80%"></div>
        <div class="line" style="width:64%"></div>
      </aside>
      <div class="mock-main">
        <h3>Getting started</h3>
        <div class="para"></div>
        <div class="para"></div>
        <div class="para short"></div>
        <div class="para" style="margin-top:1rem"></div>
        <div class="para short"></div>
        <div class="dash-tiles"><div class="dash-tile"></div><div class="dash-tile"></div></div>
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
      <p>Haru, Natsu, Aki, Fuyu. Different layouts, light and dark, not four recolors.</p>
    </article>
    <article class="bento-card">
      <p class="kicker">Studio</p>
      <h3>Theme Studio</h3>
      <p>Edit HTML, CSS, and a little client JS. Publish when it looks right.</p>
    </article>
    <article class="bento-card">
      <p class="kicker">CF Deploy</p>
      <h3>Your Cloudflare or ours</h3>
      <p>Managed *.kumooo.dev, or self-host the same Workers on your account.</p>
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
      <li>Deploy dialog: Kumooo hosting or your Cloudflare</li>
    </ul>
  </div>
</section>

${deployCta("Ship your first site tonight.", "Pick Kumooo hosting or your Cloudflare. Then go outside.")}
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
    <p>Four free seasons. Theme Studio for your own HTML and CSS. Same platform either way.</p>
    <ul>
      <li>Haru, Natsu, Aki, Fuyu</li>
      <li>Light and dark with a toggle</li>
      <li>This marketing site is a Kumooo theme</li>
    </ul>
  </div>
  <div class="feature-visual">
    <div class="dash-label">theme-marketing</div>
    <p style="margin:.6rem 0 0;font-family:IBM Plex Mono,monospace;font-size:.82rem;color:#c8c5bb">home · features · pricing · about</p>
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
    ${feature(ic.zap, "CF Deploy", "Managed *.kumooo.dev, or self-host Workers on your Cloudflare.")}
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
  <h1>Two Cloudflare paths. Zero Kumooo tax.</h1>
  <p class="lead">Host on Kumooo for a managed *.kumooo.dev site, or self-host on your Cloudflare account. You pay Cloudflare for usage either way.</p>
  <div style="display:flex;gap:.75rem;flex-wrap:wrap;margin-top:1rem">
    <button type="button" class="btn primary" data-cf-deploy-open>Deploy on Cloudflare</button>
    <a class="btn" href="https://docs.kumooo.dev/getting-started">Getting started</a>
  </div>
</section>

<section data-reveal-on-scroll>
  <div class="price-grid">
    <div class="price-card featured" data-motion-card>
      <div class="kicker">Host on Kumooo</div>
      <div class="amount">$0 <span>/ Kumooo</span></div>
      <p class="muted" style="margin:0">We run the Worker. You get {slug}.kumooo.dev. Cloudflare usage still applies on our side.</p>
      <ul>
        <li>Managed *.kumooo.dev hostname</li>
        <li>Dashboard, editor, media, themes</li>
        <li>Four free season themes</li>
        <li>Same edge stack as self-host</li>
      </ul>
      <a class="btn primary" href="https://dash.kumooo.dev/signup">Open the dashboard</a>
    </div>
    <div class="price-card" data-motion-card>
      <div class="kicker">Your Cloudflare</div>
      <div class="amount" style="font-size:1.6rem">Self-host</div>
      <p class="muted" style="margin:0 0 1rem">Own the Worker and your domain. Run create-kumooo, bind D1/KV/R2, wrangler deploy.</p>
      <ul>
        <li>API + renderer Workers on your account</li>
        <li>Your D1, R2, KV</li>
        <li>Attach your domain in Cloudflare</li>
        <li>No Kumooo SaaS fee</li>
      </ul>
      <a class="btn" href="https://docs.kumooo.dev/getting-started">Follow the install guide</a>
    </div>
  </div>
</section>

<section class="block" data-reveal-on-scroll>
  <div class="kicker">What you actually get</div>
  <h2 class="section-title">Included either way</h2>
  <div class="table-wrap">
  <table class="compare">
    <thead>
      <tr><th>Capability</th><th>Kumooo hosted</th><th>Your Cloudflare</th></tr>
    </thead>
    <tbody>
      <tr><td>Sites &amp; content</td><td class="yes">Yes</td><td class="yes">Yes</td></tr>
      <tr><td>Media library</td><td class="yes">Yes</td><td class="yes">Your R2</td></tr>
      <tr><td>Managed *.kumooo.dev</td><td class="yes">Yes</td><td>Optional if you point DNS</td></tr>
      <tr><td>Self-host on your CF</td><td>N/A</td><td class="yes">Yes</td></tr>
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
