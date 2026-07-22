# 2026-01-09 / cache bump

`renderer` v0.4.2 deployed.

- KV version key incremented
- stale HTML purged on publish hook
- no schema change

Observed p95 drop 12ms on cold read. Within noise. Keeping.

Note: alias `default` -> `haru` still active. Do not break old sites.

Follow-up:

- verified publish hook fires on PATCH status -> published
- confirmed CDN-Cache-Control header unchanged
- rolled back test flag `FORCE_MISS` in staging only

Log retention: none required. This post is the record.

If you run fuyu on your own site, copy this format. Date slash topic. Bullets for diffs. One paragraph max for context. Readers who want essays can click aki demo instead.

Rollback plan if p95 regresses: revert KV key bump, invalidate manually, file follow-up. Not needed tonight.

Metrics snapshot (staging):

- TTFB median: 18ms
- cache hit ratio: 94%
- error rate: 0.00%

Sign-off: ren / 2026-01-09 22:14 UTC. Closed.
