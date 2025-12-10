# Implementation Plan: Suggester Workflow

**Branch**: `004-suggester-workflow` | **Date**: 2025-12-10 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/004-suggester-workflow/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Enable suggester users (typically children) to view family inventory and submit suggestions for adding items to the shopping list or creating new inventory items. Admins review and approve or reject these suggestions, maintaining control while fostering family participation. This feature builds upon the Member entity with role-based permissions from 003-member-management and the Suggestion entity defined in 001-family-inventory-mvp. Technical approach uses DynamoDB for suggestion records with optimistic locking for concurrent approval handling, and role-based access control via Lambda authorizer.

## Technical Context

**Language/Version**: TypeScript 5 with strict mode enabled
**Primary Dependencies**: Next.js 16 (App Router), AWS SDK v3, Zod (validation)
**Storage**: Amazon DynamoDB (single-table design, reusing `InventoryManagement` table from 001-family-inventory-mvp)
**Testing**: Jest and React Testing Library (80% coverage required for critical paths)
**Target Platform**: AWS Lambda (serverless), Web browser (frontend)
**Project Type**: Web application (frontend + backend)
**Performance Goals**: Suggestion submission in under 30 seconds (SC-001), approval/rejection in under 15 seconds (SC-003)
**Constraints**: Stateless Lambda functions, idempotent operations, least-privilege IAM, role-based access control
**Scale/Scope**: 2-6 members per family (typical), small-scale multi-user access

### Key Entities

**Suggestion** (from parent feature 001-family-inventory-mvp, lines 463-539):
- PK: `FAMILY#{familyId}`, SK: `SUGGESTION#{suggestionId}`
- GSI2PK: `FAMILY#{familyId}#SUGGESTIONS`, GSI2SK: `STATUS#{status}#CREATED#{createdAt}`
- Attributes: suggestionId, familyId, suggestedBy, type (add_to_shopping/create_item), status (pending/approved/rejected), itemId, proposedItemName, proposedQuantity, proposedThreshold, notes, reviewedBy, reviewedAt, entityType, createdAt, updatedAt

**Member** (from parent feature 003-member-management):
- PK: `FAMILY#{familyId}`, SK: `MEMBER#{memberId}`
- GSI1PK: `MEMBER#{memberId}`, GSI1SK: `FAMILY#{familyId}`
- Attributes: memberId, familyId, email, name, role (admin/suggester), status (active/removed), version, entityType, createdAt, updatedAt

**InventoryItem** (from parent feature 001-family-inventory-mvp):
- PK: `FAMILY#{familyId}`, SK: `ITEM#{itemId}`
- Referenced by "add_to_shopping" suggestions

**ShoppingListItem** (from parent feature 001-family-inventory-mvp):
- PK: `FAMILY#{familyId}`, SK: `SHOPPING#{shoppingItemId}`
- Created when "add_to_shopping" suggestions are approved

### Integration Points

1. **Lambda Authorizer**: Role-based access control validation (admin vs suggester permissions)
2. **DynamoDB**: Suggestion, Member, InventoryItem, and ShoppingListItem records in `InventoryManagement` table
3. **AWS Cognito**: User authentication (from parent features)

### Dependencies on Parent Features

**From 001-family-inventory-mvp:**
- Family entity and family isolation mechanisms
- InventoryItem entity with all attributes
- ShoppingListItem entity for approved "add_to_shopping" suggestions
- Suggestion entity schema (lines 463-539 of data-model.md)
- DynamoDB single-table design with GSI2 for suggestion queries
- Authentication system (AWS Cognito user pool)

**From 003-member-management:**
- Member entity with role-based permissions (admin/suggester)
- Role validation and enforcement
- Member status management (active/removed)
- Lambda authorizer for role-based access control
- Optimistic locking pattern (version attribute)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### NON-NEGOTIABLE Requirements (from constitution v1.1.0)

