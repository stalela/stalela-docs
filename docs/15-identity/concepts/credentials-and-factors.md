---
title: Credentials & Factors
---

CIS supports multi-factor authentication (MFA) with pluggable credential types.
Factors are stored with metadata to enforce policy and support recovery workflows.

## Factor Catalog

| Factor | Description | Storage |
| --- | --- | --- |
| `password` | Argon2id hashed secrets with versioned parameters | Postgres `identity_credentials` |
| `otp_sms` | One-time codes delivered via SMS | Ephemeral cache + audit log |
| `totp` | RFC 6238-based shared secret seeded during enrollment | Encrypted secrets (Web Crypto AES-256-GCM) |
| `webauthn_platform` | Device-bound passkey | WebAuthn credential store with attestation metadata |
| `webauthn_cross_platform` | Hardware security keys | WebAuthn credential store |

---

## Enrollment Flow

1. Identity authenticates with an existing factor or via recovery token.
2. CIS issues an enrollment challenge with anti-replay nonce.
3. Client submits proof (password hash, OTP code, WebAuthn attestation).
4. CIS validates proof, stores factor metadata, and emits `factor.enrolled` event via the transactional outbox.

---

## Recovery

- Password reset requires proof via verified email or WebAuthn assertion plus policy-defined checks.
- Lost hardware keys can be replaced after compliance review, tracked via `recovery_ticket`.
- Rate limiting protects against brute-force enumeration of factors.

!!! danger "Do not store raw secrets"
    All factors must be hashed or encrypted at rest. Never log verification payloads. Audit logs should only contain metadata such as factor type, IP reputation, and outcome.

---

## Device Signals

CIS collects device posture data (platform attestation, risk scores) to enrich policy evaluation.
Device metadata is redacted and only linked via hashed device identifiers.
