# CI/CD Standard (per service)

Canonical GitHub Actions workflow + required checks for all Stalela service repos.

---

## Required Checks
- **lint**: golangci‑lint / eslint
- **test**: unit tests + golden fixtures
- **contract‑validate**: ensure emitted/consumed events & APIs conform to `storo-specs`
- **migrations‑dry‑run**: for services with DB migrations
- **build**: Docker image
- **publish**: tag `svc:X.Y.Z` and `svc:X`

---

## Example Workflow (`.github/workflows/ci.yml`)

```yaml
name: CI

on:
  push:
    branches: [ main ]
    tags: [ 'v*.*.*' ]
  pull_request:

jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-go@v5
        with: { go-version: '1.22' }
      - run: go install github.com/golangci/golangci-lint/cmd/golangci-lint@latest
      - run: golangci-lint run ./...

  test:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:16
        env:
          POSTGRES_PASSWORD: postgres
        ports: [ '5432:5432' ]
        options: >-
          --health-cmd="pg_isready -U postgres"
          --health-interval=10s
          --health-timeout=5s
          --health-retries=5
      localstack:
        image: localstack/localstack:3
        env:
          SERVICES: sns,sqs,s3
        ports: [ '4566:4566' ]
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-go@v5
        with: { go-version: '1.22' }
      - run: make db   # apply embedded migrations
      - run: make test # includes golden fixture tests

  contract-validate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Install Node
        uses: actions/setup-node@v4
        with: { node-version: '20' }
      - run: npm i -D @storo/specs ajv
      - run: npm run validate:events  # project script validates fixtures/outbound events against envelope v=1
      - run: npm run validate:openapi # if this repo exposes HTTP

  build:
    needs: [lint, test, contract-validate]
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Docker build
        run: |
          docker build -t ghcr.io/storo/${{ github.event.repository.name }}:${{ github.sha }} .
      - name: Log in to GHCR
        uses: docker/login-action@v3
        with:
          registry: ghcr.io
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}
      - name: Push SHA image
        run: docker push ghcr.io/storo/${{ github.event.repository.name }}:${{ github.sha }}

  publish:
    if: startsWith(github.ref, 'refs/tags/v')
    needs: [build]
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Tag & push semver images
        run: |
          IMAGE=ghcr.io/storo/${{ github.event.repository.name }}
          TAG=${GITHUB_REF#refs/tags/}
          MAJOR=$(echo $TAG | cut -d. -f1)
          docker pull $IMAGE:${{ github.sha }}
          docker tag  $IMAGE:${{ github.sha }} $IMAGE:$TAG
          docker tag  $IMAGE:${{ github.sha }} $IMAGE:$MAJOR
          docker push $IMAGE:$TAG
          docker push $IMAGE:$MAJOR
```

---

## Branching & Protection
- Trunk‑based: short‑lived PRs to `main`, protected branch.
- Required status checks: all jobs above.
- Conventional commits recommended; changelogs generated on tag.

---

## Deploy (via `storo-infra`)
- Terraform pins image tags per env (dev/staging/prod).
- PR to bump tag = deploy. Rollback = revert tag.
- Deploy during **SAST business hours**; staging soak ≥ 24h for sensitive services.

---

## Secrets & Tokens in CI
---

## Contract Validation & Fixtures

- Source of truth: see `Specs → Events` (envelope `v=1`) and `Specs → Fixtures` for golden examples.
- Minimum checks:
  - Validate outbound events from providers (gateways, ledger, CTS) against envelope `v=1` and event schemas.
  - Validate inbound consumer fixtures (e.g., ledger consuming `transfers.settled`) using AJV/`@storo/specs`.
- Recommended project scripts:
  - `validate:events` → runs schema checks on all event samples under `fixtures/events/*.json`.
  - `validate:openapi` → validates OpenAPI if the repo exposes HTTP.

- Use **GitHub Environments** or **OpenID Connect** to assume AWS roles. No long‑lived keys.
- Service‑specific permissions; least privilege to push images / read Secrets Manager where necessary.
