---
title: Enrol WebAuthn Factors
---

WebAuthn provides phishing-resistant authentication. CIS supports
platform (device-bound) and cross-platform (security key) credentials.

---

## Platform Key Enrolment

1. Start enrolment via `/api/cis/v1/identities/:id/factors` with
   `type=webauthn_platform`.
2. CIS returns `challenge` and relying-party metadata.
3. Call `navigator.credentials.create` on the client with the
   challenge.
4. Submit the attestation response to CIS to finalise enrolment.

## Cross-Platform Key Enrolment

- Identical flow with `type=webauthn_cross_platform`.
- Encourage users to set a descriptive `displayName` to distinguish
  keys.

## Recovery Guidance

- Require at least **two** WebAuthn credentials or fallback factors.
- Provide admin override to revoke lost keys via
  `/api/cis/v1/identities/:id/factors/:factorId`.

## Sample Client Code

```typescript
const attestation = await navigator.credentials.create({
  publicKey: options,
});

await fetch(
  `https://stalela-platform.vercel.app/api/cis/v1/identities/${identityId}/factors`,
  {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Tenant-Id": tenantId,
      Authorization: `Bearer ${token}`,
      "Idempotency-Key": crypto.randomUUID(),
    },
    body: JSON.stringify({
      type: "webauthn_platform",
      displayName: "MacBook Air",
      proof: attestation,
    }),
  },
);
```
