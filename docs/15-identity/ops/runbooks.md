---
title: Runbooks
---

Operational runbooks for common CIS incidents.

---

## Verification Stuck in Pending

1. Check the identity's `status_history` in Supabase for the last
   state transition — look for `needs_more_info` or provider timeout.
2. Verify provider API status dashboards.
3. Trigger manual retry via
   `POST /api/cis/v1/verification/:id/resubmit` with
   `reason=ops_retry`.
4. If still failing, escalate to Compliance with evidence references.

## Outbox Backlog

1. Inspect `cis_outbox_lag_seconds` metric; confirm lag > 60 s.
2. Check the `cis.cis_outbox` table in Supabase for unprocessed rows:
   ```sql
   SELECT count(*) FROM cis.cis_outbox
   WHERE processed_at IS NULL
     AND created_at < now() - interval '2 minutes';
   ```
3. Verify the Vercel Cron job (`/api/cis/cron/outbox-poll`) is
   executing on schedule. Check Vercel Logs for errors.
4. If the cron is healthy but messages are stuck, inspect for payload
   hash mismatches and manually re-queue with
   `UPDATE cis.cis_outbox SET retry_count = 0 WHERE …`.

## Login Abuse / Credential Stuffing

1. Review `auth.factor.challenge.failed` events for offending
   identities and IP addresses.
2. Enable tenant-level rate-limit overrides in the admin API; block
   offending IP ranges via Vercel Firewall rules.
3. Notify incident response if attack sustained > 10 minutes.
4. Rotate impacted API keys and enforce mandatory MFA.

## PII Access Anomaly

1. Alert triggered when unexpected service account accesses PII tables.
2. Immediately revoke credentials via the Supabase dashboard.
3. Query audit logs for scope of access; capture evidence.
4. Initiate incident response and notify the privacy officer within
   24 hours.
