# Dashboard Launchable Core Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship a real Kumooo dashboard control center with working `*.kumooo.dev` tenant sites, site/page/post CRUD, Markdown publishing, media, themes, SEO, OpenGraph maker, guided domains, and real release activity  - with no fabricated metrics.

**Architecture:** Keep the Vite React dashboard and Hono API / Renderer Workers. Extend D1 for site status, activity events, and OG templates. Rebuild the dashboard into a site-scoped app shell with typed API modules. Tenant hosting is fixed with Cloudflare wildcard DNS + Worker routes; OpenGraph images are generated client-side from structured templates and stored as immutable R2 media.

**Tech Stack:** TypeScript, React 19, Vite, React Router 6, Radix, Lucide, Framer Motion, Hono, Drizzle, D1, KV, R2, Cloudflare Workers/Pages, Vitest, `@kumooo/core` Zod schemas.

## Global Constraints

- Spec: `docs/superpowers/specs/2026-07-21-dashboard-launchable-core-design.md`
- Real data only  - never invent visitors, uptime, security scores, or performance numbers.
- Deferred product areas (analytics, team invites, API keys, marketplace, AI, page builder, Git builds, site duplication/transfer) must not appear as fake working controls.
- Markdown remains the content source of truth.
- Publishing updates D1 + KV cache version; it is not a Git/Workers “deploy”.
- Dashboard copy follows `WRITING.md`.
- Prefer complete vertical slices (UI + API + tests + commit) over unfinished breadth.

---

## File map

| File / directory | Responsibility |
| --- | --- |
| `apps/renderer/wrangler.jsonc` | Apex, docs, and `*.kumooo.dev/*` Worker routes |
| `apps/api/wrangler.jsonc` | API vars (`PUBLIC_SITE_SUFFIX`, `DASHBOARD_ORIGIN`, preview secret) |
| `packages/db/src/schema.ts` | `sites.status`, `site_events`, `og_templates` |
| `packages/db/migrations/0002_dashboard_core.sql` | D1 migration for new tables/columns |
| `packages/core/src/schemas.ts` | Site lifecycle, OG template, overview, preview token schemas |
| `packages/core/src/preview.ts` | HMAC preview token sign/verify |
| `packages/core/src/seo-health.ts` | Deterministic SEO health checks |
| `packages/core/src/og-template.ts` | OG template validation + render payload |
| `apps/api/src/lib/events.ts` | Append-only site activity writer |
| `apps/api/src/lib/routing-health.ts` | Tenant hostname reachability checks |
| `apps/api/src/routes/orgs.ts` | Site CRUD including archive/restore/delete |
| `apps/api/src/routes/content.ts` | Optimistic concurrency, schedule, archive/restore, revision restore |
| `apps/api/src/routes/overview.ts` | Aggregated site overview + activity |
| `apps/api/src/routes/preview.ts` | Preview token minting |
| `apps/api/src/routes/domains.ts` | DNS verify + status refresh |
| `apps/api/src/routes/media.ts` | Metadata PATCH |
| `apps/api/src/routes/og.ts` | OG presets + generation metadata |
| `apps/renderer/src/index.ts` | Preview token rendering path |
| `apps/dashboard/src/app/*` | Router, providers, AppShell |
| `apps/dashboard/src/components/*` | Shared UI primitives |
| `apps/dashboard/src/features/*` | Feature screens by domain |
| `apps/dashboard/src/lib/api/*` | Typed API clients |
| `apps/dashboard/src/styles.css` | Design tokens and shared layout CSS |

---

### Task 1: Wildcard tenant routing

**Files:**
- Modify: `apps/renderer/wrangler.jsonc`
- Modify: `apps/renderer/src/data.ts` (only if apex/docs slug resolution needs hardening)
- Test: `packages/core/test/routing-host.test.ts` (pure hostname → slug helper if extracted) or document manual Cloudflare verification in this task

**Interfaces:**
- Consumes: existing `resolveSite(db, host, PUBLIC_SITE_SUFFIX)`
- Produces: live `https://{slug}.kumooo.dev` resolving to the renderer Worker

- [ ] **Step 1: Add Worker zone route for tenants**

Update `apps/renderer/wrangler.jsonc` routes to:

```jsonc
"routes": [
  { "pattern": "kumooo.dev", "custom_domain": true },
  { "pattern": "docs.kumooo.dev", "custom_domain": true },
  { "pattern": "*.kumooo.dev/*", "zone_name": "kumooo.dev" }
]
```

