# kumooo.js marketing site design

Date: 2026-07-23  
Status: approved for planning  
Product: kumooo.js · Site: kumooo.dev (Vercel)

## Goal

Ship a **noob-friendly** marketing + Learn site that shows how powerful kumooo.js feels (motion, interactivity) while guiding absolute beginners from zero to a deployed site. Hosted “we manage your site” and the real theme editor are teased honestly as later - not faked as shipping.

## Decisions locked

| Topic | Choice |
|---|---|
| v1 scope | Landing + Learn hub (real beginner tutorials) + docs stubs + `/setup` |
| App location | `apps/www` (Next.js App Router), dogfoods `@kumooo/ui` + Framer Motion |
| Visual | Ink + mint geometric **k** (dark charcoal, mint `#6ee7b7`) |
| Hero | Live interactive mini-site **playground** (product-demo first) |
| Approach | Hybrid: brand frame + playground hero + Learn + setup path |
| Deploy | **Deploy to Vercel** button (Vercel’s flow for login/register) + guided `/setup` |
| Hosting | User deploys `apps/www` to Vercel from this GitHub repo |
| Voice | Founder-over-coffee; no em dashes; noob-friendly without talking down |

## Product pillars (copy must reinforce)

1. **Noob-friendly** - tutorials teach *making a website*, not just framework trivia.
2. **Guided install + one-click deploy** - `/setup` steps + Vercel Deploy Button; we do not build Kumooo auth for deploy.
3. **We help manage later** - hosted care is a promise, not a v1 feature.
4. **Theme editor later** - playground teases the feel; labeled as preview, not the shipped editor.

## Non-goals (this ship)

- Real theme editor, hosted multi-tenant manage, billing, or Kumooo accounts
- Fake “register on kumooo.dev to deploy” wall
- Full Fumadocs-scale docs library
- Publishing `@kumooo/ui` / `create-kumooo` to npm (workspace deps fine for www)
- Creating the Vercel project / DNS for the user (Ren connects GitHub → Vercel)
- Purple / cream-terracotta / broadsheet default AI looks

## Architecture

```
apps/www/                 Next.js marketing + learn + setup
  app/
    page.tsx              Landing + playground hero
    start/page.tsx        Soft CTA (CLI + Deploy + Learn)
    setup/page.tsx        Guided installation wizard
    learn/page.tsx        Beginner hub
    learn/[slug]/page.tsx Tutorial MDX
    docs/...              Thin stubs
  content/learn/*.mdx     Tutorial bodies
  components/playground/  Interactive hero preview
packages/ui               Shared primitives + FadeIn/Stagger
packages/framework        Shared meta helpers (optional)
starters/*                What create-kumooo / Deploy templates point at
```

Workspace: add `apps/*` back to `pnpm-workspace.yaml`. Root scripts: `dev:www`, include www in typecheck.

Vercel: Root Directory = `apps/www` (documented in README). Optional repo-root `vercel.json` only if needed for monorepo clarity; prefer Vercel dashboard Root Directory so starters stay independent.

## Routes

| Route | Job |
|---|---|
| `/` | Marketing + hero playground |
| `/setup` | Guided install: tools → create → preview → deploy |
| `/start` | Chooser: Deploy / Setup guide / CLI / Learn |
| `/learn` | Ordered beginner path |
| `/learn/[slug]` | Tutorial pages |
| `/docs` | Stubs (getting started, install, architecture) |

## Homepage composition

### First viewport (one composition)

- Brand: **kumooo.js** + geometric **k** - hero-level signal, not a tiny nav-only mark.
- One headline, one short supporting sentence.
- CTA group:
  - Primary: **Deploy on Vercel** (Deploy Button)
  - Secondary: **Guided setup** → `/setup`
  - Tertiary text link: **Learn** → `/learn`
  - Small: “prefer terminal?” → `/start#cli`
- Dominant visual: **live playground** (full-bleed / edge plane on large screens; stacks under copy on mobile).

No detached badges, promo chips, or stat strips on the hero. No card chrome unless it is the interactive playground chrome.

