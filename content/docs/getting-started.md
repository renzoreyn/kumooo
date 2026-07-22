Ten minutes from nothing to a published page.

You need Node 20+, pnpm, and a terminal you're not afraid of.

## 1. Create a project

```bash
npx create-kumooo
```

Or clone this repo and install:

```bash
git clone https://github.com/renzoreyn/kumooo
cd kumooo
pnpm install
kumooo migrate --local
kumooo dev
```

That starts:

- API on `:8787`
- your site on `:8788`
- dashboard on `:5173`

## 2. Create an account

Open the dashboard and sign up.
Or hit the API:

```bash
curl -X POST http://127.0.0.1:8787/v1/auth/signup \
  -H "Content-Type: application/json" \
  -c cookies.txt \
  -d '{"email":"you@example.com","password":"a long passphrase","name":"You"}'
```

## 3. Create a site and publish

Use the dashboard, or:

```bash
# list orgs, then create a site, then create content
curl http://127.0.0.1:8787/v1/orgs -b cookies.txt
```

Refresh `:8788`. There it is.

## When something misbehaves

```bash
kumooo doctor
```

It tells you what's wrong in English.