Keep apex/docs custom domains. Do not remove them.

- [ ] **Step 2: Create proxied wildcard DNS**

Using Cloudflare dashboard or API for zone `kumooo.dev`:

- Type: `CNAME` or `AAAA`/`A` as required by Workers routes
- Name: `*`
- Target: Workers route target / proxied (`orange cloud`)
- Proxied: yes

If the account already uses Workers custom domains for apex/docs, keep those intact and only add the wildcard zone route + DNS.

- [ ] **Step 3: Deploy renderer**

Run:

```bash
pnpm --filter @kumooo/renderer exec wrangler deploy
```

Expected: deploy succeeds; route list includes `*.kumooo.dev/*`.

- [ ] **Step 4: Verify with an existing site slug**

Run:

```bash
curl.exe -s -o NUL -w "%{http_code}" --max-time 20 https://kumooo.kumooo.dev/
nslookup some-existing-slug.kumooo.dev
```

Expected: DNS resolves (not `NXDOMAIN`). HTTP is `200` or `404` from the Worker body (`There's no Kumooo site...` only if slug missing), never browser DNS failure.

- [ ] **Step 5: Commit**

```bash
git add apps/renderer/wrangler.jsonc
git commit -m "Route *.kumooo.dev tenant hostnames to the renderer."
```

---

### Task 2: Schema, events, and core helpers

**Files:**
- Modify: `packages/db/src/schema.ts`
- Create: `packages/db/migrations/0002_dashboard_core.sql`
- Modify: `packages/core/src/schemas.ts`
- Create: `packages/core/src/preview.ts`
- Create: `packages/core/src/seo-health.ts`
- Create: `packages/core/src/og-template.ts`
- Modify: `packages/core/src/index.ts`
- Create: `packages/core/test/dashboard-core.test.ts`

**Interfaces:**
- Produces:
  - `sites.status: "active" | "archived"`
  - `siteEvents` table writer shape
  - `ogTemplates` table
  - `signPreviewToken` / `verifyPreviewToken`
  - `scoreSeoHealth(input) => { score: number; checks: SeoCheck[] }`
  - `ogTemplateSchema`, `renderOgPayload(template, bindings)`

- [ ] **Step 1: Write failing core tests**

Create `packages/core/test/dashboard-core.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { scoreSeoHealth } from "../src/seo-health.js";
import { ogTemplateSchema, renderOgPayload } from "../src/og-template.js";
import { signPreviewToken, verifyPreviewToken } from "../src/preview.js";

describe("seo health", () => {
  it("scores complete metadata", () => {
    const result = scoreSeoHealth({
      title: "Hello",
      description: "A real description",
      ogImage: "https://example.com/og.png",
      canonicalUrl: "https://example.com/",
      hasSitemap: true,
      hasRobots: true,
      hasJsonLd: true,
      hasViewport: true,
    });
    expect(result.score).toBeGreaterThanOrEqual(90);
    expect(result.checks.every((c) => c.ok)).toBe(true);
  });
});

describe("og template", () => {
  it("binds title and site name", () => {
    const template = ogTemplateSchema.parse({
      layout: "left",
      background: { type: "color", value: "#101218" },
      title: { text: "{{title}}", color: "#f3f1ea", size: 64 },
      subtitle: { text: "{{siteName}}", color: "#9a968c", size: 28 },
    });
    const payload = renderOgPayload(template, {
      title: "Ship tonight",
      siteName: "Kumooo",
      excerpt: "",
      featuredImage: null,
      hostname: "demo.kumooo.dev",
    });
    expect(payload.title).toBe("Ship tonight");
    expect(payload.subtitle).toBe("Kumooo");
    expect(payload.width).toBe(1200);
    expect(payload.height).toBe(630);
  });
});

describe("preview tokens", () => {
  it("round-trips and rejects expiry", async () => {
    const secret = "test-secret-at-least-32-chars-long!!";
    const token = await signPreviewToken(
      { siteId: "site_1", contentId: "cnt_1", exp: Math.floor(Date.now() / 1000) + 60 },
      secret,
    );
    const payload = await verifyPreviewToken(token, secret);
    expect(payload.siteId).toBe("site_1");

    const expired = await signPreviewToken(
      { siteId: "site_1", contentId: "cnt_1", exp: Math.floor(Date.now() / 1000) - 10 },
      secret,
    );
    await expect(verifyPreviewToken(expired, secret)).rejects.toThrow(/expired/i);
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `pnpm --filter @kumooo/core test -- dashboard-core`  
Expected: FAIL (modules missing)

- [ ] **Step 3: Add DB schema + migration**

In `packages/db/src/schema.ts`:

- Add `status` to `sites` with enum `active | archived`, default `active`
- Add:

```ts
export const siteEvents = sqliteTable(
  "site_events",
  {
    id: text("id").primaryKey(),
    siteId: text("site_id").notNull(),
    actorId: text("actor_id"),
    type: text("type").notNull(),
    resourceType: text("resource_type"),
    resourceId: text("resource_id"),
    metadata: text("metadata").notNull().default("{}"),
    createdAt: createdAt(),
  },
  (t) => [index("site_events_site_created").on(t.siteId, t.createdAt)],
);

