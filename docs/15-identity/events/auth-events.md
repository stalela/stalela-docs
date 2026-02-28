---
title: Auth Events
---

Authentication events signal session changes, factor challenges, and anomalies.

| Event | Payload | Notes |
| --- | --- | --- |
| `auth.session.created` | `{ sessionId, identityId, orgId, scopes }` | Successful login. |
| `auth.session.refreshed` | `{ sessionId, identityId, refreshId }` | Token refresh succeeded. |
| `auth.session.revoked` | `{ sessionId, reason }` | Session explicitly terminated. |
| `auth.factor.challenge.sent` | `{ identityId, factorId, channel }` | MFA challenge issued. |
| `auth.factor.challenge.failed` | `{ identityId, factorId, attempts }` | Failure count increments. |
| `auth.factor.challenge.verified` | `{ identityId, factorId }` | MFA challenge succeeded. |
| `auth.anomaly.detected` | `{ identityId, signal, riskScore }` | Suspicious behavior flagged. |
| `auth.scope.escalated` | `{ sessionId, previousScopes, newScopes }` | Consent or admin escalation granted. |

---

## Usage

- Drive adaptive risk controls in CTS by ingesting `auth.anomaly.detected`.
- Monitor login health by graphing `auth.session.created` vs `auth.session.revoked`.
- Alert on repeated `auth.factor.challenge.failed` events per identity.

---

## Retention

Authentication events stored for 30 days in hot storage and archived for 12 months for forensic investigations.
