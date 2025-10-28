# Stalela Nucleus vs Mojaloop Hub - Visual Contrast

This note shows how **Stalela** is *inspired by* Mojaloop while keeping a **modular, rail-agnostic nucleus**. Two diagrams:
1) Component landscape comparison
2) Transaction flow (Request-to-Pay) mapped to each architecture

---

## 1) Component Landscape

```mermaid
flowchart LR
  subgraph S["Stalela Nucleus (Modular, Rail-Agnostic)"]
    direction LR
    S1["CTS (Canonical Transfer Service)"]
    S2["Rail Gateways (EcoCash/PayShap/OPPWA/USDC)"]
    S3["Ledger Service (Double-Entry)"]
    S4["Compliance (Screening/Lists)"]
    S5["Directory & Routing (ALS/Fees/Windows)"]
    S6["Reconciliation & Returns"]
    S7["Event Bus + Outbox"]
    S8["Operator Console"]
    S9["Platform/Base (Admin/Time/Errors/IDs)"]
  end

  subgraph M["Mojaloop Hub (Switch + Scheme Services)"]
    direction LR
    M1["Account Lookup Service (ALS / Discovery)"]
    M2["Quoting Service (FX / Fees Agreement)"]
    M3["Central Ledger (Clearing/Positions)"]
    M4["Settlement Module (RTGS/Net/Prefund)"]
    M5["Scheme Rules & Auth (PKI, Signatures, Consent)"]
    M6["Fraud/Risk Hooks"]
    M7["FSPIOP API Gateway"]
    M8["ILP Coordinator (Conditions/Fulfillment)"]
  end

  %% Stalela internals
  S1 --> S4
  S1 --> S5
  S1 --> S2
  S2 --> S7
  S7 --> S3
  S7 --> S6
  S8 --- S7
  S9 --- S1
  S9 --- S2
  S9 --- S3

  %% Mojaloop internals
  M7 --> M1
  M7 --> M2
  M7 --> M8
  M8 --> M3
  M3 --> M4
  M5 --- M7
  M6 --- M7

```

**Key differences**  
- **Stalela** separates **rail adapters** (gateways) from the core; ledger is **internal SoT**.  
- **Mojaloop** is a **shared switch**: it offers discovery, quoting, clearing & settlement to **external DFSPs**.  
- Both use **directories (ALS)**, **FX/fees agreement**, **security (PKI)**, and **fraud hooks** — but Stalela keeps them inside its nucleus; Mojaloop exposes them as scheme services.

---

## 2) Request-to-Pay (R2P) Flow — Side-by-Side

```mermaid
sequenceDiagram
  autonumber
  participant Client as Merchant App / POS
  participant Stalela as Stalela CTS
  participant Dir as Directory (ALS)
  participant GW as Rail Gateway (e.g., EcoCash/PayShap/USDC)
  participant Ledger as Ledger Service

  Note over Client,Ledger: Stalela — Rail-agnostic nucleus

  Client->>Stalela: POST /transfers (payer alias, amount, rail)
  Stalela->>Dir: Resolve alias -> provider/route
  Dir-->>Stalela: Provider & fees/windows
  Stalela->>GW: transfers.submitted.<rail>
  GW-->>Stalela: transfers.accepted (prompt delivered / tx observed)
  GW-->>Stalela: transfers.settled (funds final)
  Stalela->>Ledger: Postings (Dr/Cr + fees/FX)
  Ledger-->>Stalela: Balances updated
  Stalela-->>Client: 200 OK (state: SETTLED)
```

```mermaid
sequenceDiagram
  autonumber
  participant PayerApp as Payer DFSP App
  participant Hub as Mojaloop Hub (FSPIOP)
  participant ALS as Account Lookup (Discovery)
  participant Quote as Quoting (FX/Fees)
  participant ILP as ILP/Transfer Orchestrator
  participant PayeeApp as Payee DFSP App
  participant Settle as Settlement/RTGS

  Note over PayerApp,Settle: Mojaloop — Shared scheme with DFSPs

  PayerApp->>Hub: POST /parties (discover payee alias)
  Hub->>ALS: Lookup alias -> DFSP
  ALS-->>Hub: Payee DFSP
  Hub->>PayeeApp: GET /quotes?amount,currency
  PayeeApp-->>Hub: Quote (amountIn/Out, fees, FX, ILP condition)
  Hub-->>PayerApp: Quote (approve?)
  PayerApp->>Hub: POST /transfers (attach ILP condition)
  Hub->>ILP: Coordinate conditional transfer
  ILP->>PayeeApp: Fulfill if terms met
  PayeeApp-->>Hub: Transfer success
  Hub->>Settle: (Net/Gross) settlement instruction
  Hub-->>PayerApp: Transfer completed
```

**Interpretation**  
- **Stalela** treats R2P as an internal orchestration; **gateways** perform the last-mile prompt/observe/settle.  
- **Mojaloop** formalizes **Discovery -> Quote -> Transfer** across **multiple DFSPs**, with **ILP** ensuring atomicity and a separate **settlement layer**.

---

## When to use which ideas

- Use **Stalela’s modular gateways** when you must integrate diverse rails (EcoCash, PayShap, OPPWA, USDC) *and* keep a single internal ledger of record.  
- Use **Mojaloop patterns** (FSPIOP, ILP, ISO 20022 mapping, scheme rules) to standardize cross-institution flows and future-proof for **regional interop**.

---

*Draft v1 — for internal architecture review.*
