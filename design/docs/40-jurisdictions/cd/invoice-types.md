# DRC Invoice Types

**Jurisdiction:** DR Congo (`CD`)  
**Authority:** DGI (Direction Générale des Impôts)  
**Source:** SFE Specifications v1.0

---

## Permitted Invoice Types

The DRC SFE specification mandates five invoice types. Each type flows through the same canonical lifecycle (PREPARE → COMMIT → SEAL) documented in the [Invoice Lifecycle](../../20-fiscal-platform/fiscal/invoice-lifecycle.md) page.

| Invoice Type | Code | French Label | Purpose |
|---|---|---|---|
| **Sale Invoice** | `sale` | Facture de vente | Everyday retail/wholesale sales — the default workflow. |
| **Advance Invoice** | `advance` | Facture d'avance | Payments received before goods/services are fulfilled. |
| **Credit Note** | `credit_note` | Note de crédit | Correction for returned goods or billing adjustments; treated as a new fiscal event referencing the original invoice. |
| **Export Invoice** | `export` | Facture d'exportation | Sales destined outside the DRC; routes the invoice to TG07 (Export Zero Rate). |
| **Export Credit Note** | `export_credit` | Note de crédit d'exportation | Refund tied to an export transaction, sequenced independently like all refunds. |

---

## Validation Rules

1. **Type is required** — every DRC invoice must include `invoice_type`. The Tax Engine uses it to validate tax group selection (e.g., `export` → TG07).
2. **Credit notes reference originals** — `credit_note` and `export_credit` invoices must include `original_fiscal_number` linking to the invoice being corrected.
3. **Export proof** — `export` and `export_credit` invoices should carry `export_certificate_ref` metadata for DGI verification.
4. **No deletion** — corrections are always new fiscal events. The original invoice remains immutable in the Fiscal Ledger.
