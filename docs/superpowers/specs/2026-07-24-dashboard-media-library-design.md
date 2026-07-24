# Dashboard media library (real sites)

**Date:** 2026-07-24  
**Status:** Approved direction - awaiting plan  
**Slice:** First real CMS vertical. Demo `/demo/media` stays sandbox-only.

## Goal

Customer sites store images via **app.kumooo.dev**, not starter admin panels. Owners upload, list, copy URL, and delete media for a site. Starters (and later CMS editors) consume public media URLs. Quota already surfaced on `/me` via `media_objects` must be enforced on write.

## Non-goals (this slice)

- Blog posts / pages / products CRUD in the dashboard  
- Replacing demo blog/shop admin or demo R2 wipe  
- Custom CDN domain or image transforms  
- Multipart resumable uploads / folders / tagging  
- Serving media from `{slug}.kumooo.site` (API origin is fine for v1)

## Architecture

```
Dashboard (session cookie)
  → POST/GET/DELETE /sites/:siteId/media
  → API checks ownership + plan mediaBytes
  → R2 MEDIA put/get/delete
  → D1 media_objects row

Public consumers (<img>, starters)
  → GET /media/{key}  (no auth; key must start with sites/)
```

Demo path (`/demo/media`, keys `demo/…`) is unchanged and still wiped by the midnight cron. Customer keys `sites/…` are never touched by that cron.

## Data model

Existing `media_objects` (0001):

| Column   | Use |
|----------|-----|
| `id`     | Primary key (`media_…`) |
| `user_id`| Owner (quota account) |
| `site_id`| Site scope; required for new uploads |
| `key`    | R2 object key |
| `bytes`  | Size for quota sum |
| `created_at` | List ordering |

**Migration (0007):** add columns needed for UI without a second table:

- `content_type TEXT NOT NULL DEFAULT 'application/octet-stream'`
- `filename TEXT` (original name, optional display)
- index `media_site ON media_objects (site_id)`

On site delete: keep `ON DELETE SET NULL` for rows, but **delete R2 objects** for that site’s keys in the same request (or mark orphaned and GC later - prefer delete R2 + rows when deleting a site so quota frees immediately). Prefer: when deleting a site, `DELETE FROM media_objects WHERE site_id = ?` after R2 deletes (override SET NULL by deleting rows explicitly first).

## R2 keys

```
sites/{siteId}/{mediaId}.{ext}
```

- `ext` from content type: `jpg` | `png` | `webp` | `gif`  
- Allowed types: `image/jpeg`, `image/png`, `image/webp`, `image/gif`  
- Max file size: **5 MB** per object (demo stays 2 MB)  
- Quota: user-level `SUM(bytes)` vs plan `mediaBytes` (already on `/me`)

## API

All `/sites/:siteId/media*` require the existing dashboard session and site ownership (same pattern as `GET/PATCH /sites/:id`).

### `POST /sites/:siteId/media`

- Body: `multipart/form-data` with `file`  
- Validate type + size; reject if `used + file.bytes > plan.mediaBytes` → `413` `{ error: "quota_exceeded" }`  
- If `MEDIA` unbound → `503` `{ error: "media_unavailable" }`  
- Put R2 + insert `media_objects`  
- Response `201`:

```json
{
  "ok": true,
  "id": "media_…",
  "key": "sites/…/media_….png",
  "url": "https://api.kumooo.dev/media/sites/…/media_….png",
  "bytes": 12345,
  "contentType": "image/png",
  "filename": "hero.png",
  "createdAt": "…"
}
```

### `GET /sites/:siteId/media`

- List newest first  
- Response: `{ media: [ …same fields as above… ], usedBytes, quotaBytes }`

### `DELETE /sites/:siteId/media/:mediaId`

- Ownership: row’s `user_id` + `site_id` must match  
- Delete R2 object then D1 row  
- `200` `{ ok: true }`

### `GET /media/*`

- Public, no auth  
- Path after `/media/` is the R2 key  
- Reject if missing, contains `..`, or does **not** start with `sites/`  
- Stream object with content-type + long cache (`immutable` when keyed by id)

CORS: same as existing authenticated routes for upload/list/delete; public GET for `/media/*` should allow any origin for `<img>` (or rely on no CORS needed for simple image GET - still set cache headers). Prefer mounting public CORS like `/public/*` for `/media/*`.

## Dashboard UI

On `/sites/[id]`, add a **Media** section below skin:

1. Quota line: `used / plan` (from list response or `/me`)  
2. Dropzone (reuse `@kumooo/ui` Dropzone) - upload → refresh grid  
3. Grid of thumbnails (newest first): image preview, filename, bytes, **Copy URL**, **Delete**  
4. Empty state: one short line + dropzone  

No separate `/sites/[id]/media` route in v1 - keep one site page. Preserve existing skin + delete site controls.

Dashboard `lib/api.ts`: `listMedia`, `uploadMedia`, `deleteMedia`.

## Error handling

| Case | API | UI |
|------|-----|-----|
| Not signed in | 401 | Redirect login |
| Wrong site | 404 | Toast / inline error |
| Bad type | 400 `invalid_type` | Inline under dropzone |
| Too large | 400 `invalid_size` | Inline |
| Over quota | 413 `quota_exceeded` | Inline + link to account/plans |
| R2 down | 503 | Inline |

## Site delete behavior

Before removing the `sites` row:

1. List `media_objects` for `site_id`  
2. Delete each R2 key  
3. `DELETE FROM media_objects WHERE site_id = ?`  
4. Delete site as today  

## Starter / consumer notes (out of implementation for this PR, but contract)

- Real deploys paste or pick media URLs from the dashboard library  
- Public URL shape is stable: `{API_ORIGIN}/media/{key}`  
- Later post/product editors will call the same list/upload APIs  

## Success criteria

1. Logged-in owner can upload an image on a site detail page and see it in the grid  
2. Copied URL loads the image in a private window (no session)  
3. Quota blocks upload when over plan limit  
4. Delete removes thumbnail and breaks the old URL (404)  
5. Demo `/demo/media` still works; midnight wipe does not delete `sites/` keys  
6. Deleting a site frees quota (media rows + R2 gone)

## Implementation order (for the plan)

1. Migration 0007 + media routes + wire into `sites` delete + CORS for `/media/*`  
2. Dashboard API client + Media section UI  
3. Deploy API + dashboard; smoke-test upload / public GET / quota / site delete  
4. Short docs blurb under hosting (optional, same PR if cheap)
