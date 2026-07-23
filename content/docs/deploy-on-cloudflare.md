# Deploy on Cloudflare

Kumooo is a Cloudflare product. Two paths.

## Path A: Host on Kumooo

Managed platform. Orgs, multiple sites, dashboard.

1. Sign up at [dash.kumooo.dev](https://dash.kumooo.dev).
2. Create a site. You get `{slug}.kumooo.dev` immediately.
3. Write posts. Pick a [season theme](/season-themes) or open Theme Studio.
4. Optional: attach a [custom domain](/custom-domains).

You do not run Wrangler for day-to-day publishing.

## Path B: Self-host on your Cloudflare

Your account. Full multi-org stack: orgs, many sites, one dashboard launcher.

```bash
npx create-kumooo
```

Pick **Self-host on my Cloudflare**. The installer will:

1. Clone the repo and install deps
2. `wrangler login` if needed
3. Create D1, KV, and R2 under a name prefix you choose
4. Write wrangler configs (no kumooo.dev routes; `MAX_SITES_PER_ORG=0` = unlimited)
5. Migrate, deploy API + renderer Workers
6. Build and deploy the dashboard to Cloudflare Pages

Then:

1. Open the Pages dashboard URL it prints
2. Sign up
3. Create orgs and sites as you need
4. Open the renderer `*.workers.dev` URL (it routes by host / site)
5. Attach your own domains in Cloudflare when you want them

You pay Cloudflare for usage. There is no Kumooo tax on top.

### What self-host is

Same product shape as managed Kumooo: multi-tenant orgs and sites, one launcher. You own the Workers and the bill. Managed free still caps at 2 sites; self-host does not.

## Which one?

- Ship tonight with zero Wrangler → Path A (2 sites free).
- Want unlimited sites / your own SaaS on Cloudflare → Path B.
- Tired of PHP and plugin roulette → either path. That is the point.

## CF Deploy from marketing

The marketing CTA opens this same fork.

## Checklist after first deploy

- [ ] Can sign in to the dashboard
- [ ] Site loads on `*.kumooo.dev`, workers.dev, or your hostname
- [ ] Publish a draft and see it live
- [ ] Favicon / logo set (or accept the default geometric k mark)
- [ ] Theme chosen (season or Studio)

## Next

- [Getting started](/getting-started)
- [Installation](/installation)
- [Season themes](/season-themes)
- [Custom domains](/custom-domains)
