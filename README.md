# Kumooo

**Websites shouldn't need babysitting.**

Kumooo is a publishing platform built for Cloudflare.
Your content lives in D1. Media in R2. Pages render in a Worker a few milliseconds from every reader.
There is no VPS to patch. No PHP to upgrade. No 3 a.m. "site down" pager, because there is no server.

```bash
npx create-kumooo
```

## What you get

- **Fast sites by default.** Server-rendered HTML at the edge, cached hard. Zero mandatory client-side JavaScript unless a theme opts in.
- **A real CMS.** Posts, pages, drafts, revisions, tags, media, custom fields.
- **Themes with teeth.** Plain HTML themes, or interactive React themes with Framer Motion, Lucide, and Radix.
- **Your Cloudflare account.** Multi-tenant orgs and sites. Custom domains when you want them.
- **A dashboard.** Sign up, write Markdown, publish. No curl required.
- **A CLI that likes you.** `kumooo doctor` tells you what's wrong in English.

Marketing (`kumooo.dev`) and docs (`docs.kumooo.dev`) run on Kumooo itself.
We dogfood the product. On purpose.

## Repository

| Path | What |
|---|---|
| `apps/api` | Control-plane Worker |
| `apps/renderer` | Data-plane Worker (published sites) |
| `apps/dashboard` | Admin UI (React) |
| `packages/core` | Domain logic, schemas, markdown, SEO |
| `packages/db` | Drizzle schema + migrations |
| `packages/theme-*` | Marketing, docs, seasons, studio themes |
| `packages/cli` | `kumooo` CLI |
| `packages/create-kumooo` | `npx create-kumooo` |
| `content/docs` | Docs source (seeded into the docs site) |
| `content/seasons` | Live season demo sites (`haru` / `natsu` / `aki` / `fuyu`) |

## Development

```bash
pnpm install
pnpm --filter @kumooo/cli build
pnpm exec kumooo migrate --local
pnpm exec kumooo dev
```

Then seed official content (optional):

```bash
KUMOOO_API=http://127.0.0.1:8787 \
KUMOOO_EMAIL=you@example.com \
KUMOOO_PASSWORD='a long passphrase' \
node scripts/seed-official.mjs
```

## Identity

- Built by [Ren](https://renzoreyn.dev)
- GitHub: [github.com/renzoreyn/kumooo](https://github.com/renzoreyn/kumooo)
- Email: [contact@renzoreyn.dev](mailto:contact@renzoreyn.dev)

## License

MIT.
