# Changelog

## 0.5.8

- Password signup and login next to email codes. Set a password from Account if you started on OTP.
- Copy pass: shorter, drier, less brochure.

## 0.5.7

- Dashboard CMS: per-site posts (Markdown) and media library with R2 + quotas.
- Theme packs, demo blog/shop, site skins, platform Open Graph images.
- Docs: Custom Hostnames for brand domains; cleaner punctuation (no em dashes).

## 0.5.6

- Plans: renamed Free/Pro/Team/Scale to Nimbus/Cumulus/Stratus/Cumulonimbus (IDs and prices unchanged).
- Blank starter: kit playground theme with light/dark (live at blank.kumooo.site).

## 0.5.5

- Auth: 6-digit email OTP replaces magic links; remember this device for 30 days (else 12 hours).
- Hosting hostname: `{slug}.kumooo.site` (Universal SSL) with branded "not live yet / claim this slug" fallback.
- Docs: Pro/Team prices aligned with plans ($7 / $12 monthly, $5 / $10 annual).
- Live starter demos at blank.kumooo.site, blog.kumooo.site, shop.kumooo.site.

## 0.5.4

- Marketing: sweeping light rays only (wave + mystery box gone).
- Sassy homepage flexes, changelog pages, rotating footer marquee.
- Voice: bratty, still useful.

## 0.5.3

- Fix dashboard magic-link: stop baking localhost API URL into production builds.
- Marketing hero: light rays + animated water waves.
- Nav icons only on Dashboard and GitHub.

## 0.5.2

- Marketing + docs theme toggle (light / dark / system on docs).
- Docs palette matched to marketing charcoal + mint.
- Nav icons on marketing and docs.

## 0.5.1

- Magic-link mail via Resend (`no-reply@kumooo.dev`, reply-to `contact@kumooo.dev`).
- Keep dark HTML sign-in template.

## 0.5.0

- Dark charcoal marketing theme (not void black).
- Pricing: Pro $7/mo ($5 annual), Team $12/mo ($10 annual), monthly/annual toggle.
- Docs: brand mark in sidebar, Guides section (structure, UI, env, OpenNext, domains, troubleshooting).
- Dashboard scaffold at `apps/dashboard` (`app.kumooo.dev`) with email magic-link auth.
- API scaffold at `apps/api` (`api.kumooo.dev`) with D1 users/sessions/sites + Free quotas.
- `@kumooo/plans` annual price fields.

## 0.4.0

- Flat brand mark (no black plate); stem/leg follow theme via `currentColor`.
- Add `@kumooo/plans` with Free / Pro / Team / Scale limits (Free live: 2 sites, 150 MB media).
- Marketing `/pricing` replaces `/start`; Learn and Setup move to docs.kumooo.dev.
- Redirect `/learn`, `/setup`, `/start` from the marketing site.
- Scaffold `apps/dispatch` for `{slug}.kumooo.site` (Workers for Platforms).
- Docs: Learn path, Guided setup, Hosting page.

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
