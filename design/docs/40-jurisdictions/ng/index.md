# Nigeria (NG)

| Field | Value |
|---|---|
| **ISO 3166-1 alpha-2** | `NG` |
| **Tax Authority** | FIRS (Federal Inland Revenue Service) |
| **Primary Currency** | NGN (Nigerian Naira) |
| **Secondary Currency** | USD (for international transactions) |
| **Fiscal ID Name** | TIN (Tax Identification Number) → maps to `merchant_tin` |
| **Languages** | English (primary) |
| **Fiscal Mandate** | TaxPro Max / e-Invoice |
| **Status** | **Planned — not yet implemented** |

---

## Overview

Nigeria's FIRS operates the TaxPro Max platform for tax administration and is progressively mandating electronic invoicing for VAT-registered businesses. Nigeria's large economy and complex multi-state tax regime (federal VAT + state levies) present unique challenges.

The mobile money landscape includes OPay, PalmPay, and traditional bank transfers. Nigeria's fintech ecosystem is one of Africa's most active, making it a high-value jurisdiction for Stalela.

---

## Research Required

- [ ] Map FIRS tax categories (VAT 7.5%, Exempt, Zero-rated) to Stalela tax group manifest format
- [ ] Document buyer classification requirements under FIRS
- [ ] Define permitted invoice types
- [ ] Document TaxPro Max / e-Invoice API integration
- [ ] Map TIN format and registration requirements (federal vs state)
- [ ] Identify e-invoicing compliance timeline and penalties

---

## References

- [FIRS Official Site](https://www.firs.gov.ng/)
- [Jurisdictions Overview](../index.md)
- [Country Profile Template](../country-profile-template.md)
