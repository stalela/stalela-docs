# Error Taxonomy & Codes

Consistent error codes across APIs.

---

## 🔑 Principles
- Stable, documented codes.
- Human-readable messages.
- Machine-actionable (clients can retry/failover).

---

## 🗂 Categories
- **4xx — Client Errors**
  - `40001` Invalid request schema
  - `40002` Idempotency key missing/invalid
  - `40901` Version conflict (optimistic concurrency on internal tools)
  - `40902` Idempotency conflict (same key, different body hash)
  - `42201` Compliance screening: denied
  - `42202` Directory route not found

- **5xx — Server Errors**
  - `50001` Rail adapter unavailable
  - `50002` Outbox publish failure
  - `50003` Ledger posting failed
  - `50301` Dependency unavailable (Compliance, Directory, FX)

---

## Rail Reason Code Mappings (informative)

- Mobile Money (EcoCash/MTN/Airtel)
  - Partner decline → `MM_DECLINED`
  - Insufficient funds → `MM_INSUFFICIENT_FUNDS`
  - Timeout/no response → `MM_TIMEOUT`

- PayShap
  - Proxy invalid → `PS_PROXY_INVALID`
  - Beneficiary not available → `PS_BENEFICIARY_UNAVAILABLE`
  - Timeout → `PS_TIMEOUT`

> Exact partner code → Storo reason maps to be versioned per gateway.

---

## 📌 Notes
Expand per component (CTS, Ledger, Gateways).  
All error responses MUST include:
```json
{
  "code": "42201",
  "message": "Entity denied by compliance",
  "transferId": "tr_12345",
  "timestamp": "2025-08-27T12:00:00Z"
}
```
