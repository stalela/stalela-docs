# ADR-0005: Cloud Signing Provider for Fiscal Platform

**Status:** Accepted  
**Date:** 2026-02-27

---

## Context

The Stalela Fiscal Platform requires cryptographic signatures on every invoice for tax authority compliance. The DRC's DGI (Direction Générale des Impôts) mandates that invoices carry a digital signature as proof of authenticity and integrity.

We need a signing solution that:

1. Generates RSA (or ECDSA) key pairs with the private key stored in tamper-resistant hardware.
2. Signs invoice canonical hashes on demand with low latency (<100ms per sign).
3. Provides an audit trail of all signing operations.
4. Has a free tier sufficient for Phase 1–2 volumes (<10K invoices/month).
5. Has at least one region geographically close to Southern/Central Africa.

## Decision

### Phase 1 (Current): Local Web Crypto API

- Use the Node.js Web Crypto API (`crypto.subtle`) to generate RSA-PSS 2048-bit key pairs.
- Keys are generated at process start and stored in memory (ephemeral).
- The `createLocalSigner()` factory in `packages/domain/src/fiscal/signing.ts` implements this.
- Suitable for development, testing, and low-volume production (invoices are signed but keys are not hardware-protected).

### Phase 3 (Target): Alibaba Cloud KMS

- Alibaba Cloud Key Management Service provides HSM-backed asymmetric keys.
- Region: **me-east-1** (Dubai) — closest Alibaba region to DRC/Southern Africa (~4,800km).
- Key spec: RSA_2048 with RSASSA_PSS_SHA_256 for signing.
- Free tier: 20,000 API calls/month (sufficient for Phase 1–2 volumes).
- The `createKmsSigner()` factory will implement the Alibaba KMS HTTP API.

### Signing Flow

```
Invoice Payload → Canonical Hash (SHA-256) → Sign(hash, privateKey) → Base64 Signature
```

The signing log (`signing.signing_log` table) records every operation:

| Column | Purpose |
|--------|---------|
| `id` | Signing operation ID |
| `invoice_id` | Reference to `fiscal.invoices` |
| `digest` | SHA-256 hash that was signed |
| `signature` | Base64-encoded signature |
| `signed_at` | Timestamp |

## Alternatives Considered

| Provider | Free Tier (Asymmetric) | Closest Region to DRC | Why Rejected |
|---|---|---|---|
| **AWS KMS** | No free tier for asymmetric keys ($1/key/month + $0.03/10K requests) | af-south-1 (Cape Town) | Cost at low volumes; Cape Town is farther from DRC than Dubai |
| **Azure Key Vault** | No free tier for HSM-backed keys | South Africa North (Johannesburg) | No free tier; limited African presence |
| **Google Cloud KMS** | No free tier for asymmetric keys ($0.03/10K operations) | No African region | No regional presence |
| **HashiCorp Vault** | Self-managed (free OSS) | Self-hosted | Operational burden; requires managing infrastructure |
| **Self-managed softHSM** | Free | Self-hosted | No tamper resistance; operational complexity |

## Consequences

### Positive

- **Phase 1 zero-cost**: Local Web Crypto API has no infrastructure dependencies.
- **Phase 3 low-cost**: Alibaba KMS free tier covers expected volumes for 12+ months.
- **Audit trail**: All signing operations recorded in `signing.signing_log`.
- **Pluggable**: The `Signer` interface in the domain layer allows swapping providers without changing business logic.

### Negative

- **Phase 1 key persistence**: In-memory keys are lost on process restart — acceptable for dev/testing, not for production audit requirements.
- **Vendor lock-in**: Alibaba KMS API is proprietary — mitigated by the `Signer` interface abstraction.
- **Latency**: Dubai → DRC round-trip adds ~50–100ms to each signing operation — mitigated by batch signing for bulk invoice generation.

## Migration Path

```
Phase 1: createLocalSigner() — Web Crypto RSA (current)
    ↓
Phase 2: createLocalSigner() with persisted keys (file or env-based)
    ↓
Phase 3: createKmsSigner() — Alibaba Cloud KMS (HSM-backed)
```

The `FISCAL_SIGNING_PROVIDER` environment variable selects the provider:

- `local` (default) → `createLocalSigner()`
- `alibaba-kms` → `createKmsSigner()` (Phase 3)

## References

- [Fiscal signing implementation](../../../packages/domain/src/fiscal/signing.ts)
- [Signing log schema](../../../packages/db/src/schema/fiscal.ts) — `signing.signing_log`
- [Alibaba Cloud KMS pricing](https://www.alibabacloud.com/product/kms/pricing)
- [DRC DGI SFE Specifications v1.0](../../40-jurisdictions/cd/index.md)
