# Themes

A theme is a TypeScript module with five functions that return HTML.

No template language. No mandatory client framework.

## The contract

```ts
import type { Theme } from "@kumooo/theme-kit";
import { html, raw } from "@kumooo/theme-kit";

export const myTheme: Theme = {
  name: "my-theme",
  label: "My theme",
  home(site, { posts }) { /* ... */ },
  post(site, { post }) { /* ... */ },
  page(site, { page }) { /* ... */ },
  archive(site, data) { /* ... */ },
  notFound(site) { /* ... */ },
};
```

Escaping is on by default via the `html` tagged template.
Use `raw()` for platform-rendered HTML only.

## Interactive themes

Want Framer Motion, Lucide, Radix?

SSR the shell in your theme functions, then ship a small client island
(ESM import or bundled script). Official `marketing` and `docs` themes do this.

Default customer themes stay fast and JS-optional.
Official themes may be animated. That's the showcase.

## Registering

Import and `registerTheme(...)` in the renderer.
Set `site.theme` to the theme name (`default`, `marketing`, `docs`, …).
