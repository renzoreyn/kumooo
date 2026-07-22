# Season Themes + CF Deploy (Phase 1) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans (preferred for this repo; user has rejected heavy subagent fan-out) or superpowers:subagent-driven-development. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship four free tenant themes (`haru` default, `natsu`, `aki`, `fuyu`) and reframe marketing around a two-path CF Deploy choice (Kumooo `*.kumooo.dev` vs your Cloudflare).

**Architecture:** One package `@kumooo/theme-seasons` exports four `Theme` objects registered in the renderer. `getTheme("default")` aliases to `haru`. Dashboard shares a `TENANT_THEMES` allowlist. Marketing theme gains a CF Deploy dialog; Domains dashboard stays for operators.

**Tech Stack:** TypeScript workspace packages, `@kumooo/theme-kit`, Cloudflare Worker renderer, Vite dashboard, Vitest in `@kumooo/core` / theme package tests.

**Spec:** `docs/superpowers/specs/2026-07-22-season-themes-cf-deploy-studio-design.md` (Phase 1 only). Phase 2 Theme Studio and Phase 3 hardening get separate plans after this ships.

## Global Constraints

- No em dashes (U+2014) in md/ts/tsx/html.
- No fabricated analytics or fake “one-click OAuth into any CF account.”
- Do not expose `marketing` or `docs` in tenant theme galleries.
- Real data only; season themes must be distinct designs, not four recolors of one sheet.
- Avoid purple-on-white / cream+terracotta AI cliché palettes.
- Commits: small, imperative, frequent.

## File map

| Path | Responsibility |
| --- | --- |
| `packages/theme-seasons/package.json` | Package manifest |
| `packages/theme-seasons/src/shared.ts` | Shared shell helpers (nav, pager, fonts helpers) if needed without sharing CSS |
| `packages/theme-seasons/src/haru.ts` | Spring theme |
| `packages/theme-seasons/src/natsu.ts` | Summer theme |
| `packages/theme-seasons/src/aki.ts` | Autumn theme |
| `packages/theme-seasons/src/fuyu.ts` | Winter theme |
| `packages/theme-seasons/src/index.ts` | Export all four + `SEASON_THEME_IDS` |
| `packages/theme-seasons/test/seasons.test.ts` | Render smoke + name checks |
| `apps/renderer/src/theme.ts` | Alias `default` → `haru` |
| `apps/renderer/src/index.ts` | Register season themes |
| `apps/renderer/package.json` | Depend on `@kumooo/theme-seasons` |
| `packages/core/src/schemas.ts` | `createSiteSchema` default theme `haru` |
| `packages/db/src/schema.ts` | Column default `haru` (new sites; no forced rewrite) |
| `apps/dashboard/src/lib/themes.ts` | Shared `TENANT_THEMES` catalog |
| `apps/dashboard/src/features/design/ThemesPage.tsx` | Gallery of four |
| `apps/dashboard/src/features/sites/CreateSiteDialog.tsx` | Select four; default haru |
| `apps/dashboard/src/features/settings/SettingsPage.tsx` | Select four |
| `packages/theme-marketing/src/index.ts` | CF Deploy CTA + dialog + copy |
| `content/docs/themes.md` | Document seasons + alias |
| `packages/theme-default` | Keep package for back-compat import if needed; renderer may stop registering it once seasons provide haru |

---

### Task 1: Theme resolution alias + schema defaults

**Files:**
- Modify: `apps/renderer/src/theme.ts`
- Modify: `packages/core/src/schemas.ts`
- Modify: `packages/db/src/schema.ts`
- Test: `packages/core/test/theme-alias.test.ts` (new) OR put alias test next to renderer if easier in core helper

**Interfaces:**
- Produces: `resolveThemeName(name: string): string` in `apps/renderer/src/theme.ts` (or `packages/core`) mapping `"" | "default"` → `"haru"`
- Produces: `createSiteSchema` default `theme: "haru"`

- [ ] **Step 1: Add failing test for alias**

