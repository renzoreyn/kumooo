# Installation

## The short version

```bash
npx create-kumooo
```

Answer the prompts. Done.

## What you get

A monorepo with:

- `apps/api`: control plane Worker
- `apps/renderer`: public site Worker
- `apps/dashboard`: the admin UI
- `packages/*`: core, db, themes, CLI

## Cloudflare deploy

```bash
wrangler login
kumooo migrate
kumooo deploy
```

Fill real D1 / KV / R2 IDs into `apps/api/wrangler.jsonc` and `apps/renderer/wrangler.jsonc` before production deploy.
`kumooo create` and `wrangler` will print those IDs when you create resources.

## Requirements

| Thing | Version |
|---|---|
| Node.js | 20+ |
| pnpm | 9+ |
| Cloudflare account | free tier is fine |

## Uninstalling

Two workers, one D1 database, one KV namespace, one R2 bucket.
Delete them and it's gone.
