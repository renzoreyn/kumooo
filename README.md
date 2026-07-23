# kumooo.js

**Websites shouldn't need babysitting.**

**kumooo.js** is a framework toolkit on **Next.js** for any kind of site: blank app, blog, shop, or your own shape. Serious React UI. Open source first. Hosted multi-tenant and Cloudflare controls come later.

```bash
npx create-kumooo
```

Pick **blank**, **blog**, or **shop**. Or open the marketing site and hit **Deploy on Vercel** / **Guided setup**.

## What you get

- **Built on Next.js App Router** — not a Next fork. Kumooo owns conventions, starters, CLI, and UI.
- **`@kumooo/ui`** — shadcn-style primitives, Kibo-ready registry, Radix Icons, Framer Motion (`FadeIn`, `Stagger`, …).
- **Starters** — blank / blog / shop.
- **`apps/www`** — official marketing + Learn + setup (this is what deploys to kumooo.dev).
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

## Deploy the marketing site (Ren / maintainers)

1. Push to GitHub (`renzoreyn/kumooo`).
2. In Vercel: **Import** this repo.
3. Set **Root Directory** to `apps/www`.
4. Deploy. No env vars required for v1.
5. Point `kumooo.dev` when ready.

## Deploy a starter (end users)

Prefer the **Deploy on Vercel** button on the site, or:

```bash
npx create-kumooo
```

The Deploy Button clones this monorepo with Root Directory `starters/blank` and monorepo install/build commands. Login/register happens on Vercel.

## Identity

- Built by [Ren](https://renzoreyn.dev)
- GitHub: [github.com/renzoreyn/kumooo](https://github.com/renzoreyn/kumooo)
- Email: [contact@renzoreyn.dev](mailto:contact@renzoreyn.dev)

## License

MIT.
