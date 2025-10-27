# FX Policy (USD/ZAR/ZWL)

Defines quote sources, TTL, and audit requirements for FX conversions in supported corridors.

---

## Quote Sources
- RBZ auction (ZW) vs Market providers (ZA) — configurable per tenant/corridor.
- Provenance recorded with quotes; fallback hierarchy.

## TTL & Usage
- TTL per corridor; reject expired quotes.
- Store applied rate on event/journal for audit.
- Canonical requests declare `fxStrategy` (`NOT_APPLICABLE`, `QUOTE_AT_SUBMIT`, `PASS_THROUGH`); Directory enforces viability before routing.

## Controls
- Max deviation vs reference index; alert on breach.
- Hedging hooks: external position management (future).

---

## Observability
- Metrics: quote age, deviation, rejection rate.

---

Last updated: 2025-08-27
