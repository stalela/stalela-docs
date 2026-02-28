---
title: Policy v1
---

JSON-Logic policy schema controlling verification and consent requirements.

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "https://stalela.dev/schemas/policy.v1.json",
  "title": "Policy v1",
  "type": "object",
  "required": ["policyId", "name", "version", "type", "when", "checks"],
  "properties": {
    "policyId": { "type": "string" },
    "name": { "type": "string" },
    "version": { "type": "string", "pattern": "^\\d+\\.\\d+\\.\\d+$" },
    "type": { "type": "string", "enum": ["KYC", "KYB", "CONSENT"] },
    "when": { "type": "object", "description": "JSON-Logic expression tree", "additionalProperties": true },
    "checks": { "type": "object", "additionalProperties": true },
    "createdAt": { "type": "string", "format": "date-time" },
    "updatedAt": { "type": "string", "format": "date-time" }
  },
  "additionalProperties": false
}
```

See [policy.v1.json](policy.v1.json) for the raw schema file.
