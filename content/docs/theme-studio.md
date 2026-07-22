# Theme Studio

Theme Studio is for people who want their own HTML and CSS without leaving Kumooo.

It is not a drag-and-drop page builder. You edit real files against the theme contract, preview, then publish.

## Open Studio

1. Sign in at [dash.kumooo.dev](https://dash.kumooo.dev).
2. Open your site.
3. Go to **Design / Theme Studio**.

Editors can edit and publish themes. Admins can too.

## Edit, preview, publish

1. Change templates / CSS / optional client JS.
2. Preview with the signed preview flow.
3. Click **Publish** in Studio. Live theme becomes `custom:{siteId}`.

Do not expect Settings → Save to "apply" a custom theme. Settings used to overwrite `theme` with a season id and wipe Studio work. That path no longer patches theme. Gallery Apply and Studio Publish are the ways themes change.

## Starter vs blank

Start from a season shell if you want structure. Or clear it and build lean. Keep templates escaped. No `eval` of arbitrary TypeScript on the edge.

## Safety

Renderer CSP for custom themes is stricter than first-party themes. Stick to same-origin assets and inline styles/scripts the sandbox allows.

## When to stay on seasons

If Haru / Natsu / Aki / Fuyu already fit, skip Studio. Preview them live:

- [haru.kumooo.dev](https://haru.kumooo.dev)
- [natsu.kumooo.dev](https://natsu.kumooo.dev)
- [aki.kumooo.dev](https://aki.kumooo.dev)
- [fuyu.kumooo.dev](https://fuyu.kumooo.dev)

## Next

- [Building a theme](/building-a-theme)
- [Season themes](/season-themes)
- [Themes](/themes)
