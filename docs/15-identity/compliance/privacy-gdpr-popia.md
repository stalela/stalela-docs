---
title: Privacy (GDPR & POPIA)
---

CIS enforces privacy controls aligned with GDPR (EU) and POPIA
(South Africa).

---

## Data Subject Rights

| Right | CIS Implementation |
|-------|-------------------|
| **Access** | `GET /api/cis/v1/identities/:id/pii` exposes an export package when authorized. |
| **Rectification** | Updates require audit trails and consent re-evaluation. |
| **Erasure** | Tracked via erasure tickets; downstream systems must confirm completion. |
| **Portability** | JSON export in machine-readable format. |

## Lawful Basis

- **Consent** — Captured via the consent ledger; used for marketing
  communications.
- **Contractual necessity** — Identity processing required for service
  delivery.
- **Legal obligation** — Retain verification data as mandated by
  regulators.

## POPIA Specifics

- Appoint an Information Officer to oversee compliance.
- Maintain privacy impact assessments for new features.
- Notify the Information Regulator within 72 hours of qualifying
  breaches.

## GDPR Specifics

- Maintain Article 30 records covering CIS processing activities.
- Execute Data Processing Agreements (DPAs) with tenants.
- Implement Data Protection Impact Assessments (DPIA) for new
  verification providers.

## Privacy-by-Design Practices

- Default to minimal data collection; optional fields disabled by
  default.
- Conduct quarterly privacy reviews with engineering and legal teams.
- Integrate privacy checks into CI (schema-diff alerts when new PII
  fields are introduced).
