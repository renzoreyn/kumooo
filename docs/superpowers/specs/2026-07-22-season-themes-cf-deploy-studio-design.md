# Season themes, CF Deploy choice, and Theme Studio

**Date:** 2026-07-22  
**Status:** Approved for planning (lead decision; awaiting final user skim)  
**Owner:** Lead engineer (agent) with product owner Ren

## Problem

Tenant sites only expose a single free theme (`default`). Marketing still pitches “custom domains” as the growth path, which fights Kumooo’s Cloudflare DNA. Power users want to bring their own look by writing code, not dragging blocks. Scheduling, domain automation, and a11y remain unfinished from launchable core.

## Lead decisions (project benefit)

1. **Ship in phases.** Do not block free-theme polish on a full sandbox studio or OAuth Cloudflare deploy.
2. **Four first-party free themes** named after seasons: `haru` (default), `natsu`, `aki`, `fuyu`. Replace the tenant gallery’s lone `default` option. Keep `default` as a **compat alias → `haru`** so existing sites keep rendering.
3. **Marketing pitch becomes “CF Deploy” with two clear choices**, not “add a CNAME.” Managed `*.kumooo.dev` stays the zero-friction path; “your Cloudflare” is the ownership path.
4. **Theme Studio is real code, not a page builder.** Tenants edit files against our contract. v1 uses **safe HTML templates + CSS + optional client JS**, not arbitrary TypeScript executing inside the Worker.
5. **`marketing` and `docs` stay platform-only.** Never offer them in the tenant theme gallery.
6. **Dashboard Domains remains** for operators who already host on Kumooo and later attach a hostname. Marketing CTA no longer leads with that.

## Scope by phase

### Phase 1 (this delivery) — Free seasons + CF Deploy CTA

- Package `@kumooo/theme-seasons` exporting four `Theme`s.
- Renderer: register all four; `getTheme("default")` resolves to `haru`.
- Dashboard: gallery + create-site + settings list the four seasons; default new sites to `haru`.
- Migration: existing `theme = "default"` continues to work via alias (no D1 rewrite required).
- Marketing theme: replace “custom domains” hero/tab/feature framing with **CF Deploy** choice UI (modal or dedicated section) offering:
  - **Host on Kumooo** → signup / dashboard create site → `*.kumooo.dev`
  - **Host on your Cloudflare** → guided path using CLI / Workers project you control (see Approach below)
- Keep Domains dashboard page; soften marketing copy only.

### Phase 2 — Theme Studio (dashboard code themes)

- Per-site custom theme drafts stored as versioned file trees.
- Editor in dashboard (Monaco or CodeMirror): edit provided structure.
- Preview via existing signed preview tokens with theme override.
- Publish activates a theme id like `custom:<siteId>` or `site_<id>_vN` loaded by the renderer from R2/D1.
- Security model: template sandbox (below). No `eval` of user TypeScript on the edge.

### Phase 3 — Hardening (“the rest”)

- Scheduled publish worker (cron) that flips `scheduled` → `published` and bumps cache.
- Cloudflare for SaaS / custom hostname API when tokens exist; keep DNS instruction + verify as fallback.
- Expand unit/API tests; mobile/a11y smoke on shell, editor, dialogs.

Out of scope for all three phases: visual page builders, selling paid theme marketplace, GitHub sync for themes (may follow Studio v2).

## Approaches considered

### A. Season themes as four packages; Studio as full TS `Theme` in Worker

- Pros: identical DX to first-party themes.
- Cons: arbitrary code in Worker is an abuse and XSS hazard; needs isolate/compile pipeline we do not have.
- Rejected for Studio v1.

### B. Season themes as one package; Studio = CSS variables only

- Pros: tiny, safe.
- Cons: fails the “they provide HTML/CSS/JS” ask.
- Rejected as the Studio end-state (may still expose tokens *inside* seasons later).

### C. Recommended: seasons as one package; Studio = file templates + CSS + JS; CF Deploy = two-path CTA

- Pros: matches product ask, keeps edge safe, fits current `Theme` kit, ships seasons fast.
- Cons: Studio authors learn a template dialect, not raw `theme-kit` TypeScript (document that honestly).

**Choice: C.**

## Phase 1 design

### Season themes

| Id | Role | Direction |
| --- | --- | --- |
| `haru` | Default / spring | Soft light paper, sakura-adjacent accent (not kitschy pink overload), calm reading measure, refined nav |
| `natsu` | Summer | High-contrast coastal light or dusk, stronger accent, slightly wider measure, energetic home list |
| `aki` | Autumn | Warm ink on cream/ochre, editorial serif display + sans body, generous article rhythm |
| `fuyu` | Winter | Cool slate/ink, crisp mono accents, tight chrome, quiet winter gradient |

Shared requirements for all four:

- Implement full `Theme` contract: `home`, `post`, `page`, `archive`, `notFound`.
- Respect `site.nav`, SEO `head`, language, origin.
- Distinct type + color systems (not four recolors of one stylesheet).
- Light + dark via `prefers-color-scheme` or explicit theme toggle where it fits the season.
- Accessible contrast; focus states; no emoji decoration; no purple-on-white AI cliché.
- No fabricated stats in theme chrome.
- Quality bar: must look intentional next to `theme-marketing`, not “placeholder blog.”

Implementation sketch:

