---
title: RBAC & Scopes
---

RBAC in CIS bridges organization roles and API scopes to ensure least privilege.

## Layers

1. **Platform roles** — `STAFF_SUPER_ADMIN`, `STAFF_SUPPORT`, `TENANT_OPERATOR`.
2. **Org roles** — `OWNER`, `FINANCE_ADMIN`, `DEVELOPER`, `ANALYST`.
3. **Scopes** — Fine-grained permissions encoded in tokens (e.g., `identities:read`, `orgs:manage`).

---

## Mapping

| Role | Description | Default Scopes |
| --- | --- | --- |
| `OWNER` | Full control over org configuration | `orgs:manage`, `identities:invite`, `api_keys:rotate` |
| `FINANCE_ADMIN` | Manage payouts, view sensitive balances | `orgs:view`, `payouts:manage`, `consent:read` |
| `DEVELOPER` | Manage integrations and webhooks | `api_keys:create`, `events:read`, `identities:read` |
| `ANALYST` | View reports, cannot mutate | `reports:read`, `identities:read` |
| `STAFF_SUPPORT` | Stalela support with scoped impersonation | `support:impersonate`, `identities:read`, `consent:read` |

---

## Token Issuance

- Access tokens minted by CIS include `scp` claim listing scopes, `orgId`, `tenantId`, and `role` claims.
- Supabase Auth issues the base JWT; CIS enriches it with identity-specific claims before returning to the client.
- Refresh tokens store hashed references and rotate on each use.
- Admin actions require `aud` claim matching `cis-admin` to prevent cross-service replay.

---

## Delegated Access

- Service accounts use client credentials with scopes limited to automation tasks.
- Fine-grained consent required for cross-tenant operations even for staff.
- Scoped tokens expire quickly (default 30 minutes) unless policy allows extended sessions for server-to-server integrations.

!!! warning "Scope drift"
    Audit logs should be reviewed weekly for scope escalations. Use the events feed (`auth.scope.escalated`) to trigger alerts when roles gain new capabilities.
