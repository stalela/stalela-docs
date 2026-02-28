---
title: Data Model
---

Stalela CIS persists canonical identity, organisation, and consent state in Supabase Postgres
under `pgSchema('cis')` via Drizzle ORM.

## Core Tables

| Table | Key Columns | Notes |
| --- | --- | --- |
| `identities` | `id PK`, `tenant_id`, `type`, `status`, `pii JSONB`, `metadata JSONB?`, `created_at`, `updated_at`, `deleted_at` | Primary record. `pii` stores AES-256-GCM encrypted JSON via Web Crypto. `metadata` holds optional flexible attributes. Soft deletion via `deleted_at`. |
| `status_history` | `id PK`, `identity_id FK`, `from_status`, `to_status`, `comment`, `actor_id`, `changed_at` | Append-only audit trail for lifecycle transitions. |
| `compliance_results` | `id PK`, `identity_id FK`, `outcome`, `reason`, `score`, `matched_rule_ids text[]`, `checked_at` | Stores compliance decisions for traceability and analytics. |
| `addresses` | `id PK`, `identity_id FK`, `type`, `street1`, `street2`, `city`, `state`, `postal_code`, `country`, `created_at`, `updated_at`, `deleted_at` | Postal addresses with soft delete. Types: `PRIMARY`, `SECONDARY`, `BILLING`, `SHIPPING`. |
| `phones` | `id PK`, `identity_id FK`, `type`, `number`, `extension`, `created_at`, `updated_at`, `deleted_at` | Phone numbers with soft delete. Types: `MOBILE`, `HOME`, `WORK`, `FAX`. |
| `organizations` | `id PK`, `tenant_id`, `status`, `name`, `country`, `metadata JSONB?`, `created_at`, `updated_at`, `deleted_at` | Org graph root. |
| `memberships` | `id PK`, `org_id`, `identity_id`, `roles text[]`, `scopes text[]`, `status`, `invited_by`, `expires_at` | Many-to-many between identities and organizations. |
| `identity_factors` | `id PK`, `identity_id`, `type`, `status`, `created_at`, `metadata` | MFA credentials (TOTP, WebAuthn, OTP). |
| `consents` | `id PK`, `identity_id`, `scope`, `policy_id`, `version`, `status`, `proof`, `granted_at`, `withdrawn_at` | Consent ledger (append-only). |
| `verifications` | `id PK`, `subject_type`, `subject_id`, `policy`, `status`, `created_at`, `completed_at` | Policy-driven verification workflows. |
| `verification_steps` | `id PK`, `verification_id`, `name`, `status`, `evidence_ref`, `updated_at` | Step-level audit trail. |
| `cis_outbox` | `id PK`, `aggregate_type`, `aggregate_id`, `payload JSONB`, `headers JSONB`, `attempts`, `available_at` | Transactional outbox for event dispatch. |

> **JSONB metadata**: both identities and organisations store additional key/value data in `metadata` with validation enforced at the domain layer (max 100 keys, 1 000 chars per value).

---

## Enums & Status Model

Identity status supports six values:

- `PENDING`
- `ACTIVE`
- `IN_REVIEW`
- `DENIED`
- `BLOCKED`
- `FROZEN`

`status_history` captures every transition alongside optional `comment` and `actor_id`. Domain logic refuses invalid transitions (e.g., `DENIED → ACTIVE`).

---

## Indexing Strategy

- B-tree indexes on `(tenant_id, status)` for `identities` improve search and dashboard queries.
- B-tree indexes on `(identity_id, deleted_at)` for `addresses` and `phones` facilitate soft-delete filtering.
- GIN indexes on `metadata` JSONB fields support ad-hoc filtering.
- `status_history` and `compliance_results` index `identity_id` with descending timestamp ordering.

---

## Encryption

- `identities.pii` stores encrypted JSON (AES-256-GCM) produced by Web Crypto API using the tenant-specific master key (`PII_MASTER_KEY_HEX` from environment).
- PII decryption only happens within domain transaction handlers that possess the key; store implementations return raw encrypted payloads by default.
- Audit events capture every encryption/decryption invocation.

---

## Soft Deletion & Retention

- Identities, organisations, addresses, and phones expose `deleted_at`. Store methods automatically scope queries to non-deleted rows.
- Vercel Cron jobs review soft-deleted records against retention policies before hard deletion.
- Compliance results and status history are immutable; retention policies archive old entries rather than deleting them to preserve regulatory evidence.

---

## Migration

All schema changes are managed via **Supabase CLI** migrations under `supabase/migrations/`. Run:

```bash
npx supabase db push
```
