# Deploy on Cloudflare

Kumooo is a Cloudflare product. Two paths. Same CMS.

## Path A: Host on Kumooo

Fastest.

1. Sign up at [dash.kumooo.dev](https://dash.kumooo.dev).
2. Create a site. You get `{slug}.kumooo.dev` immediately.
3. Write posts. Pick a [season theme](/season-themes) or open Theme Studio.
4. Optional: attach a [custom domain](/custom-domains).

You do not run Wrangler for day-to-day publishing.

## Path B: Your Cloudflare account

You own the Workers, D1, R2, and KV.

1. Follow [Installation](/installation) and the CLI.
2. Deploy API + renderer with Wrangler on accounts you control.
3. Point DNS however you like.

You pay Cloudflare for usage. There is no Kumooo tax on top.

## Which one?

- Ship a blog tonight → Path A.
- Agency / multi-tenant / compliance needs your account → Path B.
- Not sure → start on Path A. Migrate later if you outgrow it.

## CF Deploy from marketing

The marketing site CTA opens the same choice. "Deploy on Cloudflare" is not a CNAME tutorial. It is this fork.

## Checklist after first deploy

- [ ] Can sign in to the dashboard
- [ ] Site loads on `*.kumooo.dev` or your hostname
- [ ] Publish a draft and see it live
- [ ] Favicon / logo set (or accept the default `k.`)
- [ ] Theme chosen (season or Studio)

## Next

- [Getting started](/getting-started)
- [Installation](/installation)
- [Architecture](/architecture)
- [Custom domains](/custom-domains)
