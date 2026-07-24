# Changelog

## 0.5.9

- Auth: logout deletes the server session (not cookie-only).
- API: CORS allows `127.0.0.1` local origins; site create rejects reserved slugs `blank`, `blog`, `shop`.
- Dashboard: choose skin when creating a site; rename an existing site.
- Docs: plan names use Nimbus/Cumulus/Stratus; troubleshooting covers email codes and passwords.
- Starters: remove unused `@kumooo/framework` dependency.
- Marketing: `/docs` and `/docs/*` redirect to docs.kumooo.dev.

## 0.5.8

- Auth: email + password signup (verify with OTP), password login, set or change password on Account. Email OTP login remains.
- Dispatch: clearer empty-slug and claim pages for untaken `{slug}.kumooo.site` hosts.

## 0.5.7

- Dashboard: per-site posts (Markdown CRUD) and public `GET /public/sites/:slug/posts`.
- Dashboard: media library upload to R2 with plan quotas and edge-cached public URLs.
- Theme packs (Y2K / kumooo / Glass), demo blog/shop admins, site skins via public API.
- Open Graph images (`next/og`) on www, docs, dashboard, and demos.
- Docs: custom domains via Cloudflare for SaaS Custom Hostnames.

## 0.5.6

- Plans renamed Free/Pro/Team/Scale to Nimbus/Cumulus/Stratus/Cumulonimbus (IDs and prices unchanged).
- Blank starter: kit playground with light/dark theme (blank.kumooo.site).

## 0.5.5

- Auth: 6-digit email OTP replaces magic links; remember this device for 30 days (else 12 hours).
- Hosting: `{slug}.kumooo.site` (Universal SSL) with claim / not-live fallback pages.
- Pricing docs aligned: Cumulus $7/mo ($5 annual), Stratus $12/mo ($10 annual).
- Live demos: blank.kumooo.site, blog.kumooo.site, shop.kumooo.site.

## 0.5.4

- Marketing homepage: light-ray hero, feature sections, changelog index, footer marquee.

## 0.5.3

- Fix: dashboard no longer embeds a localhost API URL in production builds.
- Marketing hero: light rays and water-wave motion.
- Nav icons on Dashboard and GitHub links.

## 0.5.2

- Theme toggle on marketing and docs (light / dark / system on docs).
- Docs visual palette aligned with marketing (charcoal + mint).
- Nav icons on marketing and docs.

## 0.5.1

- Transactional email via Resend (`no-reply@kumooo.dev`, reply-to `contact@kumooo.dev`).
- HTML email template for sign-in codes / magic links.

## 0.5.0

- Marketing charcoal theme and pricing page (monthly/annual toggle).
- Docs: Guides section (structure, UI, env, OpenNext, domains, troubleshooting).
- Dashboard at app.kumooo.dev with email magic-link auth.
- API at api.kumooo.dev (D1 users, sessions, sites, Free/Nimbus quotas).
- `@kumooo/plans` annual price fields.

## 0.4.0

- Brand mark uses `currentColor` (theme-aware).
- `@kumooo/plans`: Free / Pro / Team / Scale limits (Free: 2 sites, 150 MB media).
- Marketing `/pricing`; Learn and Setup hosted on docs.kumooo.dev.
- Redirects: `/learn`, `/setup`, `/start` from the marketing site.
- Dispatch Worker scaffold for `{slug}.kumooo.site`.
- Docs: Learn path, Guided setup, Hosting.

## 0.3.3

- Marketing site brand mark and typography refresh.
- Docs app (`apps/docs`) on docs.kumooo.dev.
- Marketing `/docs` redirects to the docs app.

## 0.3.2

- Marketing site on Cloudflare Workers via OpenNext (`kumooo-www`).
- Deploy / Learn / Setup flows retargeted to Cloudflare (from Vercel).
- pnpm hoist (`.npmrc`) for OpenNext bundling.

## 0.3.1

- Marketing site `apps/www`: hero, Deploy button, `/setup`, Learn pages, docs stubs.
- Default `pnpm dev` runs the marketing site.

## 0.3.0

- Remove the Cloudflare CMS from the repo.
- Active packages: `@kumooo/ui`, `create-kumooo`, `starters/*`.

## 0.2.0

- Framework toolkit: Next.js starters and UI kit; CMS sunset begins.

## 0.1.x

- Former Cloudflare CMS platform (removed in 0.3.0).
