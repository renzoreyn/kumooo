# kumooo.js

**Websites shouldn't need babysitting.**

**kumooo.js** is a framework toolkit on **Next.js** for blank apps, blogs, shops, or your own shape. Serious React UI. Open source first. Deploy on your Cloudflare account, or host with us at `{slug}.kumooo.site`.

```bash
npx create-kumooo
```

Pick **blank**, **blog**, or **shop**. Or open [kumooo.dev](https://kumooo.dev).

## What you get

- **Built on Next.js App Router**, not a Next fork.
- **`@kumooo/ui`** and **`@kumooo/plans`** (Nimbus: 2 sites, 150 MB; Cumulus/Stratus priced on site).
- **Starters**: blank / blog / shop.
- **`apps/www`**: marketing + pricing (kumooo.dev)
- **`apps/docs`**: Learn, setup, guides (docs.kumooo.dev)
- **`apps/dashboard`**: email OTP hosting console (app.kumooo.dev)
- **`apps/api`**: auth + sites API (api.kumooo.dev)
- **`apps/dispatch`**: `{slug}.kumooo.site` gateway

## Development

```bash
pnpm install
pnpm dev              # marketing
pnpm dev:docs
pnpm dev:dashboard
pnpm dev:api
```

## Deploy (maintainers)

```bash
pnpm deploy:www
pnpm deploy:docs
pnpm deploy:api
pnpm deploy:dashboard
pnpm deploy:dispatch
```

## Versioning

Semantic versioning. Root `package.json` + [CHANGELOG.md](./CHANGELOG.md). Current: **0.5.0**.

## License

MIT. Author: [Ren](https://renzoreyn.dev).
