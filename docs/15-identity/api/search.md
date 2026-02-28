---
title: Search API
---

Use the public search endpoint for tenant-scoped discovery. Staff tenants can broaden filters via custom scopes.

---

## `GET /api/cis/v1/identities`

**Query parameters**

| Param | Type | Description |
| --- | --- | --- |
| `query` | string | Partial match across email, first name, and last name using Postgres `tsvector` full-text search. Case-insensitive. |
| `status` | string[] | Comma-separated list of statuses (`PENDING`, `ACTIVE`, `IN_REVIEW`, `DENIED`, `BLOCKED`, `FROZEN`). |
| `type` | string[] | Comma-separated list of identity types. |
| `limit` | integer | Page size (default `10`, maximum `100`). |
| `offset` | integer | Offset for classic pagination (default `0`). |

**Response**

```json
{
  "items": [
    {
      "identityId": "id_123",
      "type": "INDIVIDUAL",
      "status": "ACTIVE",
      "displayName": "Lerato Nkosi",
      "email": "user@example.com",
      "createdAt": "2025-01-12T08:41:03.920Z",
      "updatedAt": "2025-01-13T09:20:11.004Z"
    }
  ],
  "total": 42
}
```

=== "Curl"

    ```bash
    curl "https://stalela-platform.vercel.app/api/cis/v1/identities?status=ACTIVE,IN_REVIEW&query=lerato" \
      -H "Authorization: Bearer $TOKEN" \
      -H "X-Tenant-Id: tnt_za"
    ```

=== "JavaScript"

    ```typescript
    const res = await fetch(
      'https://stalela-platform.vercel.app/api/cis/v1/identities?status=ACTIVE&type=INDIVIDUAL&limit=25&offset=0',
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'X-Tenant-Id': tenantId,
        },
      },
    );
    const results = await res.json();
    ```

=== "Python"

    ```python
    import requests

    resp = requests.get(
        "https://stalela-platform.vercel.app/api/cis/v1/identities",
        params={
            "status": "ACTIVE,IN_REVIEW",
            "query": "lerato",
            "limit": 50,
            "offset": 0,
        },
        headers={
            "Authorization": f"Bearer {token}",
            "X-Tenant-Id": tenant_id,
        },
        timeout=10,
    )
    results = resp.json()
    ```

**Errors**

| Code | Message | Notes |
| --- | --- | --- |
| `400` | `invalid_filter` | Malformed status/type or non-numeric `limit`/`offset`. |
| `403` | `insufficient_scope` | Token lacks `identities:read`. |

Soft-deleted identities are excluded automatically. Staff applications may request elevated scopes to search across tenants; otherwise the query is restricted to the caller's `X-Tenant-Id`.
