---
title: Architecture Overview
---

# Architecture Overview

Stalela is fiscal invoicing infrastructure for the DRC. This page explains the cloud-first architecture that treats the Cloud Signing Service as the trusted authority, keeps clients in the untrusted zone, and preserves offline behavior inspired by the Odoo lessons (PWA, service workers, IndexedDB queues). We describe who interacts with Stalela, why the trust boundary matters, and how the layered components work together to produce sealed invoices, reports, and DGI-ready data.

## System Context (C4)

Merchants, developers, and auditors rely on Stalela to fiscalize commerce, document every fiscal event, and surface auditable reports, while the platform shares sealed invoices with the DGI and notifies payment partners about settlement status. The context diagram keeps these actors, the Stalela Platform services, and the external systems visible so newcomers can trace how requests flow from the client to the fiscal authority.

```mermaid
flowchart LR
    Merchant["Merchant / Finance Team"]
    Developer["Developer / Integration"]
    Auditor["Auditor / Regulator"]
    Stalela["Stalela Platform\n(Invoicing API + Dashboard + Cloud Signing + Sync)"]
    DGI["DGI (MCF / e-MCF)"]
    Payment["Payment Providers"]
    Merchant -->|Creates invoices & monitors dashboards| Stalela
    Developer -->|Builds API/SDK integrations| Stalela
    Auditor -->|Requests Z/X/A/audit exports| Stalela
    Stalela -->|Sealed invoice + security elements| DGI
    Stalela -->|Payment status, webhooks, receipts| Payment
```

## Trust Boundary

The Cloud Signing Service (HSM-backed) is the root of trust. However, to support offline retail compliance (Arrêté 033), Stalela introduces a third trust mode: **Delegated Offline Signing**. 

Client applications (Web Dashboard, API consumers, SDKs) are generally untrusted. They prepare canonical payloads (mandated identifiers, deterministic field ordering, 14 DGI tax groups). 
* **Online Mode:** Clients send payloads to Stalela Cloud. The Cloud Signing Service validates the payload, consults the Tax Engine, coordinates with the Monotonic Counter Manager, and produces the five security elements (fiscal number, fiscal authority ID, authentication code, trusted timestamp, QR payload).
* **Delegated Offline Mode:** A POS terminal equipped with the **Stalela Fiscal Extension** can request a short-lived "Delegated Credential" and a block of fiscal numbers while online. When offline, the extension acts as a semi-trusted, bounded signer, generating the security elements locally. These locally-sealed invoices are later reconciled with the Cloud Ledger.

Clients without a delegated credential must queue unsigned drafts locally and wait for connectivity. Clients may only display or deliver security elements and must never fabricate them outside of the strict delegated extension sandbox.

```mermaid
flowchart LR
    subgraph "Untrusted Zone"
        Dashboard["Web Dashboard (PWA)"]
        API["API Consumers"]
        SDK["SDK & Libraries"]
    end
    subgraph "Semi-Trusted Zone (Bounded)"
        FiscalExt["Fiscal Extension (Delegated Signer)"]
    end
    subgraph "Trusted Zone (Root)"
        Signer["Cloud Signing Service (HSM)"]
        CredIssuer["Credential Issuer"]
        Tax["Tax Engine"]
        Counter["Monotonic Counter Manager"]
        Ledger["Fiscal Ledger"]
        Reports["Report Generator (Z/X/A + audit)"]
        Sync["Sync Agent"]
    end
    Dashboard -->|Canonical payload| Signer
    Dashboard -->|Payload for local signing| FiscalExt
    FiscalExt -->|Locally-sealed invoices| Signer
    API -->|Invoice requests| Signer
    SDK -->|Queued drafts & retries| Signer
    CredIssuer -->|Issues VC + Block| FiscalExt
    Counter --> Signer
    Counter --> CredIssuer
    Tax --> Signer
    Signer --> Ledger
    Ledger --> Reports
    Ledger --> Sync
    Reports --> Sync
    Sync -->|Sealed payload uploads| DGI["DGI (MCF / e-MCF)"]
```

