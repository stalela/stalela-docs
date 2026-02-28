---
title: Consents API
---

Consent endpoints manage lifecycle events for privacy permissions.

---

## `GET /api/cis/v1/identities/:id/consents`

List consents attached to an identity.

**Response**

```json
{
  "data": [
    {
      "consentId": "cons_123",
      "scope": "PROFILE_SHARE",
      "status": "granted",
      "version": "2.0.0",
      "grantedAt": "2024-05-01T09:00:00Z"
    }
  ],
  "nextCursor": null
}
```

**Errors**

| Code | Message | Notes |
| --- | --- | --- |
| `404` | `identity_not_found` | Check identity scope. |
| `403` | `insufficient_scope` | Requires `consent:read`. |

**Auth & RBAC** — Identity owner or staff.

---

## `POST /api/cis/v1/identities/:id/consents`

Create or update a consent (see [Identities API](identities.md#factors-and-otp-verification) for related endpoints).

---

## `POST /api/cis/v1/consents/:id/withdraw`

Withdraw an existing consent.

**Request**

```json
{
  "reason": "user_request",
  "metadata": {
    "channel": "self_service"
  }
}
```

**Response**

```json
{
  "consentId": "cons_123",
  "status": "withdrawn",
  "withdrawnAt": "2024-05-02T11:00:00Z"
}
```

=== "Curl"

    ```bash
    curl -X POST https://stalela-platform.vercel.app/api/cis/v1/consents/cons_123/withdraw \
      -H "Authorization: Bearer $TOKEN" \
      -H "X-Tenant-Id: tnt_za" \
      -H "Idempotency-Key: $(uuidgen)" \
      -H "Content-Type: application/json" \
      -d '{"reason":"user_request"}'
    ```

=== "JavaScript"

    ```typescript
    await fetch('https://stalela-platform.vercel.app/api/cis/v1/consents/cons_123/withdraw', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Tenant-Id': 'tnt_za',
        Authorization: `Bearer ${token}`,
        'Idempotency-Key': crypto.randomUUID(),
      },
      body: JSON.stringify({ reason: 'user_request' }),
    });
    ```

=== "Python"

    ```python
    import uuid
    import requests

    requests.post(
        "https://stalela-platform.vercel.app/api/cis/v1/consents/cons_123/withdraw",
        json={"reason": "user_request", "metadata": {"channel": "self_service"}},
        headers={
            "Authorization": f"Bearer {token}",
            "X-Tenant-Id": "tnt_za",
            "Idempotency-Key": str(uuid.uuid4()),
        },
        timeout=10,
    )
    ```

**Errors**

| Code | Message | Notes |
| --- | --- | --- |
| `404` | `consent_not_found` | Invalid consent id. |
| `409` | `already_withdrawn` | Consent already withdrawn. |

**Idempotency** — Required.

**Auth & RBAC** — Identity owners, org admins (if delegated), or staff.
