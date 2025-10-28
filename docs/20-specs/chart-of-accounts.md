# Chart of Accounts (Stalela)

The **Chart of Accounts (CoA)** is the backbone of Stalela’s ledger.  
It defines all account types, their normal balances, and how they roll into financial statements.  
Based on lessons from *Accounting for Developers* and adapted to payments systems.

---

## Principles

- **Double-entry**: Every posting must debit one account and credit another.  
- **Normal balance**: Each account has a default side (debit or credit) where increases are recorded.  
- **Hierarchy**: Top-level categories are fixed, sub-accounts can be extended per tenant/product.  
- **Accrual basis**: Income and expenses recognized when earned, not just when cash moves.  

---

## Top-Level Categories

### 1. Assets (Normal Balance: Debit)
- **Liquidity (Cash/USDC Pool)**  
- **Settlement In Transit** (funds in process of clearing)  
- **Accounts Receivable** (e.g., unsettled merchant payments)  
- **Inventory / Collateral** (if applicable for product extensions)  

### 2. Liabilities (Normal Balance: Credit)
- **User Balances** (owed to end-users)  
- **Merchant Payables** (owed to merchants)  
- **Deferred Revenue** (collected in advance, not yet earned)  
- **Chargebacks/Returns Payable**  

### 3. Equity (Normal Balance: Credit)
- **Contributed Capital**  
- **Retained Earnings** (prior net income carried forward)  
- **Current Period Net Income** (closed at end of period into Retained Earnings)  

### 4. Revenue (Normal Balance: Credit)
- **Transaction Fees Earned**  
- **FX Spread Income**  
- **Other Service Fees**  

### 5. Expenses (Normal Balance: Debit)
- **Processing Costs** (rail fees, partner charges)  
- **Chargeback Losses**  
- **Operational Expenses** (infra, compliance overhead)  

---

## Examples

**User Deposit (USDC → Wallet)**  
- Debit Liquidity (Asset)  
- Credit User Balances (Liability)  

**Merchant Payout (USDC → Merchant)**  
- Debit Merchant Payables (Liability)  
- Credit Liquidity (Asset)  

**Fee Collection**  
- Debit User Balance (Liability)  
- Credit Transaction Fees Earned (Revenue)  

**Chargeback**  
- Debit Chargebacks Payable (Liability)  
- Credit Merchant Payables (Liability)  

---

## Notes
- Accounts can be extended per-tenant under the same category.  
- All postings must reconcile to ensure **Assets = Liabilities + Equity**.  
