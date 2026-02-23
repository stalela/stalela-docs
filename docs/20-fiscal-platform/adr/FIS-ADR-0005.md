# ADR-0005: Strategic Pivot — API-First Invoicing Platform

## Status
Accepted

## Context
- Stalela was originally designed as a POS-hardware-first product: a Progressive Web App paired with a USB Fiscal Memory device (DEF) at every point of sale. The USB device was the trusted fiscal authority, signing invoices locally via the PREPARE → COMMIT protocol. The cloud layer existed primarily to sync sealed invoices to the DGI.
- After initial design work (42-task implementation plan, UX wireframes, hardware specifications, protocol definitions), the team concluded that the hardware-first approach created an unacceptable time-to-market delay:
    - USB firmware development, secure element integration, and DGI homologation require 9–12 months before any merchant can issue a single fiscal invoice.
    - Per-device BOM cost ($10–15) and physical deployment logistics create barriers for the initial pilot.
    - The Phase 1 target segment (B2B service companies, wholesalers, schools) generates invoices from accounting software and web interfaces — they do not operate POS terminals and have no use for USB hardware.
- Competitor analysis shows that similar fiscal compliance platforms in other markets (Rwanda's EBM, Kenya's TIMS) have succeeded with cloud-first approaches, adding hardware options later for specific retail segments.

## Options

1. **Pivot to API-first invoicing platform with phased hardware introduction (selected)**
   - Phase 1: Cloud Signing Service (HSM) as the trusted fiscal authority. REST API + web dashboard + SDKs for B2B pilot.
   - Phase 2: Add POS SDK and mobile money for retail segment. POS terminals are API consumers, not USB mediators.
   - Phase 3: Introduce USB Fiscal Memory device (DEF) as an optional alternative signer for merchants requiring DGI hardware homologation.
   - Phase 4: Enterprise features — ERP connectors, fleet management, analytics.
   - Pros: Fastest path to market (3 months to Phase 1 pilot). Addresses the largest segment first (B2B). Cloud HSM delivers the same five security elements without hardware. USB hardware remains available for merchants that need it.
   - Cons: No offline fiscalization until Phase 3. Requires cloud infrastructure investment from day one.

2. **Continue with hardware-first approach (original plan)**
   - Pros: Offline fiscalization from day one. Full DGI hardware compliance.
   - Cons: 9–12 month delay. Hardware supply chain risk. Misaligned with Phase 1 target segment. Higher upfront capital required.

3. **Hybrid: ship cloud and hardware in parallel**
   - Pros: Both segments addressed simultaneously.
   - Cons: Doubles the team's focus and development surface. Risk of shipping neither well. Same hardware timeline constraints apply.

## Decision
Pivot Stalela from a POS-hardware-first product to an **API-first fiscal invoicing platform** (think Stripe Invoices for DRC). The phasing is:

| Phase | Name | Duration | Trust anchor |
|-------|------|----------|-------------|
| 1 | Software Invoicing | 3 months | Cloud Signing Service (HSM) |
| 2 | POS & Retail | 3 months | Cloud Signing Service (HSM) |
| 3 | USB Hardware | 6 months | Cloud HSM + optional DEF |
| 4 | Enterprise & Integrations | 6 months | Cloud HSM + optional DEF |

The Cloud Signing Service (HSM) is the primary fiscal authority from Phase 1 onward. The USB Fiscal Memory device becomes an optional trust anchor in Phase 3, not a prerequisite. All hardware design documents are preserved in `docs-archive/hardware/` for Phase 3 reference.

## Consequences
- **Architecture:** The cloud is the trusted half; client apps are untrusted. The Cloud Signing Service, Fiscal Ledger, and Monotonic Counter Manager are the core fiscal components. The USB device proxy is deferred to Phase 3.
- **Documentation:** All existing docs are rewritten for the cloud-first model. POS-specific docs (`pos/multi-terminal.md`, `pos/ui-ux.md`, `pos/integrations.md`, `api/pos-plugin.md`) are archived to `docs-archive/`. ADR-0003 is revised from "POS Technology Stack" to "Platform Technology Stack."
- **Product identity:** Stalela is positioned as fiscal invoicing infrastructure (like Stripe Invoices), not a POS system. Marketing, sales, and documentation reflect this identity.
- **Risk:** If the DGI mandates hardware-based fiscal signing for all merchants before Phase 3, the USB development timeline must be accelerated. The cloud-first architecture is designed to accommodate the DEF as a drop-in alternative signer without rearchitecture.
- **Team focus:** Phase 1 development focuses entirely on cloud infrastructure, REST API, web dashboard, and SDKs. No hardware or firmware work until Phase 3.

## Review
Reevaluate if: (1) Phase 1 pilot feedback reveals that the target segment requires offline fiscalization (Note: This trigger was activated, leading to [ADR-0006](FIS-ADR-0006.md) for Delegated Offline Signing), (2) the DGI publishes regulations mandating hardware-only fiscal signing, or (3) a competitor captures the B2B segment before Stalela reaches market.
