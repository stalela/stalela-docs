---
title: Consent & Privacy
---

CIS maintains a consent ledger that records who granted what permission, for which purpose, and under which policy version.

## Consent Object

| Field | Description |
| --- | --- |
| `consentId` | Unique identifier for the consent record. |
| `identityId` | Identity granting consent. |
| `policyId` | Reference to privacy or data processing policy. |
| `version` | Semantic version of the policy document. |
| `grantedAt` | ISO timestamp when consent was granted. |
| `expiresAt` | Optional expiry; `null` means indefinite. |
| `proof` | Hash pointer to append-only Postgres table containing signed artifact. |
| `scope` | Granular action (e.g., `PROFILE_SHARE`, `MARKETING_EMAIL`). |

---

## Lifecycle

1. Identity requests to perform an action requiring consent.
2. CIS presents policy summary and obtains explicit opt-in.
3. Consent record stored with tamper-evident hash chain.
4. Consent updates (withdrawal, version bump) create new entries; previous records remain for audit.

---

## Privacy Posture

- **Data minimization** — Use derived identifiers when possible. PII stored only where required.
- **Access controls** — Staff roles require `scope:consent:read` to view consent proofs.
- **Data subject rights** — CIS orchestrates access/erasure workflows with the compliance service.

!!! tip "Versioning"
    Always increment the `version` field when policy language changes. CIS automatically prompts users to re-consent when a newer version is required.

---

## Audit

- Immutable log stored in append-only Postgres tables with RLS enforcement and a retention period of at least 7 years.
- Event `consent.updated` emitted on creation, update, or withdrawal via the transactional outbox.
- Consent ledger integrates with privacy portals so identities can self-service downloads or revocation.
