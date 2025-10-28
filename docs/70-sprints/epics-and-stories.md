# 🛠 Stalela Nucleus — Kanban Board (with Repos, Langs, Infra Deps)

> Columns: **Backlog → In Progress → Review → Done**  
> Each task card includes:  
> - **Repo:** where code/docs live  
> - **Lang:** primary implementation language  
> - **Infra:** infra dependencies (DB, SNS/SQS, etc.)

---

## 🚀 Backlog

### 🟦 Infrastructure Foundations
- [ ] Provision Aurora PostgreSQL Serverless v2 (multi-AZ)  
  - Repo: `infra-stacks` (Terraform/CDK)  
  - Lang: HCL/TypeScript (CDK)  
  - Infra: AWS RDS, VPC, Subnets  

- [ ] Configure RDS Proxy  
  - Repo: `infra-stacks`  
  - Lang: HCL/TypeScript  
  - Infra: RDS Proxy, Secrets Manager  

- [ ] Setup VPC, subnets, security groups  
  - Repo: `infra-stacks`  
  - Lang: HCL/TypeScript  
  - Infra: VPC, SGs, Route Tables  

- [ ] Setup Secrets Manager entries (DB creds, CTS API keys)  
  - Repo: `infra-stacks`  
  - Lang: HCL/TypeScript  
  - Infra: AWS Secrets Manager  

- [ ] Create SNS FIFO topic: `events.transfers`  
  - Repo: `infra-stacks`  
  - Lang: HCL/TypeScript  
  - Infra: AWS SNS FIFO  

- [ ] Create SQS FIFO queues: `gateway.usdc`, `ledger.postings`, `projections.timeline`  
  - Repo: `infra-stacks`  
  - Lang: HCL/TypeScript  
  - Infra: AWS SQS FIFO  

- [ ] Attach IAM publish/consume policies  
  - Repo: `infra-stacks`  
  - Lang: HCL/TypeScript  
  - Infra: AWS IAM  

- [ ] Baseline CloudWatch dashboards (API latency, backlog, lag)  
  - Repo: `infra-observability`  
  - Lang: TypeScript/Terraform  
  - Infra: AWS CloudWatch  

- [ ] Enable X-Ray tracing for services  
  - Repo: `infra-observability`  
  - Lang: TypeScript  
  - Infra: AWS X-Ray  

---

### 🟦 Contracts-First
- [ ] Finalize Event Envelope v1 (`events.md`)  
  - Repo: `storo-specs`  
  - Lang: Markdown/JSON Schema  
  - Infra: None  

- [ ] Define Canonical Transfer API (`POST/GET /transfers`)  
  - Repo: `storo-specs`  
  - Lang: OpenAPI (YAML), Markdown  
  - Infra: None  

- [ ] Publish golden fixtures (sample transfers/events)  
  - Repo: `storo-specs`  
  - Lang: JSON/YAML  
  - Infra: None  

- [ ] Contract validation CI job (`contract-validate`)  
  - Repo: `storo-specs`, `cts-api`, `rail-gateway-*`  
  - Lang: TS/Go, GitHub Actions  
  - Infra: CI/CD pipelines  

---

### 🟦 CTS API
- [ ] Scaffold CTS API service (Node/TS)  
  - Repo: `cts-api`  
  - Lang: TypeScript (NestJS/Express)  
  - Infra: Aurora, Secrets Manager  

- [ ] Add `/live`, `/ready`, `/metrics`, `/version` endpoints  
  - Repo: `cts-api`  
  - Lang: TS  
  - Infra: None  

- [ ] Implement Idempotency middleware (Idempotency-Key + body hash)  
  - Repo: `cts-api`  
  - Lang: TS  
  - Infra: Aurora (idempotency table)  

- [ ] Implement Canonical Request normalizer  
  - Repo: `cts-api`  
  - Lang: TS  
  - Infra: None  

- [ ] Add POST `/transfers`: validate, normalize, insert into `transfers` + `outbox`  
  - Repo: `cts-api`  
  - Lang: TS  
  - Infra: Aurora  

- [ ] Add GET `/transfers/:id`: return state + timeline  
  - Repo: `cts-api`  
  - Lang: TS  
  - Infra: Aurora  

- [ ] Structured logging (transferId, tenantId, eventId)  
  - Repo: `cts-api`  
  - Lang: TS  
  - Infra: CloudWatch, X-Ray  

---

### 🟦 Compliance Adapter
- [ ] Define /screen API contract (inputs/outputs)  
  - Repo: `storo-specs`  
  - Lang: Markdown/OpenAPI  
  - Infra: None  

- [ ] Implement Compliance API client  
  - Repo: `cts-api`  
  - Lang: TS  
  - Infra: HTTP → compliance service  

- [ ] Integrate Compliance check in CTS POST flow  
  - Repo: `cts-api`  
  - Lang: TS  
  - Infra: Compliance service endpoint  