| Principle | Requirement | Status | Notes |
|-----------|-------------|--------|-------|
| **I. TypeScript Type Safety** | All code in TypeScript 5 strict mode, no implicit `any` | ✅ COMPLIANT | Will use Zod schemas for Suggestion entity |
| **II. Serverless Architecture** | All backend logic as AWS Lambda functions | ✅ COMPLIANT | Suggestion management APIs via Lambda |
| **II. Serverless Architecture** | DynamoDB single-table design | ✅ COMPLIANT | Reusing `InventoryManagement` table |
| **II. Serverless Architecture** | Lambda functions stateless and idempotent | ✅ COMPLIANT | Suggestion operations designed for idempotency |
| **III. Testing Excellence** | Test-first development, 80% coverage for critical paths | ✅ COMPLIANT | Will require tests for all suggestion management logic |
| **III. Testing Excellence** | Jest and React Testing Library | ✅ COMPLIANT | Standard testing frameworks |
| **IV. AWS Best Practices** | AWS SDK v3 with modular imports | ✅ COMPLIANT | Tree-shaking for DynamoDB client |
| **IV. AWS Best Practices** | IAM least-privilege principle | ✅ COMPLIANT | Separate roles for suggestion management Lambdas |
| **IV. AWS Best Practices** | Avoid DynamoDB scans | ✅ COMPLIANT | GSI2 for efficient suggestion queries |
| **V. Security First** | All user inputs validated and sanitized | ✅ COMPLIANT | Zod validation for all API inputs |
| **V. Security First** | Authentication and authorization for protected resources | ✅ COMPLIANT | Lambda authorizer validates JWT and role |
| **VI. Performance Optimization** | Lambda cold start optimization | ✅ COMPLIANT | Minimal dependencies, modular SDK imports |
| **VII. Code Organization** | Next.js App Router conventions | ✅ COMPLIANT | API routes in `app/api/` directory |

### Gate Evaluation

**GATE STATUS: ✅ PASS** - No constitution violations identified. All requirements align with constitution principles.

### Deployment Requirements (from constitution)

- Frontend: AWS S3 + CloudFront (NOT Vercel/Netlify)
- Backend: AWS SAM (`sam deploy`)
- Infrastructure: All resources in `template.yaml`

## Project Structure

### Documentation (this feature)

```text
specs/004-suggester-workflow/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
│   └── api-spec.yaml    # OpenAPI specification for suggestion management APIs
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
# Web application structure (frontend + backend)
src/
├── app/
│   └── api/
│       └── families/
│           └── [familyId]/
│               ├── inventory/           # Inventory viewing for suggesters
│               │   └── route.ts         # GET (list items - read-only for suggesters)
│               └── suggestions/         # Suggestion management API routes
│                   ├── route.ts         # GET (list), POST (create)
│                   └── [suggestionId]/
│                       ├── route.ts     # GET (details)
│                       ├── approve/
│                       │   └── route.ts # POST (approve - admin only)
│                       └── reject/
│                           └── route.ts # POST (reject - admin only)
├── components/
│   └── suggestions/                     # Suggestion management UI components
│       ├── SuggestionList.tsx
│       ├── CreateSuggestionForm.tsx
│       ├── SuggestionCard.tsx
│       ├── SuggestionReviewPanel.tsx
│       └── SuggestionStatusBadge.tsx
├── lib/
│   └── dynamodb/
│       └── suggestionRepository.ts
├── services/
│   └── suggestionService.ts             # Suggestion management business logic
└── types/
    └── suggestion.ts                    # Suggestion type definitions

tests/
├── unit/
│   ├── services/
│   │   └── suggestionService.test.ts
│   └── lib/
│       └── suggestionRepository.test.ts
├── integration/
│   └── api/
│       └── suggestions.test.ts
└── contract/
    └── suggestionApi.contract.test.ts
```

**Structure Decision**: Web application structure selected. This feature adds suggestion management APIs and UI components to the existing Next.js App Router application from parent features.

## Phase 0 Research Items (RESOLVED)

All clarification items have been resolved. See [`research.md`](./research.md) for detailed decisions.

| # | Question | Decision | Rationale |
|---|----------|----------|-----------|
| 1 | Concurrent approvals | Status + version locking | Defense in depth, clear error handling |
| 2 | Orphaned suggestions | Store name snapshot, fail gracefully | Preserves audit trail, admin control |
| 3 | Duplicate suggestions | Allow duplicates | Simplicity, aligns with spec |
| 4 | Retention policy | Indefinite retention | Audit trail, minimal storage cost |
| 5 | Atomic execution | DynamoDB TransactWriteItems | ACID guarantees, single API call |
| 6 | Role validation | Both authorizer and service | Defense in depth, detailed errors |
| 7 | Removed suggester | Keep pending, show name | Preserves history, admin control |

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| None | N/A | N/A |

**Note**: No constitution violations identified. All requirements align with established patterns from parent features.

---

## Post-Design Constitution Check

