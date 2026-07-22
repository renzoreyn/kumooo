# Season polish, branding, storage, docs, Theme Studio reliability

**Date:** 2026-07-22  
**Status:** Approved (lead decisions + verbal yes)  
**Owner:** Ren / lead eng

## Problem

1. Season themes are one shared shell with recolors; the hero prints the theme id (`aki`). Not usable as real site skins.
2. "Built with Kumooo" footer text is weak; we want a Framer-style floating badge.
3. Official brand mark should be **`k.`** (wordmark + favicon). Tenants need uploadable logo and favicon.
4. Media has no per-site cap; R2 is limited (~10 GB). Need **150 MB per site**.
5. Docs still surface **Writing** as a product guide; we want noob tutorials instead.
6. Theme Studio feels buggy; custom themes do not stick. Confirmed risk: **Settings Save always PATCHes `theme` from a season-only `<Select>`**, which can overwrite `custom:{siteId}` after publish. Gallery Apply also requires `admin` while Studio publish allows `editor`.

## Goals

- Four season themes that look and behave differently (layout + type + light/dark), no theme-name chrome.
- System dark mode + remembered on-page toggle.
- Floating `k.` / Made-with badge on tenant season + studio shells.
- Site branding: logo + favicon via Media, Design UI.
- Official surfaces (`kumooo.dev`, docs, unknown-host) use `k.` mark.
- Enforce 150 MB media quota per site; show usage in dashboard.
- Remove Writing from public docs nav; add tutorial pages (install, first post, etc.).
- Theme Studio: drafts save reliably, publish sticks, Settings cannot clobber custom theme, clearer dirty/publish UX.

## Non-goals

- Separate Haru Light / Haru Dark gallery entries (toggle handles mode).
- Billing / paid storage tiers.
- Removing `writing.md` from the repo (may stay for internal tone; just not linked in docs nav).
- Theme Studio visual drag-drop builder.

## Decisions

| Topic | Decision |
| --- | --- |
| Dark mode | **B:** `prefers-color-scheme` default + small toggle; persist `localStorage` key `kumooo-color-scheme` (`light` \| `dark` \| `system`) |
| Logo / favicon | Upload in Design → Branding into Media library; store `logoMediaId` / `faviconMediaId` in site `settings`; header uses `<img>` when logo set else title text; `<link rel="icon">` when favicon set |
| Official mark | Wordmark **`k.`** and matching favicon SVG/PNG for marketing, docs, unknown-site |
| Badge | Fixed bottom-right Framer-style pill linking to `https://kumooo.dev`; v1 always on season themes and Theme Studio starter; copy like `Made with k.` |
| Theme name on page | Never show season id/label as UI chrome |
| Storage | **150 MB** = sum of `media.bytes` for the site; reject upload over remaining; dashboard shows used/limit |
| Docs | Drop Writing from `NAV_MAP` / seed; Tutorials group: Building a theme + new install / first-post style guides |
| Theme Studio | Fix Settings clobber; allow editors to apply season themes; dirty state + autosave-on-blur or explicit dirty badge; publish success refreshes site theme; keep draft vs live clear |

## Season theme personalities

Shared helpers only: badge HTML/CSS snippet, color-scheme toggle script, logo/favicon head helpers. **Each theme owns its own templates**, not one `createSeasonTheme` shell.

| Id | Personality | Layout |
| --- | --- | --- |
| **haru** | Soft spring notes / personal blog | Airy magazine: date-led list, soft bloom wash, friendly display type |
| **natsu** | Summer portfolio / showcase | Wide grid of post cards, bold titles, accent bar |
| **aki** | Autumn long-form | Narrow reading measure, serif display, chapter rhythm (no `AKI` stamp) |
| **fuyu** | Winter engineer diary | Stark cool palette, mono accents, dense list, tight nav |

Each ships light + dark CSS tokens and the shared toggle.

## Branding data model

Extend `siteSettingsSchema`:

```ts
logoMediaId: z.string().optional(),
faviconMediaId: z.string().optional(),
```

Renderer resolves media URLs into `ThemeSiteContext` (e.g. `site.logoUrl`, `site.faviconUrl`) and injects favicon into `head`. Themes read logo for header.

## Storage enforcement

- Constant `SITE_MEDIA_QUOTA_BYTES = 150 * 1024 * 1024`.
- On `POST /v1/sites/:siteId/media`, sum existing bytes + new file; 413/400 if over.
- `GET` media list (or overview) returns `{ usedBytes, quotaBytes }`.
- Theme Studio R2 drafts/published theme files **do not** count toward the 150 MB media quota in v1 (separate keys; document that). Revisit if abuse appears.

## Theme Studio reliability

1. **Settings:** Remove theme `<Select>` from Settings (theme lives under Design → Themes / Studio only). Saving settings must not send `theme` unless intentionally changing it.
2. **Roles:** Season Apply uses `editor` (same as Studio publish), not `admin`.
3. **UX:** Dirty flag when editor changes; warn on navigate; Save/Publish disable clarity; show "Draft saved" vs "Live: custom:…".
4. **API:** Keep validate-on-save; return field errors clearly; optional GET after save smoke in tests.
5. **Cache:** Publish and season Apply already bump cache version; verify Settings no longer races.

## Docs

- Remove `{ slug: "writing", ... }` from theme-docs `NAV_MAP` and `seed-official.mjs`.
- Add tutorials (noob voice, no em dashes): e.g. `publishing-your-first-post.md`, expand installation if thin; keep `building-a-theme.md`.
- Re-seed official docs site after nav change.

## Testing / smoke

- Unit: season themes render distinct HTML (not shared eyebrow); dark toggle script present; quota math; settings schema branding keys.
- API: media over quota rejected; theme studio save → get roundtrip; publish sets `sites.theme` to `custom:…`.
- Dashboard: Settings save leaves `custom:` theme intact.
- Live smoke: apply aki (no `AKI` text); publish studio CSS change visible; upload blocked past 150 MB (or simulated); docs nav has Tutorials, no Writing.

## Out of scope follow-ups

- Site flag to hide Made-with badge.
- Counting theme R2 toward quota.
- Writing guide as internal-only package doc.
