# Architect Mode Rules

This file provides guidance for Architect mode when designing systems in this project.

## Serverless-First Architecture

- **All backend logic MUST be AWS Lambda functions**
- Use Next.js App Router route handlers for API endpoints
- Infrastructure defined in AWS SAM templates
- Follow AWS Well-Architected Framework pillars:
  - Operational Excellence
  - Security
  - Reliability
  - Performance Efficiency
  - Cost Optimization

## DynamoDB Design

- **Single-table design pattern is MANDATORY**
- Design access patterns BEFORE creating tables
- Use composite keys (PK + SK) for flexible querying
- Plan GSIs/LSIs based on query requirements
- Avoid table scans - design for Query operations
- Consider item collections for related data

## Lambda Requirements

- Functions MUST be **stateless** - no local state between invocations
- Functions MUST be **idempotent** - same input produces same result
- Optimize for cold starts:
  - Minimize dependencies
  - Use tree-shaking (AWS SDK v3 modular imports)
  - Keep bundle size small
  - Consider provisioned concurrency for critical paths

## IAM Security

- **Least-privilege principle is NON-NEGOTIABLE**
- Each Lambda gets its own role with minimal permissions
- Never use `*` for resources in production
- Use resource-based policies where appropriate
- Secrets in Secrets Manager or Parameter Store only

## Infrastructure as Code

- All resources defined in `template.yaml` (SAM)
- Use SAM parameters for environment-specific values
- Tag all resources for cost tracking
- Define proper resource dependencies
- Include rollback configurations