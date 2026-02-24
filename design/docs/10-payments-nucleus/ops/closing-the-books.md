# Closing the Books (Ops Runbook)

The process of finalizing accounting for a period (day, month, quarter, year).  
Based on accrual accounting and double-entry principles.

---

## Daily Tasks

1. **Reconciliation**  
   - Ingest statements from rails (Zimswitch, OPPWA, Algorand).  
   - Match to transfers in Stalela.  
   - Investigate unmatched items in Operator Console.  

2. **Ledger Validation**  
   - Run posting check: every debit has equal credit.  
   - Generate trial balance.  

3. **Compliance Delta Check**  
   - Re-run re-screening for entities against updated lists.  

---

## Monthly / Period-End Tasks

1. **Income Statement**  
   - Summarize revenues (fees, FX) and expenses (processing, chargebacks).  

2. **Close Temporary Accounts**  
   - Zero out revenue and expense accounts.  
   - Roll net income into **Current Period Net Income** account.  

3. **Balance Sheet**  
   - Validate: Assets = Liabilities + Equity.  
   - Snapshot balances for audit/export.  

4. **Cash Flow Statement**  
   - Derive from balance changes (Liquidity movements).  

---

## Technical Steps

1. Freeze event ingestion at cutoff.  
2. Run reconciliation batch job.  
3. Generate trial balance → verify zero-sum.  
4. Post closing entries:  
   - Debit/Credit Revenue → Net Income.  
   - Debit/Credit Expenses → Net Income.  
   - Close Net Income → Retained Earnings.  
5. Unlock event ingestion.  

---

## Operator Notes

- If unmatched transactions remain, escalate before closing.  
- If balances don’t tie (A=L+E), halt closing and investigate ledger.  
- All reports (Balance Sheet, Income Statement) are versioned and immutable.  
