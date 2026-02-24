# ADR-0004: Cloud Fiscal Signing (HSM)

## Status
Accepted (Amended by [ADR-0006](FIS-ADR-0006.md) for offline retail signing)

## Context
- The DRC's Facture Normalisée regime requires every commercial invoice to carry five security elements: sequential fiscal number, fiscal authority ID, cryptographic authentication code, trusted timestamp, and QR code (see `fiscal/security-elements.md`).
- The original architecture assumed that a USB Fiscal Memory device (DEF) would generate these elements locally at each point of sale. This approach requires hardware procurement, firmware development, DGI homologation, and physical deployment to every merchant outlet before any invoices can be sealed — a 9–12 month critical path.
- Stalela's Phase 1 targets B2B service companies, wholesalers, and schools that generate invoices from web dashboards and API integrations. These users do not operate POS terminals and have no need for local USB hardware.
- An HSM-backed cloud signing service can deliver the same five security elements without requiring local hardware. The Cloud Signing Service becomes the trusted fiscal authority: it assigns fiscal numbers via a Monotonic Counter Manager, signs payloads with ECDSA P-256 keys stored in the HSM, generates trusted timestamps from NTP-synced infrastructure, and produces verification QR codes.

## Options

1. **Cloud Signing Service (HSM) as primary fiscal authority (selected)**
   - Pros: Zero hardware dependency for Phase 1. Fastest path to market. Centralized key management eliminates key distribution complexity. Monotonic Counter Manager with serializable database isolation guarantees sequential fiscal numbering even under concurrent multi-terminal load. Cloud HSMs (AWS CloudHSM, Azure Dedicated HSM, or self-hosted) provide FIPS 140-2 Level 3 key protection. All fiscalization logic is centralized, simplifying audits.
   - Cons: Requires internet connectivity for fiscalization (mitigated by offline queuing — unsigned drafts are submitted when connectivity returns). Cloud infrastructure must be highly available and secure. No offline fiscalization until Phase 3 introduces the optional DEF.

2. **USB Fiscal Memory device (DEF) as day-one requirement (original architecture)**
   - Pros: Enables offline fiscalization at the point of sale. Aligns with traditional DGI expectations for hardware-based fiscal memory. Keys never leave the device.
   - Cons: 9–12 month delay for firmware development, supply chain, and DGI homologation. Per-device cost ($10–15 BOM) creates a barrier for B2B pilot. Not needed by Phase 1's target segment (service companies, schools). Physical deployment and maintenance complexity in DRC conditions.

3. **Software-only signing (no HSM)**
   - Pros: Simplest implementation — signing keys stored in application memory or encrypted at rest.
   - Cons: Keys are exposed to the application runtime, violating the trust boundary principle. No hardware-backed key protection. Would not satisfy DGI expectations for tamper-resistant signing. Unacceptable security posture for fiscal infrastructure.

## Decision
Adopt an HSM-backed Cloud Signing Service as the primary fiscal authority for Phase 1 (and beyond). The Cloud Signing Service:

- Stores ECDSA P-256 signing keys inside an HSM boundary; keys never leave the HSM.
- Assigns sequential fiscal numbers via the Monotonic Counter Manager using serializable database isolation (`SELECT ... FOR UPDATE` within a serializable transaction).
- Signs canonical payloads and returns sealed responses containing all five security elements.
- Generates verification QR codes encoding `fiscal_number`, `auth_code`, `timestamp`, and verification URL.
- Writes every sealed invoice to the append-only, hash-chained Fiscal Ledger.

In Phase 3, the USB Fiscal Memory device (DEF) is introduced as an **optional alternative signer** for merchants requiring DGI hardware homologation. Both signers produce structurally identical sealed responses and write to the same Fiscal Ledger.

## Consequences
- Client applications (web dashboard, REST API, SDKs) are untrusted. They submit canonical payloads and receive sealed responses. They may display security elements but never fabricate them.
- Internet connectivity is required for fiscalization. Clients queue unsigned drafts locally (IndexedDB, SQLite) and submit them when online. The Cloud Signing Service is the only entity that can produce valid fiscal numbers and signatures.
- Cloud HSM infrastructure must meet high availability targets (99.9%+ uptime). Key ceremony, backup, and rotation procedures must be documented.
- The Monotonic Counter Manager must handle concurrent requests from multiple outlets without producing gaps or duplicates in fiscal numbering sequences.
- Phase 3's USB Device Proxy communicates with the same Cloud API, routing payloads to the local DEF instead of the Cloud HSM based on outlet configuration.
- If the DGI mandates hardware-based signing for all merchants (not just those seeking DEF homologation), Phase 3 delivery must be accelerated.

## Review
Reevaluate if: (1) the DGI publishes regulations that explicitly require hardware-based signing for all merchants, (2) Phase 1 pilot merchants report that cloud-only connectivity is insufficient for their operations, or (3) HSM infrastructure costs exceed projections and a hybrid approach becomes more economical.
