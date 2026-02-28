# Stalela Platform

The Stalela Platform is a unified fintech infrastructure for **moving money** and **issuing fiscally compliant invoices** across sub-Saharan African markets. It comprises two decoupled product pillars and a shared foundation.

---

## Platform Architecture

```mermaid
flowchart TD
    subgraph Foundation["Shared Foundation"]
        ID["CIS (Identity Service)"]
        EB["Event Bus (Outbox)"]
        OBS["Observability (OTel)"]
        AI["AI Layer"]
    end

    subgraph PAY["Payments Nucleus"]
        CTS["Canonical Transfer Service"]
        GL["GL Ledger (Double-Entry)"]
        RAILS["Rail Gateways\n(MoMo, EFT, RTGS, Card, Crypto)"]
        RECON["Reconciliation"]
    end

    subgraph FIS["Fiscal Platform"]
        INV["Invoice API"]
        TAX["Tax Engine (Jurisdiction-Configured)"]
        CSS["Cloud Signing Service (HSM)"]
        FL["Fiscal Ledger (Hash-Chained)"]
        SYNC["Tax Authority Sync Agent"]
    end

    CTS --> GL
    CTS --> RAILS
    GL --> RECON
    INV --> TAX
    TAX --> CSS
    CSS --> FL
    FL --> SYNC

    Foundation --- PAY
    Foundation --- FIS
```

---

## Two Pillars

| Pillar | Purpose | Core Abstraction | Documentation |
|---|---|---|---|
| **Payments Nucleus** | Move money across rails — mobile money, card, crypto, EFT, RTGS | `CanonicalTransfer` | [Payments Nucleus →](10-payments-nucleus/overview/index.md) |
| **Fiscal Platform** | Create sealed, fiscally compliant invoices across jurisdictions | `CanonicalInvoice` | [Fiscal Platform →](20-fiscal-platform/index.md) |

> **Identity layer** — The [Customer Identity Service (CIS)](15-identity/index.md) underpins both pillars, providing KYC/KYB verification, consent management, and credential issuance. CIS is the platform's source of truth for who a payer, payee, merchant, or cashier actually is.

The pillars are **decoupled by design** — no shared databases, no synchronous RPC between them. They connect through opaque references (`endUserRef`) and async events on the Event Bus.

---

## Quick Navigation

| Section | What's Inside |
|---|---|
| [Foundation](00-foundation/index.md) | Shared concepts — glossary, canonical payloads, multi-tenant model, mobile money, AI capabilities |
| [Identity (CIS)](15-identity/index.md) | Customer Identity Service — KYC/KYB, verification, consent, RBAC, events, schemas |
| [Payments Nucleus](10-payments-nucleus/overview/index.md) | CTS, rail gateways, GL ledger, reconciliation, compliance, operator console |
| [Fiscal Platform](20-fiscal-platform/index.md) | Invoice API, tax engine, cloud signing (HSM), fiscal ledger, authority sync, POS |
| [Integration](30-integration/overview.md) | How the two pillars interact — payment on invoice, merchant identity, end-to-end sequences |
| [Jurisdictions](40-jurisdictions/index.md) | Country profiles — tax groups, client classifications, currencies, authority integration |
| [Infrastructure](60-infra/index.md) | Deployment architectures — Free Stack (Supabase + Vercel + Alibaba, $0–$20/mo) and AWS Blueprint |
| [Sprints](70-sprints/epics-and-stories.md) | Sprint planning and epic tracking |
| [Templates](90-templates/TEMPLATE-adr.md) | ADR, component, sequence, and state diagram templates |

