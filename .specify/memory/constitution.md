<!--
SYNC IMPACT REPORT
===================
Version Change: 1.2.2 → 1.2.3
Rationale: Add mandatory pre-completion checks for frontend tasks to prevent deployment failures
Date: 2025-12-30

Changes Made:
1. Added "Pre-Completion Checks (Frontend)" section under Development Workflow
2. Mandated four required checks before marking frontend tasks complete:
   - `npx tsc --noEmit` for comprehensive type checking
   - `npm run build` for production build validation
   - `npm test` for test suite execution
   - `npm run lint` for code style validation
3. Emphasized that development servers are lenient and may hide production errors

Impact:
- Frontend tasks CANNOT be marked complete without running all four checks
- Reduces deployment failures from undetected TypeScript errors
- Catches unused imports, type mismatches, and build-specific errors
- Enforces production-ready code before task completion

Templates Impact:
- plan-template.md: ✅ No changes needed
- spec-template.md: ✅ No changes needed
- tasks-template.md: ✅ Task completion should reference pre-completion checks
- All templates will automatically enforce pre-completion check requirements

Breaking Changes: No - codifies best practices that should already be followed
Migration Required: No - establishes workflow requirement for future work

---

PREVIOUS VERSION: 1.2.2
===================
Version Change: 1.2.1 → 1.2.2
Rationale: Add implementation patterns from Spec004 learnings: type system hierarchy, security layers, DynamoDB patterns, error handling, and type validation
Date: 2025-12-28

Changes Made:
1. Added Type System Patterns section with feature-specific vs generic type file guidance
2. Added Security Implementation Layers section with backend+frontend enforcement
3. Added DynamoDB Patterns section for atomic operations and KeyBuilder utilities
4. Added Error Handling Patterns section for structured errors with context
5. Added Type Validation Standards section for production-first validation

Impact:
- Type imports MUST prefer feature-specific files over generic entities.ts
- Duplicate type definitions MUST be checked when debugging field name errors
- Security MUST be implemented in both backend (requireRole) and frontend (conditional rendering)
- DynamoDB operations MUST use KeyBuilder utilities and TransactWriteCommand for atomic operations
- Error messages MUST include context and correlation IDs for debugging
- Type validation MUST assume production backend strictness

Templates Impact:
- plan-template.md: ✅ Tasks should reference type hierarchy and security patterns
- spec-template.md: ✅ No changes needed
- tasks-template.md: ✅ Implementation tasks should follow DynamoDB and error handling patterns
- All templates will automatically enforce implementation best practices

Breaking Changes: No - these patterns codify lessons learned from production debugging
Migration Required: No - existing code already follows these patterns where implemented

---

PREVIOUS VERSION: 1.2.1
===================
Version Change: 1.2.0 → 1.2.1
Rationale: Add API Design Patterns section from prompts/constitution.md to standardize response formats and authentication patterns
Date: 2025-12-28

Changes Made:
1. Added "API Design Patterns" section to Technology Stack & Standards
2. Standardized response format: ALL API endpoints MUST return {data: T} wrapper
3. Defined frontend API client unwrapping pattern
4. Mandated defensive empty list handling in frontend components
5. Codified centralized auth utilities usage pattern from lib/auth
6. Documented family context resolution for new users without custom:familyId
7. Standardized error response format with proper status codes

Impact:
- All API responses MUST use consistent {data: T} format
- Frontend clients MUST unwrap response.data
- Empty arrays MUST be handled defensively with fallbacks
- Authentication MUST use shared utilities (no custom implementations)
- Error responses MUST follow consistent format

Templates Impact:
- plan-template.md: ✅ No changes needed (API patterns are implementation details)
- spec-template.md: ✅ No changes needed
- tasks-template.md: ✅ Tasks should reference API pattern standards
- All templates will automatically enforce API design patterns

Breaking Changes: No - these patterns codify existing best practices
Migration Required: No - existing code already follows these patterns

---

