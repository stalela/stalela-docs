# Data Flow Diagrams

Stalela paths prioritize a cloud-first fiscal authority. Every canonical payload (merchant_nif, outlet_id, pos_terminal_id, cashier_id, client, items, tax_groups, totals, payments, timestamp) flows through the Cloud Signing Service (HSM) before any fiscal number, signature, timestamp, or QR payload leaves the trusted zone. The diagrams below trace five operational flows described in the architecture specification and highlight how the fiscal ledger, tax engine, and sync agent collaborate with clients.

!!! info "Canonical payload & trust boundary"
    - Clients (web dashboard users, API consumers, SDKs, future POS terminals) remain untrusted; they only present canonical JSON with deterministic field ordering.
    - The Cloud Signing Service (HSM) is the sole authority that assigns fiscal numbers, generates authentication codes, timestamps, and QR payloads, and persists the hash-chained fiscal ledger.
    - Sync Agent uploads sealed invoices to the DGI (MCF/e-MCF); clients may display the security elements but may **never** fabricate or mutate them.

## 1. API invoice creation (happy path)

Developers and automation systems call `POST /api/v1/invoices` to fiscalize a sale. The Stalela Invoicing API validates the payload, runs the 14-group tax engine, and forwards the result to the Cloud Signing Service. The signed response returns to the client immediately while the Sync Agent enqueues the ledger entry for the DGI.

```mermaid
sequenceDiagram
    participant "Merchant / Developer" as Merchant
    participant "Stalela Invoicing API" as InvoicingAPI
    participant "Tax Engine" as TaxEngine
    participant "Cloud Signing Service (HSM)" as CloudSigning
    participant "Fiscal Ledger" as Ledger
    participant "Sync Agent" as SyncAgent
    participant "DGI (MCF/e-MCF)" as DGI
    participant "Client App" as ClientApp

    Merchant->>InvoicingAPI: POST /api/v1/invoices with canonical payload (merchant_nif, outlet_id, pos_terminal_id, cashier_id, client, items, tax_groups, totals, payments, timestamp)
    InvoicingAPI->>TaxEngine: validate schema + compute all 14 DGI tax groups
    TaxEngine->>CloudSigning: forward validated payload for fiscal number + signature
    CloudSigning->>Ledger: persist sealed invoice (fiscal_number, auth_code, timestamp, qr_payload) in hash-chained ledger
    CloudSigning-->>InvoicingAPI: return sealed response with fiscal data
    InvoicingAPI-->>ClientApp: deliver fiscalized invoice + security elements
    CloudSigning->>SyncAgent: queue ledger entry for upload
    SyncAgent->>DGI: transmit sealed invoice batch
```

## 2. Web dashboard invoice creation (browser flow)

Stalela's PWA dashboard mirrors the API flow while adding UX touches for touchscreen terminals. The dashboard still builds the canonical payload, invokes the Invoicing API, and surfaces sealed invoices and delivery options without ever touching fiscal numbers.

```mermaid
sequenceDiagram
    participant "Merchant (Web Dashboard)" as WebMerchant
    participant "Web Dashboard (PWA)" as Dashboard
    participant "Service Worker Queue (IndexedDB)" as SWQueue
    participant "Stalela Invoicing API" as InvoicingAPI
    participant "Cloud Signing Service (HSM)" as CloudSigning
    participant "Fiscal Ledger" as Ledger
    participant "Sync Agent" as SyncAgent
    participant "DGI (MCF/e-MCF)" as DGI

    WebMerchant->>Dashboard: finalize invoice draft (client selection, line items, payments)
    Dashboard->>SWQueue: enqueue canonical payload for online submission
    SWQueue->>InvoicingAPI: POST /api/v1/invoices when connectivity available
    InvoicingAPI->>CloudSigning: fiscalize payload
    CloudSigning->>Ledger: record sealed event
    CloudSigning-->>InvoicingAPI: return fiscalized response
    InvoicingAPI-->>Dashboard: update UI (receipt delivery, QR, fiscal number)
    CloudSigning->>SyncAgent: hand off entry for DGI sync
    SyncAgent->>DGI: upload sealed invoice
```

## 3. Offline client flow (SDK or dashboard)

Offline clients queue invoices locally (IndexedDB for dashboard, SQLite for SDKs) and retry automatic submission when they reconnect. Fiscalization happens only after the payload reaches the Cloud Signing Service, ensuring no sealed invoice is issued while the client remains offline.

