---
title: Components
---

CIS is composed of modular components that collaborate via well-defined interfaces within the `stalela-platform` monorepo.

## Auth / Token Issuer

- Supabase Auth handles base JWT issuance.
- CIS enriches tokens with identity claims (`scp`, `orgId`, `trustTier`, `role`).
- Supports PKCE, device code, and WebAuthn flows.
- JWKS available at `/.well-known/jwks.json` with automatic rotation.

---

## RBAC Service

- Materializes role-to-scope mappings in `cis.memberships`.
- Evaluates dynamic policies (time-bound access, geography restrictions).
- Provides `POST /api/cis/v1/rbac/evaluate` for inline authorization decisions.

---

## Verification Orchestrator

- Domain-layer state machine for KYC/KYB workflows (no external workflow engine).
- Integrates with document verification, watchlist, and liveness providers.
- Emits `verification.*` events via the transactional outbox.

---

## PII Store

- Separate data within `pgSchema('cis')` using envelope encryption with tenant-specific data keys.
- AES-256-GCM encryption via Web Crypto API.
- Access mediated via the CIS domain layer to reduce leakage.
- Automatic key rotation tracked in `pii_key_history`.

---

## Outbox Publisher

- Writes events to `cis.cis_outbox` table with payload hash.
- Vercel Cron poller publishes events to downstream consumers.
- Monitors lag and retries with exponential backoff.

---

## Search

- Identity search powered by Postgres `tsvector` with GIN indexes on searchable fields.
- Applies redaction policies before returning results.
- No external search engine required.

---

Each component exposes structured logs and metrics to ensure observability coverage.