PREVIOUS VERSION: 1.2.0
===================
Version Change: 1.1.0 → 1.2.0
Rationale: Codify component library strategy to eliminate code duplication and ensure visual consistency
Date: 2025-12-26

Changes Made:
1. Added Principle VIII: Component Library (NON-NEGOTIABLE)
2. Mandated use of common component library (components/common/)
3. Prohibited one-off component implementations in feature directories
4. Specified exceptions for feature-specific components (with documentation requirement)
5. Added enforcement guidelines for code reviews and linting

Impact:
- All UI components MUST be sourced from common library
- New components MUST be added to common library, NOT feature directories
- 70%+ code reduction through component reuse
- 100% visual consistency enforced through shared components
- 50% faster development velocity with reusable components
- Centralized accessibility (WCAG 2.1 AA) and theme integration

Templates Impact:
- plan-template.md: ✅ Constitution Check will now validate component library usage
- spec-template.md: ✅ No changes needed
- tasks-template.md: ✅ Tasks should reference common components
- All templates will automatically enforce component library standards

Breaking Changes: Yes - existing one-off implementations must be migrated
Migration Required: Yes - feature 008-common-components provides migration path

Implementation:
- Feature 008-common-components: Common component library (13 base components)
- Migration: Replace one-off implementations across inventory, shopping-list, members, reference-data
- Enforcement: Code review checklist updated, ESLint rules recommended

---

PREVIOUS VERSION: 1.1.0
===================
Version Change: 1.0.0 → 1.1.0
Rationale: Codify build tool and deployment strategy for consistency across all features
Date: 2025-12-08

Changes Made:
1. Added Vite as mandatory build tool for frontend (Core Technologies)
2. Specified AWS S3 + CloudFront for frontend deployment (Core Technologies)
3. Added Vite-specific development standards (environment variables, output directory)
4. Expanded Deployment Process with detailed frontend deployment requirements
5. Explicitly prohibited third-party deployment platforms (Vercel, Netlify)

Impact:
- All future features MUST use Vite for frontend builds
- All frontend deployments MUST go to AWS S3 + CloudFront
- Ensures cost control (~$6.50/month vs Vercel ~$20/month)
- Maintains AWS-native architecture across entire stack
- Provides clear guidance for developer onboarding

Templates Impact:
- plan-template.md: ✅ No changes needed (already validates against constitution)
- spec-template.md: ✅ No changes needed
- tasks-template.md: ✅ No changes needed
- All templates will automatically enforce new build/deployment standards

Breaking Changes: None (this is first implementation of feature 001)
Migration Required: No (documentation-only change for new project)

---

PREVIOUS VERSION: 1.0.0
===================
Version Change: INITIAL → 1.0.0
Rationale: Initial constitution creation for Inventory Management System

New Principles Added:
1. TypeScript Type Safety (NON-NEGOTIABLE) - Strict typing with no implicit any
2. Serverless Architecture - AWS Lambda + Next.js serverless principles
3. Testing Excellence (NON-NEGOTIABLE) - Test-first, 80% coverage for critical paths
4. AWS Best Practices - SDK v3, DynamoDB optimization, least-privilege IAM
5. Security First - OWASP compliance, secrets management, input validation
6. Performance Optimization - Caching strategies, cold start optimization
7. Code Organization - Next.js App Router conventions, separation of concerns

New Sections Added:
- Technology Stack & Standards (Next.js 16, TypeScript 5, AWS SAM, DynamoDB)
- Development Workflow (code review, quality gates, deployment process)
- Governance (amendment process, compliance verification, quarterly reviews)

Templates Status:
- plan-template.md: ✅ Validated - Constitution Check section aligns with new principles
- spec-template.md: ✅ Validated - User stories and requirements structure compatible
- tasks-template.md: ✅ Validated - Test-first approach and organization aligns
- checklist-template.md: ✅ Present but not requiring updates
- agent-file-template.md: ✅ Present but not requiring updates

