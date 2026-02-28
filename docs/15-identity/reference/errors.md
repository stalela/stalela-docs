---
title: Error Catalog
---

All CIS errors include an HTTP status, a machine-readable `code`, and
a human-readable `message`.

---

## Error Codes

| Code | HTTP | Message | Description |
|------|------|---------|-------------|
| `invalid_credentials` | 401 | Invalid credentials | Authentication failed. |
| `mfa_required` | 403 | MFA required | Additional factor needed. |
| `identity_not_found` | 404 | Identity not found | Unknown identity or tenant mismatch. |
| `duplicate_identity` | 409 | Identity already exists | Same email / phone already registered. |
| `policy_not_applicable` | 400 | Policy not applicable | Policy doesn't match subject or tenant. |
| `verification_in_progress` | 409 | Verification already in progress | Cannot start another workflow. |
| `consent_exists` | 409 | Consent already exists | Duplicate consent for same scope. |
| `key_limit_reached` | 409 | API key limit reached | Org exceeded key quota. |
| `challenge_rate_limited` | 429 | Too many challenges | Rate limit triggered on verification or MFA. |
| `identity_quarantined` | 423 | Identity quarantined | Access restricted pending investigation. |

## Response Shape

```json
{
  "code": "identity_not_found",
  "message": "Identity not found"
}
```

Refer to individual API endpoint documentation for additional
domain-specific errors.
