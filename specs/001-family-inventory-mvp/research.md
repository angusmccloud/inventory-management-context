# Technical Research: Family Inventory Management System MVP

**Feature**: 001-family-inventory-mvp  
**Date**: 2025-12-08  
**Purpose**: Resolve technical unknowns and document architectural decisions before design phase

## Research Tasks Completed

### 1. DynamoDB Single-Table Design for Multi-Tenant Family Data

**Decision**: Use single-table design with composite keys and GSIs for efficient multi-tenant data access

**Rationale**: 
- Single-table design reduces costs by minimizing read/write capacity units
- Enables efficient querying patterns for family-scoped data
- Supports hierarchical data access (Family → Members, Inventory, etc.)
- DynamoDB best practice for serverless applications per AWS recommendations

**Design Pattern**:
```
PK: FAMILY#{familyId}
SK: FAMILY#{familyId} | MEMBER#{memberId} | ITEM#{itemId} | NOTIFICATION#{notificationId} | etc.

GSI1:
  PK: MEMBER#{memberId}
  SK: FAMILY#{familyId}
  (enables member-to-family lookups)

GSI2:
  PK: FAMILY#{familyId}#ITEM
  SK: THRESHOLD#{threshold}#QUANTITY#{quantity}
  (enables low-stock queries)
```

**Alternatives Considered**:
- **Multi-table design**: Rejected due to higher costs, complexity in transactions, and increased Lambda execution time
- **RDS/PostgreSQL**: Rejected due to serverless cold start penalties, need for VPC management, and higher operational complexity
- **DocumentDB**: Rejected due to cost (minimum cluster size) and constitution mandate for DynamoDB

