---
title: Verification & Policies
---

Verification workflows collect evidence and evaluate JSON-Logic policies to assign trust levels to identities and organizations.

## Policy Model

Policies are versioned documents with conditions (`when`) and required checks. They are evaluated at runtime by the policy engine.

```json
{
  "name": "KYC_ZA_BASIC",
  "when": { "country": { "eq": "ZA" } },
  "checks": { "liveness": true, "doc": ["NATIONAL_ID","PASSPORT"], "pep_sanctions": true }
}
```

- **Name** — Unique identifier for referencing in events and audit logs.
- **When** — JSON-Logic condition tree referencing attributes like `country`, `riskScore`, or tenant flags.
- **Checks** — Required verification modules. The engine orchestrates providers accordingly.

---

## Workflow Orchestration

1. Policy lookup by `tenantId`, `type` (`KYC`, `KYB`), and identity attributes.
2. Domain-layer state machine spawns provider tasks (document verification, liveness, sanctions checks).
3. Evidence persisted in encrypted storage with pointers stored in Postgres.
4. Policy engine aggregates results, emits `verified`, `denied`, or `needs_more_info` outcomes via the transactional outbox.

---

## Trust Tiers

| Tier | Description | Typical Unlocks |
| --- | --- | --- |
| `TRUST_NONE` | Unverified. Basic exploration only. | Read-only dashboards. |
| `TRUST_KYC_BASIC` | KYC satisfied with low-risk docs. | Low-volume payments, consent capture. |
| `TRUST_KYC_ENHANCED` | Enhanced due diligence completed. | Higher limits, payouts. |
| `TRUST_KYB_VERIFIED` | Business identity verified. | Merchant settlement, API key issuance. |

---

## Appeals & Remediation

- Failed checks emit `identities.verification.denied` or `orgs.verification.denied` events with reason codes.
- Appeals use `verificationId` to reference evidence and attach remediation documents.
- Policy changes require migration plans captured in [CIS-ADR-0004](../adrs/CIS-ADR-0004-policy-engine-json-logic.md).

!!! note "Policy caching"
    Policies are cached per tenant with short TTL (5 minutes). Changes propagate via `policy.updated` events to ensure stateless workers refresh caches.
