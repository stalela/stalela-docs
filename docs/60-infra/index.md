# Infrastructure

This section documents deployment architectures for the Stalela Platform.

| Option | Services | Monthly Cost | Best For |
|--------|----------|-------------|----------|
| [Free Stack](free-stack.md) | Supabase · Vercel · Alibaba Cloud · Resend · GitHub Actions | $0 – $20 | Pilot, MVP, early production |
| [AWS Blueprint](../10-payments-nucleus/infra/aws-infra.md) | ECS Fargate · RDS · SNS/SQS · CloudHSM · S3 | $800 – $2 500+ | Scale-up, regulated production |

!!! tip "Start with Free Stack"
    The Free Stack is the recommended starting point. It covers **all** platform components (Payments Nucleus + Fiscal Platform) and costs nothing until you exceed free-tier limits. Migrate individual services to AWS when traffic or compliance requires it.
