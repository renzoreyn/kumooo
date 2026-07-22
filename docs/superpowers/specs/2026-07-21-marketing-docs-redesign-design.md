# Marketing & docs redesign

**Date:** 2026-07-21  
**Status:** Approved  
**Owner:** Ren  

## Problem

`kumooo.dev` and `docs.kumooo.dev` feel empty. Every page doubles the title as two `h1`s. Contact leans on a raw email. Marketing black is too black. Motion and interactive components are thin. Docs should read like a Fumadocs site, not a rough sidebar clone.

## Goals

1. Product-first marketing homepage with kinetic motion and a softer charcoal base.
2. Docs theme as close to Fumadocs UI as practical in an SSR theme + client island.
3. One `h1` per page. No email as primary contact.
4. Enough density that neither site feels sparse.
5. Ship by updating `theme-marketing`, `theme-docs`, seed content, and redeploying the official sites.

## Non-goals

- Full-text search index (Orama or similar). Client title/heading search is enough.
- MDX playgrounds or interactive API explorers.
- Version switcher or i18n.
- Replacing the dashboard UI language (dashboard stays its own app).
- Building marketing/docs as Next.js apps. Both stay real Kumooo sites.

## Direction chosen

**Product-first + kinetic motion** (visual companion options C + B).

Rejected for this pass:

- **Editorial dense alone:** more cards without a strong product hero.
- **Kinetic showcase alone:** motion without leading with the CMS.

## Visual systems

### Marketing (`theme-marketing`)

| Token | Value | Notes |
| --- | --- | --- |
| Background | `#101218` | Soft charcoal, not `#000` |
| Foreground | warm off-white | e.g. `#f3f1ea` |
| Muted | `#9a968c` | Secondary text |
| Accent | mint `#6ee7b7` | CTAs, highlights |
| Panels | `#12151d` / `#161922` | Borders `#262b37` |
| Glow | soft mint radial | Hero atmosphere only |

Typography: keep an expressive branded stack already used by the marketing theme (not Inter/system as the hero face). Docs may use a cleaner UI stack closer to Fumadocs.

### Docs (`theme-docs`)

Match Fumadocs visual language:

- Light: white / slate surfaces, soft borders.
- Dark: navy-slate surfaces, soft borders.
- Accent: Kumooo mint/teal so docs still feel like the same product.
- Rounded-lg sidebar pills, active state with subtle accent wash.
- Layout feels like [fumadocs.dev/docs](https://www.fumadocs.dev/docs), not a marketing page.

## Marketing homepage

Page stack, top to bottom:

1. **Sticky nav**  - brand, Features / Docs / Pricing / About, GitHub CTA.
2. **Hero**  - one headline, one supporting line, `npx create-kumooo` copy chip, primary/secondary CTAs, dashboard preview panel on the right (product-first).
3. **Live numbers**  - edge TTFB, required JS (0), edge cities, free to start.
4. **Tabbed product tour**  - Editor / Media / Domains / Themes. Tab change crossfades content with Framer Motion.
5. **Feature grid**  - six concrete capabilities with hover lift.
6. **Closing CTA**  - ship tonight. No email block.

Motion budget (marketing):

- Scroll reveals on sections.
- Hover lifts on feature cards and primary controls.
- Tab crossfade on the product tour.
- Copy-chip success flash.

Secondary marketing pages (About, Features, Pricing, etc.):

- Shared nav/footer and tokens.
- Short intro, 2–3 sections, one CTA. Dense enough to not feel empty.
- About points to Ren via `renzoreyn.dev` and GitHub. GitHub / docs are primary contact surfaces.

## Docs experience (Fumadocs-close)

### Layout

- Three columns: sticky sidebar · article · sticky TOC.
- Top docs header: brand, search trigger, light/dark toggle, App / GitHub links.
- Mobile: hamburger drawer for sidebar; TOC collapses into a popover under the header.
- Breadcrumbs above the article title.
- Prev / Next footer on every doc page.

### Sidebar

- Grouped folders with section labels (Getting started, Guides, Reference, etc.).
- Nested links when needed.
- Rounded active pill and hover states in the Fumadocs style.

### Article

- Single `h1` from the content title (theme owns it).
- Markdown body starts at `h2` or prose (no duplicate `# Title`).
- Prose styling for headings, lists, tables, callouts.
- Code blocks with a copy button.
- Heading anchor links.

### TOC

- “On this page” label.
- Scroll-spy with an accent indicator on the active heading.

### Search

- Client-side command palette over seeded docs titles and headings.
- Looks like Fumadocs search UX. Not a full search index.

### Motion (docs)

Keep it light: sidebar active transition, TOC indicator, drawer slide. Not marketing-level kinetic.

## Double `h1` fix

Root cause: theme renders the page title as `h1`, and seeded markdown also starts with `# Title`.

Rules:

1. Theme always renders the content title as the only `h1`.
2. Seeded markdown for titled pages must not start with a duplicate `# Title`.
3. Apply the same rule on marketing secondary pages.

## Technical approach

### Themes stay SSR + island

- Marketing and docs remain packages consumed by the renderer.
- HTML is server-rendered. Interactive pieces ship as a small client island (Framer Motion, tabs, copy chip, search palette, theme toggle, TOC spy, mobile drawer).
- No Next.js for official marketing/docs sites.

### Content and seed

- Update `scripts/seed-official.mjs` and marketing/docs markdown so structure matches the new sections and the single-`h1` rule.
- Docs sidebar groups and order live in a nav map inside `theme-docs` (slug → group + order). Frontmatter may override title display only; it does not redefine the tree.
- Prefer GitHub and docs links over email in CTAs and footer.

### Deploy

1. Build and deploy renderer (themes bundled).
2. Re-seed official sites (`kumooo` marketing, `documentation` docs).
3. Verify `kumooo.dev` and `docs.kumooo.dev`: titles, density, motion, Fumadocs layout, contact surfaces.

## Success criteria

- Homepage matches the approved product-first mockup structure (nav, hero + dashboard, stats, tabs, features, CTA).
- Docs layout is recognizably Fumadocs-like (sidebar groups, header search + theme toggle, TOC spy, breadcrumbs, prev/next).
- No page shows two identical `h1`s.
- No primary email CTA on marketing or docs.
- Background is soft charcoal on marketing; docs support light and dark.
- Sites feel populated, not empty.

## Open decisions (resolved)

| Decision | Choice |
| --- | --- |
| Marketing vibe | Product-first + kinetic |
| Docs fidelity | As close to Fumadocs as practical without Next.js |
| Contact | GitHub / docs, not email |
| Black | Soft charcoal `#101218` on marketing |
| Search | Client title/heading palette only |

## Implementation next

After Ren reviews this file, write an implementation plan (writing-plans) covering theme rebuilds, content/seed updates, verification, and deploy.
