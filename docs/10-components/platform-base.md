# Platform/Base Library

The **Platform/Base Library** provides shared utilities for all Stalela services, ensuring consistency in health checks, IDs, error handling, time logic, and migrations.

---

## 🎯 Purpose
- Provide common **admin endpoints** for all services.  
- Standardize **time, IDs, errors** across the stack.  
- Support embedded **migrations/configs**.  
- Simplify **observability** and operational tooling.

---

## 🛠 Responsibilities
- Expose `GET /live`, `GET /ready`, `GET /metrics`, `GET /version`.  
- Provide banking-aware time utilities (cutoffs, holidays).  
- Standardize error handling (ErrorList, ParseError).  
- Offer ID generation and request tracing.  
- Embed DB migrations in service binaries.  

> Ship canonical holiday calendars for ZA/ZW and banking-day helpers (`Africa/Johannesburg`, `Africa/Harare`).

---

## 📑 Contracts

### Admin Endpoints (all services adopt via Platform/Base)
- `GET /live` → 200 when process is up (no dependencies checked)
- `GET /ready` → 200 when dependencies are healthy (DB/bus); 503 otherwise
- `GET /metrics` → Prometheus text format (counters, histograms, gauges)
- `GET /version` → JSON

```json
{
  "service": "storo-cts",
  "version": "v1.2.3",
  "gitSha": "abcd1234",
  "buildDate": "2025-08-27T10:00:00Z"
}
```

> Recommendation: bind admin server to a separate port and restrict exposure to service mesh / localhost.

---

## 🕒 Time & Calendars

- Regions/timezones supported out-of-the-box:
  - ZA → `Africa/Johannesburg`
  - ZW → `Africa/Harare`
- Helpers:
  - `Now()` → time in configured business TZ
  - `IsBankingDay(date)`
  - `NextBankingDay(from)` / `PrevBankingDay(from)`
  - `CutoffAt(date, rail)` → next effective cutoff from Directory config
- Calendars: ships canonical ZA/ZW holiday sets; Directory publishes effective calendars consumed by services.

---

## 🧰 Errors & IDs

- Error taxonomy aligns with `docs/20-specs/error-codes.md`.
- Error helpers: `ErrorList`, `ParseError`, consistent fields: `{ code, message, details?, traceId? }`.
- IDs:
  - `ID()` → sortable unique IDs (UUIDv7-style) for entities/events
  - Correlation: propagate W3C `traceparent` and include `traceId` in logs/errors

---

## 🗃️ Migrations (embedded)

Embed schema migrations into service binaries and run on startup (opt-in flag).

```go
import (
  "embed"
  base "github.com/storo/platform-base"
)

//go:embed migrations/*.sql
var migrationsFS embed.FS

func main() {
  db := mustOpenDB()
  if err := base.Migrate(db, migrationsFS); err != nil { panic(err) }
  // start admin server, app, consumers...
}
```

Migration file naming: `0001_init.sql`, `0002_add_outbox.sql` (idempotent, forward-only). Rollback is handled via new forward migrations.

---

## 🔌 Interfaces
- Imported as library into all services.  
- Provides helpers for admin, time, error, IDs, migrations.  

---

## 📐 Example

```go
// Health server
admin := base.NewAdminServer(":8081")
admin.AddLivenessCheck("db", db.Ping)
admin.Start()

// Time utils
t := base.Now()
if t.IsBankingDay() { ... }
```

---

## 🗄 Modules
- **Admin** → liveness, readiness, metrics, version.  
- **Time** → banking days, holidays, cutoffs.  
- **Errors** → ErrorList, ParseError.  
- **IDs** → ID(), correlation IDs.  
- **Migrations** → embedded FS for DB schema upgrades.  

---

## 📊 Observability
- Uniform `/metrics` for Prometheus.  
- Structured error/logging helpers.  
- Request tracing correlation.  

---

## 🔐 Security
- Admin endpoints on localhost or service mesh only.  
- No sensitive data in metrics/logs.  

---

## 🧭 Runbooks
- **/live fails** → service not running; check logs.  
- **Migration failed** → rollback DB version, re-run migration.  
- **Clock drift** → verify NTP sync; banking-day logic depends on accurate time.

---
