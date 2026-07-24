/**
 * Host gateway for `{slug}.kumooo.site`.
 * Known starter demos are proxied via service bindings.
 * Workers for Platforms (DISPATCHER) is optional for user sites later.
 */
const SITE_SUFFIX = "kumooo.site";

const DEMO_SLUGS = {
  blank: "DEMO_BLANK",
  blog: "DEMO_BLOG",
  shop: "DEMO_SHOP",
} as const;

export interface Env {
  DISPATCHER?: DispatchNamespace;
  SITE_SUFFIX?: string;
  DEMO_BLANK?: Fetcher;
  DEMO_BLOG?: Fetcher;
  DEMO_SHOP?: Fetcher;
}

interface DispatchNamespace {
  get(name: string): Fetcher;
}

function slugFromHost(hostname: string, suffix: string): string | null {
  const host = hostname.toLowerCase();
  const s = suffix.toLowerCase();
  if (host === s) return null;
  if (!host.endsWith(`.${s}`)) return null;
  const slug = host.slice(0, -(s.length + 1));
  if (!slug || slug.includes(".")) return null;
  if (!/^[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?$/.test(slug)) return null;
  return slug;
}

function htmlPage(title: string, body: string, status = 200): Response {
  const html = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${title}</title>
  <link rel="icon" href="https://kumooo.dev/favicon.svg" />
  <style>
    :root { color-scheme: dark; }
    * { box-sizing: border-box; }
    body {
      margin: 0; min-height: 100vh; display: grid; place-items: center;
      font-family: ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif;
      background:
        radial-gradient(ellipse 80% 50% at 50% -10%, rgba(110, 231, 183, 0.12), transparent 55%),
        #0c0c0e;
      color: #f5f5f7;
    }
    main { max-width: 26rem; padding: 2rem 1.25rem; text-align: center; }
    .mark { width: 40px; height: 40px; margin: 0 auto 1rem; }
    .brand { font-size: 15px; font-weight: 600; letter-spacing: -0.02em; margin: 0 0 1.5rem; }
    .brand span { color: #6ee7b7; }
    h1 { font-size: 1.65rem; letter-spacing: -0.03em; margin: 0 0 0.75rem; font-weight: 600; }
    p { color: #a1a1a6; line-height: 1.6; margin: 0; font-size: 15px; }
    code {
      font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
      color: #6ee7b7; font-size: 0.92em;
    }
    .actions { display: flex; flex-wrap: wrap; gap: 0.75rem; justify-content: center; margin-top: 1.75rem; }
    a.btn {
      display: inline-flex; align-items: center; justify-content: center;
      text-decoration: none; font-size: 14px; font-weight: 600; letter-spacing: -0.01em;
      padding: 0.7rem 1.2rem; border-radius: 999px;
    }
    a.btn-primary { background: #f5f5f7; color: #0c0c0e; }
    a.btn-ghost { color: #f5f5f7; border: 1px solid rgba(245,245,247,0.14); }
    a.btn-ghost:hover { background: rgba(245,245,247,0.06); }
  </style>
</head>
<body>
  <main>
    <img class="mark" src="https://kumooo.dev/brand-mark.png" width="40" height="40" alt="" />
    <p class="brand">kumooo<span>.js</span></p>
    ${body}
  </main>
</body>
</html>`;
  return new Response(html, {
    status,
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}

function apexPage(suffix: string): Response {
  return htmlPage(
    "kumooo hosting",
    `<h1>Sites live here</h1>
     <p>Each project gets <code>{slug}.${suffix}</code>. Empty apex. Nothing to see. On purpose.</p>
     <div class="actions">
       <a class="btn btn-primary" href="https://app.kumooo.dev">Dashboard</a>
       <a class="btn btn-ghost" href="https://kumooo.dev">kumooo.dev</a>
     </div>`,
  );
}

function unavailablePage(slug: string): Response {
  return htmlPage(
    `${slug} · 404`,
    `<h1><code>${slug}</code> is not here</h1>
     <p>Nobody deployed this slug. It might be free. Claim it in the dashboard, or pick another name and move on.</p>
     <div class="actions">
       <a class="btn btn-primary" href="https://app.kumooo.dev/sites/new?slug=${encodeURIComponent(slug)}">Claim ${slug}</a>
       <a class="btn btn-ghost" href="https://kumooo.dev">What is kumooo</a>
     </div>`,
    404,
  );
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const suffix = env.SITE_SUFFIX ?? SITE_SUFFIX;
    const slug = slugFromHost(url.hostname, suffix);

    if (!slug) {
      return apexPage(suffix);
    }

    const demoKey = DEMO_SLUGS[slug as keyof typeof DEMO_SLUGS];
    if (demoKey) {
      const demo = env[demoKey];
      if (demo) {
        return demo.fetch(request);
      }
    }

    if (env.DISPATCHER) {
      try {
        const userWorker = env.DISPATCHER.get(slug);
        return await userWorker.fetch(request);
      } catch {
        return unavailablePage(slug);
      }
    }

    return unavailablePage(slug);
  },
};
