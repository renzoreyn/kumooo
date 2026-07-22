import { createSeasonTheme } from "./shared.js";

const css = `
:root {
  --bg: #f6f1ea;
  --fg: #1e1a17;
  --muted: #6f655c;
  --line: #e4d9cc;
  --accent: #3d6b55;
  --card: #fffaf4;
  --max: 40rem;
  --display: "Fraunces", "Iowan Old Style", Georgia, serif;
  --body: "DM Sans", "Segoe UI", sans-serif;
  color-scheme: light dark;
}
@media (prefers-color-scheme: dark) {
  :root {
    --bg: #161412;
    --fg: #f3ece4;
    --muted: #a89a8c;
    --line: #2e2924;
    --accent: #7dba98;
    --card: #1f1b18;
  }
}
* { box-sizing: border-box; }
body {
  margin: 0;
  font: 17px/1.7 var(--body);
  color: var(--fg);
  background:
    radial-gradient(ellipse 70% 45% at 85% -5%, color-mix(in srgb, #d4a5b0 22%, transparent), transparent),
    radial-gradient(ellipse 55% 40% at 0% 10%, color-mix(in srgb, var(--accent) 14%, transparent), transparent),
    var(--bg);
}
a { color: var(--accent); text-decoration-thickness: 1px; text-underline-offset: 0.18em; }
a:hover { text-decoration: none; }
.wrap { max-width: var(--max); margin: 0 auto; padding: 2.25rem 1.25rem 4.5rem; }
.site-header {
  display: flex; justify-content: space-between; align-items: baseline;
  gap: 1rem; margin-bottom: 2.75rem; flex-wrap: wrap;
  padding-bottom: 1rem; border-bottom: 1px solid var(--line);
}
.logo {
  font-family: var(--display); font-weight: 600; font-size: 1.35rem;
  color: var(--fg); letter-spacing: -0.03em; text-decoration: none;
}
nav { display: flex; gap: 1.1rem; flex-wrap: wrap; }
nav a { color: var(--muted); font-size: 0.92rem; text-decoration: none; }
nav a:hover { color: var(--fg); }
.eyebrow {
  font-size: 0.75rem; letter-spacing: 0.18em; text-transform: uppercase;
  color: var(--accent); margin: 0 0 0.65rem; font-weight: 600;
}
.hero h1 {
  font-family: var(--display); font-weight: 550;
  font-size: clamp(2.4rem, 6vw, 3.4rem); letter-spacing: -0.035em;
  line-height: 1.08; margin: 0 0 0.75rem;
}
.lede { font-size: 1.1rem; max-width: 34rem; margin: 0 0 2.5rem; }
.muted { color: var(--muted); }
.post-list { display: grid; gap: 0; }
.post-card { padding: 1.35rem 0; border-top: 1px solid var(--line); }
.post-card h2 {
  font-family: var(--display); font-size: 1.45rem; font-weight: 550;
  letter-spacing: -0.02em; margin: 0 0 0.35rem;
}
.post-card h2 a { color: var(--fg); text-decoration: none; }
.post-card h2 a:hover { color: var(--accent); }
.prose h1 {
  font-family: var(--display); font-size: clamp(2rem, 4.5vw, 2.75rem);
  letter-spacing: -0.03em; line-height: 1.15; margin: 0 0 1.25rem;
}
.prose pre {
  background: var(--card); border: 1px solid var(--line);
  padding: 1rem; overflow-x: auto; border-radius: 10px;
}
.prose code { font-family: "IBM Plex Mono", ui-monospace, monospace; font-size: 0.9em; }
.site-footer {
  margin-top: 4rem; padding-top: 1.5rem; border-top: 1px solid var(--line);
  color: var(--muted); font-size: 0.9rem;
}
`;

export const haruTheme = createSeasonTheme({
  name: "haru",
  label: "Haru - spring reading theme",
  css,
  fontStylesheet:
    "https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,600;1,9..40,400&family=Fraunces:opsz,wght@9..144,500;9..144,600&display=swap",
});
