A theme is a TypeScript module with five functions that return HTML.

No template language. No mandatory client framework.

## Free tenant themes

Tenants pick from four first-party season themes:

| Id | Name | Feel |
| --- | --- | --- |
| `haru` | Haru | Spring. Soft paper, calm reading, blossom accent. **Default for new sites.** |
| `natsu` | Natsu | Summer. Coastal light, wider measure, high energy. |
| `aki` | Aki | Autumn. Warm cream, editorial serif, ochre accent. |
| `fuyu` | Fuyu | Winter. Cool ink, crisp type, quiet chrome. |

The legacy id `default` aliases to `haru` at render time, so older sites keep working without a database rewrite.

Platform themes `marketing` and `docs` stay first-party only. They do not appear in the tenant gallery.

Theme Studio (edit HTML/CSS/JS against our structure) is planned next. It is not a visual page builder.

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
Set `site.theme` to a registered name (`haru`, `natsu`, `aki`, `fuyu`, or the `default` alias).
