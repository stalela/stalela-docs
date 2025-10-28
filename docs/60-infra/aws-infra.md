# AWS Infrastructure Blueprint (Stalela Nucleus)

## General
- VPC (3 AZs); public subnets (ALB/NLB), private subnets (ECS/RDS), VPC endpoints (S3, SQS, SNS, Secrets Manager, ECR, CloudWatch).
- Compute: ECS Fargate (services + workers); cron via EventBridge Scheduler → Fargate tasks.
- Images/Artifacts: ECR; S3 for payloads/statement files (KMS-CMK).
- Config/Secrets: SSM Parameter Store + Secrets Manager (rotation); per-task IAM roles.
- CI/CD: GitHub Actions OIDC → AWS; ECR push; Terraform (`storo-infra`) apply.
- Observability: CloudWatch logs/metrics/alarms; OpenTelemetry to AMP/Managed Grafana; X-Ray optional.
- Security: ALB + WAF (public), internal ALBs; TLS (ACM); KMS on RDS/S3/SNS/SQS; least‑privilege SGs & IAM.

## Event Bus & Outbox (cross‑cutting)
- Topics: SNS per domain (`transfers`, `ledger`, `recon`, `compliance`) with SQS subscriptions per consumer.
- Queues: SQS standard with DLQs; visibility timeout > max handler time; redrive policy.
- Ordering (rare): SNS/SQS FIFO for specific flows.
- Scaling: ECS autoscale on SQS depth; alarms on outbox backlog and consumer lag.
- Replay: Outbox in RDS; DLQ replay runbooks.

## Data Stores
- RDS Postgres (Multi‑AZ) per service (CTS, Ledger, Directory, Recon, Compliance); PITR; Performance Insights.
- S3 buckets per domain: `rail-artifacts`, `statements`, `raw-webhooks` (encryption, lifecycle, bucket policies).
- Optional: Elasticache Redis for hot lookups (Directory); OpenSearch only if needed for operator search.

## Canonical Transfer Service (CTS)
- ECS Fargate behind public ALB (HTTPS, ACM). Private internal ALB for service‑to‑service where applicable.
- RDS `storo_cts` (transfers, transfer_events, outbox).
- NAT egress for partners as needed; prefer VPC endpoints for AWS services.

## Rail Gateways (EcoCash, MTN/Airtel, OPPWA, Zimswitch, PayShap, USDC/Algo)
- ECS Fargate per gateway in private subnets; internal ALB.
- Public webhooks via dedicated public ALB + WAF, path `/webhooks/<rail>`.
- S3: raw payload snapshots; SQS DLQ for poison messages.
- Signing (USDC): CloudHSM or external signer; keys never leave enclave; task role scoped to signer.
- Partner connectivity: NAT egress; PrivateLink where supported.

## Ledger Service
- ECS Fargate + RDS `storo_ledger` (journals, postings, balances, outbox).
- SQS consumers for `transfers.accepted/settled/returned`; emit `ledger.*` to SNS.
- Internal ALB for read API; optional RDS Proxy; consider partitioning/archival strategy.

## Compliance Screening
- ECS Fargate + RDS `storo_compliance`; S3 for list sources; EventBridge for scheduled refresh.
- Private ingress from CTS; alarms on index age; DLQ for ingest failures.

## Directory & Routing
- ECS Fargate + RDS `storo_directory`; emits `directory.version.updated`.
- Optional Redis cache; internal `/routes` and `/calendars` APIs.

## Reconciliation & Returns
- S3 landing buckets per rail; S3 Put → SQS → ECS normalize workers.
- Recon service (ECS + RDS `storo_recon`) matches lines → emits `transfers.settled/returned`.
- EventBridge Scheduler for partner pulls; AWS Transfer Family for SFTP if required.

## Operator Console
- Internal Next.js on ECS behind internal ALB; access via AWS VPN/Client VPN or Identity Center.
- Optionally CloudFront + WAF + Cognito/Identity Center for controlled external access.

## Environments & Regions
- Separate AWS accounts: dev, staging, prod (Organizations, SCPs, guardrails).
- Region: af‑south‑1 for ZA residency; assess ZW residency needs.
- Per‑env VPC stacks; ECR image promotion by tag; snapshot retention (35d), cross‑account copy for DR.

## HA, DR, Backups
- RDS Multi‑AZ, PITR, snapshots; S3 versioning + lifecycle; SNS/SQS DLQs.
- ECS desired count ≥ 2 for critical services across 3 AZs; ALB health checks.
- Runbooks: DLQ drains, outbox replays, RDS failovers.

## Cost & Scaling
- Reduce NAT egress via VPC endpoints (S3 Gateway, SQS/SNS/SM/ECR/Logs interfaces).
- Autoscale: CPU/Memory + custom (SQS depth, publish lag).
- Fargate Spot for non‑critical batch workers (recon), if acceptable.

## Networking & Security
- SGs per service; no 0.0.0.0/0 on private tasks; WAF on public ALBs.
- IAM: per‑task roles; scoped access to S3 prefixes/SNS topics/SQS queues/KMS keys.
- Audit: CloudTrail, Config, GuardDuty, Security Hub; log retention per policy.

## Pipeline (per service)
- Build: GitHub Actions → ECR.
- Deploy: Terraform plans/applies; ECS service update; one‑off migration task before rollout.
- Contract checks in CI using Fixtures; optional canary tasks; rollback via task set or previous image tag.

