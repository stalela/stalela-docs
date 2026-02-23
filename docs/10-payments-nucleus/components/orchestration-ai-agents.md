# Orchestration AI Agents

The AI orchestration layer augments Canonical Transfer Service (CTS) decisioning with stateless, observable agents. Each agent evaluates a specific dimension—route performance, risk posture, or platform health—and publishes structured events that loop back into CTS, Directory, and Compliance flows.

## Agent Overview

| Agent | Primary Goal | Inputs | Outputs | Invocation Path |
|---|---|---|---|---|
| Smart Rail Selector | Rank available rails against policy weights and runtime health | Transfer intent, policy weights, rail metrics | Ranked rail list, selected rail, scoring metadata | CTS orchestration pipeline prior to Directory call |
| Dynamic Risk Classifier | Assign adaptive compliance tiers | Payer/payee metadata, device signals, historical incidents | Risk tier, confidence, contributing features | CTS compliance step (pre-screen and re-evaluate on state changes) |
| Rail Health Monitor | Track infrastructure health and flag degraded rails | Events, rail telemetry (latency, failure rate, uptime), incident feed | Health state, recommended throttles, events (`rail.flagged.degraded`) | Continuous streaming microservice subscribed to Event Bus |
| Orchestration Copilot | Provide human-friendly explanations and diagnostics | Agent event history, policy configuration, observability data | Natural language summaries, CLI responses, remediation guidance | On-demand via CLI (`stalela ctl orchestration explain`) or chat assistant |

## Sample Payloads & Integration Points

### Smart Rail Selector

```json
{
  "transfer_id": "tr_789",
  "intent": "PUSH",
  "policy": {
    "optimize_for": "cost",
    "fallbacks": ["reliability", "speed"],
    "preferred_methods": ["mobile_money", "voucher"],
    "excluded_rails": ["card"]
  },
  "candidates": [
    { "rail": "mobile_money", "latency_ms": 480, "fx_spread_bps": 15, "failure_rate": 0.4 },
    { "rail": "voucher", "latency_ms": 210, "fx_spread_bps": 35, "failure_rate": 0.8 },
    { "rail": "usdc", "latency_ms": 90, "fx_spread_bps": 55, "failure_rate": 0.2 }
  ]
}
```

Response fragment published via `route.selected.via_ai`:

```json
{
  "selected_path": ["mobile_money", "voucher"],
  "score": 0.872,
  "features_used": ["latency_ms", "fx_spread_bps", "policy.optimize_for"],
  "explanations": [
    "mobile_money minimizes spread under cost-first policy",
    "voucher provides resilience under reliability fallback"
  ]
}
```

### Dynamic Risk Classifier

```json
{
  "transfer_id": "tr_789",
  "tenant_id": "tn_55",
  "entities": {
    "payer": { "type": "WALLET", "country": "ZA", "device_fingerprint": "abc" },
    "payee": { "type": "BANK", "country": "NG", "kyc_level": "basic" }
  },
  "behavioral_signals": { "lifetime_volume": 12000, "chargeback_rate": 0.01 }
}
```

Produces `risk.tier.assigned` with payload:

```json
{
  "user_id": "payer-abc",
  "risk_score": 0.34,
  "compliance_level": "tier_2",
  "features": ["country_pair", "behavioral.chargeback_rate"]
}
```

### Rail Health Monitor

Subscribed to `events.transfers.*` plus telemetry topics. Emits `rail.flagged.degraded` when thresholds are breached:

```json
{
  "rail_id": "zimswitch",
  "health_metrics": {
    "rolling_failure_rate": 0.12,
    "p99_latency_ms": 2150,
    "uptime_5m": 0.89
  },
  "timestamp": "2025-09-04T15:22:11Z",
  "recommended_action": "deprioritize",
  "confidence": 0.82
}
```

## Deployment Model

- **Packaging**: Each agent is packaged as a lightweight container or serverless function with gRPC and REST shims.
- **Invocation**: CTS invokes Smart Rail Selector and Dynamic Risk Classifier synchronously within orchestration. Rail Health Monitor runs continuously, while Orchestration Copilot is invoked on demand.
- **Observability**: OpenTelemetry traces span CTS and agent calls. Structured logs include `trace_id`, `transfer_id`, and `policy_id` for joinability.
- **Configuration**: Policies stored in the Directory/Config service are versioned; agents consume updates via feature flag streams.

## Testing & Simulation

- **Offline evaluation**: Replay historical transfers through the agents with `stalela simulate orchestration --from <date>` to measure precision/recall of routing decisions.
- **A/B experiments**: Toggle agent policies per tenant via feature flags; compare success metrics in Looker dashboards backed by `route.selected.via_ai` events.
- **Contract tests**: JSON schema fixtures for agent inputs/outputs live in `storo-specs/orchestration`. CTS CI enforces schema drift detection.
- **Chaos drills**: Use `stalela chaos rail --target=<rail>` to inject latency/failure and verify Rail Health Monitor suppresses degraded paths.

## Fallback & Observability Patterns

- **Graceful degradation**: If an agent call times out or errors, CTS reverts to deterministic Directory routing rules and records `orchestration.fallback.used` with reason codes.
- **Audit trails**: All agent outputs persist in the orchestration event stream, allowing red-team review and compliance audits.
- **Operator workflows**: Orchestration Copilot summarizes agent contributions in the Operator Console and CLI, aiding rapid incident response.
- **Model lifecycle**: Retraining jobs publish `model.version.changed` events; deployments require canary windows with heightened alerting on rail success rate.