*GATE: Re-evaluated after Phase 1 design completion.*

### Verification Against Constitution v1.1.0

| Principle | Requirement | Status | Evidence |
|-----------|-------------|--------|----------|
| **I. TypeScript Type Safety** | All code in TypeScript 5 strict mode, no implicit `any` | ✅ PASS | Zod schemas in data-model.md with explicit types for all entities |
| **I. TypeScript Type Safety** | All function parameters and return types explicitly typed | ✅ PASS | quickstart.md examples show typed functions |
| **II. Serverless Architecture** | All backend logic as AWS Lambda functions | ✅ PASS | API routes designed for Lambda deployment |
| **II. Serverless Architecture** | DynamoDB single-table design | ✅ PASS | Suggestion entity uses PK=`FAMILY#{familyId}`, SK=`SUGGESTION#{suggestionId}` |
| **II. Serverless Architecture** | Lambda functions stateless and idempotent | ✅ PASS | Optimistic locking pattern ensures idempotency |
| **III. Testing Excellence** | Test-first development, 80% coverage for critical paths | ✅ PASS | Test structure and examples in quickstart.md |
| **III. Testing Excellence** | Jest and React Testing Library | ✅ PASS | Mock patterns and test examples use Jest |
| **IV. AWS Best Practices** | AWS SDK v3 with modular imports | ✅ PASS | Modular imports shown: `@aws-sdk/lib-dynamodb`, etc. |
| **IV. AWS Best Practices** | IAM least-privilege principle | ✅ PASS | Each Lambda has specific policies |
| **IV. AWS Best Practices** | Avoid DynamoDB scans | ✅ PASS | All access patterns use Query operations via GSI2 |
| **V. Security First** | All user inputs validated and sanitized | ✅ PASS | Zod validation schemas for all API inputs |
| **V. Security First** | Authentication and authorization for protected resources | ✅ PASS | JWT auth via Cognito, role-based access control |
| **VI. Performance Optimization** | Lambda cold start optimization | ✅ PASS | Modular SDK imports, minimal dependencies |
| **VI. Performance Optimization** | DynamoDB queries optimized | ✅ PASS | GSI2 for efficient suggestion queries by status |
| **VII. Code Organization** | Next.js App Router conventions | ✅ PASS | Project structure follows conventions |
| **VII. Code Organization** | Business logic separated from presentation | ✅ PASS | Services layer separate from handlers |

### Post-Design Gate Evaluation

**GATE STATUS: ✅ PASS** - All 16 constitution requirements verified against design artifacts.

### Generated Artifacts Summary

| Artifact | Path | Description |
|----------|------|-------------|
| Research | [`specs/004-suggester-workflow/research.md`](./research.md) | 7 research decisions with rationale |
| Data Model | [`specs/004-suggester-workflow/data-model.md`](./data-model.md) | Suggestion entity with TypeScript/Zod schemas |
| API Spec | [`specs/004-suggester-workflow/contracts/api-spec.md`](./contracts/api-spec.md) | REST API specification with 6 endpoints |
| Quickstart | [`specs/004-suggester-workflow/quickstart.md`](./quickstart.md) | Developer implementation guide |

### Recommendations for Implementation Phase

1. **Type Definitions First**: Implement Zod schemas before repository layer
2. **Repository Layer Priority**: Implement and thoroughly test DynamoDB operations
3. **Test Coverage**: Ensure 80%+ coverage on critical paths:
   - Role validation logic
   - Optimistic locking conflict handling
   - Atomic transaction execution
4. **Transaction Testing**: Test TransactWriteItems with various failure scenarios
5. **Migration Strategy**: Plan for adding `version`, `itemNameSnapshot`, `suggestedByName` to existing suggestions

---

## Phase 1 Status

**✅ PHASE 1 COMPLETE** - Design phase finished on 2025-12-10

### Completed Deliverables

- [x] Phase 0 Research: All 7 clarification items resolved
- [x] Phase 1 Design: data-model.md with Suggestion entity details
- [x] Phase 1 Design: API contracts (api-spec.md) with 6 endpoints
- [x] Phase 1 Design: quickstart.md developer guide
- [x] Post-Design Constitution Check: All 16 requirements verified

### Next Steps

1. **Phase 2 Tasks**: Run `/speckit.tasks` to generate detailed task breakdown
2. **Implementation**: Follow quickstart.md implementation order
3. **Quality Gates**: Use checklists/requirements.md for validation
