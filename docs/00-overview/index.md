# Stalela Documentation

Welcome to the **Stalela Docs** — the single source of truth for how the Stalela payments nucleus is designed, built, and operated.

---

## 🌍 What this provides?

Stalela provides a **payments nucleus** for the Southern Africa ↔ global corridor. It provides:

- **Unified API** for payments, payouts, and transfers.
- **Ledger** for strict double-entry accounting and balance tracking.
- **Router** that connects to multiple **rails** (USDC on Avax/Algorand, Zimswitch/OPPWA, mobile money, EFT).
- **Compliance and reconciliation** as first-class components, not afterthoughts.

Think of it as the **boring but unbreakable center** of our payment universe.

---

## 🧩 What’s in this Documentation?

This docs repo is organized into clear layers:

### 1. Overview (you are here)
- **`index.md`** → This page: big-picture introduction, how to use the docs.
- **`nucleus.md`** → Detailed description of the Stalela nucleus (all components together).
- **`glossary.md`** → Domain terms (rails, ledger, reconciliation, returns, etc.).
- **`architecture-decisions/`** → ADRs (Architecture Decision Records) documenting why we made key choices.

### 2. Components
Each nucleus component has its own page:
- Canonical Transfer Service (CTS)
- Rail Gateways (Zimswitch, OPPWA, USDC/Algorand)
- Ledger Service
- Compliance Screening
- Directory & Routing
- Reconciliation & Returns
- Event Bus + Outbox
- Platform/Base
- Operator Console

Each page explains **Purpose → Responsibilities → Interfaces → Data → Diagrams → Failure Modes → Ops**.

### 3. Specs
- Event envelope & catalog
- Canonical Transfer API schema (`POST /transfers`)
- Posting rules (event → debit/credit accounts)
- Data retention & PII handling

### 4. Diagrams
- Component diagram of the nucleus
- Transfer lifecycle state machine
- Sequence diagrams for common flows (e.g. USDC payment, OPPWA return, reconciliation match)

### 5. Ops
- Runbooks (returns, reconciliation triage, compliance freeze/unfreeze)
- Observability (metrics, dashboards, logs, SLOs)
- Security (secrets, IAM, PII redaction)

### 6. Templates
Reusable templates for:
- New component docs
- Sequence diagrams
- State diagrams
- ADRs

---

## 📖 How to Read this Repo

- **If you’re an engineer** → dive into `10-components/` and `20-specs/`.  
- **If you’re an operator** → check `40-ops/runbooks.md`.  
- **If you’re reviewing a design decision** → see `00-overview/architecture-decisions/`.

---

## 📐 Diagram Standards

We use [Mermaid](https://mermaid.live) diagrams in Markdown.  
GitHub renders them directly; you can also export with `@mermaid-js/mermaid-cli`.

- **Component diagrams** → boxes + arrows (what services exist, how they talk).  
- **State diagrams** → transfer lifecycle (INITIATED → SETTLED → RETURNED).  
- **Sequence diagrams** → end-to-end message flows (client → CTS → rail gateway → ledger).  

Example:

```mermaid
flowchart LR
  Client --> CTS[Canonical Transfer Service]
  CTS --> GW[Rail Gateway]
  GW --> EB[(Event Bus)]
  EB --> L[Ledger]