Create `packages/core/src/theme-id.ts`:

```ts
export function resolveThemeId(name: string | null | undefined): string {
  const n = (name ?? "").trim();
  if (!n || n === "default") return "haru";
  return n;
}
```

Test `packages/core/test/theme-id.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { resolveThemeId } from "../src/theme-id.js";

describe("resolveThemeId", () => {
  it("maps default and empty to haru", () => {
    expect(resolveThemeId("default")).toBe("haru");
    expect(resolveThemeId("")).toBe("haru");
    expect(resolveThemeId(null)).toBe("haru");
  });
  it("passes through season ids", () => {
    expect(resolveThemeId("natsu")).toBe("natsu");
  });
});
```

Export from `packages/core/src/index.ts`.

- [ ] **Step 2: Run test (fail until file exists, then pass)**

Run: `pnpm --filter @kumooo/core test`

- [ ] **Step 3: Wire schema + db defaults**

In `packages/core/src/schemas.ts` change createSiteSchema:

```ts
theme: z.string().default("haru"),
```

In `packages/db/src/schema.ts`:

```ts
theme: text("theme").notNull().default("haru"),
```

(No migration required for SQLite default on new rows if column already exists; existing rows keep `default` string and resolve at runtime.)

- [ ] **Step 4: Use resolveThemeId in renderer getTheme**

```ts
import { resolveThemeId } from "@kumooo/core";

export function getTheme(name: string): Theme {
  const id = resolveThemeId(name);
  return themes.get(id) ?? themes.get("haru") ?? themes.get("default")!;
}
```

- [ ] **Step 5: Commit**

```bash
git add packages/core apps/renderer/src/theme.ts packages/db/src/schema.ts
git commit -m "Alias default theme to haru and default new sites to haru."
```

---

### Task 2: Scaffold `@kumooo/theme-seasons` with haru

**Files:**
- Create: `packages/theme-seasons/package.json`
- Create: `packages/theme-seasons/tsconfig.json` (copy from theme-default)
- Create: `packages/theme-seasons/src/haru.ts`
- Create: `packages/theme-seasons/src/index.ts`
- Create: `packages/theme-seasons/test/seasons.test.ts`
- Modify: `apps/renderer/package.json` + `pnpm-lock.yaml` via install
- Modify: `apps/renderer/src/index.ts`

**Interfaces:**
- Produces: `export const haruTheme: Theme` with `name: "haru"`
- Produces: `export const seasonThemes: Theme[]`

- [ ] **Step 1: Package scaffold**

`package.json` mirror `@kumooo/theme-default` with name `@kumooo/theme-seasons`.

- [ ] **Step 2: Failing test expecting haruTheme.name**

```ts
import { describe, expect, it } from "vitest";
import { haruTheme } from "../src/index.js";

describe("haruTheme", () => {
  it("is named haru and renders home", () => {
    expect(haruTheme.name).toBe("haru");
    const site = {
      title: "Test",
      description: "",
      language: "en",
      origin: "https://test.kumooo.dev",
      head: { __html: true as const, value: "<title>Test</title>" },
      nav: [{ title: "Home", url: "/" }],
    };
    const html = haruTheme.home(site, { posts: [], page: 1, totalPages: 1, basePath: "/" });
    expect(html.value).toContain("Test");
    expect(html.value).toContain("<!doctype html>");
  });
});
```

Add vitest to theme-seasons like core (`vitest run`).

- [ ] **Step 3: Implement haru**

Port structure from `theme-default` but **new visual system**: spring - soft paper `#f7f4ef`, ink `#1c1916`, accent muted blossom `#b85c6a` or sage-forward `#2f6f5e` with blossom highlight sparingly, display font with character (e.g. "Fraunces" or "Source Serif 4" + "DM Sans"), distinct home list treatment. Full `home|post|page|archive|notFound`.

- [ ] **Step 4: Register in renderer**

```ts
import { haruTheme, natsuTheme, akiTheme, fuyuTheme } from "@kumooo/theme-seasons";
// after Task 3 fills others; for this task register haru only if others not ready - prefer Task 2+3 together

registerTheme(haruTheme);
```

