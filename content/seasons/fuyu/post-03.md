# incident-2026-01-14-auth

Window: 14:02-14:19 UTC

Symptom: session cookie not set on first login after deploy.

Cause: `Secure` flag on cookie while staging served plain HTTP.

Fix: env `KUMOOO_COOKIE_SECURE` respected per environment.

Action items:

1. document flag in README
2. add smoke test for Set-Cookie
3. close ticket

Impact: staging only. Production unaffected. Zero user data loss.

Detection: manual QA on login flow post-deploy. Automated check added same day.

Postmortem length: short. Preferred.

Lesson: environment parity matters for cookie flags. Obvious in hindsight. Write it down so hindsight becomes docs.

If your team publishes incident notes, fuyu keeps them readable without turning them into performance theater. Facts first. Feelings optional.

Timeline export attached internally. Not public. This post is sufficient for external comms.

Severity: low. Duration: seventeen minutes. Customer reports: zero.

Communications: none sent. Internal Slack thread linked in ticket. Stakeholders notified after fix verified.

Regression guard: smoke test runs on every deploy to staging HTTP origin. Cookie flags checked explicitly.
