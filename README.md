# kumooo.js

**Websites shouldn't need babysitting.**

**kumooo.js** is a framework toolkit on **Next.js** for any kind of site: blank app, blog, shop, or your own shape. Serious React UI. Open source first. Hosted on **Cloudflare Workers** (OpenNext). Hosted multi-tenant manage comes later.

```bash
npx create-kumooo
```

Pick **blank**, **blog**, or **shop**. Or open the marketing site and hit **Deploy on Cloudflare** / **Guided setup**.

## What you get

- **Built on Next.js App Router** — not a Next fork. Kumooo owns conventions, starters, CLI, and UI.
- **`@kumooo/ui`** — shadcn-style primitives, Kibo-ready registry, Radix Icons, Framer Motion (`FadeIn`, `Stagger`, …).
- **Starters** — blank / blog / shop.
- **`apps/www`** — official marketing + Learn + setup (deploys to Cloudflare Workers).
- **Open source** you run yourself. Hosted WP.com-style is a later phase.

## Repository

| Path | What |
|---|---|
| `apps/www` | Marketing site (kumooo.dev) |
| `packages/ui` | `@kumooo/ui` |
| `packages/framework` | Shared conventions |
| `packages/create-kumooo` | `npx create-kumooo` |
| `starters/blank` | Minimal starter |
| `starters/blog` | Blog starter |
| `starters/shop` | Shop starter (demo bag) |

## Development

```bash
pnpm install
pnpm dev          # apps/www
pnpm dev:blank    # blank starter
```

## Deploy the marketing site (maintainers)

```bash
pnpm --filter @kumooo/www deploy
```

Uses `@opennextjs/cloudflare` → Worker name `kumooo-www`. Then attach `kumooo.dev` as a custom domain in the Cloudflare dashboard (Workers → kumooo-www → Domains).

## Deploy a starter (end users)

Prefer the **Deploy on Cloudflare** button on the site, or:

```bash
npx create-kumooo
```

Login/register happens on Cloudflare. Monorepo `workspace:*` packages mean Guided setup is still the most reliable path until we publish `@kumooo/ui` to npm.

## Identity

- Built by [Ren](https://renzoreyn.dev)
- GitHub: [github.com/renzoreyn/kumooo](https://github.com/renzoreyn/kumooo)
- Email: [contact@renzoreyn.dev](mailto:contact@renzoreyn.dev)

## License

MIT.
