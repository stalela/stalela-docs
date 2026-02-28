---
title: "CIS-ADR-0004: Policy Engine Uses JSON-Logic"
---

- **Status**: Accepted
- **Date**: 2024-05-01

---

## Context

Policy requirements change frequently and must be configurable by
non-engineers (product, legal, compliance teams).

## Decision

Adopt **JSON-Logic** as the policy expression language. Policies are
versioned documents stored in CIS and evaluated at runtime to
determine verification requirements and consent prompts.

## Consequences

- Enables product and legal teams to author policies without code
  deployments.
- Requires validation tooling to prevent unsafe expressions.
- SDKs must ship helpers to evaluate policies locally for testing.

## Example

```json
{
  "if": [
    { "==": [{ "var": "identity.type" }, "INDIVIDUAL"] },
    { "in": [{ "var": "tenant.region" }, ["ZA", "ZW"]] },
    true
  ]
}
```

See [Verification & Policies](../concepts/verification-and-policies.md)
for the full policy model.
