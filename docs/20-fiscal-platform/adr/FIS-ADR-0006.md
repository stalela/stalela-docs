# ADR-0006: Delegated Offline Token Architecture

**Date:** 2026-02-21
**Status:** Accepted
**Phase:** Phase 1.5 (Fast-Follow to Phase 1)

## Context

In Phase 1, Stalela relies entirely on the Cloud Signing Service (HSM) to generate fiscal numbers, signatures, and QR payloads. The original design assumed that if a client (e.g., a web dashboard) lost internet connectivity, it would queue "unsigned drafts" locally and submit them for fiscalization once connectivity returned.

However, a deep review of the DRC regulatory framework (specifically Arrêté 033) revealed a critical compliance gap: **physical receipts handed to customers in a retail environment must contain the fiscal signature and QR code at the moment of sale.** A strategy of queuing unsigned drafts is legally incompatible with B2C physical retail.

To solve this, we need a way for Point of Sale (POS) terminals to sign invoices offline. We evaluated several approaches:
1. **Pure PWA (Web Crypto API):** Storing private keys in the browser's `localStorage` or IndexedDB is vulnerable to XSS (Cross-Site Scripting) attacks, where malicious JavaScript could extract or misuse the key.
2. **WebAuthn (Passkeys):** Highly secure (uses the device's Secure Enclave), but requires a biometric prompt (FaceID/TouchID) for *every single signature*. This introduces unacceptable UX friction for fast-paced retail.
3. **Native Desktop App (Local Fiscal Daemon):** Secure (can use OS TPM) and silent, but introduces significant deployment friction (installing `.exe` files) and is vulnerable to merchants deleting the local SQLite database to erase offline cash sales.
4. **Phase 3 USB Hardware:** The ultimate solution, but hardware homologation in the DRC can take 18-24 months, blocking our entry into the retail market.

## Decision

We will implement a **Delegated Offline Token Architecture** as a Phase 1.5 fast-follow, combining principles from Self-Sovereign Identity (Verifiable Credentials), Browser Extensions (the MetaMask pattern), and HOTP (Block Allocation).

1. **Delegated Credentials (Verifiable Credentials):** Instead of the POS holding the master Cloud HSM key, the Cloud HSM issues a short-lived (e.g., 12-hour) "Delegated Private Key" to the POS terminal when it is online.
2. **The Fiscal Extension (MetaMask Pattern):** To protect this delegated key from XSS attacks on the PWA, the key is stored inside a dedicated **Stalela Chrome Extension**. The extension runs in an isolated sandbox. The cashier unlocks the extension once per shift with a PIN. The PWA sends invoice payloads to the extension, which silently auto-signs them (only if the request originates from the trusted `pos.stalela.cd` domain).
3. **Block Allocation (HOTP Pattern):** To prevent merchants from deleting local databases to hide sales, the Cloud HSM allocates a strict, sequential block of fiscal numbers (e.g., #1000 to #1500) along with the Delegated Credential. If the merchant deletes their local data and reconnects, the Cloud detects the missing block and flags the outlet for a tax audit.
4. **Reconciliation:** When connectivity returns, the POS submits the locally-sealed invoices to the Cloud. The Cloud verifies the signatures against the Delegated Credential and appends them to the Hash-Chained Fiscal Ledger.

## Consequences

### Positive
* **Regulatory Compliance:** Allows Stalela to serve physical retail merchants in compliance with Arrêté 033 without waiting for Phase 3 hardware.
* **UX:** Zero per-transaction friction (silent auto-signing) after the initial shift unlock.
* **Security:** Drastically reduces the blast radius of a compromised key (limited to 12 hours and a specific block of invoices). XSS immunity via extension isolation.
* **Tamper Detection:** Block allocation prevents the "Local Daemon Deletion" vulnerability.

### Negative
* **Deployment Friction:** Merchants must install a Chrome Extension, which is slightly more complex than a pure PWA.
* **Architectural Complexity:** Introduces a new trust mode ("semi-trusted delegated signer"), a new Credential Issuer service, and a complex reconciliation pipeline for offline-signed invoices.
* **Ledger Forking:** Requires careful handling of hash-chain forks if offline signing conflicts occur.

## Review Trigger

This decision should be reviewed if:
* The DGI explicitly rejects software-based delegated signing and mandates hardware (accelerating Phase 3).
* The DGI publishes the MCF/e-MCF API specification, and it fundamentally conflicts with our reconciliation model.
