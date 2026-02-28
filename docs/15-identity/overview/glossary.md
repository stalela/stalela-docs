---
title: Glossary
---

## CIS Glossary

| Term | Definition |
| --- | --- |
| **Identity** | Canonical record representing an individual, staff member, developer, or merchant administrator. |
| **Organization (Org)** | Legal or business entity grouping identities under shared policies and resources. |
| **Tenant** | Logical partition of the platform with isolated data residency, configuration, and policy. |
| **Factor** | Authentication method (password, OTP, TOTP, WebAuthn) bound to an identity. |
| **Verification** | Workflow that collects evidence (documents, biometrics) and evaluates policies (KYC/KYB). |
| **Consent** | Explicit permission granted by an identity to process data or act on their behalf. |
| **Scope** | Token-level permission enumerating which API surfaces a session can access. |
| **Role** | Named collection of scopes and policies applied within an organization or platform tier. |
| **Outbox** | Durable staging table (`cis.cis_outbox`) for events to guarantee exactly-once publication. |
| **Traceparent** | [W3C Trace Context](https://www.w3.org/TR/trace-context/) header propagated across services. |
| **Deterministic Event ID** | Identifier derived from entity key and event type to prevent reprocessing of the same logical change. |
| **JSON-Logic** | Policy expression format used to model conditional verification requirements. |
| **Append-Only Ledger** | Immutable Postgres table with RLS policies used for regulatory artifacts that must never be mutated. |
| **Trust Tier** | Classification assigned after verification (e.g., `TRUST_KYC_BASIC`, `TRUST_KYB_VERIFIED`) that gates downstream capabilities. |
| **Transactional Outbox** | Pattern where domain events are written to an outbox table within the same database transaction as the state change, then published asynchronously by a polling worker. |

See also: [Platform Glossary](../../00-foundation/glossary.md)
