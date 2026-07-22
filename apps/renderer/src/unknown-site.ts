/** HTML shown when a hostname hits the renderer but no site matches. */
export function unknownSitePage(host: string): string {
  const slugGuess = host.endsWith(".kumooo.dev")
    ? host.slice(0, -".kumooo.dev".length)
    : null;
  const hint =
    slugGuess && slugGuess !== "www" && !slugGuess.includes(".")
      ? `Nothing is published at <strong>${escape(slugGuess)}.kumooo.dev</strong> yet.`
      : "Nothing is published at this address yet.";

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>No site here - Kumooo</title>
<meta name="robots" content="noindex">
<link rel="icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Crect width='32' height='32' rx='7' fill='%23101218'/%3E%3Ctext x='16' y='21.5' text-anchor='middle' font-family='ui-monospace,SFMono-Regular,Menlo,Consolas,monospace' font-size='13' font-weight='700' fill='%236ee7b7'%3Ek.%3C/text%3E%3C/svg%3E" type="image/svg+xml">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700&family=IBM+Plex+Mono:wght@400;500&display=swap">
<style>
:root {
  --bg: #101218;
  --fg: #f3f1ea;
  --muted: #9a968c;
  --line: #262b37;
  --accent: #6ee7b7;
  --accent-ink: #06261c;
}
* { box-sizing: border-box; }
body {
  margin: 0;
  min-height: 100vh;
  font: 16px/1.55 Sora, "Segoe UI", sans-serif;
  color: var(--fg);
  background:
    radial-gradient(ellipse 70% 50% at 85% -10%, rgba(110,231,183,.14), transparent 55%),
    radial-gradient(ellipse 50% 40% at 0% 80%, rgba(147,197,253,.07), transparent 50%),
    var(--bg);
  display: grid;
  place-items: center;
  padding: 2rem 1.25rem;
}
.wrap { width: min(34rem, 100%); }
.logo {
  font-weight: 700;
  letter-spacing: -0.04em;
  font-size: 1.15rem;
  text-decoration: none;
  color: var(--fg);
}
.logo span { color: var(--accent); }
h1 {
  margin: 1.5rem 0 0.65rem;
  font-size: clamp(1.7rem, 5vw, 2.2rem);
  letter-spacing: -0.035em;
  line-height: 1.15;
}
p { margin: 0 0 1rem; color: var(--muted); }
p strong { color: var(--fg); font-weight: 600; }
.actions { display: flex; flex-wrap: wrap; gap: 0.65rem; margin-top: 1.4rem; }
.btn {
  display: inline-flex;
  align-items: center;
  padding: 0.55rem 1.05rem;
  border-radius: 999px;
  font-weight: 600;
  font-size: 0.92rem;
  text-decoration: none;
  border: 1px solid var(--line);
  color: var(--fg);
}
.btn:hover { border-color: var(--accent); }
.btn.primary {
  background: var(--accent);
  color: var(--accent-ink);
  border-color: var(--accent);
}
.fine {
  margin-top: 2rem;
  font: 0.8rem/1.45 "IBM Plex Mono", ui-monospace, monospace;
  color: var(--muted);
}
.fine a { color: var(--accent); }
</style>
</head>
<body>
  <div class="wrap">
    <a class="logo" href="https://kumooo.dev">k<span>.</span></a>
    <h1>No site at this address.</h1>
    <p>${hint}</p>
    <p>Kumooo is a publishing platform on Cloudflare. Write in Markdown, pick a theme, ship from the edge.</p>
    <div class="actions">
      <a class="btn primary" href="https://dash.kumooo.dev/signup">Create a site</a>
      <a class="btn" href="https://docs.kumooo.dev/getting-started">Read the docs</a>
    </div>
    <p class="fine">Looking for the product? <a href="https://kumooo.dev">kumooo.dev</a></p>
  </div>
</body>
</html>`;
}

function escape(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}
