# Observability

Metrics, logs, and tracing conventions for Stalela.

---

## Golden Signals

- **Latency**: API p95/p99 (CTS), event publish lag (outbox → bus), ledger posting latency.  
- **Traffic**: transfers/sec by rail, events/sec by topic.  
- **Errors**: rate by type; DLQ sizes.  
- **Saturation**: outbox backlog, consumer lag, DB write IOPS.  

> Telco variability: expect higher latency/timeouts during peak/maintenance windows on USSD/STK rails; adjust SLOs accordingly.

---

## Metrics (Prometheus names)

- `cts_requests_total{route,code}`  
- `cts_request_duration_seconds_bucket{route}`  
- `gateway_submit_duration_seconds_bucket{rail}`  
- `event_outbox_backlog{service}`  
- `event_publish_lag_seconds{service}`  
- `event_consumer_lag_seconds{service,topic}`  
- `ledger_posting_latency_seconds_bucket`  
- `recon_match_rate` , `recon_unmatched_backlog`  
- `compliance_screen_latency_seconds_bucket` , `compliance_index_age_hours`

> Load-shedding alerts: page on `event_publish_lag_seconds{service}` and `gateway_submit_duration_seconds_bucket{rail=~"(ecocash|mtnmomo|airtelmomo)"}` when exceeding thresholds during known windows.

---

## Logs

- JSON only.  
- Required fields: `ts`, `level`, `service`, `tenantId`, `transferId?`, `eventId?`, `traceId?`.  
- PII redaction applied before emit.

---

## Tracing

- Propagate `traceparent` across services.  
- Spans: `cts.create`, `gateway.submit`, `ledger.post`, `recon.ingest`.  
- Sample rate: 10% baseline; 100% on error paths.

---

## Dashboards

- **Exec**: transfers by rail, approval/return rates, SLAs.  
- **SRE**: outbox backlogs, publish lag, consumer lag, broker health.  
- **Finance/Ops**: settlement totals, fees, FX P&L, recon match rate.
