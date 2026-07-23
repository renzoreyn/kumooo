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

## Deploy on Vercel

Two paths:

### Path A: Deploy button

From [kumooo.js](/) or [Setup](/setup), click **Deploy on Vercel**. Sign in or create a free Vercel account on their site. Follow the clone flow. They build and host it.

### Path B: Import your GitHub repo

1. Go to [vercel.com/new](https://vercel.com/new)
2. Import the GitHub repo you pushed
3. If you cloned the whole kumooo monorepo, set **Root Directory** to `starters/blank` (or your app folder) and use the install/build commands from our Deploy button docs in the README
4. Deploy

When it finishes, Vercel gives you a URL. That is your site on the public internet.

## What we are not doing yet

kumooo.js does not host or “manage” your site for you in a WP.com sense yet. Vercel (or another Next host) does the hosting. Later we want nicer manage tools and an intuitive theme editor. Today the honest path is: you own the repo, Vercel runs it, we teach you the route.

## You made it

You went from idea → local preview → live URL. That is a real website.

→ Back to [Learn](/learn) · or [Start](/start) if you want another door
