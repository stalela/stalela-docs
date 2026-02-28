---
title: Code Structure
---

CIS lives within the `stalela-platform` monorepo, following the same patterns as the payments pillar.

## Directory Structure

```
packages/domain/src/identity/
├── types.ts                 # Interfaces, enums, Zod schemas
├── identity-store.ts        # IdentityStore port interface
├── org-store.ts             # OrgStore port interface
├── factor-store.ts          # FactorStore port interface
├── consent-store.ts         # ConsentStore port interface
├── create-identity.ts       # Create identity transaction
├── update-status.ts         # Status transition logic
├── compliance-refresh.ts    # Compliance re-screening
├── search.ts                # Search with tsvector
├── metadata.ts              # Metadata validation + update
├── addresses.ts             # Address CRUD (soft delete)
├── phones.ts                # Phone CRUD (soft delete)
├── verification.ts          # Verification state machine
└── __tests__/               # Unit tests

packages/db/src/
├── schema/
│   └── cis.ts               # Drizzle schema for pgSchema('cis')
└── stores/
    ├── cis-identity-store.ts # Drizzle implementation of IdentityStore
    ├── cis-org-store.ts      # Drizzle implementation of OrgStore
    ├── cis-factor-store.ts   # Drizzle implementation of FactorStore
    ├── cis-consent-store.ts  # Drizzle implementation of ConsentStore
    └── cis-outbox-store.ts   # Outbox store

apps/api/app/api/cis/v1/
├── identities/
│   └── route.ts             # POST, GET handlers + _setStore()
├── orgs/
│   └── route.ts             # Org endpoints
├── auth/
│   └── route.ts             # Session + factor verify
├── consents/
│   └── route.ts             # Consent lifecycle
├── verification/
│   └── route.ts             # Verification endpoints
└── api-keys/
    └── route.ts             # API key management
```

---

## Architecture Layers

### Domain Layer (`packages/domain/src/identity/`)

Pure business logic with port interfaces. Each module accepts validated input and returns results or throws domain errors. No framework dependencies — fully testable with in-memory stubs.

Key modules:

- **create-identity** — Orchestrates encryption, initial compliance checks, status assignment, and outbox event creation.
- **update-status** — Guards lifecycle transitions, captures actor/comment metadata, records history.
- **compliance-refresh** — Re-screens by calling the compliance service and updates status when required.
- **addresses / phones** — Full CRUD with soft-delete behaviour.
- **metadata** — Enforces key/value limits and performs atomic replacement.
- **search** — Tenant-scoped full-text search with `tsvector`.

### Store Layer (`packages/db/src/stores/`)

Drizzle ORM implementations of the domain store interfaces. Uses `pgSchema('cis')` for schema isolation. Store factories follow the pattern:

```typescript
export function createDrizzleIdentityStore(db: DrizzleDB): IdentityStore {
  return { /* method implementations */ };
}
```

### Route Layer (`apps/api/app/api/cis/v1/`)

Next.js App Router handlers following the project's `_setStore()` DI pattern. Each route file exports a setter, wired by `lib/bootstrap.ts` at server startup. Example:

```typescript
let _store: IdentityStore | null = null;
export function _setStore(s: IdentityStore) { _store = s; }

export async function POST(req: NextRequest) {
  if (!_store) { await bootstrap(); }
  // ... use _store
}
```

### Workers

- **Outbox poller** — Vercel Cron job that polls `cis.cis_outbox` and dispatches events.
- **Retention worker** — Scheduled job reviewing soft-deleted records against retention policies.
