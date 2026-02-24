# ADR-0002: Ledger is Double-Entry and Append-Only

**Status:** Accepted  
**Date:** 2025-08-26

---

## Context

Stalela must provide an authoritative record of money movement across rails.  
Financial correctness requires:

- Balances that always reconcile.  
- Auditability of every change.  
- Ability to reverse but never delete.  

## Decision

The **Ledger Service** is a strict **double-entry, append-only system**:

- Every posting is a pair: debit one account, credit another, amounts equal.  
- Postings are immutable. Reversals are represented as new entries.  
- Balances are derived from postings (materialized views are allowed).  
- Accounts include User, Merchant, Liquidity, Fees, FX, Settlement, Reserves.  
- Ledger consumes events (accepted, settled, returned) and applies posting rules.  

## Consequences

- Strong audit trail. No hidden state.  
- Easy reconciliation with external statements.  
- Slightly more complex reversal flows (explicit contra postings).  
- Storage grows unbounded (mitigated with archiving, partitioning).  

## Alternatives Considered

- Single-entry balances updated in place → rejected (non-auditable, error-prone).  
- Event-sourcing without explicit double-entry → rejected (money truth must be explicit).  

---

**Next Steps:**  
- Define posting rules in `20-specs/posting-rules.md`.  
- Provide Go lib for posting validation (debits == credits).  
