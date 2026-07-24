# kumooo.js Marketing Site Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship `apps/www` - ink+mint marketing site with playground hero, Deploy-to-Vercel, `/setup`, Learn tutorials, docs stubs - ready for Ren to deploy from GitHub.

**Architecture:** Next.js 15 App Router app dogfooding `@kumooo/ui`. Client playground for hero. Markdown tutorials under `content/learn`. Deploy Button clones monorepo with `root-directory=starters/blank` plus monorepo install/build commands.

**Tech Stack:** Next 15, React 19, Tailwind 4, Framer Motion via `@kumooo/ui`, TypeScript, pnpm workspaces.

## Global Constraints

- Voice: founder-over-coffee; no em dashes; noob-friendly
- Visual: ink charcoal + mint `#6ee7b7`; no purple/cream-terracotta/broadsheet
- Never claim hosted manage or theme editor ship today
- Prefer `prefers-reduced-motion`
- Package name: `@kumooo/www`

---

### Task 1: Scaffold `apps/www` + workspace

**Files:**
- Create: `apps/www/package.json`, `tsconfig.json`, `next.config.ts`, `postcss.config.mjs`, `app/globals.css`, `app/layout.tsx`, `app/page.tsx` (stub), `public/favicon.svg`, `lib/deploy.ts`, `lib/site.ts`
- Modify: `pnpm-workspace.yaml`, root `package.json`, `README.md`

- [ ] Add `apps/*` to workspace; scripts `dev:www`
- [ ] Scaffold Next app mirroring blank starter (transpile `@kumooo/ui`)
- [ ] `pnpm install` + `pnpm --filter @kumooo/www typecheck`
- [ ] Commit

### Task 2: Shell, brand, landing sections

**Files:**
- Create: `components/site-header.tsx`, `components/site-footer.tsx`, `components/brand-mark.tsx`, `components/deploy-button.tsx`, `components/sections/*.tsx`, `app/page.tsx`

- [ ] Ink+mint layout, Syne + Manrope fonts
- [ ] Hero composition + below-fold sections per spec
- [ ] Commit

### Task 3: Playground

**Files:**
- Create: `components/playground/site-playground.tsx`, `components/playground/preview-frame.tsx`

- [ ] Controls: type / accent / motion
- [ ] Animated preview; copy `npx create-kumooo` hint
- [ ] Commit

### Task 4: `/setup`, `/start`, Deploy URL

**Files:**
- Create: `app/setup/page.tsx`, `app/setup/setup-wizard.tsx`, `app/start/page.tsx`
- Create: `lib/deploy.ts` (Deploy Button URL)

- [ ] Four-step wizard + start chooser
- [ ] Commit

### Task 5: Learn + docs

**Files:**
- Create: `content/learn/*.md`, `lib/learn.ts`, `app/learn/page.tsx`, `app/learn/[slug]/page.tsx`, `app/docs/**/page.tsx`

- [ ] Four real tutorials
- [ ] Docs stubs
- [ ] Commit

### Task 6: Verify + README Vercel wiring

- [ ] typecheck + build www
- [ ] README: deploy marketing (Root Directory `apps/www`) vs end-user Deploy Button
- [ ] Push main

## Deploy Button URL (locked for implementers)

```
https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Frenzoreyn%2Fkumooo&project-name=my-kumooo-site&repository-name=my-kumooo-site&root-directory=starters%2Fblank&install-command=cd%20..%2F..%20%26%26%20pnpm%20install&build-command=cd%20..%2F..%20%26%26%20pnpm%20--filter%20%40kumooo%2Fstarter-blank%20build
```

Copy under button: login/register happens on Vercel.
