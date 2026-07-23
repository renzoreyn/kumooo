# Changelog

## 0.3.3

- Revamp marketing site: real geometric k mark, Instrument Serif + IBM Plex, anti-slop copy (no em dashes).
- Add Fumadocs app at `apps/docs` on docs.kumooo.dev.
- Marketing `/docs` redirects to the Fumadocs site.

## 0.3.2

- Host marketing site on Cloudflare Workers via OpenNext (`kumooo-www`).
- Retarget Deploy / Learn / Setup copy from Vercel to Cloudflare.
- pnpm hoist (`.npmrc`) so OpenNext bundles correctly.

## 0.3.1

- Add `apps/www` marketing site: ink+mint playground hero, Deploy to Vercel, guided `/setup`, Learn tutorials, docs stubs.
- Default `pnpm dev` runs the marketing site.

## 0.3.0

- Remove the Cloudflare CMS from the repo. kumooo.js only.
- Active tree: `@kumooo/ui`, `@kumooo/framework`, `create-kumooo`, `starters/*`.

## 0.2.0

- Framework-first pivot: Next starters, UI kit, CMS sunset.

## 0.1.x

- Former Cloudflare CMS platform (removed in 0.3.0).
