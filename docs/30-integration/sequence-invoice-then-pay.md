# End-to-End: Invoice → Pay

This page shows the complete sequence from a POS cashier creating an invoice to the customer completing mobile money payment. It is the most common cross-pillar interaction.

---

## Scenario

!!! note "DRC Example"
    This worked example uses a DRC (`CD`) jurisdiction scenario. The same flow applies to any supported jurisdiction — only the tax groups, currency, and authority sync protocol change.

A cashier at **Outlet Kinshasa Gombe** sells 3 bags of cement to **Ets Kabila** for 135,000 CDF. The customer pays half in cash and half via Airtel Money.

---

## Sequence Diagram

```mermaid
sequenceDiagram
    actor Cashier
    participant POS as POS (PWA)
    participant FIS as Fiscal Platform API
    participant TAX as Tax Engine
    participant CSS as Cloud Signing Service (HSM)
    participant FL as Fiscal Ledger
    participant CTS as Canonical Transfer Service
    participant DIR as Directory / Rail Selector
    participant GW as Rail Gateway (Airtel MoMo)
    participant TELCO as Airtel Money API
    participant EB as Event Bus
    participant GL as GL Ledger

    Note over Cashier,POS: 1. Build invoice

    Cashier->>POS: Add items: 3× Ciment Portland @ 45,000 CDF
    POS->>POS: Auto-classify: TG01 (TVA 16%)
    POS->>POS: Calculate totals: HT=135,000 / TVA=21,600 / TTC=156,600
    Cashier->>POS: Select payments: Cash 78,300 + Airtel Money 78,300
    Cashier->>POS: Enter client: Ets Kabila (NIF-789012)

    Note over POS,FL: 2. Seal invoice (Fiscal Platform)

    POS->>FIS: POST /api/v1/invoices (canonical payload)
    FIS->>TAX: Validate tax groups + totals
    TAX-->>FIS: Valid
    FIS->>CSS: Sign payload
    CSS-->>FIS: fiscal_number, signature, auth_code, QR, timestamp
    FIS->>FL: Append sealed invoice (hash-chained)
    FIS-->>POS: 201 Created — fiscal_number: "001-2026-004821"

    Note over POS,GL: 3. Initiate payment (Payments Nucleus)

    POS->>CTS: POST /transfers
    Note right of POS: intent: PUSH, amount: 78300 CDF<br/>payer: Ets Kabila (Airtel)<br/>payee: Merchant settlement account<br/>endUserRef: "001-2026-004821"<br/>railHints: ["airtel_momo"]

    CTS->>DIR: Route transfer
    DIR-->>CTS: Selected rail: airtel_momo (score: 0.92)
    CTS->>GW: Submit payment
    GW->>TELCO: STK Push to +243 812 345 678
    TELCO-->>GW: Pending (STK sent)
    GW-->>CTS: SUBMITTED

    Note over Cashier,TELCO: 4. Customer approves

    TELCO->>TELCO: Customer enters PIN on phone
    TELCO-->>GW: Payment confirmed
    GW-->>CTS: SETTLED

    Note over CTS,GL: 5. Post-settlement

    CTS->>GL: Debit payer / Credit merchant (double-entry)
    CTS->>EB: Publish transfer.settled (endUserRef: "001-2026-004821")

    Note over EB,FIS: 6. Update invoice payment status (optional listener)

    EB->>FIS: transfer.settled (endUserRef: "001-2026-004821")
    FIS->>FIS: PATCH payments[1].status = "paid"

    Note over Cashier,POS: 7. Complete

    POS->>Cashier: ✅ Invoice sealed + payment confirmed
    POS->>Cashier: Print/share receipt (PDF with QR)
```

---

## Timing

| Step | Typical latency | Notes |
|---|---|---|
| Build invoice (client-side) | N/A | Depends on cashier speed |
| Seal invoice (Fiscal Platform) | < 1 s | HSM signing + ledger append |
| Route + submit to rail | < 500 ms | Smart Rail Selector + gateway call |
| STK Push delivery | 2–10 s | Depends on telco network |
| Customer PIN entry | 5–60 s | Human interaction |
| Settlement confirmation | < 2 s | Rail callback |
| Payment status update | < 1 s | Event Bus listener |
| **Total (seal → paid)** | **~10–75 s** | Dominated by customer PIN entry |

---

## Failure Scenarios

| Failure | Handling |
|---|---|
| **HSM signing fails** | POS shows error. Invoice is not sealed. No fiscal number assigned. Cashier retries. |
| **CTS route fails** | POS shows "Payment service unavailable". Invoice is already sealed — cashier can accept cash instead and update payment method. |
| **STK Push timeout** | CTS retries once. If still no response, marks transfer as `FAILED`. POS prompts cashier to retry or switch to cash. |
| **Customer declines** | TELCO returns decline → CTS marks `FAILED`. POS prompts for alternative payment. |
| **Event Bus listener down** | Invoice stays in `pending` payment status. POS client can poll CTS directly and update payment status via Fiscal Platform API. |

---

## Key Invariants

1. **The invoice is always sealed before payment is initiated.** The fiscal number exists regardless of whether payment succeeds.
2. **Cash payments skip the CTS entirely.** The `payments` array records `"method": "cash", "status": "paid"` immediately.
3. **The Fiscal Platform never calls the CTS.** The POS client initiates both requests.
4. **`endUserRef` is the only cross-reference.** Neither system queries the other's data store.
