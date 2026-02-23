# Regulatory Reporting (ZA/ZW)

Outlines BoP (SARB exchange control) and goAML (FIC/FIU) reporting interfaces.

---

## BoP Reporting (SARB)

- Scope: cross-border payments and receipts.
- Data: payer/payee, purpose codes, currency, amount, FX rate, `exchangeControlRef`.
- Frequency: daily batch; T+1 corrections.
- Interface: file/API adapter (service TBD: `storo-reg-reporting`).

## goAML (STR/CTR)

- Thresholds: cash/crypto limits per jurisdiction.
- Triggers: rules over events (riskScore, amounts, patterns).
- Payload: goAML XML/JSON forms; attachments redacted.
- Submission: secure API with retry/backoff and receipt tracking.

---

## Event Additions

- Optional fields:
  - `exchangeControlRef` (string)
  - `purposeCode` (string)

---

## Ops & Audit

- Immutable submission log with receipts and timestamps.
- DLQ for failed submissions; manual replay runbook.

---

Last updated: 2025-08-27
