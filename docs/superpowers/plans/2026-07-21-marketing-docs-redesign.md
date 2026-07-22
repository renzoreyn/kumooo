# Marketing & Docs Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild `theme-marketing` and `theme-docs` so kumooo.dev feels product-first and kinetic, docs.kumooo.dev feels Fumadocs-close, every page has one `h1`, and contact is GitHub/docs not email.

**Architecture:** Both themes stay SSR HTML packages consumed by the renderer, with small client islands (Framer Motion DOM API via esm.sh) for tabs, copy chip, search palette, theme toggle, TOC spy, and mobile drawer. Docs nav tree is a hardcoded map in `theme-docs`. Seeded markdown drops leading `# Title` so themes own the only `h1`.

**Tech Stack:** TypeScript, `@kumooo/theme-kit` (`html`/`raw`/`joinHtml`), Framer Motion DOM via esm.sh, Google Fonts (Sora + IBM Plex Mono for marketing; Inter for docs), Cloudflare renderer deploy + `scripts/seed-official.mjs`.

## Global Constraints

- Marketing background `#101218`, accent `#6ee7b7`, muted `#9a968c`, no pure black.
- Docs must feel like Fumadocs (3-col layout, header search + theme toggle, TOC spy, breadcrumbs, prev/next). No Next.js.
- Theme owns the only `h1`. Markdown bodies must not start with a duplicate `# Title`.
- No email as primary contact. Use GitHub (`https://github.com/renzoreyn/kumooo`) and docs (`https://docs.kumooo.dev`).
- Follow `WRITING.md`: no em dashes, no forbidden marketing jargon.
- Do not rebuild marketing/docs as Next.js apps.

---

## File map

| File | Responsibility |
| --- | --- |
| `packages/theme-marketing/src/index.ts` | Marketing shell, homepage sections, client island, secondary page shell |
| `packages/theme-docs/src/index.ts` | Docs shell, nav map, Fumadocs layout, client island (search/TOC/theme/drawer) |
| `content/docs/*.md` | Docs bodies without leading `# Title` |
| `scripts/seed-official.mjs` | Seed marketing pages (features/pricing/about) + docs; no email CTAs in seed copy |
| `apps/renderer` (deploy only) | Bundles themes; no API contract changes expected |

---

### Task 1: Marketing theme rebuild

**Files:**
- Modify: `packages/theme-marketing/src/index.ts`

**Interfaces:**
- Consumes: `Theme`, `ThemeSiteContext`, `html`/`raw`/`joinHtml` from `@kumooo/theme-kit`
- Produces: `marketingTheme: Theme` with hardcoded product-first `home` / index `page`, richer `clientIsland`

- [ ] **Step 1: Update CSS tokens to soft charcoal**

Set `:root` to:

```css
:root {
  --bg: #101218;
  --fg: #f3f1ea;
  --muted: #9a968c;
  --line: #262b37;
  --accent: #6ee7b7;
  --accent-ink: #06261c;
  --card: #12151d;
  --panel: #161922;
  --max: 72rem;
  color-scheme: dark;
}
```

Remove pure `#0b0c10` / `#000` backgrounds.

- [ ] **Step 2: Rebuild homepage HTML to match approved stack**

In `marketingHome(site)` render (fullBleed):

1. Hero grid: kicker, single `h1` ("Websites shouldn't need babysitting."), lead, install chip with `data-copy="npx create-kumooo"` + Copy button, Docs + GitHub CTAs, right-side dashboard preview markup (fake UI chrome, not curl pre).
2. Stats row: four cards (`41ms`, `0kb`, `330+`, `$0`) with short labels.
3. Tabbed tour: buttons `data-tour-tab` for Editor / Media / Domains / Themes; panels `data-tour-panel`.
4. Feature grid: six cards (Fast, Themes, Cloudflare, Security, Revisions, SEO) with `data-motion-card`.
5. Closing CTA block: "Ship your first site tonight." + `npx create-kumooo` button. No email.

- [ ] **Step 3: Fix shell contact + page `h1` rule**

Footer must be:

```html
<p class="fine">Made by <a href="https://renzoreyn.dev">Ren</a>. <a href="https://github.com/renzoreyn/kumooo">GitHub</a> · <a href="https://docs.kumooo.dev">Docs</a></p>
```

Keep `page` / `post` rendering a single `<h1>${title}</h1>` before `${raw(html)}`. Do not strip HTML here; content seed handles duplicate headings.

- [ ] **Step 4: Expand client island**

Replace `clientIsland` with module that:

1. Animates `[data-motion-hero]` and `[data-motion-card]` (existing pattern).
2. Copy chip: click `[data-copy]` writes `dataset.copy` to clipboard and briefly sets text to `copied`.
3. Tabs: click `[data-tour-tab]` shows matching `[data-tour-panel]`, hides others, animates opacity.
4. Scroll reveal: `IntersectionObserver` on `[data-reveal-on-scroll]` adds `.is-visible`.

