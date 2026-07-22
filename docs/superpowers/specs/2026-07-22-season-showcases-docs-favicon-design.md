# Season showcases, default favicon, docs depth, icon theme toggle

**Date:** 2026-07-22  
**Status:** Draft for user review  
**Owner:** Ren / lead eng

## Problem

1. Marketing hero still has a large mint **orb/blob** that reads heavy and distracts from type.
2. People cannot preview season themes before picking one in the dashboard; gallery is abstract.
3. Sites without an uploaded favicon get no icon; official brand mark **`k.`** should be the default for marketing, docs, and every new tenant site.
4. Docs sidebar is text-only and thin; learners bounce.
5. Season theme color-scheme control still shows **Light / Dark / Auto** text; docs already use an icon button — seasons should match.

## Goals

- Remove marketing hero orb.
- Live preview sites: `haru.kumooo.dev`, `natsu.kumooo.dev`, `aki.kumooo.dev`, `fuyu.kumooo.dev` with hybrid content (pitch + sample posts).
- Default `k.` SVG favicon whenever `faviconMediaId` is unset.
- Docs: icon next to each sidebar item; more tutorial/guide pages people can actually follow.
- Season (and any shared) scheme toggle: **icon-only** cycle (system → light → dark), with `aria-label` / `title` for a11y.
- Marketing Themes section links to the four live previews.

## Non-goals

- New theme packages or redesigning season layouts beyond existing polish.
- Uploading a real favicon media asset for every site (inline SVG fallback is enough).
- Custom domains for season demos (`slug.kumooo.dev` is the URL).
- Replacing Lucide in the dashboard; docs/seasons use small inline SVGs only.
- Translating all docs; English-only for this pass.

## Decisions

| Topic | Decision |
| --- | --- |
| Showcase hosting | **Seeded official sites** (approach 1): create/update sites `haru` / `natsu` / `aki` / `fuyu` in `scripts/seed-official.mjs` under the official org; themes match slug |
| Content model | **Hybrid (C):** site description + short about/why page + 3–5 published posts per season under `content/seasons/{theme}/` |
| Favicon | Renderer injects inline **`k.`** SVG data-URI (or same SVG as `link rel="icon" type="image/svg+xml"`) when `faviconUrl` is null; uploaded `faviconMediaId` wins |
| Docs icons | Inline SVG per nav item in `@kumooo/theme-docs` `NAV_MAP` (no CDN icon font) |
| Docs expansion | Add pages listed below; keep Writing out of nav |
| Scheme toggle | Icon button cycling `system` → `light` → `dark` → `system`; icons: monitor/auto, sun, moon; persist `kumooo-color-scheme` as today |
| Marketing blob | Delete `.hero-orb` markup + CSS; keep lighter background washes if useful |

## Architecture

### Season showcase sites

```
seed-official.mjs
  ensureSite("haru", …, theme: "haru")
  ensureSite("natsu", …)
  ensureSite("aki", …)
  ensureSite("fuyu", …)
  upsert pages + posts from content/seasons/{slug}/*.md
```

Hostnames come from `https://{slug}.{PUBLIC_SITE_SUFFIX}` — no custom domain rows required for production `*.kumooo.dev`.

Each site settings:

- `title` / `description` sell that season’s personality
- `nav`: About + maybe Archive or Docs link
- Posts show the list/article chrome; About is a page

Voice: founder-over-coffee, no em dashes. Content should make the **layout differences** obvious (dates, chapters, status bar, cards), not just recolor the same essay four times.

### Default favicon

In `apps/renderer` `themeContext` (or shared helper):

- If `faviconUrl` → existing `<link rel="icon" href="…">`
- Else → `<link rel="icon" href="data:image/svg+xml,…">` with a compact `k.` mark (mint/dark ink that reads at 16×16)

Apply to all themes that use renderer `themeContext` (marketing, docs, seasons, default/studio shells). Unknown-host page should include the same icon in its static head.

### Docs sidebar icons + content

Extend `NavItem` with `icon: string` (raw SVG path or named key → SVG map).

Render: `[icon] Title` in `.fd-side-nav a`.

New markdown under `content/docs/` (seed + `NAV_MAP` + `DOC_TITLES`):

| Slug | Group | Purpose |
| --- | --- | --- |
| `custom-domains` | Guides | Attach your hostname |
| `media-and-branding` | Tutorials | Logo, favicon, R2, 150 MB quota |
| `theme-studio` | Tutorials | Edit HTML/CSS, publish, don’t get clobbered |
| `deploy-on-cloudflare` | Tutorials | Managed `*.kumooo.dev` vs your Cloudflare |
| `season-themes` | Guides | Haru/Natsu/Aki/Fuyu + live preview links |
| `drafts-and-revisions` | Guides | Drafts, publish, roll back |

Icons for existing + new items (sun-ish / book / wrench / etc. — simple line icons, accent on active).

### Icon scheme toggle

Update `packages/theme-seasons/src/chrome.ts`:

- Replace text label on `[data-km-scheme]` with three SVG glyphs; button shows the **current** mode’s icon
- `aria-label` / `title`: “Color scheme: system|light|dark”
- Keep the same cycle and `localStorage` key

Docs already has `[data-theme-toggle]` with an icon; align behavior/labels if it only toggles light/dark so seasons and docs both support system when practical. Prefer seasons chrome as source of truth for the three-state icon control; docs can adopt the same three-state if cheap, otherwise leave docs as-is and only fix seasons text.

### Marketing

- Remove hero orb
- Themes feature block: four links to season URLs + short line each

## Testing / smoke

1. `pnpm --filter @kumooo/theme-marketing typecheck` + seasons/docs tests as applicable
2. Deploy renderer; run seed against production API for season sites + new docs
3. Smoke: `https://haru.kumooo.dev` (and natsu/aki/fuyu) render correct theme, posts list, no theme-id stamp
4. Smoke: `https://kumooo.dev` has no `.hero-orb`; Themes section links work
5. Smoke: view-source on marketing/docs/new tenant without branding → `rel="icon"` with `k.` SVG
6. Smoke: docs sidebar shows icons; new pages 200
7. Smoke: season header toggle shows icons only; cycles system/light/dark

## Out of scope follow-ups

- Dashboard theme gallery deep-link “Open live preview”
- Screenshot cards of seasons on marketing (live links first)
- Localized season demo content
