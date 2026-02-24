# Risk Limits & KYC Tiers (ZA/ZW)

Defines tiered onboarding and runtime velocity controls aligned to FICA (ZA) and analogous ZW regimes.

---

## KYC Tiers

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

- CTS pre-submit policy check using cached tier and counters.
- Compliance `/screen` returns `score` consumed by CTS.
- Directory can convey per-rail caps.

---

## Observability

- Metrics: policy blocks, window saturation, false-positive review rate.
- Alerts: anomaly in risk-score distribution.

---

Last updated: 2025-08-27
