## The short version

```bash
npx create-kumooo
```

Pick **Self-host on my Cloudflare** or **Local first**.

## Self-host on Cloudflare

The installer creates D1, KV, R2, deploys API + renderer Workers, and deploys the dashboard to Pages.

When it finishes:

1. Open the dashboard URL
2. Sign up
3. Create one site
4. Hit the renderer workers.dev URL

Full walkthrough: [Deploy on Cloudflare](/deploy-on-cloudflare).

## Local first

```bash
cd your-folder
kumooo migrate --local
kumooo dev
```

That starts:

- API on `:8787`
- site on `:8788`
- dashboard on `:5173`

## What you get

A monorepo with:

- `apps/api`: control plane Worker
- `apps/renderer`: public site Worker
- `apps/dashboard`: the admin UI
- `packages/*`: core, db, themes, CLI

## Manual Cloudflare deploy

If you already cloned:

```bash
wrangler login
# create D1 / KV / R2, put IDs in apps/*/wrangler.jsonc
kumooo migrate
kumooo deploy
```

See [Deploy on Cloudflare](/deploy-on-cloudflare) for the guided path.

## Requirements

| Thing | Version |
|---|---|
| Node.js | 20+ |
| pnpm | 9+ |
| Cloudflare account | free tier is fine |

## Uninstalling

Two Workers, one D1 database, one KV namespace, one R2 bucket, one Pages project.
Delete them and it's gone.