---

## Serverless Pilot (Option A) — Lambda + API Gateway + Aurora Serverless v2

- Pilot decision: use API Gateway + Lambda, Aurora Serverless v2 (PostgreSQL) via RDS Proxy, SNS FIFO + SQS FIFO for events.
- Keep ECS guidance above for future non‑serverless services; pilot focuses on serverless for CTS and lightweight consumers.

### Stacks (infra repo, CDK)
- SharedVpcStack: VPC (2–3 AZs), private subnets for Lambdas + DB, NAT, interface endpoints (SQS/SNS/SM/Logs/ECR), SGs.
- DatabaseStack: Aurora Serverless v2 (min ACU 0.5–1, max 4), Multi‑AZ, RDS Proxy (IAM auth), parameter groups, Secrets Manager.
- EventingStack: SNS FIFO topic `events.transfers` with KMS; SQS FIFO DLQs and publish policy.
- ApiGatewayStack: API Gateway HTTP API (or REST if usage plans needed), WAF, stages, custom domain.
- ObservabilityStack: CloudWatch log groups, dashboards, alarms (p95, 5xx, SLO burn), X‑Ray.
- Outputs to SSM Parameter Store (per env):
  - `/storo/${env}/api/id`, `/storo/${env}/sns/events-transfers/arn`,
  - `/storo/${env}/rds/proxy/endpoint`, `/storo/${env}/rds/secret/arn`.

### Service stacks (service repos, CDK)
- Import SSM parameters, then define:
  - Lambdas: `cts-api`, `cts-outbox-worker`, optional `cts-inbound-consumer`.
  - API routes on shared API (integration + route) using imported API ID.
  - SQS FIFO queues subscribed to `events.transfers` (per consumer) with DLQs and alarms.
  - IAM roles: scoped to publish to SNS, read SQS, connect via RDS Proxy, read secrets.
  - Alarms/dashboards: p95, 5xx, queue lag, outbox failure rate, Lambda errors/throttles.

### Eventing (ordering & dedupe)
- SNS FIFO `events.transfers` with SQS FIFO subscribers per consumer.
- MessageGroupId = `transferId` (per‑key ordering), MessageDeduplicationId = `eventId`.
- DLQs: SQS standard per subscriber; 14d retention; runbooks for re‑drive.

### CDK snippets (TypeScript)
Register a Lambda on the shared API:
```ts
const apiId = ssm.StringParameter.valueForStringParameter(this, `/storo/${env}/api/id`);
const httpApi = apigwv2.HttpApi.fromHttpApiAttributes(this, 'SharedApi', { httpApiId: apiId });
const fn = new lambda.NodejsFunction(this, 'CtsApiFn', { vpc, vpcSubnets: { subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS },
  environment: { RDS_PROXY_ENDPOINT: proxy.endpoint }, tracing: lambda.Tracing.ACTIVE });
new apigwv2i.HttpLambdaIntegration('CtsApiInt', fn);
httpApi.addRoutes({ path: '/transfers', methods: [apigwv2.HttpMethod.POST], integration: new apigwv2i.HttpLambdaIntegration('Int', fn) });
```

Subscribe SQS FIFO to SNS FIFO:
```ts
const topicArn = ssm.StringParameter.valueForStringParameter(this, `/storo/${env}/sns/events-transfers/arn`);
const topic = sns.Topic.fromTopicArn(this, 'EventsTransfers', topicArn);
const q = new sqs.Queue(this, 'GatewayQueue', { fifo: true, contentBasedDeduplication: false });
new sns.Subscription(this, 'Sub', { topic, endpoint: q.queueArn, protocol: sns.SubscriptionProtocol.SQS,
  rawMessageDelivery: true, deadLetterQueue: new sqs.Queue(this, 'DLQ') });
```

Outbox worker schedule:
```ts
new events.Rule(this, 'OutboxSchedule', { schedule: events.Schedule.rate(cdk.Duration.minutes(1)),
  targets: [new targets.LambdaFunction(outboxFn, { retryAttempts: 2 })] });
```

### CI/CD (GitHub Actions with OIDC)
- Jobs: lint/test → cdk synth → cdk diff → deploy dev → integration tests → promote stage/prod with approval.
- Migrations (Flyway/Liquibase) step runs against RDS Proxy before Lambda canary.
```yaml
permissions: { id-token: write, contents: read }
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: aws-actions/configure-aws-credentials@v4
        with: { role-to-assume: arn:aws:iam::${{ secrets.AWS_ACCT }}:role/gh-oidc-cdk, aws-region: af-south-1 }
      - run: npm ci && npm run build && npx cdk synth
      - run: ./scripts/migrate.sh # runs flyway with RDS Proxy
      - run: npx cdk deploy CtsServiceStack --require-approval never
```

### Deployment order
1) Infra repo: VPC → DB + Proxy → Eventing → API → Observability → write SSM params.
2) Service repos: migrations → Lambdas → API routes → SNS/SQS subs → alarms.
3) Canary release via CodeDeploy Lambda alias (10%/10m) → 100%.

### Security & cost notes
- IAM least‑privilege per Lambda; SGs restrict DB access to RDS Proxy.
- Secrets Manager rotation (90d); IAM auth to RDS Proxy where feasible.
- Aurora min/max ACU per env; reserved concurrency caps; long polling SQS; schedule down non‑prod at night.