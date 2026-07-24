# Platform roadmap notes (parked)

Captured 2026-07-24 so they aren’t lost while shipping media library.

## Cloudflare edge caching

- Public media already targets long `Cache-Control` + immutable URLs (content-addressed by media id).
- Next: Cache Rules / Cache Reserve for `/media/*`, optional `CDN-Cache-Control`, Cache Tags per `site_id` for purge-on-delete.
- Dashboard + marketing: review `s-maxage` / stale-while-revalidate on OpenNext assets; HTML vs static split.
- Later: custom media hostname (e.g. `media.kumooo.dev`) with R2 public bucket or Worker + Cloudflare cache.

## Dashboard completeness

Still a hosting console, not a full CMS. After media:

1. Posts / pages / products editors (per site)  
2. Analytics surface (CF Web Analytics and/or own events)  
3. **GA4** property connect (measurement ID on site → inject on published starter)  
4. **GSC** verification / sitemap submit hooks  
5. Deploy / publish pipeline + status  
6. Custom domains UI  

## npm publish (`kumooo create`)

- Package: `packages/create-kumooo` (bin likely `create-kumooo` / `kumooo`).  
- Sync templates from `starters/*` before publish.  
- Publish `@kumooo/*` scoped packages (or rename bin to `kumooo`) to npm.  
- Docs: `npx create-kumooo@latest` / `pnpm create kumooo`.  
- Requires npm org access + CI release workflow.
