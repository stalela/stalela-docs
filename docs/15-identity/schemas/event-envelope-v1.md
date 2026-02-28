---
title: Event Envelope v1
---

Envelope schema used for all CIS event publications via the transactional outbox.

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "https://stalela.dev/schemas/event-envelope.v1.json",
  "title": "Event Envelope v1",
  "type": "object",
  "required": ["envelope", "key", "payload"],
  "properties": {
    "envelope": {
      "type": "object",
      "required": ["v", "eventId", "type", "occurredAt", "tenantId"],
      "properties": {
        "v": { "type": "integer", "minimum": 1 },
        "eventId": { "type": "string", "format": "uuid" },
        "type": { "type": "string" },
        "occurredAt": { "type": "string", "format": "date-time" },
        "tenantId": { "type": "string" },
        "traceparent": { "type": "string" },
        "signature": { "type": "string" },
        "keyId": { "type": "string" }
      },
      "additionalProperties": false
    },
    "key": {
      "type": "object",
      "additionalProperties": { "type": ["string", "number", "boolean", "null"] }
    },
    "payload": {
      "type": "object",
      "additionalProperties": true
    }
  },
  "additionalProperties": false
}
```

See [event-envelope.v1.json](event-envelope.v1.json) for the raw schema file.