- [ ] **Step 5: Typecheck**

Run: `pnpm --filter @kumooo/theme-marketing exec tsc --noEmit`  
Expected: exit 0

- [ ] **Step 6: Commit**

```bash
git add packages/theme-marketing/src/index.ts
git commit -m "Rebuild marketing theme with product-first homepage and kinetic island."
```

---

### Task 2: Docs theme rebuild (Fumadocs-close)

**Files:**
- Modify: `packages/theme-docs/src/index.ts`

**Interfaces:**
- Consumes: `extractToc` from `@kumooo/core`; theme-kit helpers
- Produces: `docsTheme: Theme`; internal `NAV_MAP` and helpers `navGroups()`, `prevNext(slug)`, `searchIndex(site)`

- [ ] **Step 1: Add nav map**

```ts
type NavItem = { slug: string; title: string; group: string; order: number };

const NAV_MAP: NavItem[] = [
  { slug: "index", title: "Introduction", group: "Getting started", order: 1 },
  { slug: "getting-started", title: "Getting started", group: "Getting started", order: 2 },
  { slug: "installation", title: "Installation", group: "Getting started", order: 3 },
  { slug: "architecture", title: "Architecture", group: "Guides", order: 10 },
  { slug: "cli", title: "CLI", group: "Guides", order: 11 },
  { slug: "themes", title: "Themes", group: "Guides", order: 12 },
  { slug: "authentication", title: "Authentication", group: "Guides", order: 13 },
  { slug: "writing", title: "Writing", group: "Guides", order: 14 },
  { slug: "api-reference", title: "API reference", group: "Reference", order: 20 },
];
```

Group sidebar by `group`, sort by `order`. Active link: compare current page slug to `item.slug` (pass `currentSlug` into `docsShell`).

- [ ] **Step 2: Rebuild CSS + shell to Fumadocs layout**

Structure:

```html
<div class="fd-root" data-theme="system">
  <header class="fd-header">brand · search button · theme toggle · App · GitHub · mobile menu</header>
  <div class="fd-layout">
    <aside class="fd-sidebar">grouped nav</aside>
    <main class="fd-main">
      <nav class="fd-breadcrumbs">Docs / Group / Title</nav>
      <article>…</article>
      <nav class="fd-pager">prev · next</nav>
    </main>
    <aside class="fd-toc">On this page + links</aside>
  </div>
  <div class="fd-drawer" hidden>mobile sidebar clone</div>
  <div class="fd-search" hidden>command palette</div>
</div>
```

CSS requirements:

- Light defaults + `[data-theme="dark"]` / `prefers-color-scheme` dark tokens (navy-slate).
- Accent mint/teal (`#0d9488` light / `#2dd4bf` dark).
- Sticky sidebar + TOC; hide TOC under ~1100px; hide sidebar under ~800px (drawer instead).
- Rounded-lg active sidebar pills.
- Prose styles, code block wrapper for copy button (`.fd-code` with `button[data-copy-code]`).
- No mailto contact links.

- [ ] **Step 3: Wire page helpers**

- Breadcrumbs: `Docs` → group → title.
- `prevNext(slug)`: flatten `NAV_MAP` by order; return neighbors.
- Home: render intro + start-here list from `NAV_MAP` (single `h1` = site title or "Kumooo docs").
- `page` / `post`: `<h1>${title}</h1>` + body + TOC from `extractToc`.
- Embed search index as `JSON.stringify(NAV_MAP.map(...))` into `data-search-index` on the search root (titles + slugs; headings can be empty array for MVP if not extracted server-side for all pages).

For richer search, also pass current page headings from `extractToc` into a `window.__KUMOOO_SEARCH__` bootstrap:

