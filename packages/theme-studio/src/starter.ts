import type { ThemeFiles } from "./types.js";

const shellOpen = `<!doctype html>
<html lang="{{site.language}}">
<head>
<meta charset="utf-8">
{{{head}}}
<style>{{{styles}}}</style>
</head>
<body>
<header class="site-header">
  <a class="logo" href="/">{{site.title}}</a>
  <nav>{{#nav}}<a href="{{url}}">{{title}}</a>{{/nav}}</nav>
</header>
<main>
`;

const shellClose = `
</main>
<a class="km-badge" href="https://kumooo.dev" rel="noopener">Made with Kumooo</a>
{{{clientScript}}}
</body>
</html>
`;

export function starterThemeFiles(label = "Custom theme"): ThemeFiles {
  const themeJson = JSON.stringify(
    {
      name: "custom",
      label,
      version: 1,
    },
    null,
    2,
  );

  const styles = `:root {
  --bg: #f6f3ee;
  --ink: #1a1917;
  --muted: #6b6560;
  --line: #e4ddd4;
  --accent: #2f6f5e;
  --max: 42rem;
}
* { box-sizing: border-box; }
body {
  margin: 0;
  font: 16px/1.6 "Source Serif 4", Georgia, serif;
  background: var(--bg);
  color: var(--ink);
}
a { color: var(--accent); }
.site-header, .site-footer, main {
  max-width: calc(var(--max) + 4rem);
  margin: 0 auto;
  padding: 1.25rem 1.5rem;
}
.site-header {
  display: flex; justify-content: space-between; gap: 1rem; align-items: center;
  border-bottom: 1px solid var(--line);
}
.logo { font-weight: 700; text-decoration: none; color: var(--ink); letter-spacing: -0.02em; }
nav { display: flex; gap: 1rem; flex-wrap: wrap; }
nav a { color: var(--muted); text-decoration: none; font-size: 0.92rem; }
nav a:hover { color: var(--ink); }
h1 { letter-spacing: -0.03em; line-height: 1.15; }
.muted { color: var(--muted); }
.post-list { list-style: none; padding: 0; margin: 2rem 0; }
.post-list li { padding: 1rem 0; border-top: 1px solid var(--line); }
.post-list a { text-decoration: none; color: var(--ink); font-size: 1.2rem; font-weight: 600; }
.prose img { max-width: 100%; height: auto; }
.site-footer { border-top: 1px solid var(--line); color: var(--muted); font-size: 0.9rem; }
.km-badge {
  position: fixed; right: 1rem; bottom: 1rem; z-index: 40;
  display: inline-flex; align-items: center;
  padding: 0.45rem 0.75rem; border-radius: 999px;
  background: var(--ink); color: var(--bg);
  text-decoration: none; font-size: 0.72rem; font-weight: 600;
}
`;

  const home = `${shellOpen}
<h1>{{site.title}}</h1>
<p class="muted">{{site.description}}</p>
<ul class="post-list">
{{#posts}}
  <li>
    <a href="{{url}}">{{title}}</a>
    {{#excerpt}}<p class="muted">{{excerpt}}</p>{{/excerpt}}
  </li>
{{/posts}}
</ul>
${shellClose}`;

  const article = `${shellOpen}
<article>
  <h1>{{title}}</h1>
  {{#excerpt}}<p class="muted">{{excerpt}}</p>{{/excerpt}}
  <div class="prose">{{{bodyHtml}}}</div>
</article>
${shellClose}`;

  const archive = `${shellOpen}
<h1>{{title}}</h1>
<ul class="post-list">
{{#posts}}
  <li><a href="{{url}}">{{title}}</a></li>
{{/posts}}
</ul>
${shellClose}`;

  const notFound = `${shellOpen}
<h1>Not found</h1>
<p class="muted">That page is not here.</p>
<p><a href="/">Home</a></p>
${shellClose}`;

  return {
    "theme.json": themeJson,
    "styles.css": styles,
    "templates/home.html": home,
    "templates/post.html": article,
    "templates/page.html": article,
    "templates/archive.html": archive,
    "templates/notFound.html": notFound,
  };
}