**References**:
- [AWS DynamoDB Single-Table Design Best Practices](https://aws.amazon.com/blogs/compute/creating-a-single-table-design-with-amazon-dynamodb/)
- [The DynamoDB Book by Alex DeBrie](https://www.dynamodbbook.com/)

---

### 2. Authentication and Authorization Strategy

**Decision**: Use AWS Cognito for authentication with custom authorizer Lambda for API Gateway

**Rationale**:
- Cognito provides managed user pools with email verification out-of-box
- Supports JWT tokens for stateless authentication
- Integrates seamlessly with API Gateway and Lambda
- Handles password policies, MFA, and account recovery
- Custom attributes support family membership and role metadata
- Cost-effective at expected scale (free tier covers 50k MAU)

**Implementation Approach**:
- Cognito User Pool for user authentication
- Custom attributes: `custom:familyId`, `custom:role`
- Lambda authorizer validates JWT and extracts family context
- Role-based access control (RBAC) enforced in business logic layer
- API requests include family context from JWT claims

**Alternatives Considered**:
- **NextAuth.js only**: Rejected because it requires session storage (adds complexity) and doesn't integrate as cleanly with AWS API Gateway
- **Custom JWT implementation**: Rejected due to security risks, maintenance burden, and need to build account management features
- **Auth0/Firebase Auth**: Rejected to maintain AWS-native architecture and avoid vendor lock-in

**References**:
- [AWS Cognito Developer Guide](https://docs.aws.amazon.com/cognito/latest/developerguide/)
- [API Gateway Lambda Authorizers](https://docs.aws.amazon.com/apigateway/latest/developerguide/apigateway-use-lambda-authorizer.html)

---

### 3. Email Notification Delivery via AWS SES

**Decision**: Use AWS SES (Simple Email Service) for sending low-stock notification emails

**Rationale**:
- Native AWS service with excellent Lambda integration
- Cost-effective ($0.10 per 1,000 emails)
- High deliverability rates when properly configured
- Supports templates for consistent notification formatting
- Easy to move out of sandbox for production (verify domain)
- CloudWatch integration for monitoring delivery metrics

**Implementation Approach**:
- SES email templates for low-stock notifications
- Lambda function triggered on notification creation
- Batch notifications to avoid overwhelming families (configurable digest frequency)
- Track delivery status via SES configuration sets
- Retry logic with exponential backoff for failed sends

**Alternatives Considered**:
- **SendGrid/Mailgun**: Rejected to maintain AWS-native architecture and avoid external dependencies
- **SNS for email**: Rejected because SES provides better templating and deliverability features
- **In-app only (no email)**: Rejected because spec explicitly requires email notifications (FR-016)

**References**:
- [AWS SES Developer Guide](https://docs.aws.amazon.com/ses/latest/dg/)
- [SES Email Templates](https://docs.aws.amazon.com/ses/latest/dg/send-personalized-email-api.html)

---

### 4. Next.js 16 App Router with Vite Build Tool

**Decision**: Use Next.js 16 App Router with Vite as the build tool for optimized development and production builds

**Rationale**:
- App Router is the modern Next.js approach (Pages Router is legacy)
- **Vite provides faster development builds** with instant HMR and ESM-based dev server
- **Optimized production builds** with automatic code splitting and tree-shaking
- Server Components reduce client bundle size
- Route groups enable clean authentication boundaries
- Streaming and Suspense improve perceived performance
- Static generation for optimal AWS S3 + CloudFront deployment

**Build Tool Benefits (Vite)**:
- **Fast HMR**: Sub-100ms hot module replacement
- **Native ESM**: No bundling during development
- **Optimized chunks**: Automatic vendor chunking and code splitting
- **TypeScript support**: Built-in, no additional configuration
- **Smaller bundle sizes**: Better tree-shaking than traditional bundlers

**Rendering Strategy**:
- **Server Components** (default): Dashboard, inventory lists, notifications
- **Client Components**: Interactive forms, shopping list checkboxes, real-time updates
- **Static Generation**: Landing page, marketing content, dashboard shells
- **Client-side data fetching**: SWR for dynamic user data

**Data Fetching**:
- Server Components fetch during build (for static pages)
- Client Components use SWR for client-side data fetching and caching
- Optimistic updates for better UX on mutations
- API calls to AWS Lambda backend via API Gateway

**Deployment Strategy**:
- **Static build output**: Vite generates optimized static assets
- **AWS S3**: Hosts static files (HTML, JS, CSS, images)
- **AWS CloudFront**: CDN for global distribution and HTTPS
- **API Gateway**: Separate backend API (Lambda functions)

**Alternatives Considered**:
- **Next.js built-in bundler**: Rejected because Vite provides faster builds and better DX
- **Webpack**: Rejected because Vite is significantly faster for development
- **Pages Router**: Rejected because App Router is the future and provides better patterns
- **Separate React SPA**: Rejected because Next.js provides better SEO and code organization
- **Vercel deployment**: Rejected in favor of AWS-native deployment for consistency

**References**:
- [Vite Documentation](https://vitejs.dev/)
- [Next.js 16 App Router Documentation](https://nextjs.org/docs/app)
- [Vite with React](https://vitejs.dev/guide/#scaffolding-your-first-vite-project)
- [AWS S3 Static Website Hosting](https://docs.aws.amazon.com/AmazonS3/latest/userguide/WebsiteHosting.html)

---

### 5. API Design Pattern: REST vs GraphQL

**Decision**: Use RESTful API design with standard HTTP methods and resource-oriented endpoints

**Rationale**:
- REST is simpler and aligns with AWS API Gateway + Lambda patterns
- Resource-oriented design maps cleanly to domain entities
- HTTP verbs (GET, POST, PUT, DELETE) are well-understood
- Easier to cache with standard HTTP caching headers
- Lower complexity for this scale of application
- OpenAPI specification enables API documentation and client generation

**Endpoint Structure**:
```
/api/families
/api/families/{familyId}/members
/api/families/{familyId}/inventory
/api/families/{familyId}/inventory/{itemId}
/api/families/{familyId}/shopping-list
/api/families/{familyId}/notifications
/api/families/{familyId}/suggestions
/api/families/{familyId}/locations
/api/families/{familyId}/stores
```

**Alternatives Considered**:
- **GraphQL**: Rejected because it adds complexity (schema, resolvers, client libraries) that's unnecessary for this feature set
- **gRPC**: Rejected because it's not browser-native and adds complexity
- **RPC-style endpoints**: Rejected because REST provides better semantic clarity

**References**:
- [RESTful API Design Best Practices](https://restfulapi.net/)
- [AWS API Gateway REST API](https://docs.aws.amazon.com/apigateway/latest/developerguide/apigateway-rest-api.html)

---

### 6. Lambda Function Organization and Cold Start Optimization

**Decision**: One Lambda function per logical API endpoint with shared layer for common dependencies

**Rationale**:
- Single responsibility per function improves maintainability
- Smaller bundle sizes reduce cold start times
- Easier to optimize and monitor individual functions
- Independent deployment and versioning
- Lambda layers for shared code (AWS SDK, utilities) reduce duplication

**Cold Start Optimization Techniques**:
- Use AWS SDK v3 with modular imports (tree-shaking)
- Minimize dependencies (audit with `npm ls` regularly)
- Keep handler code outside constructor/initialization
- Use Lambda SnapStart for Node.js 20 runtime (when available)
- Connection pooling for DynamoDB client (reuse across invocations)
- Provisioned concurrency for critical paths (post-MVP if needed)

**Alternatives Considered**:
- **Monolithic Lambda**: Rejected because larger bundles increase cold start times
- **Lambda per HTTP method**: Rejected as too granular; endpoint-level is the right balance
- **Separate Lambda layers per domain**: Considered but rejected; single shared layer is simpler

**References**:
- [AWS Lambda Best Practices](https://docs.aws.amazon.com/lambda/latest/dg/best-practices.html)
- [Lambda Cold Start Optimization](https://aws.amazon.com/blogs/compute/operating-lambda-performance-optimization-part-1/)
- [AWS SDK v3 Tree-Shaking](https://docs.aws.amazon.com/sdk-for-javascript/v3/developer-guide/welcome.html)

---

### 7. Testing Strategy for Serverless Application

**Decision**: Multi-layered testing approach with mocked AWS services and contract tests

**Rationale**:
- Unit tests verify business logic in isolation
- Integration tests validate Lambda handlers with mocked AWS SDK calls
- Contract tests ensure frontend-backend API alignment
- E2E tests validate critical user flows (limited due to cost)
- Mocking avoids actual AWS resource costs during testing

**Testing Layers**:

1. **Unit Tests** (Jest):
   - Business logic services
   - Utility functions
   - Data model validation
   - Target: 80%+ coverage

2. **Integration Tests** (Jest + AWS SDK mocks):
   - Lambda handler functions
   - DynamoDB query patterns
   - Error handling and edge cases
   - Use `aws-sdk-client-mock` for mocking

3. **Component Tests** (React Testing Library):
   - React components in isolation
   - User interactions and state management
   - Form validation

4. **Contract Tests** (Pact or OpenAPI validation):
   - Ensure frontend API expectations match backend implementation
   - Prevent breaking changes

5. **E2E Tests** (Playwright - limited):
   - Critical user flows (family creation, add item, low-stock notification)
   - Run in staging environment only
   - Limit to 5-10 scenarios due to execution time

**Mocking Strategy**:
- DynamoDB: Use `aws-sdk-client-mock` for unit/integration tests
- Cognito: Mock JWT validation in tests
- SES: Mock email sending; verify call parameters
- Use environment variables to toggle between real/mock services

**Alternatives Considered**:
- **LocalStack for all testing**: Rejected due to setup complexity and flakiness
- **Only E2E tests**: Rejected because slow feedback loop and expensive to maintain
- **No mocking (use real AWS)**: Rejected due to cost and test isolation concerns

**References**:
- [Jest Testing Framework](https://jestjs.io/)
- [React Testing Library](https://testing-library.com/react)
- [aws-sdk-client-mock](https://github.com/m-radzikowski/aws-sdk-client-mock)
- [Playwright E2E Testing](https://playwright.dev/)

---

### 8. Input Validation Strategy

**Decision**: Use Zod for TypeScript-first schema validation at API boundaries

**Rationale**:
- Zod provides TypeScript type inference from schemas (DRY principle)
- Runtime validation ensures data integrity
- Clear error messages for API consumers
- Integrates well with Next.js and Lambda handlers
- Prevents injection attacks and malformed data

**Implementation Approach**:
- Define Zod schemas for all API request/response payloads
- Validate inputs in Lambda handlers before business logic
- Use Zod's type inference for TypeScript types
- Centralized schema definitions in `/types/schemas/`

**Example**:
```typescript
import { z } from 'zod';

export const CreateInventoryItemSchema = z.object({
  name: z.string().min(1).max(100),
  quantity: z.number().int().min(0),
  threshold: z.number().int().min(0),
  locationId: z.string().uuid(),
  preferredStoreId: z.string().uuid().optional(),
});

export type CreateInventoryItemRequest = z.infer<typeof CreateInventoryItemSchema>;
```

**Alternatives Considered**:
- **Joi**: Rejected because Zod has better TypeScript integration
- **Class-validator**: Rejected because it requires decorators and classes (less functional)
- **Manual validation**: Rejected due to error-prone nature and lack of type safety

**References**:
- [Zod Documentation](https://zod.dev/)
- [TypeScript Schema Validation](https://www.npmjs.com/package/zod)

---

### 9. Secrets Management and Configuration

**Decision**: Use AWS Secrets Manager for sensitive data and Parameter Store for configuration

**Rationale**:
- Secrets Manager provides automatic rotation for credentials
- Parameter Store is cost-effective for non-sensitive configuration
- Both integrate natively with Lambda
- Secrets are never in version control or environment variables
- Supports per-environment configuration (dev, staging, prod)

**Usage Guidelines**:
- **Secrets Manager**: Database credentials, API keys, JWT secrets
- **Parameter Store**: Feature flags, email templates, notification settings
- **Environment Variables**: Non-sensitive config like region, stage name

**Implementation**:
- Lambda execution role grants read access to specific secrets/parameters
- Use AWS SDK v3 Secrets Manager and SSM clients
- Cache secrets in Lambda global scope (reuse across invocations)
- Prefix convention: `/inventory-mgmt/{env}/{secret-name}`

**Alternatives Considered**:
- **Environment variables only**: Rejected due to security risks (secrets in CloudFormation)
- **External vault (HashiCorp Vault)**: Rejected to maintain AWS-native simplicity
- **Parameter Store for everything**: Rejected because Secrets Manager provides rotation

**References**:
- [AWS Secrets Manager](https://docs.aws.amazon.com/secretsmanager/)
- [AWS Systems Manager Parameter Store](https://docs.aws.amazon.com/systems-manager/latest/userguide/systems-manager-parameter-store.html)

---

### 10. Monitoring and Observability

**Decision**: Use AWS CloudWatch for logging, metrics, and alarms with structured logging

**Rationale**:
- CloudWatch is built-in for Lambda (no additional setup)
- Structured JSON logs enable efficient querying with CloudWatch Insights
- Custom metrics track business-level events
- Alarms enable proactive issue detection
- X-Ray for distributed tracing (optional enhancement)

**Implementation Approach**:
- Structured logging library (pino or winston) with JSON formatter
- Log correlation IDs for request tracing
- Custom metrics: API latency, error rates, notification delivery
- Alarms: Lambda errors, DynamoDB throttling, SES bounce rates
- CloudWatch Dashboards for key metrics

**Logging Standards**:
```typescript
{
  "timestamp": "2025-12-08T12:34:56Z",
  "level": "info",
  "correlationId": "abc-123",
  "familyId": "family-456",
  "message": "Inventory item created",
  "context": {
    "itemId": "item-789",
    "quantity": 5
  }
}
```

**Alternatives Considered**:
- **DataDog/New Relic**: Rejected to avoid external costs and maintain AWS-native approach
- **ELK Stack**: Rejected due to operational overhead of managing Elasticsearch
- **Console.log only**: Rejected because unstructured logs are difficult to query

**References**:
- [CloudWatch Logs Insights](https://docs.aws.amazon.com/AmazonCloudWatch/latest/logs/AnalyzingLogData.html)
- [Structured Logging Best Practices](https://www.datadoghq.com/blog/log-file-formats/)
- [AWS X-Ray](https://aws.amazon.com/xray/)

---

### 11. Frontend Deployment Strategy: AWS S3 + CloudFront

**Decision**: Deploy frontend as static assets to S3 with CloudFront CDN

**Rationale**:
- **Cost-effective**: S3 storage is extremely cheap, CloudFront has generous free tier
- **Scalable**: Automatic scaling without server management
- **Fast**: CloudFront edge locations provide global low-latency access
- **AWS-native**: Keeps entire stack in AWS ecosystem
- **Simple CI/CD**: Easy integration with GitHub Actions, AWS CodePipeline, or Amplify
- **Vite compatibility**: Vite builds static assets perfect for S3 hosting

**Implementation Approach**:
- Vite builds static assets to `dist/` directory
- S3 bucket configured for static website hosting
- CloudFront distribution points to S3 bucket
- Route53 for custom domain (optional)
- SSL/TLS via AWS Certificate Manager (ACM)
- SPA routing handled via CloudFront error pages (404 → index.html)

**CI/CD Pipeline**:
```
1. Push to git → GitHub Actions
2. Run tests (npm test)
3. Build production (npm run build)
4. Sync to S3 (aws s3 sync dist/)
5. Invalidate CloudFront cache
```

**Alternatives Considered**:
- **Vercel**: Rejected to maintain AWS-native architecture and avoid vendor lock-in
- **AWS Amplify Hosting**: Valid alternative, but S3+CloudFront provides more control
- **AWS Elastic Beanstalk**: Rejected due to unnecessary server overhead for static site
- **EC2 + nginx**: Rejected due to operational overhead and cost

**Cost Estimate** (per month for 1000 users):
- S3 storage: ~$1
- S3 requests: ~$0.50
- CloudFront data transfer: ~$5 (first 1TB free)
- **Total**: ~$6.50/month (vs Vercel $20+)

**References**:
- [S3 Static Website Hosting](https://docs.aws.amazon.com/AmazonS3/latest/userguide/WebsiteHosting.html)
- [CloudFront with S3](https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/GettingStarted.SimpleDistribution.html)
- [SPA on S3+CloudFront](https://aws.amazon.com/blogs/compute/building-a-serverless-application-with-aws-sam/)

---

## Summary of Key Decisions

| Decision Area | Technology/Approach | Primary Rationale |
|--------------|---------------------|-------------------|
| Database | DynamoDB single-table design | Cost-effective, serverless-native, efficient queries |
| Authentication | AWS Cognito + Lambda authorizer | Managed service, JWT support, family context |
| Email | AWS SES | Native AWS integration, cost-effective |
| Frontend Framework | Next.js 16 App Router | Modern patterns, Server Components, code organization |
| Build Tool | Vite | Fast HMR, optimized builds, ESM-based development |
| Frontend Deployment | AWS S3 + CloudFront | Cost-effective, scalable, AWS-native, fast global delivery |
| API Design | RESTful with OpenAPI | Simplicity, caching, well-understood |
| Lambda Structure | One function per endpoint + shared layer | Balance of granularity and cold start optimization |
| Testing | Multi-layer with mocks | Fast feedback, cost-effective, comprehensive coverage |
| Validation | Zod | TypeScript integration, runtime safety |
| Secrets | Secrets Manager + Parameter Store | Security, rotation, native integration |
| Monitoring | CloudWatch with structured logs | Built-in, cost-effective, sufficient for scale |

## Next Steps

✅ **Phase 0 Complete**: All technical unknowns resolved  
➡️ **Phase 1**: Generate data model, API contracts, and quickstart guide  
➡️ **Phase 2**: Break down into implementation tasks

---

**Research Completed**: 2025-12-08  
**Reviewed By**: Constitution-aligned architectural review  
**Status**: Ready for Phase 1 Design

