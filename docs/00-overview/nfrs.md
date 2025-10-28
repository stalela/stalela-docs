# Non-Functional Requirements (NFRs)

This document captures the **performance, availability, security, and compliance targets** for the Stalela nucleus.

---

## 🎯 Availability
- Target uptime: **99.9%** minimum (3-nines) during MVP.
- Long-term target: **99.99%** for core services (Canonical Transfer Service, Ledger, Event Bus).

---

## ⚡ Performance
- API latency (P99):
  - POST /transfers: ≤ 250 ms (excluding external rail).
  - Balance queries: ≤ 100 ms.
- Event bus publish lag (P99): ≤ 1 s.
- Ledger posting confirmation: ≤ 1 s after settlement.

---

## 📊 Throughput
- MVP scale: 50 TPS sustained.
- Scale target (2 years): 500 TPS sustained.

---

## 🔐 Security
- Mutual TLS between services.
- Tenant API keys or JWT for client APIs.
- PII encrypted at rest, redacted in logs.
- Secrets rotation: 90 days.

---

## 🧾 Compliance
- Audit logs immutable and retained 7 years.
- Data residency: all primary storage in-region (SA/ZW).
- Screening latency: ≤ 500 ms pre-submit.

---

## 📌 Notes
This document will evolve with load tests, audits, and regulatory requirements.
