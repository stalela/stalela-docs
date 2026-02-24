# 10 Architectural Challenges for Stalela

This document outlines ten critical architectural, regulatory, and security challenges facing the Stalela system. These questions are designed to stress-test the current design assumptions, particularly regarding offline capabilities, regulatory compliance (Arrêté 033), and cryptographic integrity.

## 1. The Offline PWA Signing Paradox
**Challenge:** How can a pure web application (PWA) securely sign invoices offline without destroying the Point of Sale (POS) user experience or compromising private keys?
**Context:** If we attempt to sign invoices offline in a browser, we face a dilemma. The Web Crypto API allows key generation, but the keys are often exportable or vulnerable to XSS, failing strict fiscal security standards. WebAuthn uses the device's Secure Enclave (highly secure), but requires a biometric prompt (FaceID/TouchID) for *every single signature*. In a fast-paced retail environment, prompting the cashier for a fingerprint on every receipt is a UX disaster.
**Proposed Solution (The MetaMask/VC Pattern):** We can solve this by combining Self-Sovereign Identity (SSI) Verifiable Credentials with a Browser Extension architecture (like MetaMask). 
1. **Delegated Credentials:** The Cloud HSM issues a short-lived (e.g., 12-hour), limited-scope (e.g., 500 invoices) "Delegated Private Key" to the POS. This drastically reduces the blast radius if the key is compromised.
2. **The Fiscal Extension:** Instead of storing this key in the vulnerable PWA's `localStorage`, it is stored inside a dedicated Stalela Chrome Extension. The extension runs in an isolated sandbox, immune to XSS attacks on the main website.
3. **Silent Auto-Signing:** The cashier unlocks the extension once per shift with a PIN. The PWA sends invoice payloads to the extension, which silently auto-signs them (only if the request originates from the trusted `pos.stalela.cd` domain) and returns the signature. This provides hardware-level isolation with zero per-transaction UX friction.

## 2. The Local Fiscal Daemon Vulnerability
**Challenge:** If we deploy a Local Fiscal Daemon (a background service on Windows/Linux) to handle offline signing, what prevents a malicious merchant from deleting the local database to evade taxes?
**Context:** To solve the PWA paradox, we might use a local daemon that holds the private key and a local SQLite database to queue offline sales. However, if a merchant unplugs their router, processes 100 cash sales, and then simply deletes the `stalela_offline.db` file before reconnecting to the internet, those sales vanish. Without tamper-proof hardware, local software is inherently vulnerable to data destruction.
**Proposed Solution (Block Allocation):** Inspired by HOTP (HMAC-based One-Time Password) counters, the Cloud HSM allocates a strict, sequential block of fiscal numbers (e.g., #1000 to #1500) to the POS terminal when it is online. If the merchant deletes their local database and reconnects, the Cloud will detect the missing block of numbers and immediately flag the outlet for a tax audit.

## 3. The Arrêté 033 Real-Time Requirement
**Challenge:** How does Phase 1's "queue unsigned drafts offline" strategy comply with DRC law in physical retail environments?
**Context:** Arrêté 033 mandates that the physical receipt handed to the customer *must* contain the fiscal signature, fiscal number, and QR code. Phase 1 assumes that if the internet is down, the client queues an "unsigned draft" and syncs it later. This means the customer walks away with an illegal, non-fiscalized receipt. This strategy works for asynchronous B2B e-invoicing, but is legally incompatible with B2C physical retail.

## 4. DGI API (MCF/e-MCF) Unknowns
**Challenge:** How can we guarantee our canonical JSON payload and ECDSA P-256 signatures will be accepted by the DGI when their API specs are unpublished?
**Context:** The DGI's MCF/e-MCF endpoint URLs, authentication mechanisms, and exact payload schemas are currently unknown. If the DGI mandates a specific XML format (like UBL), a different signature algorithm (e.g., RSA-2048), or a synchronous SOAP API, our REST/JSON/ECDSA architecture will require significant, costly rework.

## 5. Hash-Chained Ledger Forking
**Challenge:** How do we resolve forks in the Hash-Chained Fiscal Ledger caused by offline signing conflicts or local database restorations?
**Context:** Each invoice's `entry_hash` includes the `previous_hash` to ensure cryptographic immutability per `outlet_id`. If a Local Daemon signs invoices offline, but the merchant restores an older backup of their local database and signs *new* invoices, the hash chain forks. When both branches eventually sync to the Cloud Fiscal Ledger, how does the system determine the canonical chain without invalidating legitimate sales?

## 6. Monotonic Counter Race Conditions
**Challenge:** How do we prevent race conditions in the Monotonic Counter Manager in high-concurrency environments without introducing massive latency?
**Context:** The system must serialize fiscal numbering per `outlet_id`. In a large supermarket with 20 POS terminals firing requests simultaneously, the Cloud Signing Service must lock the counter, increment it, sign the payload, and release the lock. Standard database transactions might cause lock contention and timeouts. How is this scaled?

## 7. Tax Engine Complexity and Retroactive Updates
**Challenge:** How does the system handle retroactive tax rate changes or new tax groups introduced by the DGI without invalidating historical invoices?
**Context:** The DRC tax code includes 14 distinct tax groups. If the DGI changes the standard VAT rate from 16% to 18% effective immediately, how do offline clients receive this update? Furthermore, if an invoice was queued offline at 16% but syncs to the cloud after the rate changes to 18%, how does the Tax Engine reconcile the discrepancy without rejecting the payload?

## 8. Hardware Homologation Delays (Phase 3)
**Challenge:** What is the contingency plan if the Phase 3 USB Fiscal Memory devices are delayed by years due to DRC homologation bureaucracy?
**Context:** Phase 3 relies on physical hardware to solve the offline security vulnerabilities. However, hardware homologation in emerging markets can take 18-24 months. If the DGI rejects our software-only Phase 1 approach for retail, and Phase 3 hardware is stuck in regulatory limbo, the business is effectively blocked from the retail sector.

## 9. Sync Agent Thundering Herd
**Challenge:** How is the Sync Agent architected to handle a massive influx of queued invoices when a nationwide internet outage resolves?
**Context:** If thousands of merchants in Kinshasa lose internet for 24 hours, they will queue millions of invoices locally. When connectivity is restored, all clients will attempt to sync simultaneously. This "thundering herd" could DDoS the Stalela Cloud API, the Cloud Signing Service, and the DGI's MCF endpoints.

## 10. Audit Traceability vs. Data Privacy
**Challenge:** How do we balance the DGI's need for granular, item-level traceability with the merchants' rights to data privacy and protection against industrial espionage?
**Context:** The system must provide comprehensive audit exports (Z, X, A reports) to the DGI. However, transmitting line-item details (e.g., exactly how many units of a specific product a merchant sold) gives the government (and potentially bad actors who compromise the DGI) unprecedented insight into a private company's margins and supply chain. Can we use zero-knowledge proofs or aggregated reporting to satisfy the DGI while protecting merchant data?