---

### 🟦 Directory Adapter
- [ ] Define /routes API contract (inputs/outputs)  
  - Repo: `storo-specs`  
  - Lang: Markdown/OpenAPI  
  - Infra: None  

- [ ] Implement Directory API client (400ms timeout, retries, cache)  
  - Repo: `cts-api`  
  - Lang: TS  
  - Infra: Directory service endpoint, Redis/memory cache  

- [ ] Integrate Directory lookup in CTS POST flow  
  - Repo: `cts-api`  
  - Lang: TS  
  - Infra: Directory service endpoint  

---

### 🟦 Outbox Dispatcher
- [ ] Create outbox table schema in Aurora  
  - Repo: `cts-api`  
  - Lang: SQL migrations  
  - Infra: Aurora  

- [ ] Worker: poll PENDING rows  
  - Repo: `cts-outbox-worker`  
  - Lang: Go/TypeScript  
  - Infra: Aurora, SNS FIFO  

- [ ] Publish to SNS FIFO (GroupId=transferId, DedupId=eventId)  
  - Repo: `cts-outbox-worker`  
  - Lang: Go/TS  
  - Infra: SNS FIFO  

- [ ] Mark row SENT if publish succeeds  
  - Repo: `cts-outbox-worker`  
  - Lang: Go/TS  
  - Infra: Aurora  

- [ ] Retry/backoff logic + DLQ  
  - Repo: `cts-outbox-worker`  
  - Lang: Go/TS  
  - Infra: Aurora, SNS  

- [ ] Metrics: backlog size, publish lag, error count  
  - Repo: `cts-outbox-worker`  
  - Lang: Go/TS  
  - Infra: CloudWatch  

---

### 🟦 Inbound Consumer (CTS State Manager)
- [ ] Subscribe to `events.transfers.accepted|settled|returned|failed`  
  - Repo: `cts-consumer`  
  - Lang: Go/TS  
  - Infra: SQS FIFO  

- [ ] Dedupe by (transferId, type) or inbox table  
  - Repo: `cts-consumer`  
  - Lang: SQL migrations, Go/TS  
  - Infra: Aurora  

- [ ] Update transfers.state + append to `transfer_events`  
  - Repo: `cts-consumer`  
  - Lang: Go/TS  
  - Infra: Aurora  

---

### 🟦 Gateway — USDC
- [ ] Consume `events.transfers.submitted.usdc`  
  - Repo: `rail-gateway-usdc`  
  - Lang: Go  
  - Infra: SQS FIFO  

- [ ] Submit to USDC rail (mock → real integration)  
  - Repo: `rail-gateway-usdc`  
  - Lang: Go  
  - Infra: Algorand/USDC APIs  

- [ ] Emit `accepted` + `settled` via outbox dispatcher  
  - Repo: `rail-gateway-usdc`  
  - Lang: Go  
  - Infra: Aurora, SNS FIFO  

---

### 🟦 Ledger (Minimal Slice)
- [ ] Create journal schema (double-entry invariants)  
  - Repo: `ledger-service`  
  - Lang: SQL migrations  
  - Infra: Aurora  

- [ ] Consume `events.transfers.settled`  
  - Repo: `ledger-service`  
  - Lang: Go/TS  
  - Infra: SQS FIFO  

- [ ] Insert postings idempotently by (transferId, type)  
  - Repo: `ledger-service`  
  - Lang: Go/TS  
  - Infra: Aurora  

---

### 🟦 Observability & Runbooks
- [ ] Structured logs with correlation IDs  
  - Repo: `cts-api`, `cts-outbox-worker`, `rail-gateway-*`, `ledger-service`  
  - Lang: TS/Go  
  - Infra: CloudWatch  

- [ ] Alerts: backlog > 5k, consumer lag > 5m, API p95 > 1s  
  - Repo: `infra-observability`  
  - Lang: Terraform/CDK  
  - Infra: CloudWatch Alarms  

- [ ] Runbooks: latency, stuck SUBMITTED, DLQ triage  
  - Repo: `docs-ops`  
  - Lang: Markdown  
  - Infra: None  

---

## 🔄 In Progress
*(move tasks here as work begins)*

---

## 👀 Review
*(move tasks here when PR/open merge request ready for review)*

---

## ✅ Done
*(move tasks here when merged/deployed/validated)*

---

# 🔗 Critical Path
1. `infra-stacks` → Infra Foundations  
2. `storo-specs` → Contracts  
3. `cts-api` → API skeleton (POST/GET, adapters)  
4. `cts-outbox-worker` → Dispatcher  
5. `cts-consumer` → Inbound consumer  
6. `rail-gateway-usdc` → First rail integration  
7. `ledger-service` → Journal slice  
8. `infra-observability` → Alerts & dashboards
