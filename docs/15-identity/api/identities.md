---
title: Identities API
---

All identity endpoints require `Authorization: Bearer …` and `X-Tenant-Id`.
Mutations should include an `Idempotency-Key` header to guarantee safe retries.

---

## `POST /api/cis/v1/identities`

Create an identity. The service encrypts PII, runs a compliance screening, and sets an initial status (`ACTIVE`, `IN_REVIEW`, or `DENIED` depending on the outcome).

**Request**

```json
{
  "type": "INDIVIDUAL",
  "email": "user@example.com",
  "firstName": "Lerato",
  "lastName": "Nkosi",
  "dateOfBirth": "1993-04-01",
  "metadata": {
    "crmId": "sf_98231"
  }
}
```

**Response**

```json
{
  "identityId": "id_123",
  "status": "IN_REVIEW",
  "createdAt": "2025-01-12T08:41:03.920Z",
  "updatedAt": "2025-01-12T08:41:03.920Z",
  "metadata": {
    "crmId": "sf_98231"
  }
}
```

Possible status outcomes:

- `ACTIVE` – compliance returned `ALLOW`.
- `IN_REVIEW` – compliance returned `REVIEW`.
- `DENIED` – hard failure, identity is blocked from progression.

=== "Curl"

    ```bash
    curl -X POST https://stalela-platform.vercel.app/api/cis/v1/identities \
      -H "Content-Type: application/json" \
      -H "X-Tenant-Id: tnt_za" \
      -H "Idempotency-Key: $(uuidgen)" \
      -H "Authorization: Bearer $TOKEN" \
      -d '{
        "type": "INDIVIDUAL",
        "email": "user@example.com",
        "firstName": "Lerato",
        "lastName": "Nkosi",
        "dateOfBirth": "1993-04-01"
      }'
    ```

=== "JavaScript"

    ```typescript
    const res = await fetch('https://stalela-platform.vercel.app/api/cis/v1/identities', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Tenant-Id': tenantId,
        Authorization: `Bearer ${token}`,
        'Idempotency-Key': crypto.randomUUID(),
      },
      body: JSON.stringify({
        type: 'INDIVIDUAL',
        email: 'user@example.com',
        firstName: 'Lerato',
        lastName: 'Nkosi',
        dateOfBirth: '1993-04-01',
      }),
    });
    const body = await res.json();
    ```

**Errors**

| Code | Message | Notes |
| --- | --- | --- |
| `400` | `invalid_payload` | Schema validation failed. See `errors` array for detail. |
| `409` | `identity_exists` | Identity with same PII already present for tenant. |
| `503` | `compliance_unavailable` | Compliance service unreachable. Request retried automatically if idempotency provided. |

**Scopes**: `identities:create`.

---

## `GET /api/cis/v1/identities/:id`

Retrieve a decrypted view of the identity (PII only returned to authorised scopes).

```json
{
  "identityId": "id_123",
  "type": "INDIVIDUAL",
  "status": "ACTIVE",
  "email": "user@example.com",
  "firstName": "Lerato",
  "lastName": "Nkosi",
  "dateOfBirth": "1993-04-01",
  "metadata": {
    "crmId": "sf_98231"
  },
  "addresses": [
    {
      "addressId": "addr_01",
      "type": "PRIMARY",
      "city": "Cape Town",
      "country": "ZA",
      "deletedAt": null
    }
  ],
  "phones": [
    {
      "phoneId": "ph_01",
      "type": "MOBILE",
      "number": "+27600000000",
      "deletedAt": null
    }
  ]
}
```

**Scopes**: `identities:read`. Soft-deleted identities return `404`.

---

## `GET /api/cis/v1/identities`

Search identities with query filters.

**Query parameters**

| Param | Type | Notes |
| --- | --- | --- |
| `query` | string | Matches PII fields (email, first name, last name) via `tsvector` full-text search. |
| `status` | string[] | Filter by one or more statuses. |
| `type` | string[] | Filter by identity type(s). |
| `limit` | integer | Default `10`, max `100`. |
| `offset` | integer | Default `0`. |

**Response**

```json
{
  "items": [
    {
      "identityId": "id_123",
      "type": "INDIVIDUAL",
      "status": "IN_REVIEW",
      "displayName": "Lerato Nkosi",
      "email": "user@example.com",
      "createdAt": "2025-01-12T08:41:03.920Z",
      "updatedAt": "2025-01-12T08:41:03.920Z"
    }
  ],
  "total": 1
}
```

**Scopes**: `identities:read`.

---

## Status Management

### `PUT /api/cis/v1/identities/:id/status`

Update lifecycle status with audit trail.

**Request**

```json
{
  "nextStatus": "BLOCKED",
  "comment": "Chargeback fraud detected",
  "actorId": "usr_ops_42"
}
```

**Response**

```json
{
  "identityId": "id_123",
  "previousStatus": "ACTIVE",
  "nextStatus": "BLOCKED",
  "updatedAt": "2025-01-13T09:20:11.004Z"
}
```

Invalid transitions return `400` with message `invalid_status_transition`.

**Scopes**: `identities:write`.

### `GET /api/cis/v1/identities/:id/status-history`

Returns the most recent transitions first.

```json
[
  {
    "statusHistoryId": "hist_01",
    "fromStatus": "ACTIVE",
    "toStatus": "BLOCKED",
    "comment": "Chargeback fraud detected",
    "actorId": "usr_ops_42",
    "changedAt": "2025-01-13T09:20:11.004Z"
  },
  {
    "statusHistoryId": "hist_00",
    "fromStatus": "PENDING",
    "toStatus": "ACTIVE",
    "comment": "Compliance approved",
    "actorId": "system",
    "changedAt": "2025-01-12T08:41:05.210Z"
  }
]
```

