# Kumooo / kumooo.js

**Websites shouldn't need babysitting.**

Kumooo is becoming **kumooo.js**: a framework-first toolkit on **Next.js** for any kind of site (blank app, blog, shop), with a serious React UI kit and (soon) Cloudflare controls + hosted multi-tenant.

```bash
npx create-kumooo
```

Pick **blank**, **blog**, or **shop**.

## What you get (now)

- **Built on Next.js App Router** — not a literal Next fork. Kumooo owns conventions, starters, CLI, and UI.
- **`@kumooo/ui`** — shadcn-style primitives, Kibo-ready registry, Radix Icons, Framer Motion (`FadeIn`, `Stagger`, …).
- **Starters** that prove versatility — blank / blog / shop.
- **Open source first** (WP.org path). Hosted WP.com-style multi-tenant is a later phase.

## Legacy CMS (sunset)

The Cloudflare Workers + D1 publishing CMS is **frozen**. See [LEGACY.md](./LEGACY.md).

No new CMS themes or CMS features. Existing `*.kumooo.dev` CMS sites may stay up during a short sunset window.

## Repository

| Path | What |
|---|---|
| `packages/ui` | `@kumooo/ui` design system |
| `packages/framework` | Shared kumooo.js conventions |
| `packages/create-kumooo` | `npx create-kumooo` |
| `starters/blank` | Minimal starter |
| `starters/blog` | Blog starter |
| `starters/shop` | Shop starter (demo bag) |
| `apps/*`, `packages/theme-*`, `packages/db`, `packages/core` | **Legacy CMS** (frozen) |

## Development

```bash
pnpm install
pnpm --filter @kumooo/starter-blank dev
```

Build the create CLI (syncs starter templates):

```bash
pnpm --filter create-kumooo build
```

## Identity

- Built by [Ren](https://renzoreyn.dev)
- GitHub: [github.com/renzoreyn/kumooo](https://github.com/renzoreyn/kumooo)
- Email: [contact@renzoreyn.dev](mailto:contact@renzoreyn.dev)

## License

MIT.
