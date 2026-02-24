# South Africa (ZA)

| Field | Value |
|---|---|
| **ISO 3166-1 alpha-2** | `ZA` |
| **Tax Authority** | SARS (South African Revenue Service) |
| **Primary Currency** | ZAR (South African Rand) |
| **Secondary Currency** | — |
| **Fiscal ID Name** | Tax Reference Number → maps to `merchant_tin` |
| **Languages** | English (primary), plus 10 other official languages |
| **Fiscal Mandate** | eFiling / Tax Compliance Status (TCS) |
| **Status** | **Planned — not yet implemented** |

---

## Overview

South Africa's SARS does not currently mandate electronic fiscal devices in the same way as East/Central African countries. However, VAT compliance requires detailed tax invoices meeting the VAT Act requirements, and SARS's eFiling platform supports electronic submission of returns.

South Africa's payment ecosystem is well-developed with PayShap (instant payments, already a Stalela rail), EFT, and card rails. The country's formal banking infrastructure and regulatory maturity make it a different profile from the mobile-money-first markets.

---

## Research Required

- [ ] Map SARS tax categories (VAT 15%, Exempt, Zero-rated) to Stalela tax group manifest format
- [ ] Document VAT invoice requirements under the VAT Act
- [ ] Define permitted invoice types (full tax invoice, abridged tax invoice, debit/credit note)
- [ ] Document eFiling / Making Tax Digital integration (if applicable)
- [ ] Map Tax Reference Number format and registration
- [ ] Assess whether SARS will mandate e-invoicing in the near term

---

## References

- [SARS Official Site](https://www.sars.gov.za/)
- [Jurisdictions Overview](../index.md)
- [Country Profile Template](../country-profile-template.md)
