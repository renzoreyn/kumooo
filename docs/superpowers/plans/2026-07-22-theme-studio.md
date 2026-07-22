# Theme Studio Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans (preferred for this repo; user has rejected heavy subagent fan-out) or superpowers:subagent-driven-development. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Let tenants ship a custom site look by editing a fixed file tree (HTML templates + CSS + optional client JS), preview it, and publish to `sites.theme = custom:{siteId}` without running arbitrary TypeScript in the Worker.

**Architecture:** New `@kumooo/theme-studio` package validates and renders a mustache-style template dialect into the existing `Theme` SSR surface. Draft/published blobs live in R2 under `themes/{siteId}/…`. D1 `site_themes` tracks published versions. Dashboard Design → Theme Studio edits files; renderer loads `custom:{siteId}` from the published snapshot.

**Tech Stack:** TypeScript workspace packages, Vitest, D1 + R2 on Workers, Vite dashboard (textarea/CodeMirror-light first; Monaco only if needed), existing preview tokens.

## Global Constraints

- No em dashes (U+2014) in md/ts/tsx/html.
- Escape-by-default templates; `{{{…}}}` only for documented trusted keys (`bodyHtml`, `head`).
- No `eval` of user TypeScript on the edge; no npm imports in `client.js`.
- Size caps: CSS 256 KB, templates total 256 KB, `client.js` 128 KB.
- `marketing` / `docs` stay platform-only; seasons remain the gallery.
- Role gate: draft edits `editor`+, publish `editor`+.
- Commits: small, imperative, frequent.
- Prefer inline execution over subagent fan-out.

## File map

| Path | Responsibility |
| --- | --- |
| `packages/theme-studio/src/dialect.ts` | Parse/validate template tags; escape render |
| `packages/theme-studio/src/starter.ts` | Default file tree for new drafts |
| `packages/theme-studio/src/compile.ts` | Compile files → `Theme` |
| `packages/theme-studio/src/limits.ts` | Size/path allowlists |
| `packages/theme-studio/test/*.test.ts` | Validator + XSS escape + compile smoke |
| `packages/db/migrations/0003_theme_studio.sql` | `site_themes` table |
| `packages/db/src/schema.ts` | Drizzle `siteThemes` |
| `apps/api/src/routes/theme-studio.ts` | Draft CRUD, publish, list versions |
| `apps/api/src/lib/theme-r2.ts` | R2 key helpers put/get/list |
| `apps/renderer/src/custom-theme.ts` | Load published theme for `custom:{siteId}` |
| `apps/renderer/src/theme.ts` | Resolve custom ids via loader |
| `apps/dashboard/src/features/design/ThemeStudioPage.tsx` | Editor UI |
| `apps/dashboard/src/lib/api/theme-studio.ts` | API client |
| `content/docs/themes.md` | Document Studio + dialect |

---

### Task 1: Template dialect (validate + render)

**Files:**
- Create: `packages/theme-studio/package.json`, `tsconfig.json`, `src/index.ts`, `src/dialect.ts`, `src/limits.ts`
- Test: `packages/theme-studio/test/dialect.test.ts`

**Interfaces:**
- Produces:

```ts
export type TemplateContext = Record<string, unknown>;

export function validateTemplate(source: string): { ok: true } | { ok: false; errors: string[] };
export function renderTemplate(source: string, ctx: TemplateContext): string;
export const TRUSTED_TRIPLE_KEYS: ReadonlySet<string>; // bodyHtml, head
export const LIMITS: { cssBytes: number; templatesBytes: number; clientJsBytes: number };
```

- [ ] **Step 1: Scaffold package** mirroring `@kumooo/theme-seasons` (name `@kumooo/theme-studio`, vitest, typecheck). Depend on nothing heavy; escape HTML with a small local helper (or reuse pattern from core if exported cleanly).

- [ ] **Step 2: Failing tests**

```ts
import { describe, expect, it } from "vitest";
import { renderTemplate, validateTemplate } from "../src/dialect.js";

describe("dialect", () => {
  it("escapes double-stash user fields", () => {
    const html = renderTemplate("<h1>{{title}}</h1>", { title: "<script>alert(1)</script>" });
    expect(html).toContain("&lt;script&gt;");
    expect(html).not.toContain("<script>");
  });
  it("allows trusted triple-stash for bodyHtml only", () => {
    expect(validateTemplate("{{{bodyHtml}}}").ok).toBe(true);
    expect(validateTemplate("{{{title}}}").ok).toBe(false);
  });
  it("renders #posts loops", () => {
    const html = renderTemplate("{{#posts}}<li>{{title}}</li>{{/posts}}", {
      posts: [{ title: "A" }, { title: "B" }],
    });
    expect(html).toContain("<li>A</li>");
    expect(html).toContain("<li>B</li>");
  });
});
```

- [ ] **Step 3: Implement dialect**
  - `{{path.to.value}}` → HTML-escaped string
  - `{{{bodyHtml}}}` / `{{{head}}}` → raw (trusted)
  - `{{#posts}}…{{/posts}}` and `{{#tags}}…{{/tags}}` for arrays of objects
  - `{{#if key}}…{{/if}}` optional simple truthy (keep minimal)
  - Reject `{{` expressions with `(` / `=` / backticks
  - Reject unknown triple-stash keys

