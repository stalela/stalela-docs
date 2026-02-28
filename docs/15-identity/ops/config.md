---
title: Configuration
---

CIS loads configuration from **Vercel Environment Variables** with
Zod validation at startup. All settings are validated through
`packages/config/` and cached for the lifetime of the serverless
function invocation.

---

## Required Environment Variables

| Variable | Description |
|----------|-------------|
| `POSTGRES_URL` | Supabase Postgres connection string (pooled via PgBouncer). |
| `SUPABASE_URL` | Supabase project URL for Auth and Storage APIs. |
| `SUPABASE_SERVICE_ROLE_KEY` | Service-role key for admin-level Supabase operations. |
| `JWT_ISSUER` | Issuer claim for JWTs issued by CIS. |
| `JWT_AUDIENCE` | Audience claim enforced for incoming tokens. |
| `JWT_SECRET` | Symmetric signing key (minimum 16 characters; rotate on schedule in production). |
| `PII_MASTER_KEY_HEX` | 32-byte master key (hex-encoded) for AES-256-GCM envelope encryption of PII blobs. |

!!! note
    `NODE_ENV` is set automatically by Vercel (`production` on prod
    deployments, `development` locally). Do not override it manually.

## Compliance Integration

| Variable | Description |
|----------|-------------|
| `COMPLIANCE_BASE_URL` | Base URL for the shared compliance service (`http://localhost:7020` in local dev). |
| `COMPLIANCE_API_KEY` | API key forwarded as `x-api-key` when calling compliance endpoints. Leave unset for non-authenticated local environments. |

If these values are absent the service defaults to local development
settings; production environments **must** set them explicitly.

## Operational Tuning

| Variable | Default | Notes |
|----------|---------|-------|
| `EMAIL_FROM` | `cis-dev@stalela.local` | Default sender for transactional email hooks. |

Rate limiting is handled by **Vercel Middleware** (Edge runtime)
rather than per-process configuration.

## Secrets Management Guidelines

- Store all secrets as **Vercel Environment Variables** (encrypted at
  rest). Environment variables can be scoped to Production, Preview,
  or Development.
- Rotate `JWT_SECRET` and `PII_MASTER_KEY_HEX` under change control.
- Never commit secrets to the repository. Use `.env.local` for local
  development only.

## Tenant Configuration

Tenant-level controls (default scopes, policies, document
requirements) are managed through the `/api/cis/v1/admin/tenants` APIs
and propagated via the transactional outbox. These settings live in
domain tables within the `cis` Postgres schema rather than process
environment.
