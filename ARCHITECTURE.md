# Architecture

The short version: two Workers, one D1 database, themes that return HTML.

See [content/docs/architecture.md](content/docs/architecture.md) for the public docs page.

```
editors ──▶ dashboard ──▶ kumooo-api ──▶ D1 / KV / R2
readers ──▶ kumooo-renderer ──▶ D1 / KV / R2 / Cache API
                 ▲
            theme packages
```

Dependency direction: workers → core/db/themes. Core depends on nothing with I/O.
