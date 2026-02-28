---
title: Organizations API
---

Manage organization creation, invitations, roles, and verification.

---

## `POST /api/cis/v1/orgs`

Create an organization.

**Request**

```json
{
  "name": "Acme Payments",
  "country": "ZA",
  "industry": "fintech",
  "metadata": {
    "registrationNumber": "2019/123456/07"
  }
}
```

**Response**

```json
{
  "orgId": "org_123",
  "status": "initialized",
  "verification": {
    "required": true,
    "policy": "KYB_ZA_STANDARD"
  }
}
```

=== "Curl"

    ```bash
    curl -X POST https://stalela-platform.vercel.app/api/cis/v1/orgs \
      -H "Content-Type: application/json" \
      -H "X-Tenant-Id: tnt_za" \
      -H "Authorization: Bearer $TOKEN" \
      -H "Idempotency-Key: $(uuidgen)" \
      -d '{"name":"Acme Payments","country":"ZA"}'
    ```

=== "JavaScript"

    ```typescript
    const res = await fetch('https://stalela-platform.vercel.app/api/cis/v1/orgs', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Tenant-Id': 'tnt_za',
        Authorization: `Bearer ${token}`,
        'Idempotency-Key': crypto.randomUUID(),
      },
      body: JSON.stringify({ name: 'Acme Payments', country: 'ZA' }),
    });
    const org = await res.json();
    ```

=== "Python"

    ```python
    import requests, uuid

    resp = requests.post(
        "https://stalela-platform.vercel.app/api/cis/v1/orgs",
        json={"name": "Acme Payments", "country": "ZA"},
        headers={
            "X-Tenant-Id": "tnt_za",
            "Authorization": f"Bearer {token}",
            "Idempotency-Key": str(uuid.uuid4()),
        },
        timeout=10,
    )
    org = resp.json()
    ```

**Errors**

| Code | Message | Notes |
| --- | --- | --- |
| `400` | `invalid_country` | Unsupported jurisdiction. |
| `409` | `duplicate_org` | Org with same registration already exists. |
| `412` | `owner_missing` | Identity lacking role to create org. |

**Idempotency** — Required.

**Auth & RBAC** — Requires `orgs:create` and `identities:manage` scopes.

---

## `POST /api/cis/v1/orgs/:orgId/invitations`

Invite identities to join the organization.

**Request**

```json
{
  "email": "owner@example.com",
  "role": "OWNER",
  "expiresAt": "2024-05-10T00:00:00Z"
}
```

**Response**

```json
{
  "invitationId": "inv_123",
  "status": "pending"
}
```

**Errors**

| Code | Message | Notes |
| --- | --- | --- |
| `400` | `role_invalid` | Role not valid for org type. |
| `403` | `insufficient_scope` | Caller lacks `orgs:invite`. |
| `409` | `identity_already_member` | Identity already part of org. |

**Idempotency** — Optional; duplicate invites de-duplicated by email.

**Auth & RBAC** — Org owners or admins only.

---

## `POST /api/cis/v1/orgs/:orgId/roles/assign`

Assign roles to existing members.

**Request**

```json
{
  "identityId": "id_456",
  "roles": ["FINANCE_ADMIN", "ANALYST"],
  "scopes": ["payouts:manage"]
}
```

**Response**

```json
{
  "membershipId": "mem_789",
  "status": "updated"
}
```

**Errors**

| Code | Message | Notes |
| --- | --- | --- |
| `403` | `insufficient_scope` | Caller not authorized to assign roles. |
| `404` | `membership_not_found` | Identity not part of org. |
| `409` | `role_conflict` | Role combination violates policy. |

**Idempotency** — Required.

**Auth & RBAC** — Requires `orgs:manage` scope.

---

## `POST /api/cis/v1/orgs/:orgId/verification/start|complete`

Initiate or complete KYB verification.

**Start request**

```json
{
  "policy": "KYB_ZA_STANDARD",
  "metadata": {
    "caseId": "case_987"
  }
}
```

**Complete request**

```json
{
  "verificationId": "ver_kyb_123",
  "evidence": {
    "documents": ["cis-evidence/ver_kyb_123/documents.zip"],
    "watchlist": "pass"
  }
}
```

**Start response**

```json
{
  "verificationId": "ver_kyb_123",
  "status": "pending"
}
```

**Complete response**

```json
{
  "verificationId": "ver_kyb_123",
  "status": "verified",
  "trustTier": "TRUST_KYB_VERIFIED"
}
```

**Errors**

| Code | Message | Notes |
| --- | --- | --- |
| `400` | `policy_not_applicable` | Org type not eligible for policy. |
| `409` | `verification_in_progress` | Existing workflow active. |
| `422` | `evidence_incomplete` | Missing required docs or checks. |

**Idempotency** — Required for `start` and `complete`.

**Auth & RBAC** — Org owners or staff with `verification:write` scope.
