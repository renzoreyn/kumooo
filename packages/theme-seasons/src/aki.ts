import { createSeasonTheme } from "./shared.js";

const css = `
:root {
  --bg: #f3ebe1;
  --fg: #2a1f14;
  --muted: #7a6550;
  --line: #ddcbb6;
  --accent: #a14a12;
  --card: #faf4ec;
  --max: 38rem;
  --display: "Libre Baskerville", "Palatino Linotype", Palatino, serif;
  --body: "Source Sans 3", "Segoe UI", sans-serif;
  color-scheme: light dark;
}
@media (prefers-color-scheme: dark) {
  :root {
    --bg: #1a1410;
    --fg: #f0e6d8;
    --muted: #b09a82;
    --line: #3a2e24;
    --accent: #e08a45;
    --card: #241c16;
  }
}
* { box-sizing: border-box; }
body {
  margin: 0;
  font: 18px/1.75 var(--body);
  color: var(--fg);
  background:
    radial-gradient(ellipse 60% 35% at 50% -5%, color-mix(in srgb, var(--accent) 18%, transparent), transparent),
    var(--bg);
}
a { color: var(--accent); text-decoration-thickness: 1px; text-underline-offset: 0.2em; }
.wrap { max-width: var(--max); margin: 0 auto; padding: 2.75rem 1.25rem 5rem; }
.site-header {
  display: flex; justify-content: space-between; align-items: baseline;
  gap: 1rem; margin-bottom: 3rem; flex-wrap: wrap;
}
.logo {
  font-family: var(--display); font-size: 1.15rem; font-weight: 700;
  color: var(--fg); text-decoration: none; letter-spacing: -0.01em;
}
nav { display: flex; gap: 1.25rem; flex-wrap: wrap; }
nav a { color: var(--muted); font-size: 0.95rem; text-decoration: none; }
nav a:hover { color: var(--accent); }
.eyebrow {
  font-size: 0.78rem; letter-spacing: 0.14em; text-transform: uppercase;
  color: var(--accent); margin: 0 0 0.85rem; font-weight: 600;
}
.hero h1 {
  font-family: var(--display); font-weight: 700;
  font-size: clamp(2.2rem, 5vw, 3rem); line-height: 1.2;
  margin: 0 0 1rem; letter-spacing: -0.02em;
}
.lede { font-size: 1.15rem; margin: 0 0 2.75rem; max-width: 32rem; }
.muted { color: var(--muted); }
.post-list { display: grid; gap: 0; }
.post-card {
  padding: 1.6rem 0;
  border-bottom: 1px solid var(--line);
}
.post-card:first-child { border-top: 1px solid var(--line); }
.post-card h2 {
  font-family: var(--display); font-size: 1.5rem; font-weight: 700;
  margin: 0 0 0.45rem; line-height: 1.3;
}
.post-card h2 a { color: var(--fg); text-decoration: none; }
.post-card h2 a:hover { color: var(--accent); }
.prose h1 {
  font-family: var(--display); font-size: clamp(2rem, 4vw, 2.6rem);
  line-height: 1.25; margin: 0 0 1.4rem;
}
.prose pre {
  background: var(--card); border: 1px solid var(--line);
  padding: 1rem; overflow-x: auto; border-radius: 4px;
}
.prose code { font-family: "IBM Plex Mono", ui-monospace, monospace; font-size: 0.88em; }
.site-footer {
  margin-top: 4.5rem; padding-top: 1.5rem; border-top: 1px solid var(--line);
  color: var(--muted); font-size: 0.9rem; font-style: italic;
}
`;

export const akiTheme = createSeasonTheme({
  name: "aki",
  label: "Aki - autumn editorial theme",
  css,
  fontStylesheet:
    "https://fonts.googleapis.com/css2?family=Libre+Baskerville:ital,wght@0,400;0,700;1,400&family=Source+Sans+3:ital,wght@0,400;0,600;1,400&display=swap",
});
