# Runbooks

Operational procedures for Stalela nucleus components. Keep these pragmatic and up to date.

---

## Transfers stuck in SUBMITTED

**Symptoms**  
- Many transfers in `SUBMITTED` for > X minutes.  
- Gateways show growing outbox backlog.

**Checks**  
1. Gateway `/ready` and `/metrics` for the affected rail.  
2. Event bus health; consumer lag.  
3. Directory lookup SLOs (routing latency spikes?).  

**Actions**
- Restart gateway dispatcher if wedged.
- Drain DLQ after verifying poison messages are quarantined.
- Temporarily throttle creation rate from CTS for the tenant with spikes.
- Archive any DLQ extracts to object storage (7-year retention) before purging queue entries (14-day in-queue policy).

**Postmortem notes**  
- Attach event IDs and sample transferIds.  
- Record root cause and prevention (ADR if architectural).

---

## Reconciliation unmatched backlog

**Symptoms**  
- `recon.exception.opened` spiking, queue > SLA.  

**Checks**  
1. Statement ingest success rate and file checksums.  
2. Directory fee tables / windows version drift.  
3. Key mapping (acqRef/authCode/externalRef) consistency.  

**Actions**  
- Assign operators to bulk-assign obvious matches.  
- Re-run ingest from last checkpoint if normalization bug found.  
- File partner ticket if delivery gaps observed.  

---

## Compliance stale index

**Symptoms**  
- Alert: compliance list age > 24h.  

**Checks**  
1. Downloader logs (network, checksum mismatch).  
2. Disk space / blob store quota.  

**Actions**  
- Trigger manual list refresh.  
- Roll back to last good index if corruption detected.  
- If still failing, force CTS to deny by policy until lists are healthy.  

---

## Ledger posting failures

**Symptoms**  
- `currency mismatch` or `negative balance blocked`.  

**Checks**  
1. Posting rules version and inputs from event.  
2. Account config (currency, status).  

**Actions**  
- Open exception, block further postings for the tenant if systemic.  
- Patch rules (PR) and replay events.  

---

## Event bus backlog

**Symptoms**  
- High outbox backlog, consumer lag.  

**Checks**  
1. Bus broker health, partition leaders.  
2. Dispatcher logs for auth / throttling errors.  

**Actions**
- Scale consumers horizontally.
- Increase partitions if saturated.
- Enable backpressure on producers (CTS) temporarily.
- If manual re-drive required, obtain dual approval and attach signed reason to the ticket before replaying messages.

---

## Load-shedding resilience (ZA)

**Symptoms**  
- Increased timeouts/latency during scheduled power cuts; spikes in retries/DLQ.  

**Checks**  
1. Gateway submit/confirm latency; retry counters.  
2. Outbox backlog and consumer lag around shedding windows.  
3. Infrastructure node availability in affected regions.  

**Actions**  
- Increase backoff and retry windows temporarily; enable circuit breakers.  
- Prefer idempotent replays after power restoration.  
- Throttle CTS create rate for impacted tenants.  
- Schedule maintenance/ingests away from shedding windows.  

**Alerts**  
- Alert on publish lag, retry spikes, and failure-rate thresholds during known windows.  

---

## POPIA DSAR (Data Subject Access/Erasure)

**Scope**  
- Handle access/correction/erasure requests while honoring legal holds and retention.

**Steps**  
1. Verify requestor identity and authority.  
2. Locate records across services (CTS, Ledger, Compliance, Recon, blobs).  
3. Produce access report with redactions; log disclosure.  
4. For erasure: apply anonymization where permitted; record legal holds where applicable.  
5. Update DSAR register with timestamps and outcome.  

**Controls**  
- Do not delete immutable audit/journal data; apply irreversible hashing where allowed.  
- Approval workflow for erasure.
