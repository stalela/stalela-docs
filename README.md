# Stalela Documentation Repo

This repository is the **single source of truth** for the Stalela nucleus design, components, specifications, and operations.

---

## 📂 Structure

```
docs/
├─ 00-overview/         # Executive summary, nucleus, glossary, ADRs
├─ 10-components/       # Component deep dives
├─ 20-specs/            # Event catalog, API schemas, posting rules, data retention
├─ 30-diagrams/         # Mermaid diagrams (component, state, sequence)
├─ 40-ops/              # Runbooks, observability, security
├─ 90-templates/        # Reusable templates for docs
```

---

## 🧭 How to Navigate

- **New engineers** → start with `00-overview/nucleus.md`.  
- **Component owners** → see `10-components/`.  
- **Operators** → see `40-ops/`.  
- **Design reviewers** → see `00-overview/architecture-decisions/`.  

---

## 🖼 Diagrams

All diagrams are written in [Mermaid](https://mermaid-js.github.io/).  
GitHub renders them inline in Markdown. You can also compile them:

```bash
npm install -g @mermaid-js/mermaid-cli
mmdc -i docs/30-diagrams/component-nucleus.mmd -o component-nucleus.png
```

---

## 🚀 MkDocs Site

This repo includes a `mkdocs.yml` to publish docs as a site:

```bash
pip install mkdocs mkdocs-material
mkdocs serve
```

Then open http://127.0.0.1:8000/

---

## ✅ Conventions

- One feature = one file.  
- Lowercase filenames, hyphen-separated.  
- Use provided templates in `90-templates/`.  
- Keep docs version-controlled with PRs, not wikis.

---

## 👥 Ownership

- **Platform Team** → base utilities, CTS, event bus.  
- **Payments Core** → gateways, ledger, recon.  
- **Compliance Ops** → compliance-screening.  
- **SRE** → observability, runbooks.

