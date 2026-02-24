# Local Development (Monorepo)

How to run Stalela locally from the monorepo. Clone once, run the fleet via Docker Compose, and swap one service for your local build.

---

## Prerequisites

- Docker Desktop or Colima
- Make or Task
- Go 1.22+ (for services/gateways)
- Node 20+ (for `apps/operator-console`, `apps/fiscal-sdk`, `libs/specs`)
- Python 3.12+ (for `apps/fiscal-sdk` Python client and docs)

---

## Clone & Bootstrap

```bash
git clone git@github.com:stalela/stalela.git
cd stalela

# Start the full fleet (released images from GHCR + Postgres + LocalStack)
cd tools/devstack
docker compose up -d
```

The devstack provides:

| Service | URL / Port |
|---|---|
| Postgres (per-service DBs) | `localhost:5432` |
| LocalStack (SNS, SQS, S3) | `http://localhost:4566` |
| Prometheus | `http://localhost:9090` |
| Grafana | `http://localhost:3000` (admin/admin) |

Services start with **released images** from GHCR. Once the fleet is up, swap one service for your local build.

---

## Develop One Service Locally

All services follow the same pattern: navigate to the service directory, run `make dev`, disable the container in devstack.

### Example: work on `services/cts`

```bash
# 1. Start your local service (hot reload via air/reflex)
cd services/cts
make dev
```

```yaml
# 2. tools/devstack/docker-compose.override.yml
#    (copy from docker-compose.override.example.yml)
services:
  cts:
    deploy:
      replicas: 0   # disable container; we run it locally
```

```bash
# 3. Apply required env (devstack infra)
export DATABASE_URL="postgres://postgres:postgres@localhost:5432/cts?sslmode=disable"
export SQS_ENDPOINT="http://localhost:4566"
export SNS_ENDPOINT="http://localhost:4566"
export AWS_ACCESS_KEY_ID=test
export AWS_SECRET_ACCESS_KEY=test
export AWS_REGION=us-east-1

# 4. Apply migrations (first time or after schema changes)
make db

# 5. Seed test data (optional)
make seed
```

### Smoke Test

```bash
curl -XPOST http://localhost:8080/v1/transfers \
  -H 'Content-Type: application/json' \
  -H 'Idempotency-Key: demo-1' \
  -d '{
    "tenantId": "tn_demo",
    "payer":  { "accountId": "acct_payer" },
    "payee":  { "accountId": "acct_merchant" },
    "amount": { "value": 1000, "currency": "USD" },
    "rail": "usdc-algo",
    "intent": "PUSH",
    "externalRef": "ext_demo"
  }'
```

Watch the flow:

- Your local `cts` emits `transfers.submitted.usdc` → LocalStack SNS
- Devstack `gw-usdc` (container) consumes → emits `accepted` then `settled`
- Devstack `ledger` posts entries
- Grafana → "Transfer Lifecycle" dashboard confirms end-to-end

---

## Working With Shared Libs

Libs are referenced via local Go module `replace` directives — no publish step needed:

```go
// services/cts/go.mod
require (
    stalela/libs/specs    v0.0.0
    stalela/libs/platform v0.0.0
    stalela/libs/outbox   v0.0.0
    stalela/libs/otel     v0.0.0
)

replace (
    stalela/libs/specs    => ../../libs/specs
    stalela/libs/platform => ../../libs/platform
    stalela/libs/outbox   => ../../libs/outbox
    stalela/libs/otel     => ../../libs/otel
)
```

Changes to `libs/` are immediately visible — no re-publish needed.

---

## Develop a Gateway

```bash
cd gateways/ecocash
make dev
```

Override in `tools/devstack/docker-compose.override.yml`:

```yaml
services:
  gw-ecocash:
    deploy:
      replicas: 0
```

EcoCash callbacks go to your local process; all other services stay containerized.

---

## Fiscal Platform Services

Fiscal services need additional env vars:

```bash
cd services/fiscal-signing
make dev

export HSM_ENDPOINT="http://localhost:8200"   # dev: HashiCorp Vault (devstack provides it)
export JURISDICTION="CD"
export MONOTONIC_COUNTER_DB="postgres://postgres:postgres@localhost:5432/fiscal_signing?sslmode=disable"
```

The devstack Vault (`localhost:8200`) is pre-seeded with dev signing keys.

---

## Timezone & Deterministic Tests

Business logic uses **Africa/Johannesburg**:

```bash
export TZ=Africa/Johannesburg
make seed-calendars   # loads holiday fixtures from libs/platform/calendars/
```

---

## Docs Development

```bash
cd docs
pip install -r requirements.txt
mkdocs serve
# → http://127.0.0.1:8000/
```

---

## Troubleshooting

| Symptom | Fix |
|---|---|
| Events not flowing | `awslocal sns list-topics` — verify LocalStack is up |
| DLQ growing | Grafana → "Event Backlogs" dashboard |
| DB migration errors | `make db` in service directory |
| Port conflicts | Check `tools/devstack/docker-compose.yml` |
| Vault sealed (fiscal) | `vault operator unseal` at `localhost:8200` |
| `go: module not found` | Verify `replace` directives in `go.mod` |

---

## Clean Up

```bash
cd tools/devstack
docker compose down -v   # stops containers and removes volumes (resets DBs + queues)
```