!!! note
    The trust boundary is enforced by the Cloud Signing Service (HSM) and the Credential Issuer. See [Delegated Offline Token Architecture](delegated-offline-token.md) for details on how the Fiscal Extension securely signs offline. Phase 3 reserves a role for the archived USB Fiscal Memory device as an optional hardware trust anchor.

## Component Map

The Stalela platform is composed of four layers: clients that originate invoices, platform services that normalize and secure requests, the fiscal core where signing happens, and external integrations that consume sealed data. The component diagram below highlights how sales data flows from dashboards or SDKs into canonical serializers, travels through multi-user policies, reaches the Cloud Signing Service, and finally feeds the fiscal ledger, reports, and sync agents.

```mermaid
graph LR
    subgraph "Client Layer"
        Dashboard["Web Dashboard (PWA)"]
        APICl["API Consumers"]
        SDKs["SDK & Libraries"]
        Mobile["Mobile App (PWA)"]
        FuturePOS["Future POS / Terminals"]
    end
    subgraph "Platform Services"
        Canonical["Canonical Serializer"]
        Invoicing["Invoicing API"]
        TaxEngine["Tax Calculation Engine"]
        MultiAccess["Multi-User Access Control (API keys, roles, outlets)"]
        Delivery["Receipt Delivery (email/WhatsApp/PDF/print)"]
    end
    subgraph "Fiscal Core (Trusted)"
        Signer["Cloud Signing Service (HSM)"]
        Counter["Monotonic Counter Manager"]
        Ledger["Hash-Chained Fiscal Ledger"]
        Reports["Report Generator (Z/X/A + audit)"]
    end
    subgraph "External"
        SyncAgent["DGI Sync Agent"]
        Payment["Payment Gateway / Notification Service"]
    end

    Dashboard --> Canonical
    APICl --> Canonical
    SDKs --> Canonical
    Mobile --> Canonical
    FuturePOS --> Canonical
    Canonical --> Invoicing
    MultiAccess --> Invoicing
    Invoicing --> TaxEngine
    TaxEngine --> Signer
    Canonical --> Signer
    Signer --> Counter
    Signer --> Ledger
    Ledger --> Reports
    Reports --> Delivery
    Delivery --> Payment
    Ledger --> SyncAgent
```

## Operational Notes

- **Offline resilience:** Clients use IndexedDB/SQLite queues, service workers, and other Odoo-inspired PWA patterns so tablets can keep capturing invoices even when disconnected. Queued payloads include canonical identifiers (`merchant_nif`, `outlet_id`, `pos_terminal_id`, `cashier_id`, `client`, `tax_groups`, `totals`, `payments`) plus metadata about the user or API key. When connectivity returns, invoices are retried against the Invoicing API and fiscalized by the Cloud Signing Service.
- **Sequential numbering:** The Monotonic Counter Manager enforces serializable isolation per outlet, so every tenant sees strictly increasing fiscal numbers even under concurrent crews, multi-user dashboards, or SDK threads.
- **Security elements & reporting:** The Cloud Signing Service (HSM) never hands out fiscal numbers, signatures, timestamps, or QR payloads to clients; it stores the sealed events in the hash-chained ledger, feeds the Report Generator with Z/X/A/audit exports, and surfaces ledger hashes for compliance reviews.
- **Sync & notifications:** The Sync Agent uploads sealed invoices to the DGI (MCF/e-MCF) and exposes statuses via webhook notifications plus the dashboard's green/yellow/red telemetry. Payment Providers receive delivery updates but never see confidential signing secrets.
- **Phase 3 reminder:** When DEF homologation is required, the archived USB Fiscal Memory device takes over signing for that outlet, but the cloud ledger continues to mirror its outputs for auditability. Until then, the Stalela Cloud remains the trusted fiscal authority that developers and finance teams rely on.
