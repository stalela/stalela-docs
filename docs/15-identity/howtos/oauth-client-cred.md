---
title: OAuth Client Credentials
---

Use client credentials for server-to-server integrations.

---

## 1. Create API Key

Use `/api/cis/v1/orgs/:orgId/api-keys` with the scopes required by
automation (e.g., `identities:read`).

## 2. Exchange for Token

```bash
curl -X POST https://stalela-platform.vercel.app/api/cis/v1/oauth/token \
  -u "$CLIENT_ID:$CLIENT_SECRET" \
  -d 'grant_type=client_credentials&scope=identities:read orgs:manage'
```

Response includes `access_token` and `expires_in`.

## 3. Call CIS APIs

```bash
curl https://stalela-platform.vercel.app/api/cis/v1/identities/id_123 \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "X-Tenant-Id: tnt_za"
```

## Token Hygiene

- Cache tokens for `expires_in - 60` seconds.
- Rotate client credentials every 90 days.
- Monitor `auth.session.created` events tagged
  `grant_type=client_credentials` for anomaly detection.
