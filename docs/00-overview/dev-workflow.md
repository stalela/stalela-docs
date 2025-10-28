# Development Workflow

This document sets conventions for how we **develop, review, and deploy** Stalela nucleus code.

---

## 🔀 Branching
- **Main branch** = always deployable.
- **Feature branches** → PR → merge to main (require review).
- Hotfix branches allowed only with approval.

---

## 📝 Code Reviews
- Minimum 1 reviewer for all PRs.
- Use ADRs for architectural changes.
- Must include tests for all new code.

---

## ✅ Testing Levels
- Unit tests with golden fixtures (esp. rail adapters).
- Integration tests with mocks/stubs.
- End-to-end tests with sandbox rails (EcoCash, OPPWA, USDC).

---

## 🏗 CI/CD
- GitHub Actions pipeline:
  - Build → Lint → Test → Dockerize → Deploy (staging).
- Staging deploys automatically.
- Production deploys require approval.

---

## 📌 Docs & ADRs
- Every new service/component must include a `docs/10-components/<name>.md`.
- Significant design changes must log an ADR under `00-overview/architecture-decisions/`.

---

## 🔐 Secrets & Security
- No secrets in repo.
- All secrets via Vault or AWS SSM.
