# STATUS: theme-seasons

Package: `@kumooo/theme-seasons`

Exports: `haru`, `natsu`, `aki`, `fuyu`

Contract: home | post | page | archive | notFound

Fuyu implementation notes:

- mono accent on timestamps and code
- reduced header height
- gradient background optional; off by default in light

Test matrix: mobile 375px, dark pref, keyboard nav.

Result: pass.

Shared chrome lives in `chrome.ts`: color scheme toggle, made-with badge, document shell. Seasons only differ in layout CSS and typography choices.

Next: seed official demo sites from `content/seasons/*`.

Blockers: none.

Owner: ren.

If you're evaluating fuyu, open this post on a phone in dark mode. Scan time should be under ten seconds. If you need more decoration, that's a signal to switch themes, not a bug.

Renderer registration order: seasons imported after marketing/docs. `getTheme("default")` resolves haru. Verified in unit test `themes.test.ts`.

Dependencies: `@kumooo/theme-kit` peer satisfied. No new runtime JS in tenant themes. CSS-only personality split.

Ship date target: same sprint as dashboard gallery update. No flag day for existing tenants.
