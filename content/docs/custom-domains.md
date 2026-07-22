# Custom domains

Your site already lives at `{slug}.kumooo.dev`. A custom domain is optional.

## When you need one

Use a custom hostname when the brand URL matters more than the Kumooo subdomain. Examples: `blog.yourco.com`, `docs.yourco.com`.

## Add a domain

1. Open the site in [dash.kumooo.dev](https://dash.kumooo.dev).
2. Go to **Domains**.
3. Add the hostname you control.
4. Create the DNS records Kumooo shows (usually a CNAME to `{slug}.kumooo.dev`).

SSL comes through Cloudflare once DNS is correct and proxied.

## Rules of thumb

- You cannot register `*.kumooo.dev` as a "custom" domain. That path is already your site slug.
- Apex domains (`example.com`) need the records Kumooo lists for apex. Follow the dashboard, not a random blog post.
- Propagation can take a few minutes. If HTTP looks fine but HTTPS fails, wait for the certificate.

## Managed vs self-host

Marketing calls this **CF Deploy**:

- **Host on Kumooo**: managed orgs and multiple sites on `*.kumooo.dev`, or attach domains through the dashboard.
- **Self-host on Cloudflare**: `npx create-kumooo` on your account. See [Deploy on Cloudflare](/deploy-on-cloudflare).

## Next

- [Getting started](/getting-started)
- [Deploy on Cloudflare](/deploy-on-cloudflare)
- [Architecture](/architecture)
