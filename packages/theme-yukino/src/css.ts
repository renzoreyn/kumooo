export const yukinoCss = `
:root {
  --yk-bg: #070b10;
  --yk-fg: #eef3f8;
  --yk-muted: #8fa0b5;
  --yk-line: rgba(238,243,248,0.1);
  --yk-accent: #7dd3fc;
  --yk-accent-ink: #041018;
  --yk-panel: #0f1520;
  --yk-panel-2: #151d2a;
  --yk-max: 74rem;
  --yk-radius: 0.65rem;
  color-scheme: dark;
}
*, *::before, *::after { box-sizing: border-box; }
html { scroll-behavior: smooth; }
body.theme-yukino {
  margin: 0;
  font: 16px/1.65 Figtree, "Segoe UI", sans-serif;
  color: var(--yk-fg);
  background: var(--yk-bg);
  min-height: 100vh;
  overflow-x: hidden;
}
body.theme-yukino::before {
  content: "";
  pointer-events: none;
  position: fixed;
  inset: 0;
  opacity: 0.035;
  background-image: radial-gradient(circle at 1px 1px, #fff 1px, transparent 0);
  background-size: 16px 16px;
  z-index: 0;
}
body.theme-yukino > * { position: relative; z-index: 1; }
img { display: block; max-width: 100%; height: auto; }
a { color: var(--yk-accent); text-decoration: none; }
a:hover { text-decoration: underline; text-underline-offset: 0.18em; }
.yk-display { font-family: Syne, Figtree, sans-serif; font-weight: 700; letter-spacing: -0.03em; }
.yk-i { width: 1.1rem; height: 1.1rem; display: inline-block; vertical-align: -0.18em; }
.yk-wrap { width: min(100% - 2rem, var(--yk-max)); margin-inline: auto; }
.kicker {
  color: var(--yk-accent); font-size: 0.72rem; font-weight: 700;
  letter-spacing: 0.16em; text-transform: uppercase; margin: 0 0 0.55rem;
}

.yk-nav {
  position: sticky; top: 0; z-index: 40;
  display: flex; align-items: center; gap: 1rem;
  padding: 0.8rem clamp(1rem, 3vw, 1.5rem);
  border-bottom: 1px solid var(--yk-line);
  background: rgba(7,11,16,0.78);
  backdrop-filter: blur(14px) saturate(1.2);
}
.yk-logo {
  font-family: Syne, Figtree, sans-serif;
  font-weight: 800; font-size: 1.05rem; letter-spacing: 0.16em;
  color: var(--yk-fg); text-decoration: none !important;
}
.yk-nav-links { display: flex; gap: 0.25rem; margin-left: auto; flex-wrap: wrap; }
.yk-nav-links a {
  color: var(--yk-muted); font-size: 0.9rem; font-weight: 560;
  text-decoration: none; padding: 0.4rem 0.7rem; border-radius: 999px;
}
.yk-nav-links a:hover { color: var(--yk-fg); background: rgba(255,255,255,0.05); }
.yk-bag-btn {
  display: inline-flex; align-items: center; gap: 0.4rem;
  border: 1px solid var(--yk-line); background: var(--yk-panel);
  color: var(--yk-fg); border-radius: 999px; padding: 0.42rem 0.8rem;
  cursor: pointer; font: inherit; transition: border-color .2s ease, color .2s ease;
}
.yk-bag-btn:hover { border-color: var(--yk-accent); color: var(--yk-accent); }
[data-yukino-bag-count] {
  min-width: 1.15rem; text-align: center; font-size: 0.75rem; font-weight: 700;
  color: var(--yk-accent-ink); background: var(--yk-accent);
  border-radius: 999px; padding: 0.08rem 0.38rem;
}

.yk-hero {
  min-height: 100svh; display: grid; align-items: end;
  padding: 5rem 0 4.5rem; position: relative; isolation: isolate;
}
.yk-hero-media {
  position: absolute; inset: 0; z-index: 0;
}
.yk-hero-media img {
  width: 100%; height: 100%; object-fit: cover; object-position: center 35%;
  filter: saturate(0.85) contrast(1.05);
}
.yk-hero-veil {
  position: absolute; inset: 0;
  background:
    linear-gradient(180deg, rgba(7,11,16,0.35) 0%, rgba(7,11,16,0.55) 40%, rgba(7,11,16,0.92) 100%),
    linear-gradient(90deg, rgba(7,11,16,0.55), transparent 55%);
}
.yk-hero-snow {
  position: absolute; inset: 0; z-index: 1; pointer-events: none; overflow: hidden;
}
.yk-hero-snow span {
  position: absolute; width: 2px; height: 2px; border-radius: 50%;
  background: rgba(238,243,248,0.65); top: -10px;
  animation: yk-fall linear infinite;
}
@keyframes yk-fall {
  to { transform: translate3d(18px, 110vh, 0); opacity: 0; }
}
@media (prefers-reduced-motion: reduce) {
  .yk-hero-snow span { animation: none; opacity: 0.3; }
}
.yk-hero-inner { position: relative; z-index: 2; width: min(100% - 2rem, var(--yk-max)); margin-inline: auto; }
.yk-hero-brand {
  font-family: Syne, Figtree, sans-serif;
  font-size: clamp(3.2rem, 13vw, 7.5rem); font-weight: 800;
  line-height: 0.88; letter-spacing: -0.045em; margin: 0 0 1rem;
  color: #f7fbff;
  text-shadow: 0 12px 40px rgba(0,0,0,0.35);
}
.yk-hero h1 {
  font-family: Syne, Figtree, sans-serif;
  font-size: clamp(1.45rem, 3.2vw, 2.15rem); font-weight: 700;
  line-height: 1.15; max-width: 16ch; margin: 0 0 0.7rem;
}
.yk-hero .yk-lead { color: #c5d0de; max-width: 34ch; margin: 0 0 1.5rem; font-size: 1.05rem; }
.yk-cta { display: flex; flex-wrap: wrap; gap: 0.7rem; }
.yk-btn {
  display: inline-flex; align-items: center; justify-content: center; gap: 0.4rem;
  border: none; border-radius: 999px; padding: 0.78rem 1.25rem;
  font: 600 0.92rem/1 Figtree, sans-serif; cursor: pointer; text-decoration: none !important;
  transition: transform .15s ease, filter .15s ease, border-color .15s ease;
}
.yk-btn:hover { transform: translateY(-1px); }
.yk-btn-primary { background: var(--yk-accent); color: var(--yk-accent-ink); }
.yk-btn-primary:hover { filter: brightness(1.06); }
.yk-btn-ghost {
  background: rgba(255,255,255,0.06); color: var(--yk-fg);
  border: 1px solid var(--yk-line); backdrop-filter: blur(8px);
}
.yk-btn-ghost:hover { border-color: var(--yk-accent); color: var(--yk-accent); }
.yk-btn-wide { width: 100%; max-width: 22rem; }

.yk-section { padding: 4.75rem 0; }
.yk-section-tight { padding-top: 2rem; }
.yk-section-head { margin-bottom: 1.75rem; max-width: 36rem; }
.yk-section-head h2 {
  font-family: Syne, Figtree, sans-serif;
  font-size: clamp(1.7rem, 3vw, 2.35rem); margin: 0; letter-spacing: -0.035em;
}

.yk-drops {
  display: grid; gap: 1.15rem;
  grid-template-columns: repeat(3, 1fr);
}
@media (max-width: 900px) {
  .yk-drops { grid-template-columns: 1fr 1fr; }
}
@media (max-width: 560px) {
  .yk-drops { grid-template-columns: 1fr; }
}
.yk-card {
  display: flex; flex-direction: column;
  text-decoration: none !important; color: inherit;
  border: 1px solid var(--yk-line); background: var(--yk-panel);
  border-radius: var(--yk-radius); overflow: hidden;
  transition: border-color 0.2s ease, transform 0.25s ease, box-shadow 0.25s ease;
}
.yk-card:hover {
  border-color: rgba(125,211,252,0.4);
  transform: translateY(-4px);
  box-shadow: 0 18px 40px rgba(0,0,0,0.35);
}
.yk-card-media {
  aspect-ratio: 4/5; position: relative; overflow: hidden; background: var(--yk-panel-2);
}
.yk-card-media img {
  width: 100%; height: 100%; object-fit: cover;
  transition: transform 0.5s ease;
}
.yk-card:hover .yk-card-media img { transform: scale(1.04); }
.yk-card-tag {
  position: absolute; top: 0.75rem; left: 0.75rem;
  font-size: 0.68rem; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase;
  color: var(--yk-accent-ink); background: var(--yk-accent);
  padding: 0.28rem 0.5rem; border-radius: 999px;
}
.yk-card-body { padding: 1rem 1.05rem 1.15rem; display: grid; gap: 0.35rem; }
.yk-card-top { display: flex; justify-content: space-between; gap: 0.75rem; align-items: baseline; }
.yk-card-body h3 { margin: 0; font-family: Syne, Figtree, sans-serif; font-size: 1.15rem; letter-spacing: -0.02em; }
.yk-price { color: var(--yk-accent); font-weight: 700; font-size: 0.95rem; white-space: nowrap; }
.yk-price-lg { font-size: 1.35rem; display: inline-block; margin: 0.35rem 0 0.5rem; }
.yk-blurb { color: var(--yk-muted); font-size: 0.92rem; margin: 0; }
.yk-label { font-size: 0.75rem; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; color: var(--yk-muted); margin: 1rem 0 0.45rem; }

.yk-story { border-block: 1px solid var(--yk-line); background: linear-gradient(180deg, rgba(125,211,252,0.04), transparent); }
.yk-story-grid {
  display: grid; gap: 2rem; align-items: center;
}
@media (min-width: 860px) {
  .yk-story-grid { grid-template-columns: 1fr 1.05fr; gap: 3rem; }
}
.yk-story-copy h2 {
  font-family: Syne, Figtree, sans-serif;
  font-size: clamp(1.8rem, 4vw, 2.6rem); margin: 0 0 0.85rem; letter-spacing: -0.035em;
}
.yk-story-copy p { color: var(--yk-muted); margin: 0; font-size: 1.05rem; max-width: 34rem; }
.yk-story-media {
  border-radius: var(--yk-radius); overflow: hidden; border: 1px solid var(--yk-line);
  aspect-ratio: 5/4;
}
.yk-story-media img { width: 100%; height: 100%; object-fit: cover; }

.yk-featured {
  display: grid; gap: 2rem; align-items: center;
}
@media (min-width: 860px) {
  .yk-featured { grid-template-columns: 1.05fr 0.95fr; gap: 3rem; }
}
.yk-featured-media {
  border-radius: var(--yk-radius); overflow: hidden; border: 1px solid var(--yk-line);
  aspect-ratio: 4/5; background: var(--yk-panel);
}
.yk-featured-media img { width: 100%; height: 100%; object-fit: cover; }
.yk-featured h2 { font-family: Syne, Figtree, sans-serif; font-size: clamp(1.8rem, 3vw, 2.4rem); margin: 0 0 0.5rem; letter-spacing: -0.03em; }

.yk-journal-list { display: grid; gap: 0; border-top: 1px solid var(--yk-line); }
.yk-journal-item {
  display: flex; justify-content: space-between; gap: 1.25rem; align-items: center;
  padding: 1.25rem 0; border-bottom: 1px solid var(--yk-line);
  color: inherit; text-decoration: none !important;
}
.yk-journal-item h3 { margin: 0 0 0.25rem; font-family: Syne, Figtree, sans-serif; font-size: 1.15rem; }
.yk-journal-item p { margin: 0; color: var(--yk-muted); font-size: 0.9rem; max-width: 42rem; }
.yk-journal-item:hover h3 { color: var(--yk-accent); }
.yk-journal-go { color: var(--yk-muted); font-size: 0.85rem; white-space: nowrap; }

.yukino-shop, .yukino-product, .yukino-article, .yukino-archive, .yk-404 {
  width: min(100% - 2rem, var(--yk-max)); margin: 2.25rem auto 4rem;
}
.yk-page-head { margin-bottom: 1.75rem; max-width: 40rem; }
.yk-page-head h1, .yk-404 h1, .yk-product-meta h1 {
  font-family: Syne, Figtree, sans-serif;
  font-size: clamp(2rem, 4vw, 2.8rem); margin: 0 0 0.5rem; letter-spacing: -0.035em;
}
.lead { color: var(--yk-muted); margin: 0; font-size: 1.05rem; }
.yukino-shop .yk-drops { margin-top: 2rem; }

.yukino-product { display: grid; gap: 2rem; }
@media (min-width: 900px) {
  .yukino-product { grid-template-columns: 1.05fr 0.95fr; align-items: start; gap: 2.5rem; }
}
.yk-product-media {
  border-radius: var(--yk-radius); overflow: hidden; border: 1px solid var(--yk-line);
  background: var(--yk-panel); aspect-ratio: 4/5;
}
.yk-product-media img { width: 100%; height: 100%; object-fit: cover; }
.yk-product-art { width: 100%; height: 100%; min-height: 20rem; }
.yk-art-a { background: linear-gradient(145deg, #1a2433, #0d1219 60%, #243247); }
.yk-sizes { display: flex; flex-wrap: wrap; gap: 0.4rem; margin: 0 0 1.25rem; }
.yk-size {
  min-width: 2.6rem; padding: 0.5rem 0.65rem; border-radius: 999px;
  border: 1px solid var(--yk-line); background: transparent; color: var(--yk-fg);
  cursor: pointer; font: 600 0.85rem Figtree, sans-serif;
}
.yk-size.is-active, .yk-size:hover { border-color: var(--yk-accent); color: var(--yk-accent); background: rgba(125,211,252,0.08); }
.yk-accordion { border-top: 1px solid var(--yk-line); margin-top: 1.75rem; }
.yk-acc-item { border-bottom: 1px solid var(--yk-line); }
.yk-acc-item summary {
  cursor: pointer; list-style: none; padding: 0.95rem 0;
  font-weight: 600; display: flex; justify-content: space-between; align-items: center;
}
.yk-acc-item summary::-webkit-details-marker { display: none; }
.yk-acc-item .body { color: var(--yk-muted); padding: 0 0 1rem; }
.yk-prose { color: var(--yk-muted); line-height: 1.75; max-width: 42rem; }
.yk-prose-tight { margin-bottom: 0.5rem; }
.yk-prose :where(h2,h3) { color: var(--yk-fg); font-family: Syne, Figtree, sans-serif; }
.yk-prose :where(p,ul,ol) { margin: 0 0 1rem; }
.yk-demo-note { color: var(--yk-muted); font-size: 0.85rem; margin: 0.75rem 0 0; }

.yk-sticky-buy {
  display: none; position: fixed; inset-inline: 0; bottom: 0; z-index: 30;
  padding: 0.85rem 1rem; border-top: 1px solid var(--yk-line);
  background: rgba(7,11,16,0.92); backdrop-filter: blur(12px);
  gap: 0.75rem; align-items: center; justify-content: space-between;
}
.yk-sticky-buy strong { display: block; font-size: 0.9rem; }
@media (max-width: 899px) {
  .yk-sticky-buy { display: flex; }
  .yukino-product { padding-bottom: 5.5rem; }
}

.yk-drawer-scrim {
  position: fixed; inset: 0; background: rgba(0,0,0,0.58); z-index: 50;
}
.yk-drawer {
  position: fixed; top: 0; right: 0; z-index: 60;
  width: min(100%, 26rem); height: 100%;
  background: var(--yk-panel); border-left: 1px solid var(--yk-line);
  padding: 1.25rem; display: flex; flex-direction: column; gap: 1rem;
  transform: translateX(100%); transition: transform 0.3s cubic-bezier(.22,1,.36,1);
}
.yk-drawer.is-open { transform: translateX(0); }
.yk-drawer[hidden], .yk-drawer-scrim[hidden] { display: none !important; }
.yk-drawer-head { display: flex; justify-content: space-between; align-items: center; }
.yk-drawer-head button {
  border: none; background: transparent; color: var(--yk-fg); cursor: pointer; padding: 0.35rem;
}
.yk-drawer-note { color: var(--yk-muted); font-size: 0.85rem; margin: 0; }
.yk-bag-line {
  display: grid; grid-template-columns: 1fr auto; gap: 0.35rem 0.75rem;
  padding: 0.85rem 0; border-bottom: 1px solid var(--yk-line); font-size: 0.92rem;
}
.yk-bag-line .qty { display: inline-flex; align-items: center; gap: 0.35rem; }
.yk-bag-line button {
  border: 1px solid var(--yk-line); background: transparent; color: var(--yk-fg);
  width: 1.65rem; height: 1.65rem; border-radius: 999px; cursor: pointer;
}
[data-yukino-bag-lines] { flex: 1; overflow: auto; }
.yk-bag-empty { color: var(--yk-muted); margin: 1rem 0; }

.yk-footer {
  padding: 2.5rem 1.25rem 3.25rem; display: grid; justify-items: center; gap: 0.85rem;
  border-top: 1px solid var(--yk-line); margin-top: 1rem;
}
.yk-credit { color: var(--yk-muted); font-size: 0.75rem; margin: 0; text-align: center; }
.yk-credit a { color: var(--yk-muted); }
.km-badge {
  display: inline-flex; align-items: center; gap: 0.45rem;
  color: var(--yk-muted); font-size: 0.8rem; text-decoration: none !important;
  border: 1px solid var(--yk-line); border-radius: 999px; padding: 0.35rem 0.7rem;
}
.km-badge:hover { color: var(--yk-fg); border-color: var(--yk-accent); }
.km-badge-mark, .km-badge-mark svg { width: 1rem; height: 1rem; display: block; }

[data-yukino-reveal] { opacity: 1; }
@media (prefers-reduced-motion: no-preference) {
  [data-yukino-reveal].yk-will-animate { opacity: 0; transform: translateY(18px); }
}
`;
