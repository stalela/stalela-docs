# Stalela Platform — Foundation

This section contains shared concepts, vocabulary, and cross-cutting capabilities that span both product pillars of the Stalela Platform.

---

## Two Pillars, One Platform

Stalela is built as two complementary product pillars that share a common foundation:

| Pillar | Purpose | Core abstraction |
|---|---|---|
| **Payments Nucleus** | Move money across rails (mobile money, card, crypto, EFT, RTGS) | `CanonicalTransfer` — a single API for all payment intents |
| **Fiscal Platform** | Create, sign, and sync fiscally compliant invoices (DRC Facture Normalisée) | `CanonicalInvoice` — a sealed, HSM-signed fiscal event |

The two pillars are **decoupled by design**. A transfer can exist without an invoice, and an invoice can exist without a transfer. When they do interact — for example, a POS sale that triggers a mobile money payment — the integration is event-driven and asynchronous.

---

## What's in this section

| Page | What it covers |
|---|---|
| [Glossary](glossary.md) | Merged vocabulary from both pillars, with disambiguation for overloaded terms |
| [Canonical Payloads](canonical-payloads.md) | Side-by-side comparison of `CanonicalTransfer` and `CanonicalInvoice` schemas |
| [Mobile Money](mobile-money.md) | Airtel, MTN MoMo, M-Pesa, Orange Money — rail settlement vs. invoice payment instrument |
| [Multi-Tenant Model](multi-tenant-model.md) | How `tenantId`, `merchant_nif`, and `outlet_id` map across both pillars |
| [AI Capabilities](ai-capabilities.md) | Smart Rail Selector, NL invoice creation, tax classification — unified AI layer |

---

## Design Principles (shared)

Both pillars follow the same engineering principles:

1. **Canonical payloads** — every domain object has a deterministic, contract-first schema. Payloads are versioned and reproducible.
2. **Event-driven** — state changes emit events to a bus. Consumers are decoupled from producers. Exactly-once semantics via transactional outbox.
3. **Offline-first** — clients queue work locally (IndexedDB, SQLite, outbox) and reconcile when connectivity returns.
4. **Append-only** — neither ledger (GL or fiscal) allows deletion. Corrections are new events.
5. **Multi-tenant** — every request is scoped to a tenant/merchant. Data isolation is enforced at every layer.
6. **AI-assisted, human-authoritative** — AI agents suggest, classify, and monitor. Humans (and HSMs) make final decisions.
7. **Observability by default** — structured logs (PII-redacted), distributed traces (`traceparent`), Prometheus metrics, alerting on DLQ depth and latency SLOs.
