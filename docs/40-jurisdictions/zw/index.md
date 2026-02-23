# Zimbabwe (ZW)

| Field | Value |
|---|---|
| **ISO 3166-1 alpha-2** | `ZW` |
| **Tax Authority** | ZIMRA (Zimbabwe Revenue Authority) |
| **Primary Currency** | ZWG (Zimbabwe Gold) |
| **Secondary Currency** | USD (United States Dollar) |
| **Fiscal ID Name** | TIN (Tax Identification Number) → maps to `merchant_tin` |
| **Languages** | English (primary), Shona, Ndebele |
| **Fiscal Mandate** | Fiscalisation of Electronic Fiscal Devices |
| **Status** | **Planned — not yet implemented** |

---

## Overview

Zimbabwe mandates electronic fiscal devices for VAT-registered businesses through ZIMRA. The country uses a dual-currency model (ZWG/USD) similar to the DRC. Key mobile money providers include EcoCash (already supported in the Payments Nucleus) and OneMoney.

ZIMRA's fiscalisation system requires electronic fiscal devices that generate fiscal day numbers, verify receipts, and transmit data to the revenue authority. Stalela's cloud-first approach can serve as a compliant SaaS alternative once ZIMRA regulations are mapped to the jurisdiction framework.

---

## Research Required

- [ ] Map ZIMRA tax categories to Stalela tax group manifest format
- [ ] Document client classification requirements (if any)
- [ ] Define permitted invoice types under ZIMRA regulations
- [ ] Document ZIMRA electronic fiscal device (EFD) sync protocol
- [ ] Identify regulatory framework and compliance deadlines
- [ ] Map TIN format and registration requirements

---

## References

- [ZIMRA Official Site](https://www.zimra.co.zw/)
- [Jurisdictions Overview](../index.md)
- [Country Profile Template](../country-profile-template.md)