Constitution-Template Alignment Analysis:
✓ plan-template.md "Constitution Check" section supports principle-based gates
✓ spec-template.md user stories support test-driven and iterative development
✓ tasks-template.md explicitly enforces test-first (write tests, ensure they fail, implement)
✓ All templates support the TypeScript + Next.js + AWS architecture defined in constitution
✓ No agent-specific references (like "CLAUDE") found that need generalization

Follow-up TODOs: None - all templates are aligned with constitution principles
-->

# Inventory Management System Constitution

## Core Principles

### I. TypeScript Type Safety (NON-NEGOTIABLE)

**All code MUST be written in TypeScript 5 with strict mode enabled.**

- No implicit `any` types allowed
- All function parameters and return types MUST be explicitly typed
- Type assertions must be justified with comments explaining why they are safe
- Shared types and interfaces MUST be defined in dedicated type definition files
- Generic types MUST be used where appropriate to maintain type safety across components

**Rationale**: Type safety prevents an entire class of runtime errors, improves developer experience through IntelliSense, and serves as living documentation. Strict typing is especially critical in serverless environments where debugging production issues is more challenging.

### II. Serverless Architecture

**The system MUST follow serverless-first principles aligned with AWS Well-Architected Framework.**

- All backend logic MUST be implemented as AWS Lambda functions
- Use Next.js App Router route handlers for API endpoints
- DynamoDB single-table design pattern MUST be used when possible
- Lambda functions MUST be stateless and idempotent
- Cold start optimization is mandatory (tree-shaking, minimal dependencies, strategic bundling)
- Infrastructure MUST be defined in AWS SAM templates with proper IAM least-privilege policies

**Rationale**: Serverless architecture provides automatic scaling, reduced operational overhead, and cost efficiency by charging only for actual usage. This aligns with modern cloud-native development practices.

### III. Testing Excellence (NON-NEGOTIABLE)

**Test-first development is mandatory for all business-critical functionality.**

- Unit tests MUST be written for all business logic and utility functions
- Integration tests MUST cover all API route handlers
- Minimum 80% code coverage required for critical paths
- Tests MUST use Jest and React Testing Library
- Tests MUST run successfully before any PR can be merged
- Mock external dependencies (AWS services, third-party APIs) in unit tests

**Rationale**: Testing is the primary defense against regressions in serverless environments where local testing is limited. Test-first development ensures code is designed for testability from the start.

### IV. AWS Best Practices

**All AWS integrations MUST follow official best practices and use modern SDK patterns.**

- AWS SDK v3 MUST be used with modular imports (tree-shaking optimization)
- DynamoDB Document Client MUST be used for data operations
- CloudWatch MUST be used for structured logging and monitoring
- Secrets MUST be stored in AWS Secrets Manager or Parameter Store
- IAM roles MUST follow least-privilege principle
- All resources MUST be tagged appropriately for cost tracking
- Avoid DynamoDB scans; use queries with proper indexes

**Rationale**: Following AWS best practices ensures security, cost optimization, and maintainability. The modular SDK v3 reduces Lambda bundle sizes, improving cold start performance.

### V. Security First

**Security MUST be considered at every layer of the application.**

- Secrets and API keys MUST NEVER be committed to version control
- All user inputs MUST be validated and sanitized
- CORS and security headers MUST be properly configured
- Authentication and authorization MUST be implemented for all protected resources
- OWASP security guidelines MUST be followed
- Dependencies MUST be regularly audited for vulnerabilities
- Environment variables MUST be used for all configuration

**Rationale**: Security vulnerabilities can lead to data breaches, compliance violations, and loss of trust. A security-first approach prevents these issues from the foundation.

### VI. Performance Optimization

**Applications MUST be optimized for performance at all layers.**

- Next.js caching strategies (SSG, ISR, SSR) MUST be used appropriately
- Next.js Image component MUST be used for all images
- Code splitting and lazy loading MUST be implemented where beneficial
- DynamoDB queries MUST be optimized (proper indexes, avoid scans)
- Lambda functions MUST be optimized for cold start performance
- Client-side bundle size MUST be monitored and kept minimal

