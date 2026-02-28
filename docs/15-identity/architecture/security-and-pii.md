---
title: Security & PII Handling
---

Protecting identity data is central to CIS. This section describes encryption, access controls, and erasure.

## Encryption

- **At rest** — PII blobs encrypted with AES-256-GCM via Web Crypto API. Data keys derived from environment-configured master key (`PII_MASTER_KEY_HEX`).
- **In transit** — TLS 1.3 enforced via Vercel Edge; all internal Supabase connections use SSL.
- **Token secrets** — Refresh tokens hashed with Argon2id and salted per tenant.

---

## Access Controls

- Database access restricted to the Supabase connection pool authenticated by service role.
- Fine-grained PostgreSQL RLS policies enforce `tenant_id` scoping on all CIS tables.
- Support tooling uses read-only replicas with masked columns.

---

## Logging Hygiene

- Structured logs redact emails, phone numbers, and document identifiers.
- Sensitive events tagged with `pii=true` for downstream filtering.
- Trace spans avoid including payloads; reference `requestId` and `eventId` instead.

---

## Key Management

- Master keys stored as environment variables (`PII_MASTER_KEY_HEX`), rotated quarterly.
- Key rotation pipeline updates `pii_key_history` and triggers cache refresh.
- No external secrets manager required for pilot; production hardening may add Vault integration.

---

## Erasure Workflows

- GDPR/POPIA requests create `erasure_ticket` records with SLA of 30 days.
- CIS deletes PII references and publishes `identities.deleted` events with anonymized payloads.
- Downstream systems must acknowledge erasure completion via webhook callbacks.

---

## Monitoring

- Metrics: `cis_pii_access_count`, `cis_pii_access_denied`.
- Alerts trigger when access from unexpected service account occurs.
- Daily audits compare production user lists against HR records to detect orphaned accounts.
