---
title: Observability
---

Monitoring covers metrics, logs, and traces across the CIS stack.

---

## Metrics

| Metric | Type | Description |
|--------|------|-------------|
| `cis_http_requests_total` | Counter | Requests by route, status, and tenant. |
| `cis_http_request_duration_seconds` | Histogram | Latency distribution for APIs. |
| `cis_outbox_lag_seconds` | Gauge | Delay between DB commit and outbox publish. |
| `cis_verification_duration_seconds` | Histogram | Time from verification start to decision. |
| `cis_auth_mfa_failure_total` | Counter | Failed MFA attempts per factor type. |

### Sample Alerts

```text
cis_http_request_duration_seconds:p95 > 0.8   → High API latency
cis_outbox_lag_seconds > 30                    → Outbox backlog
increase(cis_auth_mfa_failure_total[5m]) > 20  → Credential stuffing
```

Alerts are configured in **Vercel Analytics** or an external
monitoring provider (e.g., Datadog, Grafana Cloud) consuming
structured logs.

## Logs

- JSON structured logs with `requestId`, `tenantId`, `identityId`,
  `orgId`.
- PII fields are masked (`<redacted>` tokens) before emission.
- **Vercel Logs** provides real-time log streaming and search for
  serverless function invocations. For long-term retention, forward
  logs to a dedicated provider via Vercel Log Drains.

## Traces

- **OpenTelemetry** instrumentation on API handlers, database
  operations, and verification tasks.
- Vercel provides built-in tracing for serverless functions. Export
  spans to Grafana Tempo, Datadog, or any OTLP-compatible backend
  for deeper analysis.
- Retain traces for 14 days minimum.
- Span attributes include `policyId`, `verificationId`, but **never**
  raw PII documents.

## Dashboards

Recommended dashboard views:

| Dashboard | Key Panels |
|-----------|------------|
| **CIS Overview** | Request rate, error ratio, p95 latency |
| **Verification Health** | In-progress count, stuck workflows, provider error rates |
| **Auth Reliability** | Login success rate, MFA failure trends, session creation rate |

Runbooks (see [Runbooks](runbooks.md)) link from dashboard alerts for
quick remediation.
