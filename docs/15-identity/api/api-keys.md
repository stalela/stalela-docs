---
title: API Keys
---

API keys are issued per organization and scoped to service accounts.

---

## `POST /api/cis/v1/orgs/:orgId/api-keys`

Create a new API key.

**Request**

```json
{
  "name": "Backend integration",
  "scopes": ["identities:read", "orgs:manage"],
  "expiresAt": "2024-12-31T23:59:59Z"
}
```

**Response**

```json
{
  "keyId": "key_123",
  "secret": "sk_live_abc",
  "createdAt": "2024-05-01T10:00:00Z"
}
```

=== "Curl"

    ```bash
    curl -X POST https://stalela-platform.vercel.app/api/cis/v1/orgs/org_123/api-keys \
      -H "Authorization: Bearer $TOKEN" \
      -H "X-Tenant-Id: tnt_za" \
      -H "Idempotency-Key: $(uuidgen)" \
      -H "Content-Type: application/json" \
      -d '{"name":"Backend integration","scopes":["identities:read"]}'
    ```

=== "JavaScript"

    ```typescript
    await fetch('https://stalela-platform.vercel.app/api/cis/v1/orgs/org_123/api-keys', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Tenant-Id': 'tnt_za',
        Authorization: `Bearer ${token}`,
        'Idempotency-Key': crypto.randomUUID(),
      },
      body: JSON.stringify({ name: 'Backend integration', scopes: ['identities:read'] }),
    });
    ```

=== "Python"

    ```python
    import uuid
    import requests

    requests.post(
        "https://stalela-platform.vercel.app/api/cis/v1/orgs/org_123/api-keys",
        json={"name": "Backend integration", "scopes": ["identities:read"]},
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
| `403` | `insufficient_scope` | Requires `api_keys:create` and org ownership. |
| `409` | `key_limit_reached` | Rotate existing keys before creating more. |
| `422` | `invalid_scope` | Scope not allowed for API keys. |

**Idempotency** — Required.

**Auth & RBAC** — Org owners or delegated roles.

---

## `GET /api/cis/v1/orgs/:orgId/api-keys/:keyId`

Retrieve API key metadata (secret not returned).

**Response**

```json
{
  "keyId": "key_123",
  "name": "Backend integration",
  "status": "active",
  "lastUsedAt": "2024-05-02T08:00:00Z"
}
```

**Errors**

| Code | Message | Notes |
| --- | --- | --- |
| `404` | `key_not_found` | Key does not exist for org. |

**Auth & RBAC** — Requires `api_keys:read`.

---

## `DELETE /api/cis/v1/orgs/:orgId/api-keys/:keyId`

Deactivate an API key. Secrets cannot be recovered after deletion.

**Response**

```json
{
  "keyId": "key_123",
  "status": "revoked",
  "revokedAt": "2024-05-03T12:00:00Z"
}
```

**Errors**

| Code | Message | Notes |
| --- | --- | --- |
| `403` | `insufficient_scope` | Caller lacks revoke permission. |
| `404` | `key_not_found` | Already deleted or invalid. |

**Idempotency** — Optional; repeated deletes return same response.

**Auth & RBAC** — Org owners or staff with `api_keys:revoke`.
