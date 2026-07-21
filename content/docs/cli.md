```bash
kumooo <command>
```

`kumo` works as an alias if your fingers refuse the extra o's.

## Commands

### `kumooo create [name]`

Guided installer. Clones the repo, installs deps, tells you what to run next.

### `kumooo dev`

API on `:8787`, renderer on `:8788`, dashboard on `:5173`.
Shared local state in `.wrangler/state`.

### `kumooo build`

Dry-run production builds for both workers.

### `kumooo deploy`

Apply migrations, deploy renderer, then API.

### `kumooo migrate [--local]`

Apply SQL migrations from `packages/db/migrations`.

### `kumooo doctor`

Checks Node, layout, and wrangler configs.
Findings come with a fix.

