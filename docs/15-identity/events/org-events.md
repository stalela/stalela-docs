---
title: Organization Events
---

Organization events describe membership changes, invitations, and KYB outcomes.

| Event | Payload | Notes |
| --- | --- | --- |
| `orgs.created` | `{ orgId, status, tenantId }` | Emitted after org creation. |
| `orgs.updated` | `{ orgId, changes }` | Change log for metadata updates. |
| `orgs.member.invited` | `{ orgId, invitationId, email, role }` | Invitation issued. |
| `orgs.member.joined` | `{ orgId, identityId, roles }` | Invitation accepted. |
| `orgs.member.removed` | `{ orgId, identityId, reason }` | Membership revoked. |
| `orgs.roles.updated` | `{ orgId, identityId, roles, scopes }` | Role assignment change. |
| `orgs.verified` | `{ orgId, verificationId, trustTier }` | KYB approved. |
| `orgs.verification.denied` | `{ orgId, verificationId, reasonCode }` | KYB denied. |
| `orgs.suspended` | `{ orgId, reasonCode }` | Org access limited pending review. |
| `orgs.reinstated` | `{ orgId, reasonCode }` | Suspension cleared. |

---

## Ordering

- Partition by `orgId` ensures membership events process in sequence.
- Combine with identity events to maintain accurate access models in downstream systems.

---

## Automations

- Trigger API key rotation workflows when `orgs.member.removed` or `orgs.roles.updated` occurs.
- Sync CRM records on `orgs.verified` to accelerate merchant onboarding.
