# Sprint 001 – Kickoff

**Dates:** YYYY‑MM‑DD → YYYY‑MM‑DD  
**Team:** 2 devs (Sprint Master/System Design + Developer)  
**Focus:** Bootstrapping Stalela nucleus with contracts, infra scaffolding, and first end‑to‑end slice.

---

## 🎯 Goals (Sprint Outcome)
- Have a working **docs + specs foundation** (clear contracts, posting rules, glossary).
- Bring up **devstack** with CTS + USDC Gateway + Ledger (thin slice).
- CI/CD pipelines in place (lint, test, contract‑validate, build).
- First happy‑path transfer flows **documented and testable**.

---

## 🗂 Scope (Stories)

### 1. Documentation & Specs
- [ ] Finalize `20-specs/events.md` with explicit `"v": 1` field.
- [ ] Link `posting-rules.md` into `ledger-service.md`.
- [ ] Draft `glossary.md` (with Moov.io + finance/accounting terms).
- [ ] ADR‑0001 (outbox pattern), ADR‑0002 (double‑entry ledger).

### 2. Infra & Devstack
- [ ] `storo-devstack` repo skeleton (Docker Compose + LocalStack + Postgres + Prometheus + Grafana).
- [ ] CTS + Ledger + USDC GW images wired into devstack.
- [ ] Local override example documented in `local-dev.md`.

### 3. CI/CD
- [ ] Apply standard `.github/workflows/ci.yml` to CTS repo.
- [ ] Contract validation step wired to `storo-specs`.
- [ ] First green pipeline run.

### 4. End‑to‑End Slice (Happy Path)
- [ ] Client POST `/v1/transfers` to CTS (devstack).
- [ ] CTS emits `transfers.submitted.usdc`.
- [ ] USDC Gateway consumes, emits `accepted` + `settled`.
- [ ] Ledger posts debit/credit entries.
- [ ] Verify balances via `GET /balances`.

---

## ✅ Definition of Done
- Docs: published in repo under `/docs` (renderable on GitHub).
- Specs: validated with golden fixtures in CI.
- Infra: `docker compose up` starts stack; Grafana accessible.
- Flow: running curl against CTS → events → ledger visible in logs.

---

## 🚧 Out of Scope
- Zimswitch & OPPWA gateways (future sprints).
- Reconciliation service (later sprint).
- Operator Console UI (later sprint).

---

## 🔮 Risks & Mitigation
- **Spec churn**: mitigate by freezing contracts after ADR sign‑off.
- **Infra drift**: mitigate with Terraform baseline next sprint.
- **Dev confusion**: mitigate by docs-first (glossary, component pages).

---

## 📊 Metrics
- Sprint velocity = 4 stories completed.
- CI pass rate = 100% on `main`.
- Devstack start‑to‑happy‑path = < 15 min setup.

---

## 👥 Ownership
- Sprint Master/System Design: contracts, ADRs, devstack infra, CI template.
- Developer: implement CTS service skeleton, USDC GW skeleton, integrate with specs.

---

## 📝 Next Sprint Preview
- Add OPPWA Gateway with strict validators.
- Implement reconciliation ingest for USDC.
- Introduce Operator Console (timeline + exceptions).
