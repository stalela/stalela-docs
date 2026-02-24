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

## 🆔 Identity & KYC
- Optional MOSIP integration for National ID checks.
- Local credit bureau lookups (future).
- SIM-swap signals (mobile operators / third-party providers) for risk.
- AVS (account verification) and bank account name-matching (ZA) for pull payouts.

---

## 📄 File Specifications (Recon)
- Bankserv EFT: settlement/returns file layouts and cutoffs (link: add under recon).
- PayShap: exception/return notifications mapping.
- ZIPIT/RTGS: daily statements and reason codes.

---

## 📌 Notes
Each integration will have its own `rail-gateway-<name>.md` or `integration-<name>.md`.
