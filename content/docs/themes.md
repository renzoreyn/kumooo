A theme is either a first-party TypeScript package or a Theme Studio file tree.

## Free tenant themes

Tenants pick from four first-party season themes:

| Id | Name | Feel |
| --- | --- | --- |
| `haru` | Haru | Spring. Soft paper, calm reading, blossom accent. **Default for new sites.** |
| `natsu` | Natsu | Summer. Coastal light, wider measure, high energy. |
| `aki` | Aki | Autumn. Warm cream, editorial serif, ochre accent. |
| `fuyu` | Fuyu | Winter. Cool ink, crisp type, quiet chrome. |

The legacy id `default` aliases to `haru` at render time.

Platform themes `marketing` and `docs` stay first-party only. They do not appear in the tenant gallery.

New to Theme Studio? Start with the tutorial: [Building a theme](/building-a-theme).

## Theme Studio

Dashboard ? Design ? Theme Studio. You edit a fixed file tree, preview a draft, then publish.

```
theme.json
styles.css
templates/home.html
templates/post.html
templates/page.html
templates/archive.html
templates/notFound.html
client.js                 # optional
```

Publishing sets `sites.theme` to `custom:{siteId}`. Switch back to a season theme anytime from Themes.

### Dialect

- `{{title}}` and `{{post.title}}` are HTML-escaped.
- `{{{bodyHtml}}}` and `{{{head}}}` are trusted platform HTML only.
- `{{{styles}}}` / `{{{clientScript}}}` are filled by the compiler from your CSS/JS.
- Loops: `{{#posts}}…{{/posts}}`.
- No JS expressions inside tags. No remote imports in `client.js`.

### Limits

- CSS ? 256 KB
- Templates total ? 256 KB
- `client.js` ? 128 KB
- Last 10 published versions kept

This is not a drag-and-drop page builder.

## First-party TypeScript themes

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

Register with `registerTheme(...)` in the renderer.
