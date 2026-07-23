# kumooo.js

**Websites shouldn't need babysitting.**

**kumooo.js** is a framework toolkit on **Next.js** for blank apps, blogs, shops, or your own shape. Serious React UI. Open source first. Hosted on **Cloudflare Workers** (OpenNext). Hosted multi-tenant manage comes later.

```bash
npx create-kumooo
```

Pick **blank**, **blog**, or **shop**. Or open [kumooo.dev](https://kumooo.dev) and hit **Deploy on Cloudflare** / **Guided setup**.

## What you get

- **Built on Next.js App Router**, not a Next fork. Kumooo owns conventions, starters, CLI, and UI.
- **`@kumooo/ui`**: shadcn-style primitives, Kibo-ready registry, Radix Icons, Framer Motion.
- **Starters**: blank / blog / shop.
- **`apps/www`**: marketing + Learn + setup at kumooo.dev.
- **`apps/docs`**: Fumadocs reference at docs.kumooo.dev.
- **Open source** you run yourself. Hosted WP.com-style is a later phase.

## Repository

| Path | What |
|---|---|
| `apps/www` | Marketing site (kumooo.dev) |
| `apps/docs` | Docs (docs.kumooo.dev) |
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
pnpm dev:docs     # apps/docs
pnpm dev:blank    # blank starter
```

## Deploy (maintainers)

```bash
pnpm deploy:www    # Worker kumooo-www → kumooo.dev
pnpm deploy:docs   # Worker kumooo-docs → docs.kumooo.dev
```

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
