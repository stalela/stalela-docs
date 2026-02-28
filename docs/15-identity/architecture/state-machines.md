---
title: State Machines
---

State machines coordinate identity and organization lifecycles alongside verification workflows.

## Identity State Machine

```mermaid
stateDiagram-v2
  [*] --> pending
  pending --> active: onboarding complete
  pending --> in_review: compliance hold
  pending --> denied: hard failure

  active --> in_review: triggered by refresh
  active --> blocked: policy violation

  in_review --> active: approved
  in_review --> denied: denied
  in_review --> frozen: escalated risk

  blocked --> in_review: remediation started
  blocked --> denied: escalated failure

  frozen --> in_review: thawed for review
  denied --> [*]
  blocked --> [*]
  frozen --> [*]
```

- Domain transaction `handleUpdateIdentityStatus` enforces allowed transitions.
- Compliance refreshes may transition identities automatically when the outcome changes (`ALLOW`, `REVIEW`, `DENY`).
- Every change records a `status_history` entry with `comment` and `actorId` metadata.

---

## Organization State Machine

```mermaid
stateDiagram-v2
  [*] --> initialized
  initialized --> pending_verification: KYB started
  pending_verification --> active: policy approved
  pending_verification --> rejected: policy failed
  active --> suspended: compliance hold
  suspended --> active: remediation
  active --> dissolved: closure
```

---

## Verification Workflow

```mermaid
stateDiagram-v2
  [*] --> collect_evidence
  collect_evidence --> run_checks
  run_checks --> needs_more_info: missing docs
  run_checks --> approved
  run_checks --> denied
  needs_more_info --> collect_evidence
  approved --> [*]
  denied --> [*]
```

- `collect_evidence` uses secure upload URLs; evidence encrypted immediately.
- `run_checks` fans out to provider integrations with retries and fallback providers.
- Transitions emit events via the transactional outbox with reason codes for observability.
