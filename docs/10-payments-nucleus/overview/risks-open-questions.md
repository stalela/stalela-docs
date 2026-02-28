# Risks & Open Questions

This is a **living list** of risks and unknowns that need clarity.

---

## ❓ Open Questions
- Settlement liquidity ownership: who pre-funds? merchant vs Stalela vs bank?
- How to handle returns when rail semantics don’t map 1:1?
- Which rails are **priority for MVP** (EcoCash, USDC, OPPWA)?
- Is PayShap integration required in Phase 1?- CIS identity verification latency under load — cache warm-up strategy?
---

## ⚠️ Risks
- **Regulatory approvals** may delay go-live (cross-border, FIC).
- **Rail instability**: EcoCash APIs historically unreliable.
- **Telco politics**: MNOs may resist third-party integrations.
- **Crypto volatility**: reliance on USDC requires hedging & liquidity planning.
- **Fraud risk**: high potential for SIM swaps and social engineering.
- **CIS dependency**: all T0+ transfers require CIS identity resolution — CIS outage blocks transfer submission. Mitigate with aggressive caching and graceful degradation for low-value transfers.

---

## 📌 Mitigation Ideas
- Start with rails we fully control (USDC).
- Build compliance and audit hooks early.
- Work with AfricaNenda/Mojaloop for regulatory credibility.
