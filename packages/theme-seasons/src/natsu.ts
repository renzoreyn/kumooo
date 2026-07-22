import { createSeasonTheme } from "./shared.js";

const css = `
:root {
  --bg: #f2f7fb;
  --fg: #0d1b24;
  --muted: #5a6f7c;
  --line: #d3e0e8;
  --accent: #0b6e99;
  --hot: #e4572e;
  --card: #ffffff;
  --max: 46rem;
  --display: "Space Grotesk", "Avenir Next", system-ui, sans-serif;
  --body: "IBM Plex Sans", "Segoe UI", sans-serif;
  color-scheme: light dark;
}
@media (prefers-color-scheme: dark) {
  :root {
    --bg: #0a1218;
    --fg: #e8f1f6;
    --muted: #8aa0ae;
    --line: #1e2c36;
    --accent: #4eb6e0;
    --hot: #ff7a59;
    --card: #101a22;
  }
}
* { box-sizing: border-box; }
body {
  margin: 0;
  font: 17px/1.65 var(--body);
  color: var(--fg);
  background:
    linear-gradient(180deg, color-mix(in srgb, var(--accent) 8%, transparent), transparent 28%),
    radial-gradient(circle at 100% 0%, color-mix(in srgb, var(--hot) 16%, transparent), transparent 40%),
    var(--bg);
}
a { color: var(--accent); }
a:hover { color: var(--hot); }
.wrap { max-width: var(--max); margin: 0 auto; padding: 2rem 1.35rem 4rem; }
.site-header {
  display: flex; justify-content: space-between; align-items: center;
  gap: 1rem; margin-bottom: 2.5rem; flex-wrap: wrap;
}
.logo {
  font-family: var(--display); font-weight: 700; font-size: 1.2rem;
  letter-spacing: -0.04em; color: var(--fg); text-decoration: none;
}
nav { display: flex; gap: 1rem; flex-wrap: wrap; }
nav a {
  color: var(--muted); font-size: 0.9rem; font-weight: 500;
  text-decoration: none; padding: 0.35rem 0.55rem; border-radius: 6px;
}
nav a:hover { background: color-mix(in srgb, var(--accent) 12%, transparent); color: var(--fg); }
.eyebrow {
  display: inline-block; font-size: 0.72rem; letter-spacing: 0.2em;
  text-transform: uppercase; font-weight: 700; color: var(--hot); margin: 0 0 0.75rem;
}
.hero h1 {
  font-family: var(--display); font-weight: 700;
  font-size: clamp(2.5rem, 7vw, 3.6rem); letter-spacing: -0.045em;
  line-height: 1.02; margin: 0 0 0.85rem; max-width: 14ch;
}
.lede { font-size: 1.12rem; max-width: 36rem; margin: 0 0 2.25rem; }
.muted { color: var(--muted); }
.post-list {
  display: grid; gap: 1rem;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
}
.post-card {
  background: var(--card); border: 1px solid var(--line);
  border-radius: 14px; padding: 1.2rem 1.25rem;
  box-shadow: 0 10px 30px color-mix(in srgb, var(--accent) 6%, transparent);
}
.post-card h2 {
  font-family: var(--display); font-size: 1.25rem; font-weight: 700;
  letter-spacing: -0.03em; margin: 0 0 0.4rem;
}
.post-card h2 a { color: var(--fg); text-decoration: none; }
.post-card h2 a:hover { color: var(--accent); }
.prose h1 {
  font-family: var(--display); font-size: clamp(2.1rem, 5vw, 3rem);
  letter-spacing: -0.04em; line-height: 1.1; margin: 0 0 1.2rem;
}
.prose pre {
  background: var(--card); border: 1px solid var(--line);
  padding: 1rem; overflow-x: auto; border-radius: 12px;
}
.prose code { font-family: "IBM Plex Mono", ui-monospace, monospace; font-size: 0.9em; }
.site-footer {
  margin-top: 3.5rem; padding-top: 1.25rem; border-top: 1px solid var(--line);
  color: var(--muted); font-size: 0.88rem;
}
`;

export const natsuTheme = createSeasonTheme({
  name: "natsu",
  label: "Natsu - summer coastal theme",
  css,
  fontStylesheet:
    "https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:ital,wght@0,400;0,500;0,600;1,400&family=Space+Grotesk:wght@500;700&display=swap",
});
