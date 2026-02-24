# DRC Currency Model

**Jurisdiction:** DR Congo (`CD`)  
**Primary Currency:** CDF (Congolese Franc)  
**Secondary Currency:** USD (United States Dollar)

---

## Dual Currency

DRC businesses routinely price and transact in both CDF and USD. The Stalela Fiscal Platform supports this out of the box for the `CD` jurisdiction:

| Aspect | CDF | USD |
|---|---|---|
| **ISO 4217 code** | `CDF` | `USD` |
| **Default for invoices** | Yes — used when no currency is specified | Supported — must be explicitly set |
| **Tax calculation currency** | Always CDF — tax amounts are computed and reported in CDF | Line items priced in USD are converted to CDF for tax calculation |
| **Exchange rate** | — | DGI-published daily rate or merchant-declared rate with `fx_rate` field |

---

## Rounding Rules

| Rule | Value |
|---|---|
| **Minimum unit** | 0.01 CDF (centime) |
| **Rounding method** | Half-up (round 0.005 → 0.01) |
| **Where applied** | Per line-item tax amount, before summing into `tax_summary` |
| **Rounding adjustment field** | `tax_rounding_adjustment` — captures any delta between sum-of-lines and recalculated total |

---

## Invoice Examples

```json
// CDF-denominated invoice
{
  "jurisdiction": "CD",
  "totals": {
    "subtotal": "50000.00",
    "tax": "8000.00",
    "total": "58000.00"
  },
  "payments": [
    { "method": "mobile_money", "provider": "airtel_money", "amount": "58000.00", "currency": "CDF" }
  ]
}

// USD-denominated invoice (tax calculated in CDF equivalent)
{
  "jurisdiction": "CD",
  "totals": {
    "subtotal": "20.00",
    "tax": "3.20",
    "total": "23.20",
    "currency": "USD",
    "tax_currency": "CDF",
    "tax_in_reporting_currency": "9043.20",
    "fx_rate": "2826.00"
  },
  "payments": [
    { "method": "cash", "amount": "23.20", "currency": "USD" }
  ]
}
```

---

## Mobile Money Providers (DRC)

| Provider | Rail Gateway | Invoice Instrument Code | Currency |
|---|---|---|---|
| Airtel Money | `rail-gateway-airtel-momo` | `airtel_money` | CDF |
| MTN MoMo | `rail-gateway-mtn-momo` | `mtn_momo` | CDF |
| M-Pesa (Vodacom) | `rail-gateway-mpesa` (planned) | `mpesa` | CDF |
| Orange Money | `rail-gateway-orange` (planned) | `orange_money` | CDF |
