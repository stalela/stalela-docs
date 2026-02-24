# ADR-0003: Contracts-First via storo-specs Repo

**Status:** Accepted  
**Date:** 2025-08-26

---

## Context

Multiple services (CTS, gateways, ledger, compliance) need to interoperate.  
To avoid coupling and drift, we must define shared contracts (events, APIs) in a **single source of truth**.

Moov’s practice and our nucleus design both point to contract-first development.  

## Decision

We establish a dedicated repo: **storo-specs**.  
It will contain:

- **Event Schemas** (JSON Schema) for all domain events.  
- **API Definitions** (OpenAPI/Swagger) for HTTP APIs (e.g., CTS).  
- **Golden Fixtures** (JSON) for canonical test cases.  
- **Codegen scripts** to publish:  
  - Go structs/validators → `github.com/storo/specs-go`  
  - TS types/clients → `@storo/specs` (npm)

Services must pin to tagged releases of `storo-specs` and validate at CI.  

## Consequences

- Ensures consistency: all services emit/consume the same event shapes.  
- Enables language-agnostic clients (Go + TS at minimum).  
- Introduces one more repo to manage.  
- Requires discipline around versioning and compatibility (semver).  

## Alternatives Considered

- Duplicating schemas in each repo → rejected (guaranteed drift).  
- Informal “README spec” → rejected (non-machine-verifiable).  

---

**Next Steps:**  
- Scaffold `storo-specs` with `events/`, `api/`, `fixtures/`.  
- Add CI to validate schemas + generate Go/TS packages.  
- Update service templates to import from `storo-specs`.  
