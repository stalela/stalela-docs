---
title: Changelog
---

Notable changes to the CIS service.

---

## 2025-01-13

- Migrated CIS service to the CTS-style layered architecture
  (repositories + transactions under `packages/domain/src/identity/`).
- Added identity lifecycle enhancements: status history, compliance
  results, soft delete, metadata, addresses, and phones.
- Introduced new REST endpoints for status updates, compliance
  refresh / history, metadata replacement, and contact CRUD.
- Integrated with the shared Compliance Service
  (`COMPLIANCE_BASE_URL` / `COMPLIANCE_API_KEY`).
- Published consolidated OpenAPI spec and updated the JavaScript SDK
  with new helpers.
