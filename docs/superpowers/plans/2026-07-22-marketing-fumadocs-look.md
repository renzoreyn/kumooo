# Marketing Fumadocs-look Implementation Plan

> **For agentic workers:** Implement task-by-task. Steps use checkbox syntax.

**Goal:** Rebuild `@kumooo/theme-marketing` into a Fumadocs-inspired dark/gold marketing site with grain, bento, and rich motion.

**Architecture:** Single-file theme rewrite (CSS + home/subpages + client island). Deploy via renderer Worker.

**Tech Stack:** theme-kit HTML, Sora/IBM Plex Mono, framer-motion/dom on esm.sh, CSS grain/halftone

**Spec:** `docs/superpowers/specs/2026-07-22-marketing-fumadocs-look-design.md`

## Global Constraints

- Accent gold `#f5c542`; brand `k.`; no em dashes in copy
- Hero budget: brand, one headline, one lead, one CTA group, one dominant mock
- `prefers-reduced-motion` must disable decorative motion
- Keep CF Deploy dialog behavior

---

### Task 1: Rewrite marketing theme CSS + home

- [ ] Replace palette, grain, orb, hero, bento, mock styles in `packages/theme-marketing/src/index.ts`
- [ ] Rebuild `marketingHome` HTML per spec
- [ ] Enrich `clientIsland` motions
- [ ] Restyle features / pricing / about shells
- [ ] Typecheck theme-marketing / renderer
- [ ] Commit: `Rebuild marketing site with Fumadocs-inspired dark gold look.`
- [ ] Deploy renderer + smoke `https://kumooo.dev`
