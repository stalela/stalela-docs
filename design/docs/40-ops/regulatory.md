# Regulatory Ops (STR/CTR, BoP)

Operational procedures for regulatory submissions in ZA/ZW.

---

## Pipelines

- BoP: aggregate cross-border events → build payload → submit → store receipt.
- goAML: detect triggers → generate STR/CTR → submit → track status.

## Runbooks

- Submission failures: retry policy, contact points, escalation matrix.
- Corrections: T+1 resubmission with reference to prior filing.
- DSAR/POPIA: ensure redactions and legal holds before export.

## Observability

- Metrics: submissions/day, failure rate, mean time to receipt.
- Dashboards: pipeline health, backlog, DLQ.

---

Last updated: 2025-08-27
