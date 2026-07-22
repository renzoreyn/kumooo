# Kumooo marketing page redesign (Fumadocs-inspired)

**Date:** 2026-07-22  
**Status:** Approved (verbal: new marketing look + motion)  
**Package:** `@kumooo/theme-marketing`

## Goal

Rebuild `kumooo.dev` so the first impression matches the energy of fumadocs.dev: dark canvas, warm gold accent, grain/halftone atmosphere, hero + product mock, bento feature grid, and intentional motion. Kumooo content and voice stay. Not a Fumadocs clone.

## Visual system

| Token | Value |
| --- | --- |
| Background | Near black `#070708` |
| Foreground | Warm off-white `#f4f1e8` |
| Muted | `#9a958a` |
| Accent | Warm gold `#f5c542` |
| Accent ink | `#1a1400` |
| Line | `rgba(255,255,255,0.08)` |
| Display/body | Sora (existing) + IBM Plex Mono for code |
| Brand | **`k.`** hero-level |

Grain: CSS noise SVG overlay (low opacity). Halftone: radial-dot backgrounds on accent orbs / bento cells. No purple glow theme.

## Home structure

1. **Sticky nav:** `k.` · Features · Docs · Pricing · GitHub · primary CTA (dashboard / CF Deploy)
2. **Hero (one composition):** brand `k.`, one headline, one lead, CTA pair, dominant docs/site mock (full-bleed under copy, not a side card collage). Gold orb + grain behind. No floating promo chips on the mock.
3. **Accent lead:** short paragraph with 2–3 gold-highlighted words
4. **Bento grid:** Markdown→edge, season themes, Theme Studio, CF Deploy, media quota, SEO/RSS
5. **Split section:** “Anybody can publish” (mock editor + bullets)
6. **Final CTA** + footer (dogfood line stays)

Inner pages (Features, Pricing, About) reuse the same chrome, tokens, and motion so they do not look like the old mint theme.

## Motion (required)

Respect `prefers-reduced-motion: reduce` (instant show, no parallax).

| Motion | Behavior |
| --- | --- |
| Hero enter | Stagger logo/headline/lead/CTAs + mock fade-up |
| Orb | Slow CSS pulse / drift on gold atmosphere |
| Scroll | Sections/cards reveal with stagger |
| Bento hover | Lift + soft gold border glow |
| Tabs / copy | Keep existing CF Deploy dialog + copy-install interactions |

Keep Framer Motion DOM via `esm.sh` (already used). No new animation dependency unless needed.

## Copy constraints

- Writing voice: short, direct, no em dashes, no SaaS clichés
- Headline idea: publishing / Cloudflare / no babysitting (not “documentation framework”)
- Highlight words: Cloudflare, Markdown, edge (or similar), not Fumadocs terms

## Out of scope

- Real Cmd-K search on marketing
- Pixel-art “BUILD YOUR DOCS” clone
- Contributor avatar walls
- Separate marketing app / Next.js

## Done when

- `kumooo.dev` shows new look live
- Hero reads as one composition with `k.` dominant
- At least 3 intentional motions work; reduced-motion safe
- Features / Pricing / About share the new chrome