### Playground (client, Framer Motion)

Controls (noob-safe):

1. Site type: Blank / Blog / Shop  
2. Accent: Mint / Coral / Ice  
3. Motion: On / Off  

Preview: fake mini-site (nav + hero + one content block) updates with layout, accent, and motion. Copy affordance for `npx create-kumooo` with matching starter hint.

Label: **Preview** - “the theme editor will feel this simple (coming later).”

### Below the fold (one job per section)

1. **For beginners** - never built a site → Learn  
2. **Power without babysitting** - short motion showcase of `@kumooo/ui` primitives  
3. **What’s coming** - hosted manage + intuitive theme editor (honest later)  
4. Footer - GitHub, contact, docs stubs  

Motion budget: load stagger, playground transitions on control change, one scroll-triggered section. Prefer transform/opacity. Respect `prefers-reduced-motion`.

## Deploy to Vercel + `/setup`

### Deploy Button

- Use Vercel’s official Deploy Button / clone flow pointed at `https://github.com/renzoreyn/kumooo` with repository path / template config appropriate for a starter (prefer blank starter as default template target once wiring is clear).
- Login/register happens on **Vercel**, not kumooo.dev.
- Copy must say that clearly in one line under the button.

### `/setup` guided path

Stepped UI (progress indicator, one step visible):

1. **Tools** - Node LTS, pnpm or npm, a code editor (links + “how to check”)  
2. **Create** - `npx create-kumooo` with copy buttons; or jump to Deploy  
3. **Preview** - `pnpm dev` / `npm run dev`, open localhost  
4. **Deploy** - Deploy Button + short “what Vercel will ask” notes  

Optional checkboxes (“I installed Node”) are local-only UX sugar; no server persistence.

`/start` aggregates the same three doors: Deploy, Guided setup, CLI.

## Learn hub + tutorials

### `/learn`

Ordered path (not a link dump):

1. What a website actually is  
2. Install tools (Node, terminal basics)  
3. Your first site with `create-kumooo`  
4. Change text, colors, and publish to Vercel  

Each item: title, one-sentence outcome, time estimate (~10-20 min).

### Real MDX tutorials (v1)

| Slug | Outcome |
|---|---|
| `what-is-a-website` | Mental model: pages, deploy, URL |
| `setup-your-computer` | Node + package manager + editor |
| `first-site` | `npx create-kumooo` → local preview |
| `edit-and-deploy` | Edit a page → GitHub → Vercel |

`/docs` stubs stay short; deep API docs wait until the product needs them.

## Visual system

- Background: near-black charcoal with subtle depth (gradient / soft grain), not flat void.
- Accent: mint `#6ee7b7` on ink; secondary accents only inside playground (Coral / Ice).
- Type: expressive display + clean body (not Inter/Roboto/Arial/system defaults).
- Brand mark: existing geometric **k** treatment.
- Avoid: purple-indigo SaaS gradient, cream+terracotta serif, broadsheet hairlines, emoji decoration, glow soup.

## Vercel / GitHub wiring (for Ren)

1. Push `apps/www` on `main`.  
2. In Vercel: Import `renzoreyn/kumooo` → Root Directory `apps/www` → Deploy.  
3. Point `kumooo.dev` when ready.  
4. No env vars required for v1 marketing/learn/setup.

README section: “Deploy the marketing site” with those steps. Deploy Button for *end users* is separate from deploying *this* marketing app.

## Success criteria

- First viewport reads as one ink+mint composition with a working playground.
- Absolute beginner can go Deploy **or** `/setup` → live URL without reading the monorepo.
- Four Learn tutorials are real and completable.
- Copy never claims hosted manage or theme editor ship today.
- `pnpm --filter @kumooo/www typecheck` (or equivalent) passes; site runs via `pnpm dev:www`.

## Open implementation notes (not blockers)

- Exact Deploy Button URL params (repo vs subdirectory template) finalized during implementation against current Vercel docs.
- Whether blank starter is published as a Vercel template or users clone the monorepo path - prefer the path that gives newcomers the fewest clicks.
