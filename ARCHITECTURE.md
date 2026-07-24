# Architecture

kumooo.js is a Next.js toolkit plus optional hosted edge URLs.

```
editors → app.kumooo.dev (dashboard) → api.kumooo.dev → D1 / email
         → create-kumooo / GitHub → self-host Workers
                                  → kumooo-dispatch → demos / user Worker (*.kumooo.site)

readers → kumooo.dev / docs.kumooo.dev
```

| Piece | Role |
|---|---|
| `apps/www` | Marketing + pricing |
| `apps/docs` | Fumadocs: Learn, setup, guides |
| `apps/dashboard` | Hosting console (email code or password) |
| `apps/api` | Auth, sites, media, posts, quotas (D1 `kumooo-hosting`) |
| `apps/dispatch` | `*.kumooo.site` gateway |
| `packages/plans` | Quotas and pricing copy |

Nimbus hosted quotas: **2 sites**, **150 MB** media. Cumulus / Stratus / Cumulonimbus defined in `@kumooo/plans`.
