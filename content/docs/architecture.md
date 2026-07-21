Kumooo is two Cloudflare Workers sharing one D1 database.

## Why two workers?

| | API | Renderer |
|---|---|---|
| Traffic | Low, authenticated | High, anonymous |
| Caching | Almost none | Aggressive |
| Blast radius | One editor is annoyed | Every reader of every site |

A bad dashboard deploy should not take down published sites.
That's the whole point.

## Data

- **D1**: users, orgs, sites, content, revisions, media metadata, domains
- **R2**: media bytes
- **KV**: session cache + per-site cache versions

## Cache invalidation

Cache keys embed a per-site version from KV.
Publishing bumps the version. Old entries age out.
No purge storms.

## Themes

Themes are packages implementing `home`, `post`, `page`, `archive`, `notFound`.

1. **SSR HTML** (default): zero required JavaScript
2. **Interactive**: same contract, plus client islands (Framer Motion, Lucide, Radix)

Marketing (`kumooo.dev`) and docs (`docs.kumooo.dev`) are real Kumooo sites.
We dogfood the product. On purpose.

