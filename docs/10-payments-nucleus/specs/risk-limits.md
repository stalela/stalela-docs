# Risk Limits & KYC Tiers (ZA/ZW)

Defines tiered onboarding and runtime velocity controls aligned to FICA (ZA) and analogous ZW regimes.

---

## KYC Tiers

[CIS](../../15-identity/index.md) is the **single authority** for KYC/KYB tier assignment. CTS caches the tier from the JWT `kycTier` claim but never independently verifies identity documents — all verification flows run through CIS.

See [CIS KYC/KYB Flows](../../15-identity/compliance/kyc-kyb-flows.md) for the verification workflows that determine tier assignment.

- Tier 0 (Minimal)
  - Allowed: low-value transactions; no cross-border.
  - Requirements: basic identity (name, mobile), phone verification.
  - Limits: daily/monthly caps; no PULL.

- Tier 1 (Standard)
  - Allowed: domestic transfers; moderate limits.
  - Requirements: ID/passport, selfie/biometric, address proof.
  - Limits: higher daily/monthly; PULL optional.

- Tier 2 (Enhanced)
  - Allowed: cross-border, higher limits.
  - Requirements: full KYC, income/proof of funds; enhanced due diligence.
  - Limits: bespoke per-tenant.

---

## Runtime Controls

- Velocity: txn count and value per window (1h/24h/30d) by `kycTier`.
- Corridor: per-rail and cross-border maxima, exchange-control flags.
- Risk score gates: deny or require review above thresholds.

---

## Contract Additions

- Event enrichment fields (optional):
  - `kycTier`: string (T0|T1|T2)
  - `riskScore`: number (0-100)

---

## Enforcement Points

- CTS pre-submit policy check using **CIS-issued** `kycTier` (from JWT claim) and cached velocity counters.
- Compliance `/screen` returns `score` consumed by CTS; screening uses CIS-verified identity data (`cisEntityId`).
- Directory can convey per-rail caps.
- When CIS emits `identity.tier.changed`, CTS must invalidate its cached tier for the affected entity.

---

## Observability

- Metrics: policy blocks, window saturation, false-positive review rate.
- Alerts: anomaly in risk-score distribution.

---

Last updated: 2025-08-27
