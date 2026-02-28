---
title: Identity Events
---

Identity events communicate lifecycle changes, verification outcomes, and factor updates.

| Event | Payload | Notes |
| --- | --- | --- |
| `identities.created` | `{ identityId, type, status }` | Emitted after identity insert; consumers should hydrate caches. |
| `identities.updated` | `{ identityId, changes }` | Includes diff of changed fields. |
| `identities.deleted` | `{ identityId, reason }` | Soft delete with erasure workflow kickoff. |
| `identities.email_verified` | `{ identityId, email }` | Contact verification succeeded. |
| `identities.phone_verified` | `{ identityId, phone }` | Phone verification succeeded. |
| `identities.verification.started` | `{ identityId, verificationId, policy }` | KYC workflow initiated. |
| `identities.verified` | `{ identityId, verificationId, trustTier }` | Verification approved. |
| `identities.verification.denied` | `{ identityId, verificationId, reasonCode }` | Policy failure. |
| `identities.suspended` | `{ identityId, reasonCode, expiresAt }` | Quarantine triggered. |
| `identities.reinstated` | `{ identityId, reasonCode }` | Suspension lifted. |
| `factor.enrolled` | `{ identityId, factorId, type }` | MFA factor added. |
| `factor.removed` | `{ identityId, factorId, type }` | Factor revoked. |
| `factor.challenge.sent` | `{ identityId, factorId, channel }` | Challenge delivered via SMS/email/push. |
| `factor.challenge.failed` | `{ identityId, factorId, attempts }` | Use to monitor brute-force attempts. |

---

## Ordering Guarantees

- All identity events share partition key = `identityId`.
- Deduplicate using `eventId` before persisting to downstream stores.

---

## Backfill Guidance

For existing tenants migrating to CIS, use `identities.imported` events (behind feature flag) to seed caches without triggering verification flows.
