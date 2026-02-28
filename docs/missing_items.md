# Missing Items for Southern Africa Context

This document tracks gaps to make the Stalela nucleus production-ready for South Africa (ZA) and Zimbabwe (ZW). Each entry lists a short description, suggested docs location, and status.

---

## Regulatory and Reporting

- **FICA onboarding tiers and risk-based limits (ZA)**
  - Description: Define KYC tiers, allowable limits/velocities, and enforcement hooks in CTS/compliance.
  - Suggested docs: `docs/20-specs/risk-limits.md`
  - Status: Completed (see `20-specs/risk-limits.md`)

- **POPIA data handling and cross-border transfers**
  - Description: Clarify data localization, lawful basis, and cross-border transfer clauses; align with retention policy.
  - Suggested docs: `docs/40-ops/security.md` (POPIA section) and `docs/20-specs/data-retention-pii.md` (expanded)
  - Status: Completed (sections added)

- **SARB exchange control (BoP reporting)**
  - Description: Event fields, submission schedules, and BoP file/API formats for authorized dealer reporting.
  - Suggested docs: `docs/20-specs/regulatory-reporting.md`
  - Status: Completed (see `20-specs/regulatory-reporting.md`)

- **goAML STR/CTR integrations (SA FIC, ZW FIU)**
  - Description: Schemas, batching, thresholds, and ops runbook for suspicious/cash threshold reporting.
  - Suggested docs: `docs/20-specs/regulatory-reporting.md`, `docs/40-ops/regulatory.md`
  - Status: Completed (spec + ops runbook added)

- **Licensing posture and scheme participation (PASA/System Operator)**
  - Description: Document required licenses/partners and operational controls per role.
  - Suggested docs: `docs/40-ops/security.md` (Licensing & Scheme Participation)
  - Status: Completed (section added)

---

## Rails Coverage and Interop

- **Mobile money rails beyond EcoCash (MTN MoMo, Airtel Money, Telecash/OneMoney; ZA wallets)**
  - Description: Gateway docs with STK/USSD prompts, callbacks, reason codes, limits.
  - Suggested docs: `docs/10-components/rail-gateway-mtn-momo.md`, `rail-gateway-airtel-momo.md`, `rail-gateway-ecocash.md`
  - Status: Completed (docs added)

- **PayShap (instant proxy payments)**
  - Description: Proxy types, resolution flow, timeouts, dispute/return semantics.
  - Suggested docs: `docs/10-components/rail-gateway-payshap.md`
  - Status: Completed (doc added)

- **BankservAfrica EFT (batch)**
  - Description: File layouts, cutoffs, settlement windows, exception handling.
  - Suggested docs: `docs/10-components/rail-gateway-eft.md`
  - Status: Completed (doc added; DebiCheck section added)

- **ZIPIT and RTGS nuances (ZW)**
  - Description: Message formats, settlement timing, reason codes.
  - Suggested docs: `docs/10-components/rail-gateway-zimswitch.md` (expand) and `rail-gateway-rtgs.md`
  - Status: Partially completed (RTGS doc added; ZIPIT mapping to expand in Zimswitch)

---

## Reconciliation and File Formats

- **Bankserv EFT/PayShap/ZIPIT/RTGS file specs**
  - Description: Record layouts, matching keys, cutoffs, T+N timelines.
  - Suggested docs: `docs/20-specs/external-integrations.md` (expand) and `docs/10-components/reconciliation-returns.md` (expand)
  - Status: Completed (sections/pointers added)

- **Reason code mapping for mobile money and PayShap**
  - Description: Standardized return/dispute taxonomy and mapping tables.
  - Suggested docs: `docs/20-specs/error-codes.md` (expand with rail maps)
  - Status: Completed (section added)

---

## FX and Cross-Border

- **Rate sources and quote policy (USD/ZAR/ZWL)**
  - Description: Approved quote sources (RBZ auction vs market), TTL, provenance; audit requirements.
  - Suggested docs: `docs/20-specs/fx-policy.md`
  - Status: Completed (spec added)

