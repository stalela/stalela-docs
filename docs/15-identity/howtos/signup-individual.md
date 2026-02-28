---
title: Sign Up an Individual
---

This guide walks through registering an individual user, verifying
contact details, and initiating KYC.

---

## 1. Create the Identity

```bash
curl -X POST https://stalela-platform.vercel.app/api/cis/v1/identities \
  -H "Content-Type: application/json" \
  -H "X-Tenant-Id: tnt_za" \
  -H "Authorization: Bearer $SERVICE_TOKEN" \
  -H "Idempotency-Key: $(uuidgen)" \
  -d '{"type":"INDIVIDUAL","email":"person@example.com"}'
```

Store `identityId` for subsequent steps.

## 2. Verify Email

```bash
curl -X POST https://stalela-platform.vercel.app/api/cis/v1/identities/id_123/verify/email/start \
  -H "X-Tenant-Id: tnt_za" \
  -H "Authorization: Bearer $TOKEN"
```

Deliver the challenge code to the user and verify via
`/api/cis/v1/identities/:id/verify/email/complete`.

## 3. Enrol MFA

Use `/api/cis/v1/identities/:id/factors` to enrol TOTP or WebAuthn.
Encourage WebAuthn for phishing resistance.

## 4. Capture Consent

Attach required consents via `/api/cis/v1/identities/:id/consents`
with policy-version references.

## 5. Start KYC

```bash
curl -X POST https://stalela-platform.vercel.app/api/cis/v1/identities/id_123/verification/start \
  -H "X-Tenant-Id: tnt_za" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Idempotency-Key: $(uuidgen)" \
  -d '{"policy":"KYC_ZA_BASIC"}'
```

Monitor events (`identities.verified`) to update onboarding flows.
