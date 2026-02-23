# DRC fiscal arrêtés that govern Stalela

Stalela lives inside the tightly regulated world of the Facture Normalisée mandate. Four ministerial orders work together:
- **Arrêté 032/2023** defines the governance and committee that approves architecture, vendors, and timelines.
- **Arrêté 033/2023** lays down the operational requirements for every invoice and device, enforcing the trust boundary that the governance committee supervises.
- **Arrêté 034/2023** regulates who may commercialize devices and software, so the governance committee can evaluate those suppliers.
- **Arrêté 016/2025** patches the commercialization regime defined in 034 while keeping the operational and governance foundations intact.

Each tab below distills one arrêté with the latest implications for Stalela. Cross-links point to related orders so reviewers see how governance, operational rules, commercialization, and amendments intersect.

!!! info "Phased compliance"
    Stalela addresses these regulations in phases: **Phase 1** (Software Invoicing) uses the Cloud Signing Service (HSM) as the trusted fiscal authority. **Phase 3** introduces the USB Fiscal Memory device (DEF) for merchants requiring hardware homologation. The regulatory obligations remain constant across phases — only the trusted signer changes.

=== "Arrêté 032 — Governance"

#### Arrêté n°032/2023 — Governance of the reform {: #arrete-032}

Arrêté 032 does not touch invoices directly; it creates the **Comité de Suivi** with a Steering Committee, Technical Committee, and Technical Secretariat that oversee every design, budget, and deployment decision. It authorizes external technical providers, controls procurement, and appoints the bodies that approve the operational framework in [Arrêté 033](#arrete-033) and the commercialization rules in [Arrêté 034](#arrete-034).

**Key responsibilities**
- Validate the project charter, architecture, and vendor selections.
- House the Technical Committee that drafts specifications, including the Stalela architecture.
- Command the Technical Secretariat to document all decisions and preserve institutional memory.
- Manage political relationships with the DGI, DGDA, and other ministries so that operational changes (e.g., new invoices, reports, or compliance hooks) can roll out in harmony with the enforcement path defined in [Arrêté 033](#arrete-033).

**Stalela implications**
- Every new architecture document (specs, ADRs, APIs) must be up for review by this committee, so keep changelogs and summaries ready.
- Vendor certification requests and pricing disclosures ultimately flow to the same governance body that owns the rules in [Arrêté 034](#arrete-034).
- The Technical Committee can change specs without new legislation; the documentation process must stay flexible to respond to rapid directives.

=== "Arrêté 033 — Operational rules"

#### Arrêté n°033/2023 — Operationalizing the standardized invoice {: #arrete-033}

This is the core operational law. It forces every VAT-registered merchant to issue a **standardized invoice** through an approved system, insists on **physical DEFs or e-UF/e-MCF** fallback pathways, and moves compliance from periodic reporting to **continuous, always-on discipline**.

**Highlights**
- Every transaction must return a sealed invoice with DEF-generated security elements; **no invoice equals non-compliance**, even offline.
- Two parallel enforcement paths: physical USB/DEF devices (UF + MCF) or controlled cloud/electronic systems, both required to keep fallback hardware handy.
- Vendors must certify devices, provide maintenance, and keep audited change logs—feeding back into the governance structure in [Arrêté 032](#arrete-032).
- Device lifecycles are strictly controlled: activation, deactivation, and failure reporting happen under DGI supervision.
- Financial incentives (50% hardware tax credit) accelerate adoption while tightening penalties for misuse.

**Cross-references**
- The governance in [Arrêté 032](#arrete-032) approves the technical architecture that this operational order enforces.
- The supplier certification pipeline in [Arrêté 034](#arrete-034) makes sure only homologated technology appears in this mandate.
- Arrêté 016/2025 (see [below](#arrete-016-2025)) softens supplier scarcity but leaves the obligation to fiscalize every sale unchanged.

**Stalela implications**
- In Phase 1, the Cloud Signing Service (HSM) fulfills the DEF role via software. In Phase 3, the USB device provides hardware-level compliance.
- Offline-first behavior is a legal requirement — not a convenience — so client applications must queue unsigned drafts and submit them once the cloud is reachable.
- Outlet registration, activation, and failure reporting need automation so DGI inspectors see the same data the law demands.

=== "Arrêté 034 — Commercialization and market design"

#### Arrêté n°034/2023 — Licensing fiscal sellers {: #arrete-034}

Arrêté 034 regulates who can sell DEF hardware and SFE software. It institutes a four-role model (DEF, SFE, suppliers, distributors), a multi-stage approval pipeline (agrément → homologation → authorization), strict distributor obligations, and price visibility to keep the market traceable. The first version even limited suppliers to three, creating regional monopolies (later relaxed by [Arrêté 016/2025](#arrete-016-2025)).

**Key rules**
- Suppliers must prove technical, financial, and logistical readiness, maintain 24-month manufacturer partnerships, and undergo homologation every time they change their product.
- Distributors install, train, and support — users cannot self-install, ensuring traceability.
- The tax authority monitors stock, spare parts, pricing, and reporting; any deviation can trigger withdrawal.
- SFE providers must guarantee immutability, security, and archival retention, aligning with the reporting expectations from [Arrêté 033](#arrete-033).

**Stalela implications**
- Homologation planning is critical: almost any firmware or configuration change needs declaration or re-certification.
- Distributor relationships matter; Stalela needs trusted partners to cover installation, training, and maintenance.
- Pricing changes are visible to DGI, so every offer must include a pre-approved price list.
- The governance body in [Arrêté 032](#arrete-032) uses these commercialization metrics to approve vendors, so keep documentation ready.

=== "Arrêté 016/2025 — Amendment to Arrêté 034"

#### Arrêté n°016/2025 — Scaling amendment {: #arrete-016-2025}

This amendment keeps the commercialization controls of Arrêté 034 but fixes key bottlenecks: it removes the three-supplier ceiling, limits approvals to two-year renewable terms, clarifies minor update handling, and tightens distributor accountability while leaving mandatory fiscalization intact.

**What changed**
- Unlimited suppliers (while retaining technical, financial, and coverage thresholds) so the market can scale without artificial scarcity.
- Supplier approvals now expire after two years, introducing planned renewal activities for Stalela.
- Minor software changes can be declared instead of undergoing full re-homologation, reducing friction for SFE iterations noted in [Arrêté 033](#arrete-033).
- Distributor obligations now explicitly cover user onboarding, training, and fair territorial coverage with price discipline still enforced.
- Enterprises may seek conditional exemptions, acknowledging complex ERP/SFE deployments while keeping governance oversight from [Arrêté 032](#arrete-032).

**Stalela implications**
- The path to certification is more realistic, but the two-year cadence demands an approval lifecycle plan.
- Minor updates no longer require major re-certification, so the documentation strategy should categorize changes as "minor" vs. "material" and declare them appropriately.
- Pricing discipline and distributor accountability remain high-priority constraints, so contractual language must reference this order alongside Arrêté 034.
- The amendment is an explicit acknowledgement that the same operational rules in [Arrêté 033](#arrete-033) still apply even as the commercialization regime adapts.
