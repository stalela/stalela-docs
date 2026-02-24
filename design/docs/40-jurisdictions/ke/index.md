# Kenya (KE)

| Field | Value |
|---|---|
| **ISO 3166-1 alpha-2** | `KE` |
| **Tax Authority** | KRA (Kenya Revenue Authority) |
| **Primary Currency** | KES (Kenyan Shilling) |
| **Secondary Currency** | — |
| **Fiscal ID Name** | PIN (Personal Identification Number) → maps to `merchant_tin` |
| **Languages** | English (primary), Swahili |
| **Fiscal Mandate** | eTIMS (electronic Tax Invoice Management System) |
| **Status** | **Planned — not yet implemented** |

---

## Overview

Kenya's KRA mandates electronic tax invoicing through eTIMS (electronic Tax Invoice Management System). Since January 2024, all VAT-registered taxpayers must generate tax invoices through eTIMS-compliant systems. The system uses Type A (online), Type B (ETR devices), and Type C (ESD solutions) integration modes.

Kenya's mobile money ecosystem is dominated by M-Pesa (Safaricom), which is already a rail in the Stalela Payments Nucleus architecture. KRA's eTIMS API is publicly documented, making it a strong candidate for the second jurisdiction implementation.

---

## Research Required

- [ ] Map KRA tax categories (VAT 16%, Exempt, Zero-rated) to Stalela tax group manifest format
- [ ] Document buyer classification requirements under KRA
- [ ] Define permitted invoice types (tax invoice, credit note, debit note)
- [ ] Document eTIMS API integration (Type C — ESD mode)
- [ ] Map PIN format and registration requirements
- [ ] Identify compliance deadlines and penalties

---

## References

- [KRA eTIMS Portal](https://www.kra.go.ke/)
- [Jurisdictions Overview](../index.md)
- [Country Profile Template](../country-profile-template.md)
