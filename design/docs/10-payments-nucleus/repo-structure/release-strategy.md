# Release Strategy

Versioning, compatibility, and deprecation policy for Stalela’s **multi‑repo** nucleus.

---

## Goals
- Ship services independently with **predictable compatibility**.
- Keep **contracts-first** (events + APIs) as the single source of truth.
- Enable **safe rollbacks** (just flip image tags).
- Avoid hard breaks: use **dual‑publish** and **additive** changes.

---

## Semantic Versioning (SemVer)
- All repos use **X.Y.Z**.
  - **X** = breaking
  - **Y** = backward‑compatible features
  - **Z** = fixes/internal

### Images & Packages
- Docker: `svc:X.Y.Z` and `svc:X` (major alias)
- Go module (`specs-go`): `vX.Y.Z` tags
- NPM (`@storo/specs`): semver tags

---

## Events (JSON Schema) Versioning
- Each event in `storo-specs` has an explicit **envelope** with a **`"v"` field**:
  ```json
  { "eventId":"...", "type":"transfers.settled", "v":1, "occurredAt":"...", "transferId":"...", "tenantId":"...", "payload":{...} }
  ```
- **Additive** changes (new optional fields in `payload`) ⇒ **minor** bump of `storo-specs`; **no** change to `v`.
- **Breaking** changes ⇒ introduce **new event version** (e.g., `v2`), keep `v1` schemas.  
  - **Providers** (e.g., gateways) **dual‑publish** `v1` and `v2` for ≥ 2 releases.
  - **Consumers** (e.g., ledger/recon) add support for `v2` before we retire `v1`.

**Consumer rule:** always validate by `type + v` and reject unknown versions with a clear metric/log.

---

## HTTP APIs Versioning
- Path versioning: `/v1/...`, breaking change ⇒ **new path** `/v2/...`.
- Run both versions until all clients migrate; publish sunset date.

---

## Deprecation Policy
1. **Propose** change + ADR in `storo-specs` PR.
2. **Announce** (changelog + #dev‑announcements), add sunset date.
3. **Dual‑run** (events/APIs) for ≥ 2 releases or agreed window.
4. **Measure**: consumer readiness dashboards.
5. **Remove** old version after sign‑off.

---

## Release Flow (per service)
1. Merge to `main` (all checks green).
2. **Tag** `vX.Y.Z` → CI builds/pushes images.
3. `storo-infra` PR bumps the env pin:
   - dev → staging → prod (separate PRs), with **Africa/Johannesburg** cutoffs in mind.
4. Rollback = revert tag pin in `storo-infra`.

---

## Rollout Patterns
- **Canary**: ship to ≤10% traffic via separate task set/service.
- **Shadow** (events): consume `v2` in a shadow consumer and compare outcomes before switching.
- **Feature Flags**: CTS per‑tenant throttles, gateway partner toggles.

---

## Compatibility Matrix (example)

| Producer | Event | Current | Next | Policy |
|---|---|---|---|---|
| gw-usdc | transfers.settled | v1 | v2 | dual‑publish 2 releases |
| ledger  | consumes `settled` | v1 | v1+v2 | must accept both |
| recon   | consumes `settled` | v1 | v1+v2 | must accept both |

---

## Changelogs
- Each repo maintains `CHANGELOG.md` (Keep a Changelog format).
- `storo-specs` also publishes a **schema diff** in release notes.

---

## SLAs for Releases
- Prod changes during **business hours SAST** only (unless hotfix).
- Staging soak time: **≥ 24h** for gateways and ledger changes.
- Emergency rollback target: **< 10 minutes** (tag flip + health checks).
