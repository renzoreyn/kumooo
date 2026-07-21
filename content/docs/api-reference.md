Base URL: your API worker (local: `http://127.0.0.1:8787`).

Errors look like:

```json
{ "error": { "code": "not_found", "message": "Site not found." } }
```

## Auth

| Method | Path | What |
|---|---|---|
| POST | `/v1/auth/signup` | create account + org |
| POST | `/v1/auth/login` | set session cookie |
| POST | `/v1/auth/logout` | clear session |
| GET | `/v1/auth/me` | current user |

## Orgs and sites

| Method | Path | What |
|---|---|---|
| GET | `/v1/orgs` | your organizations |
| GET | `/v1/orgs/:orgId/sites` | list sites |
| POST | `/v1/orgs/:orgId/sites` | create site |
| GET | `/v1/sites/:siteId` | site details |
| PATCH | `/v1/sites/:siteId` | update name/theme/settings |

## Content

| Method | Path | What |
|---|---|---|
| GET | `/v1/sites/:siteId/content` | list |
| POST | `/v1/sites/:siteId/content` | create |
| GET | `/v1/sites/:siteId/content/:id` | get |
| PATCH | `/v1/sites/:siteId/content/:id` | update (+ revision) |
| DELETE | `/v1/sites/:siteId/content/:id` | delete |
| GET | `/v1/sites/:siteId/content/:id/revisions` | revisions |

## Media and domains

| Method | Path | What |
|---|---|---|
| GET/POST | `/v1/sites/:siteId/media` | list / upload |
| DELETE | `/v1/sites/:siteId/media/:id` | delete |
| GET/POST | `/v1/sites/:siteId/domains` | list / add |
| DELETE | `/v1/sites/:siteId/domains/:id` | remove |

