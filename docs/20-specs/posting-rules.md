# Posting Rules (Expanded)

Defines how Stalela translates transfer lifecycle events into **double‑entry ledger postings**.  
This is the authoritative mapping for `ledger-service`.

---

## Principles
- Every posting set must **balance** (sum debits = sum credits).  
- Postings are **append‑only**; reversals are explicit.  
- Ledger is **accrual‑based**: income/expenses recognized when earned, not when paid.  
- Use **normal balances** from chart‑of‑accounts.md.  

---

## Event → Posting Rules

### 1. `transfers.accepted` (AUTH / reservation)
- If rail supports **authorization** (card‑like), create pending/memo postings:

| Debit (Dr) | Credit (Cr) | Notes |
|------------|-------------|-------|
| Rail Settlement Pending | User / Payer | Off‑balance memo (not cash movement yet) |

---

### 2. `transfers.settled` (funds final)

#### Case: PUSH payment (payer sends to payee)
| Debit (Dr) | Credit (Cr) | Notes |
|------------|-------------|-------|
| User / Payer | Merchant / Payee | Principal transfer |
| Merchant / Payee | Fees Revenue | If fee charged (separate leg) |
| FX Loss | Merchant / Payee | If FX conversion loss applied |
| Merchant / Payee | FX Gain | If FX conversion gain applied |

#### Case: PULL payment (merchant pulls funds)
| Debit (Dr) | Credit (Cr) | Notes |
|------------|-------------|-------|
| User / Payer | Merchant / Payee | Principal |
| Merchant / Payee | Fees Revenue | Optional fee leg |

#### Per‑rail surcharges and partner fees (netting)
| Debit (Dr) | Credit (Cr) | Notes |
|------------|-------------|-------|
| Merchant / Payee | Fees Partner | Partner surcharge retained by Stalela on behalf of partner |
| Fees Partner | Partner Payable | Net settlement to partner at recon/settlement time |

> Netting entries reduce operational payouts; settle partner payable on statement reconciliation.

---

### 3. `transfers.returned` (rail return / chargeback)

| Debit (Dr) | Credit (Cr) | Notes |
|------------|-------------|-------|
| Merchant / Payee | User / Payer | Reverse principal |
| Fees Expense | Merchant / Payee | Return fees absorbed |

---

### 4. `transfers.failed` (technical failure)
- No postings (transfer never finalized).

---

## Period Closing Entries (Ops)

At end of reporting period (see closing-the-books.md):

- Close temporary **Income** and **Expense** accounts to **Retained Earnings**.  
- Reconciliation must confirm balances vs external statements before close.  

---

## Example Walkthrough

User pays Merchant 100 ZAR via USDC rail. Fee = 2 ZAR.

1. Event: `transfers.settled`
2. Ledger postings:

| Debit (Dr) | Credit (Cr) | Amount |
|------------|-------------|--------|
| User Account | Merchant Account | 100 |
| Merchant Account | Fees Revenue | 2 |

Merchant net = 98 ZAR. System recognized 2 ZAR as revenue.

---

## Exceptions

- Negative balances: only Liquidity/FX/Reserve accounts allowed.  
- Multi‑currency: FX legs must always be paired (gain or loss).  
- Manual journal entries require dual approval and clear memo.  

---

## References

- chart-of-accounts.md (account categories, normal balances)  
- closing-the-books.md (period cycle)  
- tax-vat.md (VAT on fees)  
