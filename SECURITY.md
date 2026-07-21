# Security

Email **contact@renzoreyn.dev**. Please don't open a public issue for security problems.

## Model, briefly

- Passwords: PBKDF2-SHA256, 600k iterations
- Sessions: random tokens, only SHA-256 stored, HttpOnly cookies
- Templates escape by default
- Tenancy scoped by org/site ID on every query
