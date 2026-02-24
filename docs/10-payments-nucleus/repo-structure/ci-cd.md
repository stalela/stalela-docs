# CI/CD (Monorepo)

GitHub Actions workflows for the `stalela` monorepo. Path filters ensure only affected services are rebuilt on each PR.

---

## Workflow Structure

```
.github/workflows/
├── affected.yml        ← Detect changed packages → dispatch per-service builds
├── service-ci.yml      ← Reusable: lint → test → contract-validate → build → push
├── docs.yml            ← MkDocs build + Vercel deploy (triggered by docs/ changes)
└── specs-ci.yml        ← Validate libs/specs/ schemas + fixtures (no build step)
```

---

## Required Checks (per service)

| Step | Tool | Notes |
|---|---|---|
| `lint` | `golangci-lint` / `eslint` | Enforced before tests run |
| `test` | `go test` / `jest` / `pytest` | Unit + golden fixture tests |
| `contract-validate` | `ajv` + `spectral` | Validates events + OpenAPI against `libs/specs/` |
| `migrations-dry-run` | `migrate -dry-run` | Services with embedded migrations only |
| `build` | `docker build` | Only runs if lint+test+contract pass |
| `push` | GHCR | SHA-tagged on PR merge; semver-tagged on release tag |

---

## Affected Detection (`.github/workflows/affected.yml`)

```yaml
name: Detect affected packages

on:
  push:
    branches: [ main ]
  pull_request:

jobs:
  detect:
    runs-on: ubuntu-latest
    outputs:
      services: ${{ steps.filter.outputs.services }}
      gateways: ${{ steps.filter.outputs.gateways }}
      libs:     ${{ steps.filter.outputs.libs }}
      docs:     ${{ steps.filter.outputs.docs }}
    steps:
      - uses: actions/checkout@v4
        with: { fetch-depth: 0 }

      - uses: dorny/paths-filter@v3
        id: filter
        with:
          filters: |
            services:
              - 'services/**'
              - 'libs/**'          # lib changes rebuild all dependents
            gateways:
              - 'gateways/**'
              - 'libs/**'
            libs:
              - 'libs/specs/**'
            docs:
              - 'docs/**'

  service-matrix:
    needs: detect
    if: needs.detect.outputs.services == 'true'
    strategy:
      matrix:
        service: [ cts, ledger, compliance, directory, recon,
                   fiscal-signing, fiscal-ledger, tax-authority-sync ]
    uses: ./.github/workflows/service-ci.yml
    with:
      service: ${{ matrix.service }}
      path: services/${{ matrix.service }}
```

---

## Reusable Service CI (`.github/workflows/service-ci.yml`)

```yaml
name: Service CI

on:
  workflow_call:
    inputs:
      service:
        required: true
        type: string
      path:
        required: true
        type: string

jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-go@v5
        with: { go-version: '1.22' }
      - run: golangci-lint run ./${{ inputs.path }}/...

  test:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:16
        env: { POSTGRES_PASSWORD: postgres }
        ports: [ '5432:5432' ]
        options: >-
          --health-cmd="pg_isready -U postgres"
          --health-interval=10s --health-timeout=5s --health-retries=5
      localstack:
        image: localstack/localstack:3
        env: { SERVICES: sns,sqs,s3 }
        ports: [ '4566:4566' ]
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-go@v5
        with: { go-version: '1.22' }
      - run: make -C ${{ inputs.path }} db
      - run: make -C ${{ inputs.path }} test

  contract-validate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '20' }
      - run: |
          cd libs/specs
          npm ci
          npm run validate:events
          npm run validate:openapi

  build:
    needs: [ lint, test, contract-validate ]
    runs-on: ubuntu-latest
    permissions:
      packages: write
    steps:
      - uses: actions/checkout@v4
      - uses: docker/login-action@v3
        with:
          registry: ghcr.io
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}
      - run: |
          docker build \
            -t ghcr.io/stalela/${{ inputs.service }}:${{ github.sha }} \
            -f ${{ inputs.path }}/Dockerfile \
            --build-arg SERVICE=${{ inputs.service }} \
            .
          docker push ghcr.io/stalela/${{ inputs.service }}:${{ github.sha }}
```

---

## Release Tags

Tags are **path-scoped** so each service releases independently:

```bash
git tag services/ledger/v1.2.3
git push origin services/ledger/v1.2.3
```

The `publish` job re-tags the SHA image with semver:

```yaml
  publish:
    if: startsWith(github.ref, 'refs/tags/services/') || startsWith(github.ref, 'refs/tags/gateways/')
    needs: [ build ]
    runs-on: ubuntu-latest
    steps:
      - name: Tag semver images
        run: |
          PARTS=(${GITHUB_REF#refs/tags/})
          SERVICE=$(echo $PARTS | cut -d/ -f2)
          TAG=$(echo $PARTS | cut -d/ -f3)
          MAJOR=$(echo $TAG | cut -d. -f1)
          IMAGE=ghcr.io/stalela/$SERVICE
          docker pull $IMAGE:${{ github.sha }}
          docker tag $IMAGE:${{ github.sha }} $IMAGE:$TAG
          docker tag $IMAGE:${{ github.sha }} $IMAGE:$MAJOR
          docker push $IMAGE:$TAG
          docker push $IMAGE:$MAJOR
```

---

## Docs CI (`.github/workflows/docs.yml`)

```yaml
name: Docs

on:
  push:
    branches: [ main ]
    paths: [ 'docs/**' ]
  pull_request:
    paths: [ 'docs/**' ]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v5
        with: { python-version: '3.12' }
      - run: pip install -r docs/requirements.txt
      - run: cd docs && mkdocs build --strict
```

Vercel deploys automatically on push to `main` via `docs/vercel.json`.

---

## Branching & Protection

- **Trunk-based**: short-lived feature branches → PR → `main`. No long-lived release branches.
- Branch protection: all required checks must pass.
- **Conventional commits**: `docs:`, `feat:`, `fix:`, `chore:`, `refactor:`.
- Deploy during **SAST Africa/Johannesburg business hours**; staging soak ≥ 24 h for fiscal and payments services.

---

## Secrets in CI

- Use **GitHub OIDC** to assume AWS roles — no long-lived access keys.
- Service-specific IAM roles (least-privilege): push to GHCR, read Secrets Manager for integration tests.
- Unit-test jobs use LocalStack and in-memory mocks — no real AWS credentials needed.
