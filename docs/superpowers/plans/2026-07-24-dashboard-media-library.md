# Dashboard media library Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans (inline — user said go). Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Per-site media upload/list/delete in the dashboard with R2 + quota, public cacheable URLs.

**Architecture:** Authenticated routes under `/sites/:id/media`; public `GET /media/sites/…` from R2 with long Cache-Control. Demo `/demo/media` untouched.

**Tech Stack:** Hono on Cloudflare Workers, D1, R2 (`MEDIA`), Next.js dashboard, `@kumooo/plans` quotas, `@kumooo/ui` Dropzone.

## Global Constraints

- Max file **5 MB**; types jpeg/png/webp/gif only  
- R2 keys `sites/{siteId}/{mediaId}.{ext}` — never wiped by demo cron  
- Enforce plan `mediaBytes` on upload (`413 quota_exceeded`)  
- Public media responses: `Cache-Control: public, max-age=31536000, immutable` (+ Cloudflare-friendly headers)  
- Demo admin stays sandbox-only  

## File map

| File | Role |
|------|------|
| `apps/api/migrations/0007_media_meta.sql` | `content_type`, `filename`, `media_site` index |
| `apps/api/src/routes/media.ts` | Public GET `/media/*` + helpers (url, ext, wipe site media) |
| `apps/api/src/routes/sites.ts` | Nested media CRUD + site delete cleans R2/rows |
| `apps/api/src/index.ts` | Mount `/media`, CORS for `/media/*` |
| `apps/dashboard/lib/api.ts` | `listMedia` / `uploadMedia` / `deleteMedia` |
| `apps/dashboard/components/site-media.tsx` | Dropzone + grid UI |
| `apps/dashboard/app/sites/[id]/page.tsx` | Mount Media section |

### Task 1: Migration + public media route + site media API

**Files:** create migration + `media.ts`; modify `sites.ts`, `index.ts`

- [ ] **Step 1:** Add `0007_media_meta.sql`
- [ ] **Step 2:** Implement `media.ts` public GET + `mediaPublicUrl`, `extFor`, `deleteSiteMedia`
- [ ] **Step 3:** Add POST/GET/DELETE `/:id/media` on `sitesRoutes`; call `deleteSiteMedia` before site DELETE
- [ ] **Step 4:** Wire CORS + route in `index.ts`; apply remote migration
- [ ] **Step 5:** Commit

### Task 2: Dashboard client + Media UI

**Files:** `lib/api.ts`, `components/site-media.tsx`, `sites/[id]/page.tsx`

- [ ] **Step 1:** Client methods (FormData upload must not force JSON Content-Type)
- [ ] **Step 2:** `SiteMedia` section (quota, dropzone, grid, copy, delete)
- [ ] **Step 3:** Mount on site detail below skin
- [ ] **Step 4:** Commit

### Task 3: Deploy + smoke test

- [ ] Deploy API + dashboard  
- [ ] Upload → public GET 200 → delete → 404  
- [ ] Confirm demo media still works  

## Follow-ups (tracked, not this plan)

See `docs/superpowers/specs/2026-07-24-platform-roadmap-notes.md`
