---
title: Versioning & Compatibility
---

CIS maintains backward-compatible event contracts. Consumers should build tolerant parsers and monitor changelog updates.

## Compatibility Policy

- **Backwards compatible** — New fields appended, never removed without major version.
- **Deprecation cadence** — Deprecated fields remain for at least 180 days with announcements in the changelog.
- **Schema versioning** — `envelope.v` increments on breaking envelope changes (none planned).

---

## Change Management

1. Schema proposal captured in [CIS ADRs](../adrs/CIS-ADR-0002-event-envelope-and-bus.md).
2. Preview topics published to `*-beta` suffix for 30 days.
3. Production rollout includes changelog entry and email alert to subscribers.

---

## Migration Strategy

- Use feature flags to opt into new fields.
- Validate event payloads against JSON Schemas in [schemas/event-envelope.v1](../schemas/event-envelope-v1.md).
- Replay events with `/api/cis/v1/events/replay?from=<timestamp>` to rebuild downstream stores.

---

## Testing

- Contract tests using `stalela-specs` fixtures ensure consumers adhere to expected payloads.
- Mock servers available in the SDKs for local development.
