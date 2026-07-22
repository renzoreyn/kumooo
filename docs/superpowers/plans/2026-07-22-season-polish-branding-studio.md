# Season polish, branding, storage, docs, Theme Studio Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make season themes actually distinct and usable, add Framer-style `k.` badge + light/dark toggle, tenant logo/favicon, 150 MB media quota, tutorial-first docs, and fix Theme Studio so custom themes stick.

**Architecture:** Fix Settings clobber first. Rebuild `@kumooo/theme-seasons` as four real templates sharing only badge/toggle helpers. Store logo/favicon media ids in site settings; enforce quota on media upload. Drop Writing from docs nav and seed tutorials.

**Tech Stack:** Existing Workers/D1/R2, theme-kit, dashboard React, theme-docs package, seed-official.mjs

**Spec:** `docs/superpowers/specs/2026-07-22-season-polish-branding-studio-design.md`

## Global Constraints

- No em dashes (U+2014) in product/docs copy.
- Official wordmark is `k.` (with the period).
- Per-site media quota: exactly 150 MB (`150 * 1024 * 1024`).
- Season pages must never print the theme id as UI chrome.
- Theme Studio custom ids stay `custom:{siteId}` / `custom-draft:{siteId}`.

---

## File map

| Path | Role |
| --- | --- |
| `apps/dashboard/src/features/settings/SettingsPage.tsx` | Remove theme select; stop PATCHing theme |
| `apps/api/src/routes/orgs.ts` | Editor can PATCH theme; settings omit theme wipe |
| `apps/dashboard/src/features/design/ThemeStudioPage.tsx` | Dirty state, clearer publish UX |
| `apps/dashboard/src/features/design/ThemesPage.tsx` | Confirm apply works for editors |
| `packages/theme-seasons/src/*` | Four unique themes + shared badge/toggle |
| `packages/theme-kit` / renderer `themeContext` | logoUrl, faviconUrl |
| `packages/core/src/schemas.ts` | logoMediaId, faviconMediaId |
| `apps/api/src/routes/media.ts` | 150 MB quota |
| `apps/dashboard` Design Branding + Media usage | UI |
| `packages/theme-docs`, `content/docs/*`, `scripts/seed-official.mjs` | Tutorials nav |
| Official themes / `unknown-site.ts` | `k.` branding |

---

### Task 1: Stop Settings from wiping custom themes

**Files:**
- Modify: `apps/dashboard/src/features/settings/SettingsPage.tsx`
- Modify: `apps/api/src/routes/orgs.ts` (optional: ignore `theme` if value is invalid / prefer Design-only)

- [ ] Remove Theme `<Select>` and `theme` state from SettingsPage.
- [ ] `sitesApi.update` on Settings save sends only `name` + `settings` (no `theme`).
- [ ] Lower `PATCH /sites/:siteId` theme changes to require `editor` when `body.theme` is set, or keep admin for name/settings and allow editor theme via Themes route only (Themes already uses sitesApi.update — change requireSiteAccess for theme-only updates to editor).
- [ ] Manual check: publish Theme Studio → change description in Settings → Save → site.theme still `custom:…`.
- [ ] Commit: `Fix Settings save wiping custom Theme Studio themes.`

### Task 2: Theme Studio dirty UX + editor apply

**Files:**
- Modify: `apps/dashboard/src/features/design/ThemeStudioPage.tsx`
- Modify: `apps/api/src/routes/orgs.ts` if Task 1 did not already allow editor theme PATCH

- [ ] Track `dirty` when textarea changes; show unsaved badge; `beforeunload` if dirty.
- [ ] After publish, set dirty false and show live theme id.
- [ ] Ensure Themes Apply works for editor role.
- [ ] Commit: `Harden Theme Studio dirty state and theme apply roles.`

### Task 3: Shared season helpers (badge + color scheme)

**Files:**
- Create: `packages/theme-seasons/src/chrome.ts` (badge HTML, toggle script, `colorSchemeCss`)
- Modify tests

- [ ] Export `madeWithBadge()`, `colorSchemeToggleScript()`, base CSS for badge + `html[data-theme]`.
- [ ] localStorage key `kumooo-color-scheme`.
- [ ] Commit: `Add shared Made-with badge and color-scheme toggle for seasons.`

### Task 4: Rebuild four season themes (unique layouts)

**Files:**
- Replace/overhaul: `haru.ts`, `natsu.ts`, `aki.ts`, `fuyu.ts`, `shared.ts` (or delete shared factory)
- Modify: `packages/theme-seasons/test/seasons.test.ts` (assert no eyebrow theme name; distinct structure)

- [ ] Each theme: own shell/home/post layout per spec personalities.
- [ ] Light + dark tokens; include badge + toggle.
- [ ] Logo: if `site.logoUrl` use img, else title text (context may land in Task 5; stub optional field).
- [ ] Tests pass; no `aki`/`haru` string in home body as eyebrow.
- [ ] Commit: `Rebuild season themes as distinct light/dark layouts.`

### Task 5: Branding fields + renderer + Design UI

**Files:**
- Modify: `packages/core/src/schemas.ts`
- Modify: renderer theme context / head
- Create/modify: dashboard Design Branding page or section
- Wire media picker / upload

- [ ] settings: `logoMediaId`, `faviconMediaId`
- [ ] Resolve public media URLs into theme context + favicon link
- [ ] Official `k.` on marketing/docs/unknown-site
- [ ] Commit: `Add site logo and favicon branding.`

### Task 6: 150 MB per-site media quota

**Files:**
- Modify: `apps/api/src/routes/media.ts`
- Modify: Media dashboard page for used/quota
- Test: quota rejection

- [ ] Constant 150 MiB; sum bytes; reject over limit
- [ ] Return usage on list endpoint
- [ ] Commit: `Enforce 150MB media quota per site.`

### Task 7: Docs tutorials, drop Writing from nav

**Files:**
- Modify: `packages/theme-docs/src/index.ts` NAV_MAP
- Modify: `scripts/seed-official.mjs`
- Create: tutorial markdown as needed
- Deploy renderer + re-seed

- [ ] Remove Writing from nav
- [ ] Ensure Tutorials: building-a-theme + first post / install polish
- [ ] Commit: `Drop Writing from docs nav and expand tutorials.`

### Task 8: Deploy + production smoke

- [ ] Deploy api, renderer, dashboard as needed
- [ ] Smoke: Settings no wipe; season no theme label; badge visible; quota header; docs nav
- [ ] Commit any fixups
