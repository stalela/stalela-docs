# Security

Standards for secrets, access, PCI scope, and PII handling in Stalela.

---

## Secrets Management

- Stored in a centralized vault (e.g., HashiCorp Vault).  
- Rotated at least every 90 days; immediate rotation on incident.  
- No secrets in environment variables for long-lived services without vault agent.  

---

## Access Control

- Service-to-service auth via mTLS or mesh-issued JWT.  
- RBAC for Operator Console (OPS, COMPLIANCE, ADMIN).  
- Principle of least privilege to DBs and blob stores.

---

## PCI & PAN Scope

- Card data handled exclusively in **OPPWA/Zimswitch gateway**.  
- PAN/token never flows into CTS or Ledger.  
- Webhook/file artifacts are redacted and encrypted.

### PCI SAQ & Tokenization (in-region)
- Prefer network tokenization or vetted token vaults; avoid PAN handling outside gateways.  
- Scope reduction: isolate gateways; segment networks; harden endpoints.  
- Complete appropriate SAQ (likely SAQ D for service providers) with compensating controls documented.  

---

## PII Handling

- Encrypt at rest; redact in logs and events.  
- Minimize in DBs; store raw artifacts in encrypted blob store.  
- Data retention per `20-specs/data-retention-pii.md`.

---

## POPIA (South Africa)

- Lawful basis: document processing purposes per flow (screening, settlement, reporting).  
- Cross-border transfers: assess adequate protection or implement contractual safeguards; record in audits.  
- Data subject rights: verify identity; fulfill access/correction/erasure subject to legal holds.  
- Privacy by design: DPIA for new rails; minimize PII in events; default encryption.

---

## Licensing & Scheme Participation (ZA/ZW)

- Role options: PSP, System Operator, or via sponsor bank; document per environment.  
- PASA participation: outline sponsor relationships, limits, and responsibilities.  
- Operational controls: incident management, segregation of duties, change management.

---

## Secure Coding

- Input validation at boundaries; strict schema checks.  
- Dependency scanning and SAST/DAST in CI.  
- Security headers on all admin endpoints.

---

## Incident Response

- 24/7 on-call rotation; breach protocol documented.  
- Forensics: immutable logs and event store.  
- Post-incident ADR if architectural changes required.
