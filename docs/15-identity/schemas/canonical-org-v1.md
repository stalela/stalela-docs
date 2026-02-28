---
title: Canonical Org v1
---

Organization schema used for merchant records across Stalela services.

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "https://stalela.dev/schemas/canonical-org.v1.json",
  "title": "Canonical Organization v1",
  "type": "object",
  "required": ["orgId", "tenantId", "status", "name", "createdAt"],
  "properties": {
    "orgId": { "type": "string", "pattern": "^org_[a-zA-Z0-9]+$" },
    "tenantId": { "type": "string" },
    "name": { "type": "string", "minLength": 1 },
    "status": { "type": "string", "enum": ["initialized", "pending_verification", "active", "suspended", "dissolved"] },
    "country": { "type": "string", "pattern": "^[A-Z]{2}$" },
    "trustTier": { "type": "string", "enum": ["TRUST_NONE", "TRUST_KYB_VERIFIED"] },
    "metadata": { "type": "object", "additionalProperties": { "type": ["string", "number", "boolean", "null"] } },
    "createdAt": { "type": "string", "format": "date-time" },
    "updatedAt": { "type": "string", "format": "date-time" }
  },
  "additionalProperties": false
}
```

See [canonical-org.v1.json](canonical-org.v1.json) for the raw schema file.
