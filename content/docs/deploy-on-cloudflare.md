# Deploy on Cloudflare

Kumooo is a Cloudflare product. Two paths. Different shapes.

## Path A: Host on Kumooo

Managed platform. Orgs, multiple sites, dashboard.

1. Sign up at [dash.kumooo.dev](https://dash.kumooo.dev).
2. Create a site. You get `{slug}.kumooo.dev` immediately.
3. Write posts. Pick a [season theme](/season-themes) or open Theme Studio.
4. Optional: attach a [custom domain](/custom-domains).

You do not run Wrangler for day-to-day publishing.

## Path B: Self-host one site

WordPress-style. Your Cloudflare account. **One site**, not a clone of the whole Kumooo multi-tenant cloud.

The dedicated single-site install package is shipping next. Until then:

1. Prefer Path A if you want to publish tonight.
2. Watch [Installation](/installation) / CLI docs for the one-site path when it lands.
3. Do not expect `create-kumooo` to stand up a full multi-org SaaS on your account. That is not the product promise.

You pay Cloudflare for usage. There is no Kumooo tax on top.

## Which one?

- Ship a blog tonight → Path A.
- Want your own Cloudflare bill for a single site → Path B (one-site package next).
- Want to run your own multi-tenant Kumooo → not supported. Use Path A or talk to us.

## CF Deploy from marketing

The marketing CTA opens this same fork. Managed vs one site. Not "fork the SaaS."

## Checklist after first deploy

- [ ] Can sign in to the dashboard
- [ ] Site loads on `*.kumooo.dev` or your hostname
- [ ] Publish a draft and see it live
- [ ] Favicon / logo set (or accept the default `k.`)
- [ ] Theme chosen (season or Studio)

## Next

- [Getting started](/getting-started)
- [Installation](/installation)
- [Season themes](/season-themes)
- [Custom domains](/custom-domains)
