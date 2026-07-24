# Platform roadmap notes (parked)

Captured 2026-07-24 so they aren’t lost while shipping media library / OG baselines.

## Cloudflare edge caching

- Public media already targets long `Cache-Control` + immutable URLs (content-addressed by media id).
- Next: Cache Rules / Cache Reserve for `/media/*`, optional `CDN-Cache-Control`, Cache Tags per `site_id` for purge-on-delete.
- Dashboard + marketing: review `s-maxage` / stale-while-revalidate on OpenNext assets; HTML vs static split.
- Later: custom media hostname (e.g. `media.kumooo.dev`) with R2 public bucket or Worker + Cloudflare cache.

## Dashboard completeness

Still a hosting console, not a full CMS. After media:

1. Posts / pages / products editors (per site)
2. **SEO tools** (complete set on dashboard): title/description, canonical, robots, sitemap, structured data hints, social preview
3. **Open Graph editor** - per-site (and later per-page) OG title, description, image picker from media library, Twitter card
4. **Analytics** - default **Cloudflare Web Analytics** (privacy-friendly, first-party). **Google Analytics (GA4)** optional via dashboard toggle + measurement ID injected on published sites
5. **GSC** verification / sitemap submit hooks
6. Deploy / publish pipeline + status
7. Custom domains UI

## First-party OG (platform sites)

Baseline `opengraph-image` (`next/og` / Satori via `ImageResponse`) + `metadataBase` on:

- `kumooo.dev` (www)
- `docs.kumooo.dev`
- `app.kumooo.dev`
- `blank.kumooo.site` / `blog.kumooo.site` / `shop.kumooo.site`

Customer sites later use the OG editor + media library.

## Custom domains (hosted)

- Platform / demo Workers: wrangler **Workers custom domains**
- Customer `{slug}.kumooo.site`: **dispatch** + Workers for Platforms
- Customer brand domains (Pro+): **Cloudflare for SaaS Custom Hostnames** (CNAME to SaaS fallback) - not one Workers custom domain per customer

## npm publish (`kumooo create`)

- Package: `packages/create-kumooo` (bin likely `create-kumooo` / `kumooo`).
- Sync templates from `starters/*` before publish.
- Publish `@kumooo/*` scoped packages (or rename bin to `kumooo`) to npm.
- Docs: `npx create-kumooo@latest` / `pnpm create kumooo`.
- Requires npm org access + CI release workflow.
