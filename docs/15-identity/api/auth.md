---
title: Auth API
---

All authentication endpoints require the following headers unless stated otherwise:

- `Authorization: Bearer <token>` — For refresh or factor verification.
- `X-Tenant-Id: <tenant>` — Tenant context for multi-tenant routing.
- `Idempotency-Key: <uuid>` — For mutation safety (optional on login).

---

## `POST /api/cis/v1/auth/sessions`

Create a session using password or factor-first authentication. Supports password and WebAuthn assertions.

**Request**

```json
{
  "identity": "id_123",
  "strategy": "password",
  "password": "correct horse battery staple",
  "orgId": "org_456",
  "scope": ["identities:read", "orgs:manage"]
}
```

**Response**

```json
{
  "sessionId": "sess_789",
  "accessToken": "eyJhbGciOi...",
  "expiresIn": 1800,
  "refreshToken": "rt_123",
  "mfaRequired": false
}
```

=== "Curl"

    ```bash
    curl -X POST https://stalela-platform.vercel.app/api/cis/v1/auth/sessions \
      -H "Content-Type: application/json" \
      -H "X-Tenant-Id: tnt_za" \
      -d '{
        "identity": "id_123",
        "strategy": "password",
        "password": "correct horse battery staple"
      }'
    ```

=== "JavaScript"

    ```typescript
    import fetch from 'node-fetch';

    const res = await fetch('https://stalela-platform.vercel.app/api/cis/v1/auth/sessions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Tenant-Id': 'tnt_za',
      },
      body: JSON.stringify({
        identity: 'id_123',
        strategy: 'password',
        password: 'correct horse battery staple',
      }),
    });
    const session = await res.json();
    ```

=== "Python"

    ```python
    import requests

    payload = {
        "identity": "id_123",
        "strategy": "password",
        "password": "correct horse battery staple",
    }
    resp = requests.post(
        "https://stalela-platform.vercel.app/api/cis/v1/auth/sessions",
        json=payload,
        headers={"X-Tenant-Id": "tnt_za"},
        timeout=10,
    )
    session = resp.json()
    ```

**Errors**

| Code | Message | Mitigation |
| --- | --- | --- |
| `401` | `invalid_credentials` | Check password or factor challenge status. |
| `403` | `mfa_required` | Complete factor verification via `/api/cis/v1/auth/factors/:id/verify`. |
| `409` | `session_conflict` | Existing active session with same device + scope. |

**Idempotency** — Not required. Each attempt creates a new session event.

**Auth & RBAC** — Password-first logins require valid credentials; scope limited by role and consent.

---

## `POST /api/cis/v1/auth/refresh`

Exchange a refresh token for a new access token.

**Request**

```json
{
  "refreshToken": "rt_123"
}
```

**Response**

```json
{
  "sessionId": "sess_789",
  "accessToken": "eyJhbGciOi...",
  "expiresIn": 1800,
  "refreshToken": "rt_456"
}
```

**Errors**

| Code | Message | Notes |
| --- | --- | --- |
| `400` | `invalid_token_format` | Token malformed or expired. |
| `401` | `refresh_revoked` | Token revoked due to logout or device removal. |
| `423` | `identity_quarantined` | Identity suspended; contact support. |

**Idempotency** — Required. Supply `Idempotency-Key` to avoid double-refresh.

**Auth & RBAC** — Requires valid refresh token bound to identity and org.

---

## `POST /api/cis/v1/auth/factors/:id/verify`

Verify a multi-factor challenge (OTP, WebAuthn, etc.).

**Request**

```json
{
  "challengeId": "chal_123",
  "code": "123456",
  "webauthnResponse": null
}
```

**Response**

```json
{
  "verified": true,
  "sessionId": "sess_789",
  "mfaToken": "mfa_abc"
}
```

**Errors**

| Code | Message | Notes |
| --- | --- | --- |
| `400` | `challenge_expired` | Retry login; OTP expired after 5 minutes. |
| `401` | `invalid_factor` | Factor revoked or not associated with identity. |
| `429` | `challenge_rate_limited` | Too many attempts; wait before retrying. |

**Idempotency** — Optional but recommended for automated retries.

**Auth & RBAC** — Factor must belong to the identity initiating session. On success, the session scopes from original login apply.
