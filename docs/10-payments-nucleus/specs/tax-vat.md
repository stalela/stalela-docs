# Tax & VAT (ZA/ZW)

Guidance on tax treatment for fees and surcharges in the Stalela ledger.

---

## VAT Basics (ZA)
- Standard rate: 15% (as of doc date).  
- Taxable supplies: Stalela service fees typically vatable; confirm per tenant.
- Invoicing: include VAT breakdown and tax codes per line.

## Zimbabwe Considerations
- Local VAT/sales tax nuances to be configured per tenant/product; document rates.

---

## Ledger Representation
- Fees split into net and VAT components at settlement time.
- Example (ZAR): amount 100.00; fee 2.00 excl VAT; VAT 0.30 (15%).

```text
Dr USER 100.00
Cr MERCHANT 98.00
Cr FEES_NET 2.00
Cr FEES_VAT 0.30
```

> Accounts may be configured under Revenue/Tax control accounts.

---

## Event/Metadata
- Add `taxCode` (optional) in events referencing fee lines.

---

## Observability
- Metrics: VAT accrued/day; reconciliation with invoices.

---

Last updated: 2025-08-27
