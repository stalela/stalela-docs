# Stalela Technical Design Documentation

Stalela is a multi-jurisdiction fiscal invoicing platform that creates, validates, signs, and synchronizes invoices across different countries' fiscal mandates. The platform supports configurable tax rules, authority integrations, and compliance requirements per jurisdiction — starting with the DRC's Facture Normalisée and expanding across Sub-Saharan Africa. Invoices are sealed by a cloud signing service backed by an HSM, then synced to the jurisdiction's tax authority while clients queue requests offline and deliver sealed receipts.

The platform combines an API-first invoicing surface (REST + SDKs), a web dashboard, a cloud signing service backed by an HSM, and a resilient sync agent that delivers sealed invoices to each jurisdiction's tax authority. AI capabilities — natural language invoice creation, tax auto-classification, and anomaly detection — are embedded across the platform, while a public verification portal lets anyone confirm an invoice's authenticity by scanning its QR code. Each section below shows how Stalela enforces fiscal compliance while keeping the developer experience modern and familiar.

## Supported Jurisdictions

| Code | Country | Authority | Status |
|---|---|---|---|
| **CD** | DR Congo | DGI | Active — [Country Profile →](../40-jurisdictions/cd/index.md) |
| **ZW** | Zimbabwe | ZIMRA | Planned — [Stub →](../40-jurisdictions/zw/index.md) |
| **KE** | Kenya | KRA | Planned — [Stub →](../40-jurisdictions/ke/index.md) |
| **RW** | Rwanda | RRA | Planned — [Stub →](../40-jurisdictions/rw/index.md) |
| **TZ** | Tanzania | TRA | Planned — [Stub →](../40-jurisdictions/tz/index.md) |
| **NG** | Nigeria | FIRS | Planned — [Stub →](../40-jurisdictions/ng/index.md) |
| **ZA** | South Africa | SARS | Planned — [Stub →](../40-jurisdictions/za/index.md) |

See the full [Jurisdictions Framework](../40-jurisdictions/index.md) for details on how country profiles are structured and how to add new jurisdictions.

## Key sections
- **Architecture:** System overview, trust boundary, component map, and data flows that explain how client applications interact with the Cloud Signing Service, fiscal ledger, and tax authority sync agent.
- **Identity:** Merchant identity management, KYB verification, and user/API key provisioning are handled by the [Customer Identity Service (CIS)](../15-identity/index.md), which is the source of truth for `merchant_tin` assignment and credential issuance across both pillars.
- **Invoicing Platform:** Product overview, API walkthrough, web dashboard experience, SDKs, multi-user controls, and [AI-powered capabilities](platform/ai-capabilities.md) including natural language invoice creation, tax auto-classification, and anomaly detection.
- **Fiscal Engine:** Invoice lifecycle rules, jurisdiction-configured tax groups, canonical payload schema, mandatory security elements, reports (Z/X/A/audit), and [public invoice verification](fiscal/invoice-verification.md) via QR code or fiscal number.
- **Cloud & Sync:** Cloud architecture, offline-first sync logic, resilience to connectivity loss, and [tax authority integration](cloud/authority-sync.md) requirements.
- **Platform & Integrations:** Multi-user/multi-tenant access controls, integration playbooks, and partner-ready libraries.
- **Jurisdictions:** Country-specific profiles containing tax groups, client classifications, invoice types, currencies, and authority integration protocols. See [Jurisdictions →](../40-jurisdictions/index.md).
- **ADRs:** Authoritative decisions about architecture, signing, security, and platform strategy.
- **Implementation:** Roadmap, [Kanban Board](implementation/kanban.md) with epic-level status, phase summaries, and execution guidance for shipping the software invoicing platform.
- **API Reference:** Open endpoints for invoice creation, listing, voiding, and refunding, plus SDK guidance for integrating with Stalela.

## Phase roadmap summary
1. **Phase 1 – Software Invoicing:** API-first invoicing platform with cloud fiscal signing, tax engine coverage, and dashboard controls.
2. **Phase 2 – POS & Retail:** Multi-terminal retail/restaurant extensions with optional local fiscal services that coordinate with the cloud.
3. **Phase 3 – USB Hardware:** Optional USB Fiscal Memory device for DEF homologation, serving as a trust anchor for high-compliance merchants.
4. **Phase 4 – Enterprise:** ERP integrations, analytics, and scaling across outlets, fleets, and geographies.

## Design principles (inspired by field research)
- **Offline-first confidence:** Clients can cache catalogs and queue requests, but fiscal finality is achieved via the cloud signing service once connectivity returns.
- **PWA-friendly:** Build the dashboard and POS clients as progressive web apps that load fast, work across devices, and feel native on tablets.
- **Mobile-optimized:** Prioritize the lowest-cost Android tablets, large touch targets, and minimal text entry so merchant staff can move quickly.
- **Multi-currency:** Each jurisdiction declares its supported currencies and rounding rules. DRC supports CDF/USD dual-currency; other jurisdictions declare their own.
- **Mobile money native:** Embed jurisdiction-specific mobile money providers (Airtel Money, M-Pesa, Orange Money, EcoCash, etc.) into the payment flow as first-class citizens.
- **Jurisdiction-configurable:** Tax groups, client classifications, invoice types, currency rounding, and authority sync protocols are all driven by the active jurisdiction profile.

## How to use this documentation
1. Start with the **Architecture** section to internalize the trust boundary between untrusted clients and the Cloud Signing Service.
2. Explore the **Invoicing Platform**, **Fiscal Engine**, and **Cloud & Sync** pages to understand the lifecycle of a sealed invoice.
3. Check the **Jurisdictions** section for country-specific tax groups, client classifications, and authority integration details.
4. Consult the **ADR** folder when you need compliance rationale or formal decisions.
5. Drop into **Implementation** and **API Reference** when planning integrations, rollouts, or partner onboarding.
