---
title: Verification API
---

The verification API exposes neutral endpoints to inspect and manage both identity (KYC) and organization (KYB) workflows. Use the `verificationId` returned from identity or org start requests.

---

## `GET /api/cis/v1/verification/:id`

Retrieve verification status and evidence pointers.

**Response**

```json
{
  "verificationId": "ver_123",
  "subjectType": "identity",
  "subjectId": "id_123",
  "policy": "KYC_ZA_BASIC",
  "status": "pending",
  "steps": [
    { "name": "document_upload", "status": "completed" },
    { "name": "liveness_check", "status": "pending" }
  ],
  "evidence": {
    "document": "cis-evidence/ver_123/documents.pdf"
  },
  "updatedAt": "2024-05-01T10:02:00Z"
}
```

**Errors**

| Code | Message | Notes |
| --- | --- | --- |
| `404` | `verification_not_found` | Ensure identifier belongs to tenant. |
| `403` | `insufficient_scope` | Requires `verification:read`. |

**Auth & RBAC** — Staff or org roles with verification read scope.

---

## `POST /api/cis/v1/verification/:id/resubmit`

Resubmit evidence after remediation.

**Request**

```json
{
  "evidence": {
    "document": "cis-evidence/ver_123/documents_v2.pdf",
    "notes": "Resubmitted with certified ID"
  },
  "reason": "document_reupload"
}
```

**Response**

```json
{
  "verificationId": "ver_123",
  "status": "pending",
  "steps": [
    { "name": "document_upload", "status": "completed" },
    { "name": "liveness_check", "status": "pending" }
  ]
}
```

=== "Curl"

    ```bash
    curl -X POST https://stalela-platform.vercel.app/api/cis/v1/verification/ver_123/resubmit \
      -H "X-Tenant-Id: tnt_za" \
      -H "Authorization: Bearer $TOKEN" \
      -H "Idempotency-Key: $(uuidgen)" \
      -H "Content-Type: application/json" \
      -d '{"evidence":{"document":"cis-evidence/ver_123/documents_v2.pdf"}}'
    ```

=== "JavaScript"

    ```typescript
    await fetch('https://stalela-platform.vercel.app/api/cis/v1/verification/ver_123/resubmit', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Tenant-Id': 'tnt_za',
        Authorization: `Bearer ${token}`,
        'Idempotency-Key': crypto.randomUUID(),
      },
      body: JSON.stringify({
        evidence: { document: 'cis-evidence/ver_123/documents_v2.pdf' },
        reason: 'document_reupload',
      }),
    });
    ```

=== "Python"

    ```python
    import uuid
    import requests

    requests.post(
        "https://stalela-platform.vercel.app/api/cis/v1/verification/ver_123/resubmit",
        json={
            "evidence": {"document": "cis-evidence/ver_123/documents_v2.pdf"},
            "reason": "document_reupload",
        },
        headers={
            "X-Tenant-Id": "tnt_za",
            "Authorization": f"Bearer {token}",
            "Idempotency-Key": str(uuid.uuid4()),
        },
        timeout=10,
    )
    ```

**Errors**

| Code | Message | Notes |
| --- | --- | --- |
| `400` | `invalid_evidence` | Evidence payload missing required artifacts. |
| `409` | `verification_locked` | Case closed; open appeal to resubmit. |

**Idempotency** — Required for resubmissions.

**Auth & RBAC** — Identity owners (self-service) or staff with `verification:write`.

---

## `POST /api/cis/v1/verification/:id/decision`

Staff endpoint to override verification outcome.

**Request**

```json
{
  "decision": "approved",
  "reasonCode": "manual_override",
  "notes": "Verified via alternative documentation"
}
```

**Response**

```json
{
  "verificationId": "ver_123",
  "status": "verified",
  "decisionedBy": "id_staff_001",
  "occurredAt": "2024-05-01T12:00:00Z"
}
```

**Errors**

| Code | Message | Notes |
| --- | --- | --- |
| `403` | `insufficient_scope` | Requires staff role with override permission. |
| `409` | `decision_already_final` | Workflow already finalised. |

**Idempotency** — Required to avoid multiple decisions.

**Auth & RBAC** — Staff with `verification:override` and quorum policy if configured.
