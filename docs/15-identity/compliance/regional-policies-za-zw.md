---
title: Regional Policies (ZA & ZW)
---

Regional regulations shape CIS configuration per tenant.

---

## South Africa (ZA)

- **POPIA** compliance mandates explicit consent for marketing
  communications.
- ID number storage requires encryption and access audit trails.
- Verification providers must be accredited by the **Financial
  Intelligence Centre (FIC)**.
- Cross-border data transfers need standard contractual clauses
  signed.

## Zimbabwe (ZW)

- **Reserve Bank of Zimbabwe** guidelines enforce strict KYC for
  financial institutions.
- Proof of residence required for all individuals; documents must be
  refreshed annually.
- Businesses must provide share registers to reveal beneficial
  ownership.
- Data residency: identity data stored in Supabase Postgres
  (primary region) with encrypted backups for disaster recovery.

## Tenant Configuration Tips

- Set `tenant.region=ZA` or `tenant.region=ZW` to auto-apply default
  policies.
- Override `consentRequirements` for marketing vs transactional
  emails.
- Use the policy engine to require manual review for high-risk
  categories (e.g., crypto exchanges).

!!! tip "Adding a new jurisdiction"
    See [Jurisdictions](../../40-jurisdictions/index.md) for country profiles.
    Create a matching policy set and register it with the CIS tenant
    admin API.