**Rationale**: Performance directly impacts user experience and operational costs. Serverless architectures amplify the importance of optimization due to cold starts and per-invocation billing.

### VII. Code Organization

**Code MUST be organized following Next.js 16 App Router conventions with clear separation of concerns.**

- Use Next.js App Router directory structure (`app/` directory)
- Business logic MUST be separated from presentation components
- Related files MUST be colocated (components, styles, tests)
- AWS SAM template and infrastructure code MUST be in project root
- DynamoDB table definitions MUST be in SAM template
- Shared utilities MUST be in a dedicated `lib/` or `utils/` directory
- Type definitions MUST be in `types/` or colocated with their modules

**Rationale**: Consistent organization improves maintainability, reduces cognitive load, and makes onboarding new developers faster. Colocation reduces the distance between related code.

### VIII. Component Library (NON-NEGOTIABLE)

**All UI components MUST be built as reusable components in the common library. One-off component implementations are prohibited.**

- UI components MUST be sourced from `components/common/` library
- New components MUST be added to the common library, NOT feature-specific directories
- One-off button/input/card implementations in feature directories are PROHIBITED
- Feature-specific components MUST compose common components, not recreate them
- Each common component MUST include TypeScript types, tests, and documentation
- Components MUST be theme-aware and consume centralized theme configuration
- All components MUST meet WCAG 2.1 AA accessibility standards
- Visual consistency MUST be enforced through shared component usage

**Exceptions** (feature-specific components allowed only when):
- Component is truly unique to a single feature with no reuse potential
- Component composes multiple common components for feature-specific layout
- Exception is documented and justified in code review

**Enforcement**:
- Code reviews MUST reject one-off component implementations
- ESLint rules SHOULD flag styling patterns outside common library
- New features MUST use existing common components before requesting new ones

**Rationale**: Component library eliminates code duplication (70%+ reduction achieved), ensures visual consistency across the application, centralizes accessibility and theme integration, and accelerates development velocity (50% faster with reusable components). One-off implementations create technical debt, styling inconsistencies, and maintenance burden.

## Technology Stack & Standards

### Core Technologies

- **Frontend Framework**: Next.js 16 with App Router
- **Build Tool**: Vite (for frontend builds and development)
- **Language**: TypeScript 5 with strict mode enabled
- **Runtime**: Node.js 24.x LTS
- **Backend Deployment**: AWS SAM (Serverless Application Model)
- **Frontend Deployment**: AWS S3 + CloudFront (static site hosting with CDN)
- **Database**: Amazon DynamoDB
- **Testing**: Jest and React Testing Library
- **Local Development**: Docker Engine (required for AWS SAM local testing)
  - Docker Desktop MUST NOT be used in this environment
  - Use Docker Engine directly via package manager (apt, yum, homebrew)

### Type System Patterns

**Type definitions MUST follow a clear hierarchy to prevent schema conflicts.**

- **Feature-specific type files** (e.g., `types/shoppingList.ts`, `types/inventory.ts`) are the **SINGLE SOURCE OF TRUTH** for their domain
- **Generic entity files** (e.g., `types/entities.ts`) MAY contain legacy or shared types but MUST NOT be used when feature-specific definitions exist
- When importing types, ALWAYS check for feature-specific type files FIRST before falling back to generic entity files
- Duplicate type definitions across files indicate a migration in progress - ALWAYS use the feature-specific version
- Field name errors (e.g., `itemName` vs `name`) are often caused by importing from the wrong type file

**Example - Correct Type Import Priority**:
```typescript
// ✅ CORRECT - Import from feature-specific file
import { ShoppingListItem } from '../types/shoppingList';

// ❌ WRONG - Generic entities.ts may have outdated schema
import { ShoppingListItem } from '../types/entities';
```

