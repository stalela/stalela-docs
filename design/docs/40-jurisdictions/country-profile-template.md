# Country Profile Template

Use this template when adding a new jurisdiction to the Stalela Fiscal Platform. Copy this folder structure to `40-jurisdictions/{country_code}/` and fill in each section.

---

## Folder Structure

```
40-jurisdictions/{country_code}/
├── index.md                  # Country overview
├── tax-groups.md             # Tax group manifest (codes, rates, decision tree)
├── client-classifications.md # Buyer categories and tax behavior
├── invoice-types.md          # Permitted invoice types
├── currencies.md             # Currency model and rounding rules
├── authority-integration.md  # Tax authority sync protocol
└── regulatory/               # Country-specific legal framework
    ├── legal-framework.md    # Regulatory overview
    └── ...                   # Additional regulatory documents
```

---

## index.md Template

```markdown
# {Country Name} ({ISO Code})

| Field | Value |
|---|---|
| **ISO 3166-1 alpha-2** | `{XX}` |
| **Tax Authority** | {Authority Name} ({Abbreviation}) |
| **Primary Currency** | {CUR} ({Currency Name}) |
| **Secondary Currency** | {CUR2} (if applicable) |
| **Fiscal ID Name** | {Local term} → maps to `merchant_tin` |
| **Languages** | {List of supported languages} |
| **Fiscal Mandate** | {Name of the invoicing mandate or law} |
| **Status** | Planned / In Progress / Active |

## Overview

{Brief description of the country's fiscal compliance requirements and how Stalela addresses them.}

## Key Sections

| Page | Contents |
|---|---|
| [Tax Groups](tax-groups.md) | {N} tax group codes, rates, and decision tree |
| [Client Classifications](client-classifications.md) | Buyer categories and tax behavior |
| [Invoice Types](invoice-types.md) | Permitted fiscal document types |
| [Currencies](currencies.md) | Currency model and rounding rules |
| [Authority Integration](authority-integration.md) | {Authority} sync protocol |
| [Regulatory](regulatory/legal-framework.md) | Legal framework and compliance deadlines |
```

---

## Checklist

- [ ] Country overview (`index.md`) with all metadata fields
- [ ] Tax group manifest with codes, names, rates, and decision tree
- [ ] Client classifications with tax behavior effects
- [ ] Invoice types with local-language labels
- [ ] Currency model with rounding rules
- [ ] Tax authority integration (protocol, endpoints, authentication)
- [ ] Regulatory framework (laws, deadlines, certification requirements)
- [ ] Navigation entry added to `mkdocs.yml`
- [ ] Supported Jurisdictions table updated in `40-jurisdictions/index.md`
