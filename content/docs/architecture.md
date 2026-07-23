# Architecture

kumooo.js is conventions + kits on **Next.js**, not a fork of Next.

```
create-kumooo
  -> starters/blank|blog|shop
       -> @kumooo/ui
       -> @kumooo/framework
       -> next
```

| Piece | Role |
|---|---|
| `create-kumooo` | Scaffolds a starter |
| `@kumooo/ui` | Design system (Button, Dialog, FadeIn, Radix Icons, …) |
| `@kumooo/framework` | Shared site meta / env helpers |
| Starters | Opinionated App Router apps |

Later: `@kumooo/cloudflare` plugin (cache / compression via CF API), then hosted multi-tenant. Those are not in this tree yet.
