# Glossary

Shared domain language for Stalela. Sources include our design docs and Moov.io’s [terms-dictionary](https://github.com/moov-io/terms-dictionary).  
This file should be the **first stop** for new contributors.

---

## A

**ACH**  
Automated Clearing House. Batch-based payment network in the U.S.  
_Not directly used in Stalela, but referenced via Moov patterns._

**Account**  
A ledger entity that holds balances and records postings. Types include: User, Merchant, Liquidity, Fees, FX, Settlement.

**AI Routing**
AI-enhanced orchestration capability that ranks and selects rails in real time using policy weights, historical performance, cost, and risk context.

**ADR (Architecture Decision Record)**  
Lightweight doc capturing a key architectural choice, its context, decision, and consequences.

**Authorization (AUTH)**  
A request to place a hold on funds. In Stalela, represented in the canonical transfer intent.

---

## B

**BAI2**  
Bank Administration Institute format for statement files. Used by Moov and referenced as a model for Stalela’s reconciliation exports.

**Balance**  
The net amount for an account at a given time, derived from postings.

**BIN (Bank Identification Number)**  
The first digits of a card number, identifying the issuer. Stored in the Directory service.

**Bus (Event Bus)**  
Pub/sub system (SNS+SQS in dev) delivering domain events between services.

---

## C

**Canonical Transfer Service (CTS)**  
Front-door API and orchestrator for transfers in Stalela. Ensures idempotency, normalization, compliance, and routing.

**Chargeback / Return**  
Reversal of a prior settlement, with reason codes. Modeled as state transitions in CTS and reversal postings in the Ledger.

**Compliance Screening**  
Process of checking payer/payee against watchlists (OFAC, UN, EU, SA FIC). Implemented as a local fast index.

**Cutoff**  
Time of day after which payments are queued for next business day. Defined in Directory service.

---

## D

**Directory Service**  
Component maintaining authoritative data on institutions, BINs, fees, and settlement windows.

**Double-entry**  
Accounting principle: every debit has an equal credit. Enforced in Stalela Ledger.

**DLQ (Dead Letter Queue)**  
Queue for events that failed processing and need operator intervention.

---

## E

**Event**  
Immutable record emitted by a service (e.g., `transfers.settled`). Structured by the event envelope spec.

**Event Envelope**  
Standard wrapper for all events: `{ eventId, type, occurredAt, transferId, tenantId, payload }`.

**External Reference**  
Rail- or partner-provided identifier (e.g., auth code, transaction ref). Stored in transfers table.

---

## F

**FBO (For Benefit Of)**  
Banking account structure where a custodian holds funds for multiple end-users. Modeled in Ledger accounts.

**Fixture (Golden Test)**  
Sample payload used in tests to ensure round-trip parsing and validation stability.

---

## G

**Gateway**  
Adapter for a payment rail (Zimswitch, OPPWA, USDC/Algorand). Translates canonical transfers into rail-specific requests.

**GL (General Ledger)**  
The book of record. Stalela Ledger service maintains the general ledger.

**Glossary**  
This file. Shared terms and definitions.

---

## I

**Idempotency**  
Ensuring a request (e.g., `POST /transfers`) can be safely retried without duplication.

**ISO 8583**  
International standard for card payment messages. Zimswitch uses this; Stalela validates payloads via strict schemas.

**ISO 20022**  
XML/JSON standard for financial messaging. Referenced for future-proofing rails.

---

## L

**Ledger**  
The authoritative record of postings, balances, and statements. Event-driven, double-entry, append-only.

**Lifecycle (Transfer)**  
State machine: INITIATED → SUBMITTED → ACCEPTED → SETTLED → (RETURNED | FAILED).

**Liquidity Account**  
Special ledger account representing pooled liquidity held for customer settlements.

---

## O

**Observability**  
The ability to measure, trace, and debug system behavior via metrics, logs, and tracing.

**OFAC**  
Office of Foreign Assets Control. U.S. sanctions list. Indexed locally alongside UN/EU/SA lists.

**Operator Console**  
Internal UI for handling returns, recon exceptions, and compliance flags.

---

## P

**PII (Personally Identifiable Information)**  
Sensitive data (names, IDs, PANs). Must be encrypted, redacted in logs, and retained per policy.

**Posting**  
Atomic debit/credit entry in the ledger. Immutable, append-only.

**Posting Rules**  
Mapping from transfer events to specific ledger postings (accounts, amounts, memos).

---

## R

**Rail**  
A payment network (e.g., Zimswitch, OPPWA, Algorand/USDC).

**Risk Agents**
AI services embedded in CTS orchestration that evaluate fraud and identity signals to assign compliance tiers and trigger adaptive controls.

**Reconciliation**  
Process of matching partner statements or on-chain events with internal transfers. Runs nightly.

**Return**  
Negative state transition; undo of a prior settlement with reason codes.

---

## S

**Settlement**  
Final movement of funds on a rail. In Stalela, confirmed by events and reconciled against statements.

**Specs Repo**  
Dedicated repo holding event schemas, API definitions, and fixtures (`storo-specs`). Source of truth for contracts.

**State Diagram**  
Visual representation of lifecycle states and transitions (Mermaid).

---

## T

**Tenant**  
Isolated namespace for a customer/institution using Stalela. All transfers are scoped by tenantId.

**Trace ID**  
Identifier used for distributed tracing across services.

**Transfer**  
Core unit of money movement in Stalela, defined by canonical schema (payer, payee, amount, rail, intent, etc.).

---

## W

**Watchlist**  
Sanctions/risk list (OFAC, UN, EU, SA FIC). Ingested and indexed locally for compliance screening.

---

_This glossary evolves with the system. Always update it alongside specs and ADRs._
