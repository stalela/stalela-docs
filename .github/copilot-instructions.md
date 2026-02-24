# Stalela — Copilot Instructions

## Product Identity + Phase Boundaries
- Use **Stalela** (never "KutaPay" or "Bono Pay") in docs, code comments, and examples.
- Stalela has **two pillars**: (1) a **Payments Nucleus** (Southern Africa ↔ global payments corridor) and (2) a **Fiscal Invoicing Platform** (multi-jurisdiction tax compliance, DRC-first).
- Phase 1 trust anchor is cloud signing; `kupapay/design/docs-archive/hardware/` is Phase 3 reference only — not part of the current platform.

## Big-Picture Architecture (Read First)
- **Payments Nucleus**: Canonical Transfer Service → Rail Gateways (Zimswitch, OPPWA, USDC/Algorand, M-Pesa, Airtel, EcoCash) → Ledger Service (double-entry) → Compliance Screening → Reconciliation. New-engineer entry point: `stalela-docs/docs/00-overview/nucleus.md`.
- **Fiscal Platform**: Clients submit canonical payloads → `Cloud Signing Service (HSM)` seals them → `Fiscal Ledger` (append-only, hash-chained) stores sealed invoices → `Tax Authority Sync Agent` transmits to DGI or jurisdiction equivalent. Arch root: `stalela-docs/docs/20-fiscal-platform/cloud/architecture.md`.
- Ledger is **append-only**: voids, credit notes, and refunds are new fiscal events — not mutations of existing records.
- Offline signing path: `Fiscal Extension` with `Delegated Offline Token` — bounded semi-trusted, see `stalela-docs/docs/20-fiscal-platform/cloud/offline-sync.md`.

## Domain Invariants (Do Not Break)
- Canonical payload key order must be preserved: `jurisdiction`, `merchant_tin`, `outlet_id`, `pos_terminal_id`, `cashier_id`, `client`, `tax_groups`, `totals`, `payments`.
- Tax groups, client classifications, invoice types, currencies, and rounding rules are **jurisdiction-configured** — loaded from country profiles under `stalela-docs/docs/40-jurisdictions/{ISO-3166-alpha-2}/`.
- DRC (CD) is the reference implementation: 14 tax groups (TG01–TG14), 5 client classifications, 5 invoice types, CDF/USD currencies. All other jurisdictions define their own.
- Fiscal numbering is strictly monotonic per outlet — enforced by `Monotonic Counter Manager` under multi-terminal concurrency.
- Canonical terminology (do not invent synonyms): `Cloud Signing Service`, `Fiscal Ledger`, `Tax Authority Sync Agent`, `Report Generator`, `Delegated Offline Token`, `Canonical Transfer Service`.

## Workflow in This Repository
- **Ralph Loop** drives all doc work: read `kupapay/IMPLEMENTATION_PLAN.md`, find the **first** `READY` task, execute it, mark `DONE`, commit, exit. Do not start the next task.
- **Build & validate docs**: `cd stalela-docs && mkdocs build` (fix broken refs before merging).
- **Local dev server**: `cd stalela-docs && mkdocs serve` → http://127.0.0.1:8000/
- **Dependencies**: `pip install -r stalela-docs/requirements.txt` (`mkdocs`, `mkdocs-material`, `pymdownx`).
- **Automation**: `python kupapay/.github/cookbook/copilot-sdk/python/recipe/ralph_loop.py build 50`.
- **Commit convention**: `docs: [TASK-ID] short description` (e.g., `docs: TASK-012 rewrite trust-boundary`).
- **Deployment**: `stalela-docs/vercel.json` auto-deploys to `https://stalela-docs.vercel.app/` on push to `main`.

## Two-Repo Structure (Current) → Monorepo (Planned)
- **Current state**: `kupapay/` (planning workspace) + `stalela-docs/` (live docs site) — two separate repos.
- **Planned target**: a single `stalela` monorepo. See `stalela-docs/docs/10-payments-nucleus/repo-structure/monorepo.md` for the intended layout (`services/`, `gateways/`, `apps/`, `libs/`, `infra/`, `tools/`, `docs/`).
- `kupapay/design/docs/` is the kupapay-era source — preserved for reference, superseded by `stalela-docs/docs/`.
- `site/` in either repo is a build artifact — never edit directly.

## Integration Points + Unknowns
- `Tax Authority Sync Agent` boundary is jurisdiction-specific. DRC uses DGI (MCF/e-MCF); other jurisdiction protocols are unconfirmed — mark as **blockers**, do not invent them (see `stalela-docs/docs/20-fiscal-platform/cloud/authority-sync.md`).
- WhatsApp is a delivery/query channel only — preserve `source: "whatsapp_bot"` in audit logs; it is not a trust anchor.
- Mobile money rails update payment state only — they have no role in fiscal trust logic.
- Keep unknowns explicit in docs/specs rather than inventing payload formats or authority protocol details.

## Documentation Conventions
- Quote all Mermaid node labels containing parentheses, slashes, or commas: `["Node (A/B)"]`.
- One concept per file; lowercase hyphen-separated filenames.
- New doc pages must be added to `stalela-docs/mkdocs.yml` nav or they won't appear in the site.
- After significant doc changes, update `kupapay/memory-bank/activeContext.md` and `progress.md`.

## Jurisdiction Model
- Country profiles: `stalela-docs/docs/40-jurisdictions/{ISO-3166-alpha-2}/`. Template: `country-profile-template.md`.
- Active: CD (DRC). Stubs (research needed): ZW, KE, RW, TZ, NG, ZA.
- Universal field name is `merchant_tin`; DRC's local term is NIF — map in the DRC country profile only, not globally.
