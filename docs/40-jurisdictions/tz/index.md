# Tanzania (TZ)

| Field | Value |
|---|---|
| **ISO 3166-1 alpha-2** | `TZ` |
| **Tax Authority** | TRA (Tanzania Revenue Authority) |
| **Primary Currency** | TZS (Tanzanian Shilling) |
| **Secondary Currency** | — |
| **Fiscal ID Name** | TIN (Tax Identification Number) → maps to `merchant_tin` |
| **Languages** | English, Swahili (primary) |
| **Fiscal Mandate** | EFD (Electronic Fiscal Device) / VFD (Virtual Fiscal Device) |
| **Status** | **Planned — not yet implemented** |

---

## Overview

Tanzania's TRA mandates electronic fiscal devices for all VAT-registered businesses. The system includes physical EFDs and Virtual Fiscal Devices (VFDs) that connect to TRA's fiscal server for real-time receipt verification. VFDs allow software-based fiscal compliance, aligning well with Stalela's cloud signing model.

TRA's VFD API requires real-time receipt registration with the fiscal server, which returns a verification code for each transaction. Tanzania's mobile money ecosystem includes M-Pesa (Vodacom), Airtel Money, and Tigo Pesa.

---

## Research Required

- [ ] Map TRA tax categories (VAT 18%, Exempt, Zero-rated, Special Relief) to Stalela tax group manifest format
- [ ] Document buyer classification requirements under TRA
- [ ] Define permitted invoice types / receipt types
- [ ] Document VFD API integration protocol
- [ ] Map TIN format and registration requirements
- [ ] Identify VFD certification process

---

## References

- [TRA Official Site](https://www.tra.go.tz/)
- [Jurisdictions Overview](../index.md)
- [Country Profile Template](../country-profile-template.md)
