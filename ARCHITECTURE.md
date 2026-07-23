# Architecture

kumooo.js is a Next.js toolkit plus optional hosted edge URLs.

```
editors ──�?app.kumooo.dev (dashboard) ──�?api.kumooo.dev ──�?D1 / email
         └─�?create-kumooo / GitHub ──�?self-host Workers
                                     └─�?kumooo-dispatch ──�?user Worker (*.kumooo.site)

readers ──�?kumooo.dev / docs.kumooo.dev
```

| Piece | Role |
|---|---|
| `apps/www` | Marketing + pricing |
| `apps/docs` | Fumadocs: Learn, setup, guides |
| `apps/dashboard` | Magic-link hosting console |
| `apps/api` | Auth, sites, quotas (D1 `kumooo-hosting`) |
| `apps/dispatch` | Workers for Platforms dynamic dispatch |
| `packages/plans` | Quotas and pricing copy |

Free hosted quotas: **2 sites**, **150 MB** media. Pro / Team / Scale defined in `@kumooo/plans`.