- **Nostro/Vostro flows and exchange-control tags**
  - Description: Ledger accounts, event fields (e.g., `exchangeControlRef`), hedging hooks, corridor limits.
  - Suggested docs: `docs/10-components/ledger-service.md` (expand), `docs/20-specs/events.md` (add fields)
  - Status: Completed (ledger and events expanded)

---

## KYC, Identity, Fraud

- **CIS ↔ CTS identity resolution**
  - Description: CTS must resolve `cisEntityId` to a verified identity before screening. Define the resolution API contract, caching strategy (JWT claims vs. API call), and fallback when CIS is unavailable.
  - Suggested docs: `docs/15-identity/api/identities.md`, `docs/10-payments-nucleus/components/canonical-transfer-service.md`
  - Status: Partially complete — CIS docs created; CTS doc updated with CIS references. Resolution API contract still needs formal OpenAPI spec.

- **CIS-issued credentials lifecycle**
  - Description: Document full lifecycle of CIS-issued API keys and JWTs: creation, rotation, revocation, grace periods. Define claim schema (`tenantId`, `merchant_tin`, `outlet_id`, `kycTier`, `cisEntityId`).
  - Suggested docs: `docs/15-identity/api/api-keys.md`, `docs/15-identity/api/auth.md`
  - Status: Completed (CIS Phase 1 docs)

- **CIS merchant onboarding flow**
  - Description: End-to-end onboarding: merchant registration → KYB verification → tier assignment → `tenantId` + `merchant_tin` minting → credential issuance.
  - Suggested docs: `docs/15-identity/howtos/onboard-merchant.md`, `docs/30-integration/merchant-identity.md`
  - Status: Completed (CIS Phase 1 + Phase 2 integration docs)

- **CIS consent management (POPIA/GDPR)**
  - Description: Consent collection, storage, withdrawal, and DSAR flows through CIS. Define which services must check consent before processing PII.
  - Suggested docs: `docs/15-identity/compliance/privacy-gdpr-popia.md`, `docs/15-identity/api/consents.md`
  - Status: Completed (CIS Phase 1 docs)

- **CIS as KYC tier authority**
  - Description: CIS is the single source of truth for KYC tier assignment. CTS, Compliance, and Fiscal cache the tier but never independently verify. Document tier change events (`identity.tier.changed`) and cache invalidation.
  - Suggested docs: `docs/15-identity/concepts/verification-and-policies.md`, `docs/10-payments-nucleus/specs/risk-limits.md`
  - Status: Completed (CIS Phase 1 + Phase 2 specs updated)

- **Tiered limits and velocity controls by KYC level**
  - Description: Policy matrix and enforcement points in CTS/compliance.
  - Suggested docs: `docs/20-specs/risk-limits.md`
  - Status: Completed (see `20-specs/risk-limits.md`)

- **SIM-swap signals, AVS (ZA), bank account name-matching**
  - Description: Risk inputs and integration contracts.
  - Suggested docs: `docs/20-specs/external-integrations.md` (expand)
  - Status: Completed (expanded)

- **PEPs/adverse media local sources**
  - Description: Additional list sources and ingest SLAs.
  - Suggested docs: `docs/10-components/compliance-screening.md` (expand)
  - Status: Completed (expanded)

- **DebiCheck mandates (if pull payments)**
  - Description: Mandate lifecycle, consent storage, return flows.
  - Suggested docs: `docs/10-components/rail-gateway-eft.md` (DebiCheck section)
  - Status: Completed (section added)

---

## Tax and Fees

- **VAT handling (ZA 15%) and ZW tax nuances**
  - Description: Fee lines with tax codes, invoicing artifacts, ledger posting examples.
  - Suggested docs: `docs/20-specs/tax-vat.md`, `docs/10-components/ledger-service.md` (expand)
  - Status: Completed (spec added; ledger note added)

- **Per-rail surcharges and partner fee netting**
  - Description: Posting patterns and reconciliation treatment.
  - Suggested docs: `docs/20-specs/posting-rules.md` (expand)
  - Status: Completed (posting rules expanded)

---

## Operational Realities

