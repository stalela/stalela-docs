---
title: Onboard a Merchant Org
---

Steps to onboard a merchant organisation, invite members, and
complete KYB.

---

1. **Create organisation** using `/api/cis/v1/orgs` with legal
   metadata.
2. **Invite administrators** via
   `/api/cis/v1/orgs/:orgId/invitations` (roles `OWNER`,
   `FINANCE_ADMIN`).
3. **Assign roles** after acceptance using
   `/api/cis/v1/orgs/:orgId/roles/assign`.
4. **Issue API keys** for integration; store secrets securely.
5. **Initiate KYB** via
   `/api/cis/v1/orgs/:orgId/verification/start` with policy
   `KYB_ZA_STANDARD`.
6. **Monitor events** (`orgs.member.joined`, `orgs.verified`) to
   unlock CTS integration.
7. **Sync to CTS** — Provide `orgId` when creating merchant accounts
   in the Canonical Transfer Service for payment enablement.

!!! tip "Automation"
    Automate onboarding using workflow engines or the SDKs to reduce
    manual errors and ensure policies are enforced consistently.
