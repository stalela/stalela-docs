# External Integrations — Edge Map

This file maps out **external systems** Stalela must eventually connect to.  

---

## 🌍 Rails
- **EcoCash / Mobile Money (ZW)** → push-only flows, STK prompts.
- **Zimswitch / OPPWA** → ISO 8583 + JSON APIs, card-present & online.
- **PayShap (SA)** → proxy-based instant payments.
- **USDC/Algorand** → blockchain adapter.
- **EFT/RTGS (SA)** → batch payments, settlement via SARB.

---

## 🏦 Banks & RTGS
- South Africa: NPS, EFT clearing, RTGS.
- Zimbabwe: Zimswitch settlement partners.

---

## ⚖️ Regulatory
- South Africa: FIC reporting APIs.
- Zimbabwe: FIU suspicious activity reporting.
- Cross-border: FATF Travel Rule (TBD).

---

## 🆔 Identity & KYC (CIS-Managed)

All identity verification and KYC/KYB adapters are managed by the **Customer Identity Service (CIS)**.
Payments Nucleus does not call these providers directly — it resolves `cisEntityId` and `kycTier` from CIS.

- **MOSIP** → National ID verification (ZW, future DRC). CIS adapter.
- **DHA (Home Affairs, SA)** → South African ID verification. CIS adapter.
- **Credit bureaus** → Enhanced-tier checks (TransUnion, XDS). CIS adapter.
- **SIM-swap signals** → Mobile operator / third-party providers for fraud risk. CIS adapter.
- **AVS (Account Verification)** → Bank account name-matching (ZA) for pull payouts. CIS adapter.
- **DGI / ZIMRA** → Tax authority identity cross-checks for KYB. CIS adapter.

> See [Identity (CIS)](../../15-identity/index.md) for architecture and adapter details.

---

## 📄 File Specifications (Recon)
- Bankserv EFT: settlement/returns file layouts and cutoffs (link: add under recon).
- PayShap: exception/return notifications mapping.
- ZIPIT/RTGS: daily statements and reason codes.

---

## 📌 Notes
Each integration will have its own `rail-gateway-<name>.md` or `integration-<name>.md`.