- **ZA/ZW holiday calendars in Platform/Base**
  - Description: Ship canonical calendars and banking-day rules (Africa/Johannesburg, Harare).
  - Suggested docs: `docs/10-components/platform-base.md` (expand)
  - Status: Completed (note added)

- **Load-shedding resilience**
  - Description: Backoff policies, offline retries, idempotent replay runbooks.
  - Suggested docs: `docs/40-ops/runbooks.md` (expand), `docs/40-ops/observability.md` (alerts)
  - Status: Completed (sections added)

- **Localization (en/af/zu/xh/st/tn) for Operator Console**
  - Description: i18n strategy and scope of translations.
  - Suggested docs: `docs/10-components/operator-console.md` (expand)
  - Status: Completed (section added)

- **SLA adjustments for telco variability**
  - Description: Timeouts, retry budgets for USSD/STK flows.
  - Suggested docs: `docs/40-ops/observability.md` (expand SLOs)
  - Status: Completed (notes added)

---

## Security and Privacy

- **PCI scope guidance for in-region deployments**
  - Description: Tokenization vendors, containment patterns, SAQ posture.
  - Suggested docs: `docs/40-ops/security.md` (expand)
  - Status: Completed (PCI SAQ guidance added)

- **POPIA DSAR runbooks**
  - Description: Data subject access/erasure flows with legal hold exceptions.
  - Suggested docs: `docs/40-ops/runbooks.md` -> add DSAR section
  - Status: Completed (runbook added)

---

## Documentation and Repo Stubs

- **New gateway component docs (EcoCash, MTN MoMo, Airtel, PayShap, EFT)**
  - Description: Create skeleton pages using `TEMPLATE-component.md`.
  - Suggested docs: `docs/10-components/rail-gateway-*.md`
  - Status: Completed (docs added)

- **Regulatory reporting service**
  - Description: Service doc for goAML/BoP adapters and schedules.
  - Suggested docs: `docs/10-components/regulatory-reporting.md`
  - Status: Completed (doc added)

- **Specs additions (regulatory, risk limits, FX, VAT, alias directory)**
  - Description: Author new spec pages and link from Overview/Specs index.
  - Suggested docs: `docs/20-specs/*.md` (as listed above)
  - Status: Completed (risk-limits, regulatory-reporting, fx-policy, tax-vat, events updated)

- **Ops additions (regulatory, telco resilience)**
  - Description: Runbooks and procedures for reporting and telco constraints.
  - Suggested docs: `docs/40-ops/regulatory.md`, `docs/40-ops/telco-resilience.md`
  - Status: Completed (regulatory ops added; telco notes in observability/runbooks)

---

## Event and Data Model Tweaks

- **Add envelope fields: `kycTier`, `riskScore`, `exchangeControlRef`, `taxCode`, `proxyType`**
  - Description: Optional fields in relevant `transfers.*` events with versioning guidance.
  - Suggested docs: `docs/20-specs/events.md` (expand)
  - Status: Completed (events updated)

- **Directory data for ZA/ZW**
  - Description: Bank codes (ZA), PayShap proxy rules, ZW BIN/member mappings, settlement calendars.
  - Suggested docs: `docs/10-components/directory-routing.md` (expand)
  - Status: Completed (directory expanded)

---

## Diagrams to Add

- **PayShap sequence/state**
  - Description: Proxy resolution, submit, settle, returns.
  - Suggested docs: `docs/30-diagrams/sequence-submit-payshap.mmd`, `state-payshap.mmd`
  - Status: Completed (sequence added)

- **EFT batch sequence**
  - Description: File submit -> settlement -> exceptions.
  - Suggested docs: `docs/30-diagrams/sequence-eft-batch.mmd`
  - Status: Completed (sequence added)

- **EcoCash STK prompt**
  - Description: R2P prompt/accept/settle/return timeline.
  - Suggested docs: `docs/30-diagrams/sequence-stk-ecocash.mmd`
  - Status: Completed (sequence added)

- **BoP reporting pipeline**
  - Description: Event -> aggregation -> submission -> ack/retry.
  - Suggested docs: `docs/30-diagrams/sequence-bop-reporting.mmd`
  - Status: Completed (sequence added)

---

Last updated: 2025-08-27
