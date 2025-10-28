# ADR-0001: Outbox Pattern Mandatory

**Status:** Accepted  
**Date:** 2025-08-26

---

## Context

Stalela is an event-driven system. Each service must emit domain events when its state changes (e.g., `transfers.submitted`, `ledger.balance.updated`).  
We need to guarantee **exactly-once delivery** of these events despite crashes, retries, or network failures.

Naïve approaches (publishing to the bus inside app logic) risk double-emits, message loss, or divergence between DB state and events.

## Decision

Every service **must implement the Outbox pattern**:

- State change + outbox row are persisted in the same database transaction.  
- A background dispatcher process reads the outbox table and publishes events to the bus (SNS/SQS).  
- Consumers are idempotent (dedupe by `eventId` and `transferId+state`).  
- Failed publishes are retried with exponential backoff.  
- DLQ (dead-letter queue) captures poison events.  

## Consequences

- Strong delivery semantics: events are published exactly once if possible, at least once otherwise, never zero.  
- Event consumers may see duplicates, so **idempotency is required**.  
- Storage overhead: each service maintains its own outbox table.  
- Operationally: requires monitoring dispatch lag, DLQ size, and retries.  

## Alternatives Considered

- Two-phase commit with DB + broker → rejected (complex, brittle).  
- "Best effort" publish outside txn → rejected (event loss possible).  

---

**Next Steps:**  
- Scaffold outbox table schema in `platform-base`.  
- Provide Go lib for services to use out-of-the-box (insert, dispatch, metrics).  
