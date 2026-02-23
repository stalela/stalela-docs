# Regulatory Reporting Service

**Purpose**  
Prepare and submit statutory reports (BoP, goAML) for ZA/ZW; manage schedules, receipts, and retries.

## Responsibilities
- Aggregate required data from events/services.  
- Build BoP files/API payloads and goAML STR/CTR submissions.  
- Manage submission windows, retries, and DLQs.  
- Store immutable receipts and audit logs.

## Interfaces
### Inputs
- Events: `transfers.*` (as needed), ledger postings (read-only API).  
- Internal reads: CTS/Ledger/Compliance summaries.

### Outputs
- Files/APIs: BoP to SARB authorized dealer; goAML to FIC/FIU.  
- Events: `reg.submission.created`, `reg.submission.acknowledged`, `reg.submission.failed`.

## Data Model
- `reg_submissions` (id, type, scope, payloadRef, status, submittedAt, receiptRef).  
- `outbox_reg` for event emission.  
- Artifacts: encrypted payloads and receipts.

## Runbooks
- Submission failure: retry with backoff; escalate per contact matrix.  
- Corrections: T+1 resubmission referencing prior filing.  

## Security
- Least privilege to source systems; encrypt at rest; PII minimization in artifacts.  
- Access controlled endpoints for manual replay.