export const ogTemplates = sqliteTable(
  "og_templates",
  {
    id: text("id").primaryKey(),
    siteId: text("site_id").notNull(),
    name: text("name").notNull(),
    isDefault: integer("is_default", { mode: "boolean" }).notNull().default(false),
    config: text("config").notNull(),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [index("og_templates_site").on(t.siteId)],
);
```

Create `packages/db/migrations/0002_dashboard_core.sql` matching those tables/columns.

- [ ] **Step 4: Implement core helpers**

Implement:

- `preview.ts`: HMAC-SHA256 over base64url JSON payload (`siteId`, `contentId?`, `theme?`, `exp`)
- `seo-health.ts`: one check object per input flag/field; score = round(100 * passed / total)
- `og-template.ts`: Zod schema for layout/background/title/subtitle/logo; `renderOgPayload` replaces `{{title}}`, `{{excerpt}}`, `{{siteName}}`, `{{hostname}}`

Export from `packages/core/src/index.ts`.

- [ ] **Step 5: Run tests to verify they pass**

Run: `pnpm --filter @kumooo/core test -- dashboard-core`  
Expected: PASS

- [ ] **Step 6: Apply migration**

Run:

```bash
pnpm --filter @kumooo/api exec wrangler d1 migrations apply kumooo-app --remote
```

Expected: `0002_dashboard_core.sql` applied.

- [ ] **Step 7: Commit**

```bash
git add packages/db packages/core
git commit -m "Add dashboard core schema, SEO health, OG templates, and preview tokens."
```

---

### Task 3: API foundation  - events, overview, routing health, site lifecycle

**Files:**
- Create: `apps/api/src/lib/events.ts`
- Create: `apps/api/src/lib/routing-health.ts`
- Create: `apps/api/src/routes/overview.ts`
- Modify: `apps/api/src/routes/orgs.ts`
- Modify: `apps/api/src/index.ts`
- Modify: `apps/api/src/env.ts` (add `PREVIEW_SIGNING_SECRET` if missing)
- Test: `apps/api` manual curl checklist in this task (no separate API test harness yet)

**Interfaces:**
- Produces:
  - `recordSiteEvent(db, { siteId, actorId, type, resourceType?, resourceId?, metadata? })`
  - `GET /v1/sites/:siteId/overview`
  - `GET /v1/sites/:siteId/events`
  - `GET /v1/sites/:siteId/routing-health`
  - `POST /v1/sites/:siteId/archive`
  - `POST /v1/sites/:siteId/restore`
  - `DELETE /v1/sites/:siteId` with body `{ confirmSlug: string }`

- [ ] **Step 1: Implement event writer**

```ts
// apps/api/src/lib/events.ts
import { newId } from "@kumooo/core";
import { siteEvents, type Db } from "@kumooo/db";

export async function recordSiteEvent(
  db: Db,
  input: {
    siteId: string;
    actorId?: string | null;
    type: string;
    resourceType?: string;
    resourceId?: string;
    metadata?: Record<string, unknown>;
  },
) {
  await db.insert(siteEvents).values({
    id: newId("evt"),
    siteId: input.siteId,
    actorId: input.actorId ?? null,
    type: input.type,
    resourceType: input.resourceType ?? null,
    resourceId: input.resourceId ?? null,
    metadata: JSON.stringify(input.metadata ?? {}),
  });
}
```

- [ ] **Step 2: Implement routing-health helper**

`checkRoutingHealth({ slug, suffix, customHostnames })` returns:

```ts
type RoutingHealth = {
  tenantHostname: string;
  dnsOk: boolean;
  httpOk: boolean;
  status: "live" | "dns_missing" | "unreachable" | "archived";
  checkedAt: string;
};
```

Use `fetch(`https://${slug}.${suffix}/`)` with a short timeout from the Worker. Treat DNS/network throw as `dnsOk: false`. Treat any HTTP response from the renderer (including 404 site-missing) as DNS/route success; map “no site” separately only when the site row is missing.

- [ ] **Step 3: Overview + events routes**

`GET /v1/sites/:siteId/overview` returns only real fields:

```ts
{
  site: { id, name, slug, theme, status, url },
  counts: { published, drafts, scheduled, archived, media },
  lastPublishedAt: string | null,
  routing: RoutingHealth,
  seo: ReturnType<typeof scoreSeoHealth>,
  theme: string
}
```

`GET /v1/sites/:siteId/events?limit=20` returns newest `site_events`.

- [ ] **Step 4: Site archive / restore / delete**

- Archive sets `sites.status = "archived"`, records `site.archived`
- Restore sets `active`, records `site.restored`
- Delete requires `confirmSlug === site.slug`, deletes content/media/domains/events/templates for that site (order children first), records nothing after deletion, returns `{ ok: true }`
- List endpoints exclude archived by default; `?status=archived` includes them

- [ ] **Step 5: Wire routes in `apps/api/src/index.ts`**

Mount overview routes beside existing site routes.

- [ ] **Step 6: Smoke with curl against local or remote API**

After deploy/login cookie:

```bash
curl.exe -s https://kumooo-api.explicit2929.workers.dev/v1/sites/<SITE_ID>/overview -H "Cookie: ..."
```

Expected: JSON with counts and routing, no visitor fields.

- [ ] **Step 7: Commit**

```bash
git add apps/api packages/db packages/core
git commit -m "Add site overview, activity events, routing health, and site lifecycle APIs."
```

---

### Task 4: Content concurrency, scheduling, revisions restore, preview API

**Files:**
- Modify: `apps/api/src/routes/content.ts`
- Create: `apps/api/src/routes/preview.ts`
- Modify: `apps/renderer/src/index.ts`
- Modify: `apps/api/wrangler.jsonc` / secrets for `PREVIEW_SIGNING_SECRET`
- Modify: `packages/core/src/schemas.ts` (`expectedUpdatedAt` on update)

**Interfaces:**
- Produces:
  - `PATCH /v1/sites/:siteId/content/:id` accepts `expectedUpdatedAt`
  - conflict response `{ error: { code: "conflict", current } }`
  - `POST /v1/sites/:siteId/content/:id/restore` body `{ revisionId }`
  - `POST /v1/sites/:siteId/content/:id/preview-token` → `{ token, url, expiresAt }`
  - Renderer `GET /_preview?token=...` renders draft without caching as public content

- [ ] **Step 1: Add optimistic concurrency**

On PATCH, if `expectedUpdatedAt` is present and does not equal `row.updatedAt.toISOString()`, throw conflict with current serialized content.

Always create a revision before applying the patch (existing behavior). On publish/schedule transitions, call `recordSiteEvent` + `bumpCacheVersion`.

- [ ] **Step 2: Archive / restore / hard-delete rules**

- Soft archive: `status = "archived"` (keep row)
- Restore from archived → `draft`
- Hard delete only when current status is `archived` (or accept explicit `?force=true` only for admins if already deleted today  - prefer archive-first)
- Keep existing DELETE but gate it behind archived status to match the spec

- [ ] **Step 3: Revision restore endpoint**

```ts
contentRoutes.post("/sites/:siteId/content/:id/restore", async (c) => {
  // load revision, apply snapshot fields, insert new revision of pre-restore state, bump cache if published
});
```

- [ ] **Step 4: Preview token route + renderer path**

API:

```ts
const exp = Math.floor(Date.now() / 1000) + 15 * 60;
const token = await signPreviewToken({ siteId, contentId, theme, exp }, c.env.PREVIEW_SIGNING_SECRET);
return {
  token,
  expiresAt: new Date(exp * 1000).toISOString(),
  url: `https://${site.slug}.${c.env.PUBLIC_SITE_SUFFIX}/_preview?token=${token}`,
};
```

Renderer: if path is `/_preview`, verify token, load content even if draft, render with theme, set headers:

```ts
"Cache-Control": "private, no-store"
"X-Robots-Tag": "noindex"
```

- [ ] **Step 5: Set signing secret**

```bash
pnpm --filter @kumooo/api exec wrangler secret put PREVIEW_SIGNING_SECRET
pnpm --filter @kumooo/renderer exec wrangler secret put PREVIEW_SIGNING_SECRET
```

Use the same value on both Workers.

- [ ] **Step 6: Commit**

```bash
git add apps/api apps/renderer packages/core
git commit -m "Add content concurrency, revision restore, and signed draft previews."
```

---

### Task 5: Dashboard app shell and design system

**Files:**
- Create: `apps/dashboard/src/app/router.tsx`
- Create: `apps/dashboard/src/app/providers.tsx`
- Create: `apps/dashboard/src/app/AppShell.tsx`
- Create: `apps/dashboard/src/components/ui/*` (`Button`, `Input`, `Textarea`, `Select`, `Dialog`, `ConfirmDialog`, `Badge`, `EmptyState`, `Skeleton`, `Toast`, `PageHeader`)
- Create: `apps/dashboard/src/components/nav/Sidebar.tsx`
- Create: `apps/dashboard/src/components/nav/SiteSwitcher.tsx`
- Modify: `apps/dashboard/src/styles.css`
- Modify: `apps/dashboard/src/main.tsx`
- Modify: `apps/dashboard/src/App.tsx` (thin re-export or delete after migration)
- Keep auth pages working under `/login` and `/signup`

**Interfaces:**
- Produces: `<AppShell />` with routes:
  - `/` all sites
  - `/sites/:siteId` overview
  - `/sites/:siteId/posts|pages|collections|media|design/themes|design/navigation|seo|deployments|domains|settings`
  - `/sites/:siteId/content/:contentId` editor
  - `/sites/:siteId/new?type=post|page`

- [ ] **Step 1: Replace CSS tokens**

Use soft surfaces (not pure black/white):

```css
:root {
  --bg: #f6f4ef;
  --fg: #16150f;
  --muted: #6d6a60;
  --line: #e4e0d4;
  --accent: #0f6b5c;
  --accent-fg: #f4fffb;
  --card: #fffcf7;
  --sidebar: #f3f0e8;
  --danger: #b42318;
  --ok: #0f6b5c;
  --warn: #9a6700;
  --sidebar-w: 248px;
  --header-h: 56px;
}
@media (prefers-color-scheme: dark) {
  :root {
    --bg: #14130f;
    --fg: #f3f0e7;
    --muted: #9c988c;
    --line: #2a2822;
    --accent: #5ecfba;
    --accent-fg: #06261c;
    --card: #1a1914;
    --sidebar: #12110e;
  }
}
```

Add shell layout classes: `.app-shell`, `.sidebar`, `.main`, `.topbar`, drawer modifiers, `@media (max-width: 900px)`.

- [ ] **Step 2: Build AppShell + Sidebar**

Sidebar items exactly as approved IA. Mobile: hamburger opens drawer; trap focus; Esc closes; restore focus.

Do not add Analytics / Integrations / Developers / Team as primary fake destinations. Optional footer link “Roadmap” text only.

- [ ] **Step 3: Wire router + auth provider**

Move current auth context into `providers.tsx`. Private routes redirect to `/login`.

- [ ] **Step 4: Typecheck**

Run: `pnpm --filter @kumooo/dashboard typecheck`  
Expected: exit 0

- [ ] **Step 5: Commit**

```bash
git add apps/dashboard
git commit -m "Rebuild dashboard shell with site-scoped navigation."
```

---

### Task 6: Typed API client + all-sites experience

**Files:**
- Create: `apps/dashboard/src/lib/api/client.ts`
- Create: `apps/dashboard/src/lib/api/sites.ts`
- Create: `apps/dashboard/src/lib/api/content.ts`
- Create: `apps/dashboard/src/lib/api/media.ts`
- Create: `apps/dashboard/src/lib/api/domains.ts`
- Create: `apps/dashboard/src/lib/api/overview.ts`
- Create: `apps/dashboard/src/features/sites/AllSitesPage.tsx`
- Create: `apps/dashboard/src/features/sites/CreateSiteDialog.tsx`
- Remove/replace: `apps/dashboard/src/pages/HomePage.tsx`, `apps/dashboard/src/api.ts` usages

**Interfaces:**
- Produces typed functions matching Task 3/4 endpoints; `AllSitesPage` uses API `url` + routing health, never hardcodes hostnames as live

- [ ] **Step 1: Split API modules**

`client.ts` keeps credentials include + error parsing. Resource modules export functions only.

- [ ] **Step 2: All-sites UI**

Show searchable cards with name, hostname, status badge (`Live` only if routing health status is `live`), theme, content counts if available, Open / Visit / Edit actions.

Create wizard fields: name, slug, description, theme select (`default`, `marketing`, `docs` only if allowed for customer sites  - default to `default` for new tenants).

- [ ] **Step 3: Typecheck + manual create-site smoke**

Run typecheck; create a site in the UI; confirm card URL matches API.

- [ ] **Step 4: Commit**

```bash
git add apps/dashboard
git commit -m "Add typed API clients and all-sites dashboard experience."
```

---

### Task 7: Overview page with real activity

**Files:**
- Create: `apps/dashboard/src/features/overview/OverviewPage.tsx`
- Create: `apps/dashboard/src/features/overview/HealthBanner.tsx`
- Create: `apps/dashboard/src/features/overview/ActivityFeed.tsx`
- Create: `apps/dashboard/src/features/overview/QuickActions.tsx`

**Interfaces:**
- Consumes: `GET /v1/sites/:siteId/overview`, `GET /v1/sites/:siteId/events`

- [ ] **Step 1: Build overview from API only**

Health banner copy examples:

- Live: “Your site is reachable.”
- DNS missing: “This hostname does not resolve yet.”
- Unreachable: “DNS works, but the renderer did not respond.”
- Archived: “This site is archived.”

Cards: published/drafts/media/last publish/SEO score/theme. No visitors.

- [ ] **Step 2: Quick actions + activity feed**

Actions link to new post, media, domains, themes, live site. Feed renders event types with relative time.

- [ ] **Step 3: Commit**

```bash
git add apps/dashboard
git commit -m "Add real-data site overview and activity feed."
```

---

### Task 8: Content tables + Markdown editor

**Files:**
- Create: `apps/dashboard/src/features/content/ContentListPage.tsx`
- Create: `apps/dashboard/src/features/content/CollectionsPage.tsx`
- Create: `apps/dashboard/src/features/editor/EditorPage.tsx`
- Create: `apps/dashboard/src/features/editor/MarkdownToolbar.tsx`
- Create: `apps/dashboard/src/features/editor/SlashMenu.tsx`
- Create: `apps/dashboard/src/features/editor/MetaPanel.tsx`
- Create: `apps/dashboard/src/features/editor/useAutosave.ts`
- Create: `apps/dashboard/src/lib/markdown/insert.ts`
- Create: `packages/core/test/markdown-insert.test.ts` or dashboard unit equivalent
- Replace: `apps/dashboard/src/pages/EditorPage.tsx`, `SitePage.tsx`

**Interfaces:**
- Produces editor state machine: `idle | saving | saved | offline | error | conflict`
- Autosave PATCH with `expectedUpdatedAt`
- Toolbar/slash insert helpers mutate markdown string at cursor

- [ ] **Step 1: Content list**

Posts and Pages share `ContentListPage` with `type` prop. Support search, status filter, pagination from API. Row actions: edit, preview, publish, archive, restore, delete (delete only if archived).

- [ ] **Step 2: Collections page**

List available types (`post`, `page`, plus any discovered custom `content.type` values). Clicking routes to filtered list. No schema builder UI.

- [ ] **Step 3: Editor canvas**

Layout: title, slug, markdown textarea/source, toolbar, optional split preview using `renderMarkdown` from a small shared preview renderer in dashboard (or fetch preview URL iframe when token exists).

Meta panel: excerpt, tags, featured image, status/schedule, SEO fields, revisions list + restore.

- [ ] **Step 4: Autosave hook**

```ts
// debounce 800ms; skip if !dirty; send expectedUpdatedAt; on conflict set status conflict and keep local text
```

Announce status with `aria-live="polite"`.

- [ ] **Step 5: Typecheck + manual edit smoke**

- [ ] **Step 6: Commit**

```bash
git add apps/dashboard packages/core
git commit -m "Ship content tables and Markdown editor with autosave."
```

---

### Task 9: Media library

**Files:**
- Create: `apps/dashboard/src/features/media/MediaPage.tsx`
- Create: `apps/dashboard/src/features/media/MediaPickerDialog.tsx`
- Modify: `apps/api/src/routes/media.ts` (PATCH alt/filename metadata)
- Replace: `apps/dashboard/src/pages/MediaPage.tsx`

**Interfaces:**
- `PATCH /v1/sites/:siteId/media/:id` `{ alt?: string }`
- Existing upload/list/delete

- [ ] **Step 1: API metadata patch + event `media.uploaded` / `media.deleted`**

- [ ] **Step 2: Media UI**

Drag/drop, grid/list toggle, search/type filters, copy URL, edit alt, delete confirm, picker dialog for editor insert (`![alt](url)`).

Show real size/mime only. No “Saved 95%” claims.

- [ ] **Step 3: Commit**

```bash
git add apps/dashboard apps/api
git commit -m "Upgrade media library with picker, metadata, and delete."
```

---

### Task 10: Design (themes + navigation) and SEO settings

**Files:**
- Create: `apps/dashboard/src/features/design/ThemesPage.tsx`
- Create: `apps/dashboard/src/features/design/NavigationPage.tsx`
- Create: `apps/dashboard/src/features/seo/SeoPage.tsx`
- Create: `apps/dashboard/src/features/settings/SettingsPage.tsx`
- Use: `PATCH /v1/sites/:siteId` for theme/settings/nav/seo

**Interfaces:**
- Theme apply calls site PATCH `{ theme }` + event `site.theme_changed`
- Nav editor writes `settings.nav`
- SEO page writes `settings.seo` + title/description and shows `scoreSeoHealth` results with fix links

- [ ] **Step 1: Themes gallery**

Cards for registered themes (`default`, and others only if intended for tenants). Preview via preview-token with `theme` override when content exists, otherwise static description. Confirm before apply.

- [ ] **Step 2: Navigation editor**

Ordered list of `{ title, url }` with add/remove/reorder. Save to site settings.

- [ ] **Step 3: SEO + Settings pages**

SEO health checks must use real site fields + known endpoints (`/sitemap.xml`, `/robots.txt`). Settings: name, description, language, timezone, theme.

- [ ] **Step 4: Commit**

```bash
git add apps/dashboard apps/api
git commit -m "Add theme, navigation, SEO, and general settings screens."
```

---

### Task 11: OpenGraph Maker

**Files:**
- Create: `apps/api/src/routes/og.ts`
- Create: `apps/dashboard/src/features/seo/OgMakerPage.tsx`
- Create: `apps/dashboard/src/features/seo/OgCanvas.tsx`
- Create: `apps/dashboard/src/features/seo/generateOgPng.ts`
- Modify: `apps/api/src/index.ts`
- Modify: editor MetaPanel to open/override OG image

**Interfaces:**
- `GET/POST /v1/sites/:siteId/og-templates`
- `PATCH/DELETE /v1/sites/:siteId/og-templates/:id`
- `POST /v1/sites/:siteId/og-templates/:id/default`
- Generation: browser canvas exports PNG → existing media upload → write URL into `settings.seo.defaultOgImage` or content `seo.ogImage`
- Templates store JSON config only; each generate creates a new media row (immutable URL)

- [ ] **Step 1: OG template API**

Validate with `ogTemplateSchema`. Support default flag (unset others when setting default).

- [ ] **Step 2: OgCanvas live preview**

Render 1200×630 preview in a scaled canvas/SVG from `renderOgPayload`. Controls for layout, colors, title/subtitle bindings, logo media picker, safe-area toggle.

Also show small Facebook/X card chrome previews using the same image.

- [ ] **Step 3: Generate PNG**

```ts
export async function generateOgPng(payload: RenderedOgPayload): Promise<Blob> {
  // draw to OffscreenCanvas or HTMLCanvasElement at 1200x630
  // return PNG blob
}
```

Upload via media API; PATCH site/content SEO with returned URL; record `og.generated` event.

- [ ] **Step 4: Wire into SEO nav + editor**

SEO section route `/sites/:siteId/seo/og`. Editor meta panel: “Generate social image” uses default template bindings for current title/excerpt.

- [ ] **Step 5: Commit**

```bash
git add apps/dashboard apps/api packages/core
git commit -m "Add template-based OpenGraph maker with R2-backed PNG output."
```

---

### Task 12: Domains, deployments/releases, lifecycle UI polish

**Files:**
- Create: `apps/dashboard/src/features/domains/DomainsPage.tsx`
- Create: `apps/dashboard/src/features/deployments/DeploymentsPage.tsx`
- Modify: `apps/api/src/routes/domains.ts` (verify endpoint)
- Modify: site settings/all-sites for archive/restore/delete dialogs

**Interfaces:**
- `POST /v1/sites/:siteId/domains/:domainId/verify`
- Returns `{ dnsOk, httpOk, sslOk, status, records: [{ type, name, value, proxied? }] }`
- Deployments page lists `site_events` filtered to publish/restore/theme/domain/settings types as “releases”

- [ ] **Step 1: Domain verify API**

On verify:

1. Lookup DNS TXT/CNAME instructions for custom host → renderer target
2. Attempt HTTPS fetch to hostname
3. Update domain status `pending|active|error`
4. Record `domain.verified` / `domain.error`

Tenant hostname card always shows `{slug}.{PUBLIC_SITE_SUFFIX}` with routing-health.

- [ ] **Step 2: Domains UI**

Add domain form, required DNS table, status badges (DNS / SSL / CDN / Routing separate), remove action.

- [ ] **Step 3: Deployments UI**

Timeline of real events only. Restore action links to content revision restore when metadata includes `contentId` + `revisionId`.

- [ ] **Step 4: Site/content destructive dialogs**

Typed-slug confirm for site delete. Content hard delete only from archived. Explain URLs/media/domains lost.

- [ ] **Step 5: Commit**

```bash
git add apps/dashboard apps/api
git commit -m "Add guided domains, release activity, and lifecycle destructive flows."
```

---

### Task 13: Production rollout and critical journey verification

**Files:**
- Modify as needed for bugfixes found in verification
- Optionally add: `apps/dashboard` smoke script notes in `README.md` only if already documenting deploy commands

- [ ] **Step 1: Deploy API, renderer, dashboard**

```bash
pnpm --filter @kumooo/api exec wrangler deploy
pnpm --filter @kumooo/renderer exec wrangler deploy
pnpm --filter @kumooo/dashboard build
# deploy apps/dashboard/dist to Cloudflare Pages (existing project)
```

Bump relevant KV cache versions if stale HTML appears.

- [ ] **Step 2: Run critical journey on production**

Checklist:

1. Sign up / sign in on dashboard
2. Create site `dash-smoke-<n>`
3. Confirm `https://dash-smoke-<n>.kumooo.dev` resolves (not NXDOMAIN)
4. Create post, verify autosave states
5. Open preview URL; confirm draft not on public slug
6. Publish; open public post
7. Edit + restore revision
8. Upload media; insert into post
9. Change theme + nav
10. Configure SEO + generate OG image; confirm `og:image` on public HTML
11. Add guided custom domain flow (can stop at instructions if no spare domain)
12. Archive/restore post; archive disposable site; delete disposable site

- [ ] **Step 3: Mobile + a11y smoke**

Check drawer nav, editor meta panel, tables, dialogs at ~390px width. Keyboard tab through shell and dialogs. Confirm save status is announced.

- [ ] **Step 4: Final commit for verification fixes**

```bash
git add -A
git commit -m "Fix launchable dashboard issues found in production verification."
```

Only commit if there are real fixes.

---

## Spec coverage checklist

| Spec area | Task(s) |
| --- | --- |
| `*.kumooo.dev` routing | 1 |
| App shell / IA / visual language | 5 |
| Real overview + activity | 2, 3, 7 |
| All sites + site CRUD | 3, 6, 12 |
| Posts/pages/collections CRUD | 4, 8, 12 |
| Markdown editor + autosave | 8 |
| Preview + revisions + scheduling | 4, 8 |
| Media library | 9 |
| Themes + navigation | 10 |
| SEO health | 2, 10 |
| OpenGraph maker | 2, 11 |
| Guided domains | 12 |
| Deployments as real releases | 3, 12 |
| Settings | 10 |
| No fabricated analytics | Global + 7 |
| Production critical journey | 13 |

## Notes for implementers

- OpenGraph PNG generation is **client canvas → media upload** in Task 11 so Workers do not need a native image runtime in v1. Template JSON remains the source of truth.
- If wildcard DNS cannot be automated from this environment, complete DNS in Cloudflare UI during Task 1 and record the exact records in the commit message body.
- Do not reintroduce `HomePage` hardcoded `{slug}.kumooo.dev · Live` without routing-health confirmation.