- [ ] **Step 4: Run tests**

Run: `pnpm --filter @kumooo/theme-studio test`

- [ ] **Step 5: Commit**

```bash
git add packages/theme-studio
git commit -m "Add Theme Studio template dialect with escape-by-default rendering."
```

---

### Task 2: Starter tree + compile to Theme

**Files:**
- Create: `packages/theme-studio/src/starter.ts`, `packages/theme-studio/src/compile.ts`, `packages/theme-studio/src/types.ts`
- Test: `packages/theme-studio/test/compile.test.ts`
- Modify: `packages/theme-studio/src/index.ts`

**Interfaces:**
- Produces:

```ts
export type ThemeFiles = {
  "theme.json": string;
  "styles.css": string;
  "templates/home.html": string;
  "templates/post.html": string;
  "templates/page.html": string;
  "templates/archive.html": string;
  "templates/notFound.html": string;
  "client.js"?: string;
};

export function starterThemeFiles(label?: string): ThemeFiles;
export function validateThemeFiles(files: ThemeFiles): { ok: true } | { ok: false; errors: string[] };
export function compileTheme(files: ThemeFiles): import("@kumooo/theme-kit").Theme;
```

- [ ] **Step 1: Starter** with readable default CSS (light paper, not purple cliché) and templates using `{{{head}}}`, `{{site.title}}`, `{{#posts}}`, `{{{bodyHtml}}}`.

- [ ] **Step 2: validateThemeFiles** checks required paths, `theme.json` parse, size caps, each template via `validateTemplate`.

- [ ] **Step 3: compileTheme** returns a `Theme` whose functions wrap templates + inject `<style>` + optional `<script defer src=…>` later (v1 can inline `client.js` as `<script type="module">` only if same-origin content; prefer deferred inline module with CSP note). For v1: inline `client.js` at end of body as `<script type="module">…</script>` after validating no `import` from http(s).

- [ ] **Step 4: Test compile home contains site title and CSS.**

- [ ] **Step 5: Commit**

```bash
git add packages/theme-studio
git commit -m "Compile Theme Studio file trees into theme-kit Theme objects."
```

---

### Task 3: D1 `site_themes` + R2 helpers

**Files:**
- Create: `packages/db/migrations/0003_theme_studio.sql`
- Modify: `packages/db/src/schema.ts`, `packages/db/src/index.ts` if needed
- Create: `apps/api/src/lib/theme-r2.ts`

**Interfaces:**
- Produces table:

```sql
CREATE TABLE site_themes (
  id TEXT PRIMARY KEY,
  site_id TEXT NOT NULL,
  version INTEGER NOT NULL,
  status TEXT NOT NULL, -- draft | published | archived
  label TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  published_at INTEGER
);
CREATE UNIQUE INDEX site_themes_site_version ON site_themes (site_id, version);
CREATE INDEX site_themes_site_status ON site_themes (site_id, status);
```

- Produces R2 helpers:

```ts
export function draftKey(siteId: string, path: string): string; // themes/{siteId}/draft/{path}
export function publishedKey(siteId: string, version: number, path: string): string;
export async function putThemeFile(bucket: R2Bucket, key: string, body: string, contentType: string): Promise<void>;
export async function getThemeFile(bucket: R2Bucket, key: string): Promise<string | null>;
export async function listThemePrefix(bucket: R2Bucket, prefix: string): Promise<string[]>;
```

- [ ] **Step 1: Write migration + Drizzle table `siteThemes`.**

- [ ] **Step 2: Apply remote migration**

Run: `pnpm exec wrangler d1 migrations apply kumooo-app --remote` from `apps/api` (or repo standard migrate command).

- [ ] **Step 3: Implement theme-r2 helpers; unit-test key formatting in a tiny node test or assert in API tests.**

- [ ] **Step 4: Commit**

```bash
git add packages/db apps/api/src/lib/theme-r2.ts
git commit -m "Add site_themes table and R2 key helpers for Theme Studio."
```

---

### Task 4: Theme Studio API routes

**Files:**
- Create: `apps/api/src/routes/theme-studio.ts`
- Modify: `apps/api/src/index.ts` to mount routes
- Optionally: Zod schemas in `packages/core/src/schemas.ts`

**Interfaces:**
- Produces endpoints (all site-scoped via `requireSiteAccess`):

| Method | Path | Role | Behavior |
| --- | --- | --- | --- |
| GET | `/v1/sites/:siteId/theme-studio` | viewer | Draft files (or starter if empty) + published version meta |
| PUT | `/v1/sites/:siteId/theme-studio/files` | editor | Body `{ files: Partial<ThemeFiles> }` merge into draft R2 |
| POST | `/v1/sites/:siteId/theme-studio/reset` | editor | Reset draft to starter |
| POST | `/v1/sites/:siteId/theme-studio/publish` | editor | Validate, copy draft → published/vN, insert `site_themes`, set `sites.theme=custom:{siteId}`, bump cache |
| GET | `/v1/sites/:siteId/theme-studio/versions` | viewer | List published versions |