**Scopes**: `identities:read`.

---

## Compliance Endpoints

### `PUT /api/cis/v1/identities/:id/compliance/refresh`

Re-run compliance screening using stored PII.

```json
{
  "decision": {
    "outcome": "REVIEW",
    "reason": "List match",
    "score": 62.4,
    "matchedRuleIds": ["ofac-sdn-001"]
  },
  "identity": {
    "identityId": "id_123",
    "status": "IN_REVIEW"
  }
}
```

If the outcome differs from the current status, the transaction updates the identity and records a status history entry. Failures to reach the compliance service respond with `503 compliance_unavailable`.

**Scopes**: `identities:write`.

### `GET /api/cis/v1/identities/:id/compliance`

Fetch the most recent decisions (default limit `10`).

```json
[
  {
    "complianceResultId": "cmp_01",
    "outcome": "DENIED",
    "reason": "OFAC list match",
    "score": 93.4,
    "matchedRuleIds": ["ofac-sdn-001"],
    "checkedAt": "2025-01-13T09:20:09.221Z"
  },
  {
    "complianceResultId": "cmp_00",
    "outcome": "ALLOW",
    "checkedAt": "2025-01-12T08:41:04.112Z"
  }
]
```

**Scopes**: `identities:read`.

---

## Metadata

### `PUT /api/cis/v1/identities/:id/metadata`

Replace the metadata object atomically.

```json
{
  "metadata": {
    "crmId": "sf_98231",
    "segment": "vip"
  }
}
```

Validation rules:

- Maximum 100 keys.
- Key names must be `<= 64` characters, snake_case.
- Values must be strings up to 1 000 characters.

**Scopes**: `identities:write`.

---

## Addresses

| Endpoint | Purpose |
| --- | --- |
| `POST /api/cis/v1/identities/:id/addresses` | Create address |
| `GET /api/cis/v1/identities/:id/addresses` | List active addresses |
| `PUT /api/cis/v1/identities/:id/addresses/:addressId` | Update address |
| `DELETE /api/cis/v1/identities/:id/addresses/:addressId` | Soft delete |

**Create request**

```json
{
  "type": "PRIMARY",
  "street1": "12 Loop Street",
  "city": "Cape Town",
  "postalCode": "8001",
  "country": "ZA"
}
```

**Create response**

```json
{
  "addressId": "addr_01",
  "identityId": "id_123",
  "type": "PRIMARY",
  "createdAt": "2025-01-12T08:45:22.005Z"
}
```

Updates and deletes respect soft deletion (`deletedAt` timestamp). Lists exclude deleted rows by default.

**Scopes**: `identities:write` for mutation, `identities:read` for list.

---

## Phones

| Endpoint | Purpose |
| --- | --- |
| `POST /api/cis/v1/identities/:id/phones` | Create phone |
| `GET /api/cis/v1/identities/:id/phones` | List active phones |
| `PUT /api/cis/v1/identities/:id/phones/:phoneId` | Update phone |
| `DELETE /api/cis/v1/identities/:id/phones/:phoneId` | Soft delete |

Phone number requests mirror addresses with `type`, `number`, `extension`. Mutation endpoints behave identically to addresses with soft delete semantics.

---

## Factors and OTP Verification

### `POST /api/cis/v1/identities/:id/factors`

Create a verification factor for an identity. For `EMAIL_OTP` and `SMS_OTP` factors, a cryptographically secure 6-digit OTP is automatically generated.

**Request**

```json
{
  "kind": "EMAIL_OTP",
  "handle": "user@example.com"
}
```

**Response**

```json
{
  "id": "factor_123",
  "identityId": "id_123",
  "kind": "EMAIL_OTP",
  "status": "PENDING",
  "handle": "user@example.com",
  "createdAt": "2025-01-12T08:41:03.920Z",
  "updatedAt": "2025-01-12T08:41:03.920Z"
}
```

**OTP Behavior:**

- **Generation**: OTPs are randomly generated 6-digit codes (100000–999999) using cryptographically secure random number generation.
- **Expiration**: OTPs expire 15 minutes after creation (`expiresAt` field).
- **Single-use**: Once verified, a factor's status changes to `VERIFIED` and cannot be reused.
- **Delivery**: For `EMAIL_OTP` factors, the OTP code is automatically sent via email through the notifications service (Resend).

### `POST /api/cis/v1/factors/:factorId/verify`

Verify an OTP code against a factor.

**Request**

```json
{
  "code": "123456"
}
```

**Response**

```json
{
  "status": "verified"
}
```

**Verification Rules:**

- The code must match the factor's `secret` field exactly.
- The factor must be in `PENDING` status (not already verified or revoked).
- The factor must not be expired (`expiresAt` must be in the future).
- Upon successful verification, the factor status changes to `VERIFIED`.

**Errors**

| Code | Error | Message |
| --- | --- | --- |
| `400` | `FACTOR_EXPIRED` | This verification code has expired |
| `400` | `FACTOR_ALREADY_VERIFIED` | This verification code has already been used |
| `400` | `FACTOR_REVOKED` | This verification code has been revoked |
| `400` | `INVALID_CODE` | Invalid verification code |
| `404` | `FACTOR_NOT_FOUND` | Factor not found |
