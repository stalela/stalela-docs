# Rail Gateway — EFT (BankservAfrica Batch)

**Purpose**  
Manage batch submissions and returns for EFT, aligning with Bankserv file formats and cutoffs.

## Responsibilities
- Produce batch files; submit to partner; ingest settlement/return files.
- Emit `accepted/settled/returned/failed` events accordingly.

## Interfaces
- Files: batch submission, settlement, returns.
- Events (envelope `v=1`): `transfers.*`

## Data Model
- `eft_batches`, `eft_lines`, artifacts for file copies.

## Rules
- Cutoffs, windows, file validation (record counts, checksums).

## DebiCheck Mandates (ZA)
- Mandate lifecycle: create → amend → cancel; store mandate reference and consent metadata.
- Pull payments: verify active mandate before submission; include mandateRef in payload.
- Returns: map mandate-related reason codes to `transfers.returned` with details.

## Failure Modes
- File reject; late returns; mismatched totals → recon exception.

## Observability & Security
- Metrics: batch success rate; PII minimal in files; encryption at rest.