- [ ] **Step 1: Implement GET (ensure draft exists by writing starter on first read).**

- [ ] **Step 2: Implement PUT with path allowlist + size checks before R2 put.**

- [ ] **Step 3: Implement publish** using `validateThemeFiles` + `compileTheme` (compile must succeed); version = max+1; prune archived beyond keep-last-10; `recordSiteEvent` type `site.theme_published`; `bumpCacheVersion`.

- [ ] **Step 4: Manual smoke via curl login + GET/PUT/publish.**

- [ ] **Step 5: Commit**

```bash
git add apps/api packages/core
git commit -m "Add Theme Studio draft and publish API."
```

---

### Task 5: Renderer loads `custom:{siteId}`

**Files:**
- Create: `apps/renderer/src/custom-theme.ts`
- Modify: `apps/renderer/src/theme.ts`, `apps/renderer/src/index.ts` (preview already passes theme override)
- Modify: `apps/renderer/package.json` depend on `@kumooo/theme-studio`

**Interfaces:**
- Produces:

```ts
export async function loadCustomTheme(
  env: { MEDIA: R2Bucket; DB: D1Database },
  siteId: string,
): Promise<Theme | null>;
```

- `getTheme` becomes async OR renderer calls `resolveTheme(name, env, siteId)`:
  - if name starts with `custom:`, load published files from latest `site_themes` published version
  - else existing registry

Prefer sync registry for first-party and a small cache Map for custom themes keyed by `siteId:version` with KV version already busting pages.

- [ ] **Step 1: loadCustomTheme** reads D1 latest published version for site, loads required R2 objects, `compileTheme`.

- [ ] **Step 2: Wire render paths** (home/post/page/archive/404/preview) to await custom loader when needed.

- [ ] **Step 3: When custom theme active, add CSP header** `default-src 'self'; style-src 'self' 'unsafe-inline'; script-src 'self' 'unsafe-inline'` (inline module for client.js v1) — tighten later.

- [ ] **Step 4: Deploy renderer; smoke custom theme on a site.**

- [ ] **Step 5: Commit**

```bash
git add apps/renderer
git commit -m "Render published custom themes from R2 in the Worker."
```

---

### Task 6: Dashboard Theme Studio UI

**Files:**
- Create: `apps/dashboard/src/lib/api/theme-studio.ts`
- Create: `apps/dashboard/src/features/design/ThemeStudioPage.tsx`
- Modify: `apps/dashboard/src/components/nav/Sidebar.tsx`, `apps/dashboard/src/app/router.tsx`
- Modify: `ThemesPage.tsx` — short note linking to Studio; show Active when `site.theme` starts with `custom:`

**Interfaces:**
- UI: file list (fixed paths) + textarea editor + Save draft + Reset + Publish + Preview (uses existing preview-token with theme `custom:{siteId}` after publish, or draft preview token extension).

**Draft preview (v1 decision):** Preview button requires publish OR we add preview API that compiles draft in-memory. Prefer **draft preview**: extend preview-token payload `theme: "custom-draft:{siteId}"` and renderer loads draft R2. If too large for one task, ship publish-then-preview first and add draft preview in a follow-up commit in this same task.

Ship **draft preview** in this task: token theme `custom-draft:{siteId}` → renderer loads draft files.

- [ ] **Step 1: API client + route `/sites/:siteId/design/studio`.**

- [ ] **Step 2: Page UI** (no Monaco required): select file, edit, save, publish, preview.

- [ ] **Step 3: Sidebar entry "Theme Studio".**

- [ ] **Step 4: Typecheck dashboard; deploy Pages.**

- [ ] **Step 5: Commit**

```bash
git add apps/dashboard
git commit -m "Add Theme Studio editor under Design."
```

---

### Task 7: Docs + production smoke

**Files:**
- Modify: `content/docs/themes.md`
- Re-seed docs; deploy API if not already

- [ ] **Step 1: Document file tree, dialect, limits, custom theme id.**

- [ ] **Step 2: Seed + smoke**
  1. Open Studio on smoke site → edit CSS accent → save → publish
  2. Public home uses custom styles
  3. `{{title}}` with `<script>` in a post title stays escaped
  4. Switch back to `haru` in Themes gallery

- [ ] **Step 3: Commit docs**

```bash
git add content/docs/themes.md
git commit -m "Document Theme Studio for tenants."
```

---

## Spec coverage (Phase 2)

| Spec item | Task |
| --- | --- |
| Starter file tree | 2 |
| Mustache dialect + escape | 1 |
| R2 draft/published + site_themes | 3 |
| Activate `custom:{siteId}` | 4-5 |
| Dashboard Theme Studio | 6 |
| Size caps / validation | 1-2, 4 |
| CSP on custom | 5 |
| Docs | 7 |
| No marketing/docs in gallery | unchanged (gallery) |

Phase 3 scheduler / CF SaaS: **not in this plan**.

## Execution

Prefer **inline execution** with executing-plans checkpoints after Tasks 2, 4, and 6.
