import { createSeasonTheme } from "./shared.js";

const css = `
:root {
  --bg: #eef1f5;
  --fg: #10141c;
  --muted: #5c6678;
  --line: #cfd6e2;
  --accent: #3d5afe;
  --card: #ffffff;
  --max: 42rem;
  --display: "Syne", "Avenir Next", system-ui, sans-serif;
  --body: "IBM Plex Sans", "Segoe UI", sans-serif;
  --mono: "IBM Plex Mono", ui-monospace, monospace;
  color-scheme: light dark;
}
@media (prefers-color-scheme: dark) {
  :root {
    --bg: #0b0e14;
    --fg: #e7ebf3;
    --muted: #8b95a8;
    --line: #222836;
    --accent: #8ab4ff;
    --card: #121722;
  }
}
* { box-sizing: border-box; }
body {
  margin: 0;
  font: 16.5px/1.65 var(--body);
  color: var(--fg);
  background:
    linear-gradient(135deg, color-mix(in srgb, var(--accent) 7%, transparent), transparent 42%),
    var(--bg);
}
a { color: var(--accent); text-decoration: none; }
a:hover { text-decoration: underline; text-underline-offset: 0.15em; }
.wrap { max-width: var(--max); margin: 0 auto; padding: 2rem 1.2rem 4rem; }
.site-header {
  display: flex; justify-content: space-between; align-items: center;
  gap: 1rem; margin-bottom: 2.5rem; flex-wrap: wrap;
  padding: 0.85rem 1rem; background: var(--card);
  border: 1px solid var(--line); border-radius: 12px;
}
.logo {
  font-family: var(--display); font-weight: 700; font-size: 1.05rem;
  letter-spacing: -0.03em; color: var(--fg); text-decoration: none;
}
nav { display: flex; gap: 0.85rem; flex-wrap: wrap; }
nav a {
  color: var(--muted); font-size: 0.82rem; font-family: var(--mono);
  letter-spacing: 0.02em; text-decoration: none;
}
nav a:hover { color: var(--fg); }
.eyebrow {
  font-family: var(--mono); font-size: 0.72rem; letter-spacing: 0.16em;
  text-transform: uppercase; color: var(--muted); margin: 0 0 0.7rem;
}
.hero h1 {
  font-family: var(--display); font-weight: 700;
  font-size: clamp(2.3rem, 6vw, 3.3rem); letter-spacing: -0.04em;
  line-height: 1.05; margin: 0 0 0.8rem;
}
.lede { font-size: 1.05rem; max-width: 34rem; margin: 0 0 2.25rem; }
.muted { color: var(--muted); }
.post-list { display: grid; gap: 0.75rem; }
.post-card {
  padding: 1.1rem 1.15rem; border: 1px solid var(--line);
  border-radius: 10px; background: var(--card);
}
.post-card h2 {
  font-family: var(--display); font-size: 1.2rem; font-weight: 700;
  letter-spacing: -0.025em; margin: 0 0 0.35rem;
}
.post-card h2 a { color: var(--fg); text-decoration: none; }
.post-card h2 a:hover { color: var(--accent); }
.prose h1 {
  font-family: var(--display); font-size: clamp(2rem, 4.5vw, 2.7rem);
  letter-spacing: -0.035em; line-height: 1.1; margin: 0 0 1.15rem;
}
.prose pre {
  background: var(--card); border: 1px solid var(--line);
  padding: 1rem; overflow-x: auto; border-radius: 10px;
}
.prose code { font-family: var(--mono); font-size: 0.88em; }
.site-footer {
  margin-top: 3.5rem; padding-top: 1.25rem; border-top: 1px solid var(--line);
  color: var(--muted); font-size: 0.82rem; font-family: var(--mono);
}
`;

export const fuyuTheme = createSeasonTheme({
  name: "fuyu",
  label: "Fuyu - winter crisp theme",
  css,
  fontStylesheet:
    "https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500&family=IBM+Plex+Sans:ital,wght@0,400;0,500;1,400&family=Syne:wght@700&display=swap",
});