Also keep registering `defaultTheme` temporarily OR stop and rely on alias - prefer: register `haruTheme` and remove `defaultTheme` registration once haru exists; `resolveThemeId` handles old sites.

- [ ] **Step 5: `pnpm install` from repo root; run tests**

Run: `pnpm --filter @kumooo/theme-seasons test`  
Run: `pnpm --filter @kumooo/renderer typecheck`

- [ ] **Step 6: Commit**

```bash
git add packages/theme-seasons apps/renderer package.json pnpm-lock.yaml
git commit -m "Add haru season theme and register it in the renderer."
```

---

### Task 3: natsu, aki, fuyu themes

**Files:**
- Create: `packages/theme-seasons/src/natsu.ts`
- Create: `packages/theme-seasons/src/aki.ts`
- Create: `packages/theme-seasons/src/fuyu.ts`
- Modify: `packages/theme-seasons/src/index.ts`
- Modify: `packages/theme-seasons/test/seasons.test.ts`
- Modify: `apps/renderer/src/index.ts`

**Interfaces:**
- Produces: `natsuTheme`, `akiTheme`, `fuyuTheme` each with unique `name` and distinct CSS/type

Visual brief (must not share one CSS file):

| Theme | Light bg | Accent | Type vibe |
| --- | --- | --- | --- |
| natsu | bright sand/sky `#f3f8fc` | coastal `#0b6e99` or coral `#e4572e` | Geometric sans, wider measure |
| aki | warm cream `#f4ebe0` | ochre `#b45309` | Serif display + quiet sans |
| fuyu | cool `#0e1218` default dark-first or light `#eef1f5` | ice `#5b8def` / ink | Tight mono meta + stark headlines |

- [ ] **Step 1: Extend tests for all four names + home render**

```ts
import { seasonThemes } from "../src/index.js";
it("exports four unique season ids", () => {
  expect(seasonThemes.map((t) => t.name).sort()).toEqual(["aki", "fuyu", "haru", "natsu"]);
});
```

- [ ] **Step 2: Implement three themes (full Theme contract each)**

- [ ] **Step 3: Register all four in renderer**

- [ ] **Step 4: Typecheck + test**

Run: `pnpm --filter @kumooo/theme-seasons test`  
Run: `pnpm --filter @kumooo/renderer typecheck`

- [ ] **Step 5: Commit**

```bash
git add packages/theme-seasons apps/renderer
git commit -m "Add natsu, aki, and fuyu season themes."
```

---

### Task 4: Dashboard tenant theme gallery

**Files:**
- Create: `apps/dashboard/src/lib/themes.ts`
- Modify: `apps/dashboard/src/features/design/ThemesPage.tsx`
- Modify: `apps/dashboard/src/features/sites/CreateSiteDialog.tsx`
- Modify: `apps/dashboard/src/features/settings/SettingsPage.tsx`

**Interfaces:**
- Produces:

```ts
export type TenantThemeInfo = {
  id: "haru" | "natsu" | "aki" | "fuyu";
  name: string;
  description: string;
};

export const TENANT_THEMES: TenantThemeInfo[] = [
  { id: "haru", name: "Haru", description: "Spring. Soft paper, calm reading, blossom accent." },
  { id: "natsu", name: "Natsu", description: "Summer. Coastal light, wider measure, high energy." },
  { id: "aki", name: "Aki", description: "Autumn. Warm cream, editorial serif, ochre accent." },
  { id: "fuyu", name: "Fuyu", description: "Winter. Cool ink, crisp type, quiet chrome." },
];

export const DEFAULT_TENANT_THEME = "haru" as const;
```

- [ ] **Step 1: Add `lib/themes.ts`**

- [ ] **Step 2: ThemesPage uses `TENANT_THEMES`** instead of hardcoded single default; active badge compares `site.theme` via `resolveThemeId` (import from `@kumooo/core`) so old `default` shows as Haru active.

