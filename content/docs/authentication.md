## Sessions (humans)

```
POST /v1/auth/signup
POST /v1/auth/login
POST /v1/auth/logout
GET  /v1/auth/me
```

Login sets an HttpOnly cookie.
Passwords are PBKDF2-SHA256 (600k iterations).
Minimum 10 characters. Passphrases beat hieroglyphs.

## Roles

| Role | Can |
|---|---|
| viewer | read |
| author | draft own content, upload media |
| editor | publish and edit anything |
| admin | settings, domains |
| owner | everything |

## Errors you might see

**That login didn't work.**
Double-check your email and password.

**You need the editor role (or higher) for that.**
Authors draft. Editors publish.

