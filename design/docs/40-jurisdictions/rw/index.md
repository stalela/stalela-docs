# Rwanda (RW)

| Field | Value |
|---|---|
| **ISO 3166-1 alpha-2** | `RW` |
| **Tax Authority** | RRA (Rwanda Revenue Authority) |
| **Primary Currency** | RWF (Rwandan Franc) |
| **Secondary Currency** | — |
| **Fiscal ID Name** | TIN (Tax Identification Number) → maps to `merchant_tin` |
| **Languages** | English, French, Kinyarwanda |
| **Fiscal Mandate** | EBM (Electronic Billing Machine) / V-EBM |
| **Status** | **Planned — not yet implemented** |

---

## Overview

Rwanda's RRA mandates electronic billing through the EBM (Electronic Billing Machine) system. In recent years, RRA has introduced V-EBM (Virtual EBM), allowing software-based invoicing through certified cloud systems — closely aligned with Stalela's architecture.

V-EBM systems must connect to RRA's VSDC (Virtual Sales Data Controller) to obtain invoice signatures. Rwanda's tax structure is simpler than the DRC (VAT 18%, Exempt, Zero-rated), making it a straightforward jurisdiction to implement.

---

## Research Required

- [ ] Map RRA tax categories (VAT 18%, Exempt, Zero-rated) to Stalela tax group manifest format
- [ ] Document buyer classification requirements under RRA
- [ ] Define permitted invoice types
- [ ] Document V-EBM / VSDC integration protocol
- [ ] Map TIN format and registration requirements
- [ ] Identify V-EBM certification process and requirements

---

## References

- [RRA Official Site](https://www.rra.gov.rw/)
- [Jurisdictions Overview](../index.md)
- [Country Profile Template](../country-profile-template.md)