- [ ] **Step 3: CreateSiteDialog + Settings** options from `TENANT_THEMES`; initial state `haru`.

- [ ] **Step 4: Typecheck dashboard**

Run: `pnpm --filter @kumooo/dashboard typecheck`

- [ ] **Step 5: Commit**

```bash
git add apps/dashboard
git commit -m "Expose haru, natsu, aki, and fuyu in the tenant theme gallery."
```

---

### Task 5: Marketing CF Deploy choice

**Files:**
- Modify: `packages/theme-marketing/src/index.ts`
- Optionally: `content/docs/getting-started.md` short “Host on your Cloudflare” section if missing

**Interfaces:**
- Produces: CF Deploy dialog markup + client JS (inline module or existing island) toggling choice
- Paths:
  - Kumooo: `https://kumooo-dashboard.pages.dev/signup`
  - Your CF: `https://docs.kumooo.dev/getting-started` (or `/installation`)

- [ ] **Step 1: Add dialog HTML + button in `marketingHome`**

Primary CTA becomes **Deploy on Cloudflare** opening a `<dialog id="cf-deploy">` with two cards:

1. **Host on Kumooo** - `{slug}.kumooo.dev` - link to dashboard signup  
2. **Host on your Cloudflare** - own Worker + domain - link to docs  

Include Cancel / Escape close. No OAuth.

- [ ] **Step 2: Replace domains tab / features / pricing copy**

- Domains tab headline → CF Deploy framing  
- Features “Custom domains” card → “CF Deploy” / managed vs self-host  
- Pricing row: `Managed *.kumooo.dev` / `Self-host on your CF`

- [ ] **Step 3: Wire minimal client JS** for dialog open/close (inline in marketing theme, same pattern as existing islands)

- [ ] **Step 4: Manual check**

Run renderer locally or deploy; open `/` and `/pricing`; open dialog; both links work.

- [ ] **Step 5: Commit**

```bash
git add packages/theme-marketing
git commit -m "Reframe marketing around CF Deploy with Kumooo vs your Cloudflare."
```

---

### Task 6: Docs + production deploy smoke

**Files:**
- Modify: `content/docs/themes.md`
- Deploy: renderer + dashboard (API only if schema default matters for create)

- [ ] **Step 1: Update themes.md**

Document season ids, `default`→`haru` alias, tenant gallery list. Note Theme Studio as upcoming.

- [ ] **Step 2: Commit docs**

```bash
git add content/docs/themes.md
git commit -m "Document free season themes for tenants."
```

- [ ] **Step 3: Deploy**

```bash
pnpm --filter @kumooo/renderer run deploy
pnpm --filter @kumooo/dashboard run build
# from apps/dashboard:
npx wrangler pages deploy dist --project-name kumooo-dashboard --branch main --commit-dirty=true
```

Re-seed or PATCH official marketing site is already theme `marketing` - no change. Optional: bump KV cache for marketing/docs sites.

- [ ] **Step 4: Smoke**

1. Create site in dashboard → theme haru  
2. Apply natsu → preview + public  
3. Open kumooo.dev → CF Deploy dialog both paths  
4. Confirm old site with `theme=default` still renders (alias)

- [ ] **Step 5: Final commit only if smoke fixes needed**

```bash
git commit -m "Fix season theme and CF Deploy issues found in smoke."
```

---

## Spec coverage (Phase 1)

| Spec item | Task |
| --- | --- |
| haru/natsu/aki/fuyu free themes | 2-3 |
| haru default + default alias | 1 |
| Dashboard gallery | 4 |
| CF Deploy two-path CTA | 5 |
| marketing/docs not in gallery | 4 |
| Honest no OAuth | 5 |
| Docs | 6 |

Phase 2 Studio / Phase 3 scheduler+CF SaaS: **not in this plan**.

## Self-review notes

- No TBD placeholders.
- Alias lives in `@kumooo/core` so dashboard and renderer share behavior.
- Season themes intentionally separate CSS per file for distinct design.