**Rationale**: As schemas evolve, type definitions may exist in multiple files. Feature-specific files contain the current production schema, while generic files may contain legacy definitions. This hierarchy prevents schema mismatches that cause silent data corruption (e.g., creating records with undefined fields due to wrong property names).

### Security Implementation Layers

**Security MUST be enforced at BOTH backend and frontend layers with different mechanisms.**

- **Backend Layer** (Authorization): 
  - Use `requireAdmin()` or `requireSuggester()` functions from `lib/auth`
  - Validate roles before ANY business logic execution
  - Return HTTP 403 Forbidden for unauthorized access attempts
  - Log all authorization failures for security monitoring
  
- **Frontend Layer** (UI Visibility):
  - Use conditional rendering based on `userContext.role` to hide unauthorized UI elements
  - Prevent users from seeing actions they cannot perform
  - Improve UX by removing confusing/broken functionality
  - Update BOTH desktop and mobile navigation when hiding nav items

**Example - Two-Layer Security**:
```typescript
// Backend - Authorization
import { requireAdmin } from '../lib/auth';

export const handler = async (event) => {
  const userContext = getUserContext(event, logger);
  await requireAdmin(userContext, familyId); // Throws 403 if not admin
  // ... business logic
};

// Frontend - UI Visibility  
const isAdmin = userContext?.role === 'admin';

{isAdmin && (
  <Button onClick={handleAdminAction}>Admin Action</Button>
)}
```

**Rationale**: Backend authorization prevents unauthorized API access (security), while frontend conditional rendering prevents confusing UX (usability). Both layers are required - frontend alone can be bypassed, backend alone creates confusing UI with broken buttons.

### DynamoDB Patterns

**DynamoDB operations MUST follow established patterns for consistency and correctness.**

- **KeyBuilder Utilities**: ALWAYS use `KeyBuilder` functions for generating partition/sort keys
  - Example: `KeyBuilder.shoppingListItem(familyId, itemId, storeId, isPurchased)`
  - Never construct keys manually with string concatenation
  
- **Atomic Operations**: Use `TransactWriteCommand` for operations that create multiple related items
  - Maximum 3 items per transaction (DynamoDB limit: 25, but keep simple)
  - Ensures all items are created together or none at all
  - Required for operations like "create inventory item AND add to shopping list"
  
- **Schema Compliance**: All DynamoDB items MUST include ALL required schema fields
  - Include version numbers for optimistic locking (`version: 1`)
  - Include TTL fields even if null (`ttl: null`)
  - Use `null` for nullable fields, not `undefined` (DynamoDB removes undefined fields)
  
- **Query Optimization**: Always use queries with proper indexes, NEVER scan operations
  - All queries MUST filter by `familyId` for family isolation
  - Use GSI2 for low-stock queries and shopping list filtering

**Example - Atomic Transaction**:
```typescript
import { TransactWriteCommand } from '@aws-sdk/lib-dynamodb';

const command = new TransactWriteCommand({
  TransactItems: [
    { Put: { TableName, Item: inventoryItem } },
    { Put: { TableName, Item: shoppingListItem } },
  ],
});
await docClient.send(command);
```

**Rationale**: KeyBuilder utilities prevent key format errors, atomic transactions prevent partial writes that corrupt data relationships, and schema compliance ensures all records work correctly with query patterns and application code.

### Error Handling Patterns

**Error responses MUST include sufficient context for debugging production issues.**

- All errors MUST include correlation IDs for tracing across logs
- Validation errors MUST include specific field errors from Zod
- Error messages MUST be helpful for developers while avoiding sensitive data exposure
- Log errors with CloudWatch structured JSON format including full context
- Return appropriate HTTP status codes: 400 (validation), 401 (auth), 403 (forbidden), 404 (not found), 500 (server error)

