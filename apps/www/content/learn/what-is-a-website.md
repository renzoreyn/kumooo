# What a website actually is

A website is a bunch of files your computer can turn into pages, sitting on a computer that stays online (a host). People type a URL. The host sends those pages back.

## The three pieces

1. **Your files** — text, images, code. In kumooo.js that starts as a Next.js project on your laptop.
2. **A host** — for us, usually [Cloudflare Workers](https://workers.cloudflare.com). They keep a copy of your project running at the edge.
3. **A URL** — something like `my-site.your-subdomain.workers.dev`. Later you can point your own domain at it.

## What “deploy” means

Deploy means: take the project that works on your laptop and put a build of it on the host so strangers can open it.

You are not “uploading a Word doc.” You are publishing an app. That sounds scarier than it is. The Deploy button and the setup guide walk you through it.

## What kumooo.js is in that picture

kumooo.js is not a mysterious new internet. It is starters, UI, and conventions on top of Next.js so you are not starting from a blank abyss.

- **Today:** you build and deploy yourself (with our guides) on Cloudflare.
- **Later:** we want to help manage sites and ship a theme editor that feels obvious. Those are not live yet.

## Next

When that mental model clicks, set up your computer.

→ [Set up your computer](/learn/setup-your-computer)
