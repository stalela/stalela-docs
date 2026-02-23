# DR Congo (CD)

| Field | Value |
|---|---|
| **ISO 3166-1 alpha-2** | `CD` |
| **Tax Authority** | DGI (Direction Générale des Impôts) |
| **Primary Currency** | CDF (Congolese Franc) |
| **Secondary Currency** | USD (United States Dollar) |
| **Fiscal ID Name** | NIF (Numéro d'Identification Fiscale) → maps to `merchant_tin` |
| **Languages** | French (primary), Lingala, Swahili, Tshiluba |
| **Fiscal Mandate** | Facture Normalisée (Standardized Invoice) |
| **Status** | **Active — reference implementation** |

---

## Overview

The Democratic Republic of Congo mandates that every VAT-registered merchant issue **standardized invoices** (Facture Normalisée) through an approved billing system. The DGI (Direction Générale des Impôts) enforces a layered compliance chain: SFE → DEF → MCF/e-MCF → DGI, with 14 tax groups, five invoice types, and mandatory security elements on every fiscal document.

Stalela's Fiscal Platform implements DRC compliance as its first jurisdiction profile. In Phase 1, the Cloud Signing Service (HSM) acts as the trusted fiscal authority. In Phase 3, an optional USB Fiscal Memory device (DEF) can serve as the local trust anchor for merchants requiring hardware homologation.

---

## Key Sections

| Page | Contents |
|---|---|
| [Tax Groups](tax-groups.md) | 14 DGI tax groups (TG01–TG14) with rates and decision tree |
| [Client Classifications](client-classifications.md) | 5 DRC-mandated buyer categories |
| [Invoice Types](invoice-types.md) | 5 DRC invoice document types |
| [Currencies](currencies.md) | CDF/USD dual currency model and rounding rules |
| [Authority Integration](authority-integration.md) | DGI MCF/e-MCF sync protocol |
| [Regulatory](regulatory/legal-framework.md) | DRC legal framework, arrêtés, and SFE specifications |

---

## DRC-Specific Terminology Mapping

| DRC Term | Stalela Generic Term | Notes |
|---|---|---|
| NIF (Numéro d'Identification Fiscale) | `merchant_tin` | Unique taxpayer ID assigned by DGI |
| DGI (Direction Générale des Impôts) | Tax Authority | Central tax enforcement agency |
| Facture Normalisée | Sealed Invoice | Legally compliant fiscal document |
| DEF (Dispositif Électronique Fiscal) | Fiscal Memory Device | USB hardware trust anchor (Phase 3) |
| SFE (Système de Facturation d'Entreprise) | Enterprise Billing System | DGI certification standard |
| MCF / e-MCF | Tax Authority Sync Protocol | Data upload protocol to DGI |
| Comité de Suivi | Governance Committee | Oversight body for the reform |

---

## Compliance Phases

| Phase | Scope | DRC Compliance Approach |
|---|---|---|
| **Phase 1** | Software Invoicing | Cloud HSM generates all security elements. Meets SFE requirements via software. |
| **Phase 2** | POS & Retail | POS terminals connect as API consumers. Cloud remains fiscal authority. |
| **Phase 3** | USB Hardware (DEF) | Optional USB device signs invoices locally. Full hardware homologation path. |
| **Phase 4** | Enterprise | ERP integrations built on the established fiscal platform. |