**Example - Structured Error Response**:
```typescript
catch (error) {
  logger.error('Failed to process suggestion', {
    correlationId,
    suggestionId,
    familyId,
    error: error instanceof Error ? error.message : 'Unknown error',
  });
  
  return {
    statusCode: 500,
    body: JSON.stringify({
      error: 'Internal server error',
      correlationId,
      message: process.env.NODE_ENV === 'development' ? error.message : undefined,
    }),
  };
}
```

**Rationale**: Production debugging in serverless environments is challenging because you cannot attach debuggers or inspect live state. Rich error context with correlation IDs allows tracing request flow across Lambda invocations and DynamoDB operations through CloudWatch Logs.

### Type Validation Standards

**Type validation MUST assume production AWS backend strictness, not local development leniency.**

- Write TypeScript types to match PRODUCTION DynamoDB schema and Lambda validation
- Do not rely on local development skipping validation (e.g., `IS_LOCAL` bypasses)
- Test with validation enabled to catch type mismatches before deployment
- Use strict type checking for nullable vs optional fields:
  - `fieldName: string | null` when field must exist but can be null
  - `fieldName?: string` when field may be omitted entirely
  
**Example - Production-First Types**:
```typescript
// ✅ CORRECT - Matches production validation
interface ShoppingListItem {
  name: string;              // Required field
  storeId: string | null;    // Required but nullable
  version: number;           // Required for optimistic locking
  ttl: number | null;        // Required for TTL cleanup
}

// ❌ WRONG - Assumes local development leniency
interface ShoppingListItem {
  name?: string;             // Optional in dev, breaks in prod
  storeId?: string;          // Undefined gets stripped by DynamoDB
}
```

**Rationale**: Local development may skip certain validation checks for convenience, but production environments enforce strict validation. Types that work locally but fail in production cause deployment failures and runtime errors. Always code against production requirements.

### Development Standards

- All asynchronous operations MUST use async/await (no raw Promises or callbacks)
- Error handling MUST be comprehensive with appropriate error boundaries
- Logging MUST be structured and include relevant context
- Next.js data fetching and caching best practices MUST be followed
- Vite MUST be used for frontend builds (NOT Webpack or other bundlers)
- Vite build output MUST go to `dist/` directory
- Environment variables MUST be used for all configuration
- Frontend environment variables MUST be prefixed with `NEXT_PUBLIC_` or `VITE_`
- Code MUST follow consistent formatting (use Prettier or similar)
- UI MUST meet WCAG 2.1 AA color-contrast requirements; white-on-white or other low-contrast text/background combinations are prohibited and form elements MUST retain visible focus states
- Automated accessibility checks (e.g., axe) MUST run in CI for new or changed pages/components and block merges on failures

### API Design Patterns

- **Response Format**: ALL API endpoints MUST return responses wrapped in a `data` field:
  ```typescript
  // ✅ CORRECT - Backend response format
  return {
    statusCode: 200,
    body: JSON.stringify({
      data: {
        items: [],
        totalCount: 0
      }
    })
  };
  
  // ❌ WRONG - Missing data wrapper
  return {
    statusCode: 200,
    body: JSON.stringify({
      items: [],
      totalCount: 0
    })
  };
  ```
- **Frontend API Client**: All API clients MUST expect and unwrap the `{data: T}` format:
  ```typescript
  const response: ApiSuccess<T> = await response.json();
  return response.data; // Unwrap and return inner object
  ```
- **Empty List Handling**: Frontend components MUST handle empty arrays defensively:
  ```typescript
  // ✅ CORRECT - Defensive with fallback
  const items = response.items || [];
  
  // ❌ WRONG - Assumes array always exists
  const items = response.items;
  ```
- **Authentication**: ALWAYS use centralized auth utilities from `lib/auth`:
  ```typescript
  // ✅ CORRECT - Use shared auth utilities
  import { getUserContext, requireAdmin } from '../lib/auth';
  const userContext = getUserContext(event, logger);
  
  // ❌ WRONG - Custom auth implementation
  const userContext = event.requestContext.authorizer;
  ```
