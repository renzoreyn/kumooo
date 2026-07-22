Ten minutes from nothing to a published page.

You need Node 20+, pnpm, and a terminal you're not afraid of.

## Fastest: Host on Kumooo

1. Sign up at [dash.kumooo.dev](https://dash.kumooo.dev)
2. Create a site
3. Publish

No Wrangler. `{slug}.kumooo.dev` is live when you are.

## Self-host on your Cloudflare

```bash
npx create-kumooo
```

Choose **Self-host on my Cloudflare**. Follow the prompts.
Details: [Deploy on Cloudflare](/deploy-on-cloudflare) and [Installation](/installation).

## Local playground

```bash
npx create-kumooo
# pick Local first
cd your-folder
kumooo migrate --local
kumooo dev
```

That starts:

- API on `:8787`
- your site on `:8788`
- dashboard on `:5173`

Open the dashboard, sign up, create a site, publish. Refresh `:8788`.

## When something misbehaves

```bash
kumooo doctor
```

It tells you what's wrong in English.