- `packages/theme-seasons/src/{haru,natsu,aki,fuyu}.ts` + `index.ts` exports.
- `apps/renderer` depends on `@kumooo/theme-seasons`, registers four themes.
- `getTheme`: if name is `default` or missing, return `haru`.
- Dashboard `TENANT_THEMES` constant shared (single module) used by ThemesPage, CreateSiteDialog, SettingsPage.
- Create site API default theme string becomes `haru` (schema default update).

### CF Deploy marketing UX

**Primary CTA pattern (home + pricing closing sections):**

1. Button: **Deploy on Cloudflare**
2. Choice surface (dialog or split panel):

| Choice | Outcome |
| --- | --- |
| **Use Kumooo hosting** | Copy: “We run the Worker. You get `{slug}.kumooo.dev` in minutes.” CTA → `https://kumooo-dashboard.pages.dev/signup` (or `/` if logged in). Secondary: open docs. |
| **Use your Cloudflare account** | Copy: “Own the Worker and your domain. Same stack.” CTA → `/docs` install/CLI path (`npx create-kumooo` + `wrangler deploy`) with a short checklist: create Worker, bind D1/KV/R2 as needed, attach custom domain in CF. Optional: deep-link GitHub template when available. |

v1 does **not** require Cloudflare OAuth or automatic provision into the user’s account. That is Phase 3+ if demand shows. Honesty over fake one-click.

Replace marketing tab/feature copy that over-promises “Custom domains without the ticket queue” with CF Deploy framing. Pricing table: rename row to “Managed `*.kumooo.dev`” vs “Self-host on your CF.”

## Phase 2 design — Theme Studio

### Author model

We provide a **starter file tree**. They edit files. We validate and publish.

```
theme/
  theme.json          # name, label, version, engines
  styles.css          # required
  templates/
    home.html
    post.html
    page.html
    archive.html
    notFound.html
  client.js           # optional; loaded with defer + CSP
```

`theme.json` example:

```json
{
  "name": "my-theme",
  "label": "My Theme",
  "version": 1
}
```

### Template dialect

- HTML with mustache-style tags.
- Escaped by default: `{{title}}`, `{{post.title}}`.
- Trusted HTML only via documented triple-stash for platform-rendered markdown: `{{{bodyHtml}}}`, `{{{head}}}`.
- Allowed loops/conditionals for lists: `{{#posts}}…{{/posts}}`.
- Disallowed: arbitrary JS expressions in templates, `{{{` on user fields, external script URLs except same-origin theme `client.js`.

Renderer maps today’s `Theme` functions by compiling templates + CSS into the same SSR string pipeline (escape-by-default).

### Storage and activation

- Draft files in R2: `themes/{siteId}/draft/*`
- Published snapshot: `themes/{siteId}/published/v{n}/*` + D1 row `site_themes` (`id`, `siteId`, `version`, `status`, `label`, `createdAt`)
- Activating sets `sites.theme` to `custom:{siteId}` (renderer loads published snapshot).
- Switching back to `haru`/`natsu`/… restores first-party theme.

### Dashboard UX

- Nav: Design → **Theme Studio** (new) beside Themes gallery.
- Gallery stays first-party seasons; Studio is for custom.
- Editor: file tree + code pane + “Preview” (preview-token with custom theme) + “Publish theme”.
- Validation errors block publish (missing templates, illegal tags, CSS size caps).

### Limits (v1)

- Max CSS 256 KB; max total templates 256 KB; max client.js 128 KB.
- One published custom theme per site (versioned history keep last 10).
- No npm imports in client.js; no Worker bindings from custom themes.

## Phase 3 design — Hardening

- **Scheduler:** Cloudflare cron on API or renderer Worker every minute; select due `scheduled` content; publish; `content.published` event; bump KV cache version.
- **Custom hostnames:** when `CF_API_TOKEN` + zone config present, create custom hostname on domain add; Domains UI shows CF status. Else keep DNS table + verify.
- **Tests:** season theme smoke (render home/post); template validator unit tests; cron publish integration; a11y smoke checklist in plan.

## Data / API changes

| Change | Phase |
| --- | --- |
| Schema default theme `haru`; `getTheme` alias | 1 |
| Shared `TENANT_THEMES` module | 1 |
| Marketing copy/CTA | 1 |
| `site_themes` table + R2 theme objects | 2 |
| Theme Studio CRUD + publish endpoints | 2 |
| Cron publish route | 3 |

## Security

- First-party themes: trusted code in repo (status quo).
- Custom themes: escape-by-default templates; CSP on rendered pages when custom theme active (`default-src 'self'`; allow Google Fonts only if theme opts in via allowlist).
- Preview tokens unchanged (short-lived, signed).
- Role gate: Theme Studio publish requires `editor`+.

## Testing

- Unit: `getTheme` alias; template validator; season themes return HTML for home/post.
- Manual: create site → haru; switch seasons; preview; marketing CF Deploy dialog both paths.
- Studio (Phase 2): publish custom theme; public page uses it; XSS attempt in `{{title}}` escaped.
- Phase 3: schedule post in past → cron publishes.

## Success criteria

- New tenants default to **haru** and can pick **natsu / aki / fuyu** without redeploying content.
- Marketing primary deploy story is CF Deploy with two honest paths.
- Theme Studio (Phase 2) lets a developer ship a custom look with HTML/CSS/JS under our structure without Worker code execution.
- No fabricated metrics; no marketing/docs themes for tenants.

## Non-goals

- Drag-and-drop page builder.
- Paid theme store.
- Instant OAuth provision of Workers into arbitrary CF accounts (Phase 1).
- Letting tenants fork `marketing`/`docs` layouts.
