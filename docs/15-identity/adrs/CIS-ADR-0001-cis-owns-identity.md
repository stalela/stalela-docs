---
title: "CIS-ADR-0001: CIS Owns Identity Lifecycle"
---

- **Status**: Accepted
- **Date**: 2024-05-01

---

## Context

The platform previously allowed multiple services to mutate identity
records, leading to conflicting states and inconsistent audit trails.

## Decision

CIS becomes the **sole owner** of identity lifecycle: creation,
updates, verification, suspension, and erasure. Other services must
treat CIS as the source of truth and interact via APIs or events.

## Consequences

- CTS and Ledger services subscribe to CIS events rather than
  mutating identity data directly.
- Additional guardrails implemented (Row-Level Security, audit logs).
- Integration teams must migrate legacy flows to call CIS APIs.
