# Edit text and deploy

You have a local site. Now make it yours and put it on the internet.

## Edit something

Open the project in your editor. Find `app/page.tsx`. Change a heading. Save. Confirm localhost updates.

That is the whole game: edit files, preview, deploy.

## Get it onto GitHub

If the project is not a git repo yet:

```bash
git init
git add .
git commit -m "my first kumooo site"
```

Create an empty repository on [GitHub](https://github.com/new). Then connect and push (GitHub shows you the exact commands for a new repo).

## Deploy on Cloudflare

Two paths:

### Path A: Deploy button

From [kumooo.js](/) or [Setup](/setup), click **Deploy on Cloudflare**. Sign in or create a free Cloudflare account on their site. Follow the clone flow. They build and host it on Workers.

### Path B: CLI (when your app is Workers-ready)

For the official site we use OpenNext (`@opennextjs/cloudflare`) and:

```bash
pnpm deploy
```

Starters are catching up to that path. Until packages are published to npm, Guided setup + create-kumooo is the reliable beginner route.

When it finishes, Cloudflare gives you a `workers.dev` URL. That is your site on the public internet.

## What we are not doing yet

kumooo.js does not host or “manage” your site for you in a WP.com sense yet. Cloudflare runs the Worker. Later we want nicer manage tools and an intuitive theme editor. Today the honest path is: you own the repo, Cloudflare runs it, we teach you the route.

## You made it

You went from idea → local preview → live URL. That is a real website.

→ Back to [Learn](/learn) · or [Start](/start) if you want another door
