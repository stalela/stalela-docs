# DRC Client Classifications

**Jurisdiction:** DR Congo (`CD`)  
**Authority:** DGI (Direction Générale des Impôts)  
**Source:** SFE Specifications v1.0

---

## Classification Table

The DRC mandates five buyer categories on every fiscal invoice. The classification drives the first branches of the [tax group decision tree](tax-groups.md) and populates `client.classification` in the canonical invoice payload.

| Classification | Code | Description | Tax Behavior |
|----------------|------|-------------|--------------|
| **Individual** | `individual` | Private person (natural person) | Default to TG02/TG03 or TG04 if the catalog marks the line as an essential good. |
| **Company** | `company` | Registered corporation (legal entity with RCCM) | Use any tax group; TG02/TG03 are defaults. |
| **Commercial Individual** | `commercial_individual` | Sole trader (patente holder) | Same as company but carries proprietor ID. |
| **Professional** | `professional` | Licensed professionals (lawyers, doctors, accountants) | Services default to TG03; specify TG04 when the Ministry authorizes the reduced regime. |
| **Embassy** | `embassy` | Diplomatic mission or international organization | Always TG01 (Exempt) unless DGI issues a `tax_override_reason`. |

---

## Validation Rules

1. **Classification is required** — every DRC invoice must include `client.classification`. The Cloud Signing Service rejects invoices without it.
2. **Embassy → TG01** — if classification is `embassy`, the tax engine must force TG01 on all line items unless an explicit `tax_override_reason` is provided by DGI.
3. **NIF requirement** — `company` and `commercial_individual` clients must provide their NIF in `client.tin`. Individual clients may omit it for transactions below the DGI threshold.
4. **RCCM for companies** — the `client.registration_number` field should carry the RCCM number for registered corporations.

---

## Mapping to Generic Platform

| DRC Field | Generic Stalela Field | Notes |
|---|---|---|
| `client.classification` | `client.classification` | Enum values are jurisdiction-specific |
| `client.nif` | `client.tin` | Taxpayer ID of the buyer |
| `client.rccm` | `client.registration_number` | Business registration |