```js
window.__KUMOOO_SEARCH__ = {
  pages: NAV_PAGES, // from SSR JSON
  currentHeadings: toc.map(t => ({ id: t.id, text: t.text, url: `#${t.id}` })),
};
```

- [ ] **Step 4: Client island**

Implement:

1. Theme toggle: cycle `light` / `dark` / `system`, persist `localStorage.kumooo-docs-theme`, set `data-theme` on `.fd-root`.
2. Mobile drawer open/close.
3. Search palette: Cmd/Ctrl+K or button; filter `pages` + `currentHeadings` by query; Enter navigates.
4. TOC scroll-spy: IntersectionObserver on `h2,h3` in article; set `.active` on TOC links.
5. Code copy: for each `pre`, wrap or attach button that copies `pre.innerText`.
6. Light fade-in on `[data-docs-main]` (keep subtle).

- [ ] **Step 5: Typecheck**

Run: `pnpm --filter @kumooo/theme-docs exec tsc --noEmit`  
Expected: exit 0

- [ ] **Step 6: Commit**

```bash
git add packages/theme-docs/src/index.ts
git commit -m "Rebuild docs theme to match Fumadocs layout and interactions."
```

---

### Task 3: Strip duplicate titles from content + seed marketing pages

**Files:**
- Modify: `content/docs/*.md` (all pages that start with `# Title`)
- Modify: `scripts/seed-official.mjs`
- Create marketing page bodies inline in seed (or add `content/marketing/*.md` if preferred)

**Interfaces:**
- Consumes: existing seed `upsertPage(siteId, { slug, title, bodyMarkdown })`
- Produces: published pages whose HTML does not contain a second matching `h1`

- [ ] **Step 1: Strip leading `# …` from each docs markdown file**

For every file under `content/docs/` except README if unused: remove the first line if it is an ATX `h1` matching the page title. Body should start with intro paragraph or `##`.

Example `getting-started.md` before:

```md
# Getting started

Kumooo is…
```

After:

```md
Kumooo is…
```

Keep `##` sections intact so TOC still works.

- [ ] **Step 2: Update seed marketing secondary pages**

In `scripts/seed-official.mjs`, ensure pages `features`, `pricing`, `about` exist with bodies that:

- Do not start with `# Features` / `# Pricing` / `# About`
- Are 2–3 short sections of real copy (WRITING.md tone)
- About links to `https://renzoreyn.dev` and GitHub, not mailto as primary CTA
- Footer/contact language in seed copy avoids email

Also remove any seed/nav references that use `mailto:contact@renzoreyn.dev` if present.

- [ ] **Step 3: Commit**

```bash
git add content/docs scripts/seed-official.mjs
git commit -m "Fix duplicate h1s in docs content and densify marketing seed pages."
```

---

### Task 4: Verify locally (typecheck + theme smoke)

**Files:** none (verification only)

- [ ] **Step 1: Monorepo typecheck**

Run: `pnpm typecheck`  
Expected: exit 0

- [ ] **Step 2: Smoke-render themes if a small test harness exists**

If no harness, skip. Otherwise import `marketingTheme` / `docsTheme` and call `page`/`home` with a fake `ThemeSiteContext` and assert:

```ts
const html = String(marketingTheme.home(site, { posts: [], page: 1, totalPages: 1, basePath: "/" }));
assert(!html.includes("mailto:contact@renzoreyn.dev"));
assert((html.match(/<h1/g) || []).length === 1);
assert(html.includes("#101218") || html.includes("--bg: #101218"));
```

- [ ] **Step 3: Commit only if tests/harness files were added**

---

### Task 5: Deploy renderer + re-seed official sites

**Files:** deploy config already in `apps/renderer/wrangler.jsonc`

- [ ] **Step 1: Deploy renderer**

Run from repo root (use project’s existing deploy path):

```bash
pnpm --filter @kumooo/renderer exec wrangler deploy
```

Expected: successful Worker deploy.

- [ ] **Step 2: Re-seed**

```bash
$env:KUMOOO_API="https://<api-worker-url>"
$env:KUMOOO_EMAIL="contact@renzoreyn.dev"
$env:KUMOOO_PASSWORD="<existing password>"
node scripts/seed-official.mjs
```

Expected: `updated` / `created` lines for marketing + docs pages.

- [ ] **Step 3: Manual verify**

Open:

- `https://kumooo.dev`  - soft charcoal, dashboard hero, stats, tabs, features, CTA; one `h1`; no email in footer
- `https://kumooo.dev/about`  - one `h1`, dense enough, Ren/GitHub links
- `https://docs.kumooo.dev`  - Fumadocs-like shell, search, theme toggle, sidebar groups
- A deep docs page  - TOC spy, breadcrumbs, prev/next, one `h1`

- [ ] **Step 4: Commit any deploy/script tweaks if needed**

---

## Spec coverage checklist

| Spec requirement | Task |
| --- | --- |
| Product-first homepage stack | Task 1 |
| Kinetic motion (scroll, hover, tabs, copy) | Task 1 |
| Soft charcoal `#101218` | Task 1 |
| Fumadocs docs layout + interactions | Task 2 |
| Nav map in theme-docs | Task 2 |
| Single `h1` | Tasks 1–3 |
| No email primary contact | Tasks 1–2 |
| Seed denser marketing pages | Task 3 |
| Deploy + verify | Task 5 |

## Self-review notes

- No Orama / MDX / versioning (non-goals respected).
- Search is client title/heading palette only (Task 2).
- Plan avoids placeholders; theme CSS/JS details are specified by structure and behavior, not every pixel of Fumadocs.
