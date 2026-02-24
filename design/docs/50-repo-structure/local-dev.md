# Local Development (storo‑devstack)

How to run Stalela locally **without** a monorepo. You’ll run the fleet via Docker and **swap one service** for your local build.

---

## Prereqs
- Docker Desktop / Colima
- Make or Task
- Go 1.22 (for Go services), Node 20 (for console)
- `storo-devstack` repo cloned

Devstack provides: Postgres (multi‑DB), LocalStack (SNS/SQS), Prometheus, Grafana, and released service images.

---

## Start the Fleet

```bash
git clone git@github.com:storo/storo-devstack.git
cd storo-devstack
docker compose up -d
```

Services come up with **released images**. Grafana is available at http://localhost:3000 (admin/admin by default).

---

## Develop One Service Locally

Example: work on **storo-gw-usdc** while everything else runs in containers.

1) Clone your service and start it locally:
```bash
git clone git@github.com:storo/storo-gw-usdc.git
cd storo-gw-usdc
make dev    # or task dev (hot reload)
```

2) In `storo-devstack/docker-compose.override.example.yml`, copy to `docker-compose.override.yml` and **disable** the service container, mapping your local port:

```yaml
# docker-compose.override.yml
services:
  gw-usdc:
    deploy:
      replicas: 0  # disable container; we'll run it locally
  # If the stack expects a port:
  #   ports:
  #     - "8085:8085"  # match your local gw-usdc listen port
```

3) Ensure env points to devstack infra:
- Postgres: `postgres://localhost:5432/gw_usdc?sslmode=disable`
- SQS/SNS (LocalStack): `http://localhost:4566` with dummy creds
- S3 (for payloads): `http://localhost:4566`

4) Seed data (optional):
```bash
make seed   # directory entries, holidays, test tenants
```

You can now post a transfer to CTS in devstack and watch events reach your **local** gateway.

---

## Example: Smoke Test (USDC Happy Path)

```bash
# Create a transfer
curl -XPOST http://localhost:8080/v1/transfers   -H 'Idempotency-Key: demo-1'   -d '{
    "tenantId":"tn_demo",
    "payer":{"accountId":"acct_payer"},
    "payee":{"accountId":"acct_merchant"},
    "amount":{"value":1000,"currency":"USD"},
    "rail":"usdc-algo","intent":"PUSH","externalRef":"ext_demo"
  }'
```

Verify in logs:
- CTS emits `transfers.submitted.usdc`
- Your local `gw-usdc` consumes and emits `accepted` then `settled`
- Ledger in devstack posts entries

---

## Tilt (optional, live reload)

If you prefer **Tilt** for hot‑reload:
- `storo-devstack/Tiltfile` includes services. Comment out the one you run locally.
- Point your local service to devstack infra as above.

---

## Timezone & Cutoffs

Business rules use **Africa/Johannesburg**. For predictable tests:
- Export `TZ=Africa/Johannesburg`
- Seed holidays via `platform-base` fixtures

---

## Troubleshooting

- **Events not flowing**: check LocalStack is up (`awslocal sns list-topics`).
- **DLQ growing**: open Grafana → “Event Backlogs” dashboard.
- **DB migrations**: run `make db` in the service repo to apply embedded migrations.
- **CORS** (console): set `CORS_ALLOWED_ORIGINS=http://localhost:3001` on services that expose HTTP APIs.

---

## Clean Up

```bash
docker compose down -v  # stop and remove volumes
```

This resets your local DBs and queues.
