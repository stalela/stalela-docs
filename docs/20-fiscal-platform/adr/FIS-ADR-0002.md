# ADR-0002: Signature Algorithm Selection

## Status
Accepted

## Context
- The USB Fiscal Memory device and its Secure Element are the only components that ever see the private signing key (design/docs/hardware/secure-element.md). Nothing outside the SE can derive, export, or clone this key, so the algorithm must be supported inside the sealed chip.
- The Secure Element review already evaluated ECDSA P-256 versus Ed25519 and concluded that the family we selected (ATECC608B / SE050) already accelerates P-256 and matches the curve used on existing fiscal certificates. Ed25519 is treated as a future-proof option pending regulatory and vendor certification, while RSA is too heavy for the MCU (design context + DISCUSSION.md lines 7285-7400 explain why hardware is mandated).
- The DGI has not published a mandatory signature algorithm, but inspectors expect curves compatible with earlier fiscal memories and want minimal signature payloads on receipts.

## Options

1. **ECDSA P-256 (current baseline)**  
   - Pros: Hardware acceleration available in ATECC608B/SE050; produces 64-byte signatures that fit on receipts and QR codes; aligns with curves used in existing fiscal certificates; familiar to auditors.  
   - Cons: Requires careful nonce and counter governance inside the SE, but that logic already exists.

2. **Ed25519 (future option)**  
   - Pros: Smaller signature size (64 bytes) with faster signing on modern SEs; better resilience to some side-channel attacks; easier canonicalization.  
   - Cons: Not yet certified by the SE vendor for our hardware, and the DGI has not approved the curve; adopting it would force a platform change and additional regulatory work.

3. **RSA-2048**  
   - Pros: Very mature and widely understood by regulators.  
   - Cons: Signature payloads are large (> 256 bytes), which burdens QR codes and receipts; signing performance is poor on constrained MCUs; the SEs we selected (ATECC608B/SE050) are optimized for ECC, not RSA.

## Rationale
ECDSA P-256 is the most practical choice today because it is natively accelerated by the Secure Element family we already selected, matches the public curve seen in the current fiscal authorities’ certificates, and keeps signature sizes manageable for receipts and QR codes (design/docs/hardware/secure-element.md). The activation flow (`CFG|INIT`) and journal signing flow already assume this curve, so switching algorithms would require new protocol definitions and resets of the counter/nonce governance. Ed25519 remains a candidate for later phases once the vendor and DGI certify support, while RSA is ruled out because of its performance and payload penalties.

## Decision
Adopt ECDSA P-256 as the signature algorithm for all invoices signed by the USB Fiscal Memory device. The SE will generate the key pair on-device, enforce the PREPARE → COMMIT lifecycle, and never expose the private key.

## Consequences
- Downstream systems (receipts, cloud, auditors) can rely on 64-byte signatures produced by the SE and validated against the public certificate presented during `QRY|STATUS`.
- If future hardware or regulatory changes require another curve (e.g., Ed25519), we will document the migration in a new ADR and revise the USB protocol accordingly, including updates to nonce expiry and journal verification logic.