```mermaid
sequenceDiagram
    participant "Merchant (SDK)" as SDKMerchant
    participant "Local Queue (IndexedDB/SQLite)" as LocalQueue
    participant "Stalela Invoicing API" as InvoicingAPI
    participant "Cloud Signing Service (HSM)" as CloudSigning
    participant "Fiscal Ledger" as Ledger
    participant "Sync Agent" as SyncAgent
    participant "DGI (MCF/e-MCF)" as DGI

    SDKMerchant->>LocalQueue: save canonical payload (queued, status=Queued)
    LocalQueue-->>LocalQueue: await connectivity (automatic retries)
    LocalQueue->>InvoicingAPI: submit stored payload when online
    InvoicingAPI->>CloudSigning: fiscalize queued payload
    CloudSigning->>Ledger: append sealed invoice
    CloudSigning-->>InvoicingAPI: deliver sealed response
    InvoicingAPI-->>SDKMerchant: notify fiscalized status (green)
    CloudSigning->>SyncAgent: schedule upload
    SyncAgent->>DGI: transmit invoice batch
```

## 4. Void & credit note fiscal events

Voids and refunds are always new fiscal events that reference the original fiscal number. The same tax engine and signing flow produce a fresh fiscal number, ledger entry, and sealed response so auditors can trace both the original and reversal.

```mermaid
sequenceDiagram
    participant "Merchant / Auditor" as MerchantAuditor
    participant "Stalela Invoicing API" as InvoicingAPI
    participant "Cloud Signing Service (HSM)" as CloudSigning
    participant "Fiscal Ledger" as Ledger
    participant "Sync Agent" as SyncAgent
    participant "DGI (MCF/e-MCF)" as DGI

    MerchantAuditor->>InvoicingAPI: POST /api/v1/invoices/{fiscal_number}/void with reference to original and new totals
    InvoicingAPI->>CloudSigning: rerun tax & signing flow for void/credit note
    CloudSigning->>Ledger: append new sealed event (new fiscal_number, QR, auth_code, references original)
    CloudSigning-->>InvoicingAPI: return sealed reversal response
    InvoicingAPI-->>MerchantAuditor: provide void/credit note receipt
    CloudSigning->>SyncAgent: enqueue reversal for DGI
    SyncAgent->>DGI: upload reversal batch
```

## 5. Report generation (auditor view)

Report requests hit Stalela's reporting endpoints that query the Fiscal Ledger for the mandated Z, X, A, and audit export views. Each response includes fiscal_number ranges, auth codes, timestamps, and ledger hashes sourced from the cloud ledger so every report matches the same sealed invoices the Sync Agent uploads.

```mermaid
sequenceDiagram
    participant "Auditor / Merchant" as Auditor
    participant "Stalela Reporting API" as ReportingAPI
    participant "Report Generator" as ReportGenerator
    participant "Fiscal Ledger" as Ledger

    Auditor->>ReportingAPI: POST /api/v1/reports (type=Z/X/A/audit)
    ReportingAPI->>ReportGenerator: fetch ledger entries for requested range
    ReportGenerator->>Ledger: read hash-chained sealed invoices
    Ledger-->>ReportGenerator: return fiscal numbers, auth codes, timestamps, tax totals
    ReportGenerator-->>ReportingAPI: assemble report (JSON + PDF)
    ReportingAPI-->>Auditor: deliver report with fiscal_authority_id and ledger hash
```

## 6. Delegated Offline Signing (Phase 1.5)

To comply with Arrêté 033 in physical retail environments, POS terminals equipped with the Stalela Fiscal Extension can request a Delegated Credential while online. When offline, the extension signs invoices locally within its allocated block. When connectivity returns, the locally-sealed invoices are submitted to the Cloud for reconciliation.

```mermaid
sequenceDiagram
    participant "POS (PWA)" as POS
    participant "Fiscal Extension" as Ext
    participant "Credential Issuer" as Issuer
    participant "Cloud Signing Service" as CloudSigning
    participant "Fiscal Ledger" as Ledger
    participant "Sync Agent" as SyncAgent

    Note over POS,Issuer: 1. Online Provisioning
    POS->>Ext: Request Delegated Credential
    Ext->>Issuer: Send Public Key + Request Block
    Issuer->>Issuer: Allocate Block (#1000-#1500)
    Issuer-->>Ext: Return VC + Block
    
    Note over POS,Ext: 2. Offline Signing
    POS->>POS: Create Invoice JSON
    POS->>Ext: Request Signature
    Ext->>Ext: Validate Origin & Sign Payload
    Ext-->>POS: Return Signature + VC
    POS->>POS: Print Receipt (Locally Sealed)
    
    Note over POS,SyncAgent: 3. Online Reconciliation
    POS->>CloudSigning: Submit Locally-Sealed Invoices
    CloudSigning->>CloudSigning: Verify Signatures against VC
    CloudSigning->>Ledger: Append to Hash-Chained Ledger
    CloudSigning-->>POS: Reconciliation Complete
    CloudSigning->>SyncAgent: Queue for DGI Upload
```