- **Family Context Resolution**: For new users without `custom:familyId` in JWT:
  ```typescript
  // Query Member table first to get familyId
  const member = await memberModel.getByMemberId(userContext.userId);
  if (!member) {
    throw new Error('User must be member of a family');
  }
  const familyId = member.familyId;
  ```
- **Error Responses**: Use consistent error format with proper status codes:
  ```typescript
  return {
    statusCode: 400,
    body: JSON.stringify({
      error: 'Validation failed',
      details: zodError.errors
    })
  };
  ```

## Development Workflow

### Code Review Requirements

- All changes MUST go through pull request review
- At least one approval required before merging
- All tests MUST pass
- Code coverage MUST meet minimum thresholds for critical paths
- Security implications MUST be considered and documented

### Quality Gates

- TypeScript compilation MUST succeed with no errors
- Linting MUST pass with no errors (warnings acceptable with justification)
- All tests MUST pass
- Type checking (`npm run type-check`) MUST pass in CI for every pull request
- Vite production build (`npm run build`) MUST succeed in CI for every pull request
- Code coverage MUST meet requirements (80% for critical paths)
- Security audit MUST show no high-severity vulnerabilities

### Pre-Completion Checks (Frontend)

**Before marking any frontend task as complete, the following scripts MUST be run and pass:**

1. **Type Check**: `npx tsc --noEmit`
   - Validates ALL TypeScript errors across the entire codebase
   - Catches unused imports, type mismatches, missing properties
   - More comprehensive than build-time type checking
   - MUST show zero errors before task completion

2. **Production Build**: `npm run build`
   - Validates that production build compiles successfully
   - Ensures Next.js can generate static/dynamic pages
   - Catches build-specific errors that may not appear in development
   - MUST complete successfully with no errors

3. **Test Suite**: `npm test`
   - Runs all unit and integration tests
   - Required by Testing Excellence principle (III)
   - MUST pass with minimum 80% coverage for critical paths

4. **Linting** (if configured): `npm run lint`
   - Validates code style and catches common errors
   - MUST pass with no errors (warnings acceptable with justification)

**Rationale**: Development servers (`npm run dev`) are lenient and may not catch errors that will block production deployment. Running these checks locally before marking work complete prevents deployment failures and reduces iteration cycles. TypeScript's `--noEmit` flag is especially critical as it performs comprehensive type checking that may be skipped during incremental builds.

### Deployment Process

- Infrastructure changes MUST be reviewed separately from application code when possible
- SAM templates MUST be validated before deployment
- Deployments MUST follow blue-green or canary patterns for production
- Rollback procedures MUST be documented and tested

**Frontend Deployment** (AWS S3 + CloudFront):
- Frontend MUST be deployed to AWS S3 as static assets
- CloudFront MUST be used for CDN and HTTPS
- CloudFront cache MUST be invalidated after each deployment
- S3 bucket MUST be configured for static website hosting
- SPA routing MUST be handled via CloudFront error pages (404 → index.html)
- Third-party platforms (e.g., Vercel, Netlify) MUST NOT be used

**Backend Deployment** (AWS SAM):
- Backend MUST be deployed via `sam deploy` command
- Lambda functions MUST be tested locally with `sam local` before deployment
- API Gateway configurations MUST be reviewed for CORS and security headers

## Governance

This constitution supersedes all other development practices and guidelines. All code reviews, architectural decisions, and feature implementations MUST align with these principles.

**Amendment Process**:
- Proposed amendments MUST be documented with clear rationale
- Amendments MUST be reviewed and approved by project stakeholders
- Breaking changes require a migration plan
- Version number MUST be updated following semantic versioning

**Compliance**:
- All pull requests MUST be verified for constitutional compliance
- Deviations MUST be explicitly justified and documented
- Technical debt MUST be tracked and addressed systematically
- Regular constitutional reviews MUST occur quarterly

**Version**: 1.2.3 | **Ratified**: 2025-12-08 | **Last Amended**: 2025-12-30
