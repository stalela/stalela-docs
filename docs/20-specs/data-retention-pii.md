# Data Retention & PII Handling

The **data retention policy** governs how long Storo stores sensitive data and how it is redacted.

---

## 🎯 Principles
- **Minimize PII** stored in core DBs.  
- **Encrypt at rest** all raw rail payloads.  
- **Retain only what’s needed** for audit, compliance, dispute resolution.  
- **Expire or redact** data after retention window.

---

## 📦 Storage Classes
- **Canonical DBs (CTS, Ledger, Compliance, Directory, Recon)**  
  - Store IDs, references, metadata only.  
  - No raw PII beyond accountId/tenantId.  

- **Blob Store (encrypted)**  
  - Stores raw rail payloads, statements.  
  - Access tightly controlled, time-limited.  

---

## ⏳ Retention Windows
- Transfer & ledger events: **7 years** (audit requirement).  
- Raw rail payloads: **18 months**.  
- Compliance screening results: **5 years**.  
- Operator actions (audit log): **7 years**.  

---

## 🧹 Redaction
- After expiry, execute stored proc `select cts_pii_tombstone(:tenantId, :transferId)` which:
  - Nulls column-level PII on canonical tables (`payer`, `payee`, contact fields).
  - Writes an immutable audit row documenting who requested the erasure and why.
  - Leaves immutable event payloads untouched (they only contain stable references).
- Keep metadata (transferId, amounts, dates).

---

## 🔐 Security
- All PII encrypted at rest + in transit.  
- Logs redact sensitive fields (names, IDs, PANs).  
- Access scoped to tenant & role.  

---

## 🌍 POPIA Cross-Border Transfers (ZA)
- Assess adequacy for destination; if inadequate, add contractual safeguards and consent where required.  
- Maintain a register of cross-border transfers with purpose, destinations, and safeguards.  
- Ensure processors/sub-processors contractually meet POPIA obligations.  
- Do not include PII in event payloads unless strictly necessary; prefer references.

---

## 🧭 Runbooks
- **Retention job failure** → retry, escalate if backlog > 24h.  
- **Legal hold** → suspend deletion for specific entities.  
- **PII exposure incident** → trigger breach protocol immediately.  

---
