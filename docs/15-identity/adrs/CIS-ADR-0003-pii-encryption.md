---
title: "CIS-ADR-0003: PII Encryption Strategy"
---

- **Status**: Accepted (amended 2025-01 for free-stack alignment)
- **Date**: 2024-05-01

---

## Context

PII is highly sensitive and must be protected against unauthorized
access and disclosure.

## Decision

Implement **envelope encryption** using tenant-specific data keys and
a master key. Store encrypted blobs separately from public identity
data. All access routes through audited database queries with
Row-Level Security.

## Free-Stack Amendment (2025-01)

The original ADR referenced AWS KMS for CMK management and HashiCorp
Vault for key storage. Under the Stalela free-stack architecture:

| Original | Current |
|----------|---------|
| AWS KMS (CMK) | `PII_MASTER_KEY_HEX` env var (Vercel encrypted) |
| Envelope encryption via KMS Decrypt | Web Crypto API `AES-256-GCM` in Edge runtime |
| HashiCorp Vault | Vercel Environment Variables (encrypted at rest) |
| Audited stored procedures | Drizzle ORM queries + RLS policies on `pgSchema('cis')` |

Key rotation is managed through environment variable updates under
change control. The service supports hot-reload via serverless
function cold-start (new invocations pick up updated env vars
immediately).

## Consequences

- Increased latency for PII reads due to encryption overhead.
- Requires key rotation workflows under change control.
- Enables compliance with POPIA and GDPR encryption mandates.
