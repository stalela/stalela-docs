# ADR-0003: Platform Technology Stack

### Decision - 2026-02-17 (revised 2026-06-01)
**Decision**: Build Stalela as a cloud-first invoicing platform with a REST API, web dashboard, and client SDKs (JavaScript / Python) — replacing the original PWA + local fiscal daemon architecture that assumed USB hardware from day one.

**Context**:
- The strategic pivot (see ADR-0005) moves Stalela from a POS-hardware-first product to an API-first invoicing platform (think Stripe Invoices for DRC fiscal compliance). Phase 1 targets B2B service companies, wholesalers, and schools that need sealed fiscal invoices without deploying POS terminals or USB devices.
- The Cloud Signing Service (HSM) is the trusted fiscal authority in Phase 1. Client applications are untrusted — they submit canonical payloads and receive sealed responses containing fiscal numbers, signatures, timestamps, and QR codes.
- The platform must support two client surfaces from launch: a REST API for programmatic integrations and a web dashboard for manual invoice management.
- Offline-first remains non-negotiable: client apps queue unsigned drafts locally (IndexedDB/Service Worker for web, SQLite for SDKs) and submit them when connectivity returns. Fiscalization only happens in the cloud.
- Phase 2 adds POS terminals as API consumers. Phase 3 optionally introduces the USB Fiscal Memory device (DEF) as an alternative signer. The technology stack must accommodate these future layers without rearchitecture.

**Options**:
1. **REST API + Web Dashboard + Client SDKs (selected)**
   - Pros: Fastest path to market for B2B pilot. REST API is universally understood and integrates with any language or ERP. Web dashboard provides immediate value without installation. SDKs (JavaScript, Python) abstract API complexity and enable offline queuing. Cloud HSM centralizes the trust boundary — no local daemon needed for Phase 1.
   - Cons: Requires cloud infrastructure from day one (HSM, database, sync agent). No offline fiscalization until Phase 3 introduces the DEF.

2. **PWA + Local Fiscal Daemon (original architecture)**
   - Pros: Enables offline fiscalization via the USB device. Single codebase runs on tablets, phones, and desktops.
   - Cons: Requires USB hardware from day one, which delays market entry. Local daemon adds deployment complexity. Not suitable for API-first B2B integrations (service companies, schools). Assumes POS UX that most Phase 1 customers don't need.

3. **GraphQL API instead of REST**
   - Pros: Flexible querying for complex invoice structures. Single endpoint simplifies versioning.
   - Cons: Adds complexity for simple CRUD operations. Tooling ecosystem is smaller in the DRC developer community. Over-engineering for the current feature set.

4. **Mobile-first native apps (iOS/Android)**
   - Pros: Best mobile UX. Direct access to device hardware (camera for QR scanning, NFC).
   - Cons: Two codebases to maintain. App store distribution delays updates. Most Phase 1 customers (B2B) prefer web/API access over mobile apps.

**Rationale**: The REST API + Web Dashboard + SDKs stack aligns with the API-first strategy. It delivers the fastest path to the B2B pilot (Phase 1) without requiring USB hardware or POS terminals. The cloud HSM centralizes the trust boundary, eliminating the need for a local fiscal daemon in Phase 1. JavaScript and Python SDKs cover the majority of integration scenarios in the DRC market. The web dashboard (built as a standard SPA) provides immediate value for merchants who prefer manual invoice management. This stack naturally extends to Phase 2 (POS terminals become API consumers) and Phase 3 (USB device proxy communicates with the same Cloud API).

**Impact**:
- Cloud infrastructure (HSM, PostgreSQL, Redis, message queue) must be provisioned and secured from Phase 1.
- REST API design follows the canonical payload contract documented in `api/cloud.md`.
- Web dashboard is a standard SPA (React or Vue) that consumes the same REST API as external integrators.
- SDKs implement offline queuing (IndexedDB/SQLite), idempotency (payload hash + `Idempotency-Key` header), and automatic retry logic.
- The local fiscal daemon from the original architecture is deferred to Phase 3 as the USB Device Proxy, scoped to outlets that opt into DEF signing.

**Review**: Reevaluate if Phase 1 pilot feedback indicates that offline fiscalization (without cloud connectivity) is a hard requirement for the initial market segment, which would accelerate Phase 3 USB hardware delivery.
