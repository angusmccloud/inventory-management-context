# Implementation Plan: Shopping List Management

**Branch**: `002-shopping-lists` | **Date**: 2025-12-10 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/002-shopping-lists/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Enable adults to create and manage family shopping lists that bridge inventory awareness to actionable shopping trips. Items can be added from tracked inventory or as free-text entries, organized by store, and checked off as purchased. The implementation reuses the ShoppingListItem entity from the parent feature's data model with optimistic locking for concurrent updates and DynamoDB TTL for automatic cleanup of purchased items.

## Technical Context

**Language/Version**: TypeScript 5 with strict mode enabled  
**Primary Dependencies**: Next.js 16 (App Router), AWS SDK v3, Zod (validation)  
**Storage**: Amazon DynamoDB (single-table design, reusing `InventoryManagement` table)  
**Testing**: Jest and React Testing Library (80% coverage for critical paths)  
**Target Platform**: Web application (AWS S3 + CloudFront for frontend, AWS Lambda for backend)  
**Project Type**: Web application (frontend + backend)  
**Performance Goals**: Add item in <10 seconds (SC-001), API response <200ms p95  
**Constraints**: Serverless-first, stateless Lambda functions, optimistic locking for concurrency  
**Scale/Scope**: Family-scoped data, multiple concurrent users per family

### Key Technical Decisions (from research.md)

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Data Model | Reuse ShoppingListItem from 001-family-inventory-mvp | Already complete, no duplication |
| Concurrency | Optimistic locking with `version` attribute | Prevents data loss, simpler than pessimistic |
| Retention | 7-day TTL for purchased items | Automatic cleanup via DynamoDB TTL |
| Store Assignment | Optional, `STORE#UNASSIGNED` sentinel | Reduces friction, supports "Unassigned" group |
| API Design | RESTful under `/api/families/{familyId}/shopping-list` | Consistent with parent feature |
| Real-Time | Deferred (polling for MVP) | Reduces complexity, future enhancement |

### Data Model Extensions

The ShoppingListItem entity from `001-family-inventory-mvp/data-model.md` requires two additional attributes:

```typescript
{
  // Existing attributes from parent data model...
  version: number;           // For optimistic locking (starts at 1)
  ttl: number | null;        // Unix timestamp for DynamoDB TTL (set when purchased)
}
```

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

**Post-Design Verification**: 2025-12-10 (Phase 1 Complete)

### I. TypeScript Type Safety (NON-NEGOTIABLE) ✅ PASS

- [x] All code in TypeScript 5 with strict mode
- [x] No implicit `any` types
- [x] All function parameters and return types explicitly typed
- [x] Shared types in dedicated type definition files
- [x] Zod schemas for runtime validation

**Evidence**:
- [`data-model.md`](./data-model.md) lines 289-341: Complete Zod schemas defined for `ShoppingListItemSchema`, `CreateShoppingListItemSchema`, `UpdateShoppingListItemSchema`, and `UpdateStatusSchema`
- [`quickstart.md`](./quickstart.md) lines 280-291: Handler implementation shows explicit typing with `z.object()` validation
- All types exported with `z.infer<>` for TypeScript integration

### II. Serverless Architecture ✅ PASS

- [x] All backend logic as AWS Lambda functions
- [x] Next.js App Router route handlers for API endpoints
- [x] DynamoDB single-table design (reusing `InventoryManagement` table)
- [x] Lambda functions stateless and idempotent
- [x] Cold start optimization (tree-shaking, minimal dependencies)
- [x] Infrastructure in AWS SAM templates

**Evidence**:
- [`quickstart.md`](./quickstart.md) lines 437-527: SAM template additions for 6 Lambda functions
- [`data-model.md`](./data-model.md) lines 14-16: Reuses existing `InventoryManagement` table
- [`research.md`](./research.md) lines 49-58: Optimistic locking ensures idempotency
- Handler examples use AWS SDK v3 modular imports for tree-shaking

### III. Testing Excellence (NON-NEGOTIABLE) ✅ PASS

- [x] Test-first development for business logic
- [x] Unit tests for all business logic and utilities
- [x] Integration tests for API route handlers
- [x] 80% code coverage for critical paths
- [x] Jest and React Testing Library
- [x] Mock AWS services in unit tests

**Evidence**:
- [`quickstart.md`](./quickstart.md) lines 167-264: Complete test examples with `aws-sdk-client-mock`
- [`quickstart.md`](./quickstart.md) lines 66-87: Test file structure defined for handlers and services
- Test-first workflow documented in lines 139-165

### IV. AWS Best Practices ✅ PASS

- [x] AWS SDK v3 with modular imports
- [x] DynamoDB Document Client for data operations
- [x] CloudWatch for structured logging
- [x] IAM roles with least-privilege
- [x] No table scans (Query operations only)
- [x] Resources tagged for cost tracking

**Evidence**:
- [`quickstart.md`](./quickstart.md) lines 271-277: Uses `@aws-sdk/client-dynamodb` and `@aws-sdk/lib-dynamodb` modular imports
- [`data-model.md`](./data-model.md) lines 26-34: All access patterns use Query operations with proper key conditions
- [`quickstart.md`](./quickstart.md) lines 455-526: SAM template uses `DynamoDBCrudPolicy` and `DynamoDBReadPolicy` for least-privilege

### V. Security First ✅ PASS

- [x] No secrets in version control
- [x] All user inputs validated (Zod schemas)
- [x] CORS and security headers configured
- [x] Role-based authorization (admin write, all read)
- [x] Environment variables for configuration

**Evidence**:
- [`contracts/api-spec.yaml`](./contracts/api-spec.yaml) lines 14-22: Authorization requirements documented (admin for write, any member for read)
- [`data-model.md`](./data-model.md) lines 376-378: Family isolation enforced via `familyId` in all queries
- [`quickstart.md`](./quickstart.md) lines 295-302: Role check in handler (`role !== 'admin'`)
- All configuration via `process.env.DYNAMODB_TABLE_NAME`

### VI. Performance Optimization ✅ PASS

- [x] Optimized DynamoDB queries (no scans)
- [x] Lambda cold start optimization
- [x] Client-side bundle size monitoring

**Evidence**:
- [`data-model.md`](./data-model.md) lines 26-34: All access patterns use Query with proper indexes
- [`research.md`](./research.md) lines 35-40: Confirms no new GSIs needed, uses existing GSI2
- Modular AWS SDK imports reduce bundle size

### VII. Code Organization ✅ PASS

- [x] Next.js App Router directory structure
- [x] Business logic separated from presentation
- [x] Related files colocated
- [x] Shared utilities in `lib/` or `utils/`
- [x] Type definitions in `types/` or colocated

**Evidence**:
- [`quickstart.md`](./quickstart.md) lines 62-113: Complete file structure with handlers, services, types, and tests colocated
- Backend handlers in `src/handlers/shopping-list/`
- Frontend components in `components/shopping-list/`
- Types in `src/types/shoppingList.ts`

---

### Constitution Check Summary

| Principle | Status | Notes |
|-----------|--------|-------|
| I. TypeScript Type Safety | ✅ PASS | Zod schemas, explicit types, strict mode |
| II. Serverless Architecture | ✅ PASS | Lambda functions, SAM templates, single-table design |
| III. Testing Excellence | ✅ PASS | Test-first examples, mock patterns, coverage targets |
| IV. AWS Best Practices | ✅ PASS | SDK v3 modular, Query-only, least-privilege IAM |
| V. Security First | ✅ PASS | Input validation, role-based auth, family isolation |
| VI. Performance Optimization | ✅ PASS | No scans, optimized queries, minimal dependencies |
| VII. Code Organization | ✅ PASS | App Router structure, colocation, separation of concerns |

**Gate Status**: ✅ ALL PRINCIPLES PASS - Ready for Phase 2 (Task Generation)

**Gate Violations**: None identified

## Project Structure

### Documentation (this feature)

```text
specs/002-shopping-lists/
├── plan.md              # This file
├── research.md          # Phase 0 output (complete)
├── spec.md              # Feature specification
├── data-model.md        # Phase 1 output (extends parent)
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output (API spec)
├── checklists/          # Requirements checklist
│   └── requirements.md
└── tasks.md             # Phase 2 output
```

### Source Code (repository root)

```text
# Web application structure (frontend + backend)
backend/
├── src/
│   ├── handlers/
│   │   └── shopping-list/
│   │       ├── create.ts
│   │       ├── list.ts
│   │       ├── get.ts
│   │       ├── update.ts
│   │       └── delete.ts
│   ├── services/
│   │   └── shopping-list.service.ts
│   ├── types/
│   │   └── shopping-list.ts
│   └── lib/
│       └── dynamodb.ts
└── tests/
    ├── unit/
    │   └── services/
    │       └── shopping-list.service.test.ts
    └── integration/
        └── handlers/
            └── shopping-list.test.ts

frontend/
├── src/
│   ├── app/
│   │   └── shopping-list/
│   │       ├── page.tsx
│   │       └── [storeId]/
│   │           └── page.tsx
│   ├── components/
│   │   └── shopping-list/
│   │       ├── ShoppingListItem.tsx
│   │       ├── AddItemForm.tsx
│   │       ├── StoreFilter.tsx
│   │       └── ShoppingListView.tsx
│   └── services/
│       └── shopping-list.api.ts
└── tests/
    └── components/
        └── shopping-list/
            └── ShoppingListItem.test.tsx
```

**Structure Decision**: Web application structure selected based on parent feature's architecture. Shopping list functionality extends existing backend/frontend separation with dedicated handlers, services, and components.

## Complexity Tracking

> **No constitution violations identified.** All decisions align with established principles.

| Aspect | Complexity | Justification |
|--------|------------|---------------|
| Data Model | Low | Reuses existing entity with 2 new attributes |
| Access Patterns | Low | Uses existing GSI2, no new indexes |
| Concurrency | Medium | Optimistic locking requires version tracking |
| API | Low | Standard RESTful CRUD operations |
| Authorization | Low | Reuses existing role-based model |

---

## Phase Completion Summary

### Phase 0: Research ✅ COMPLETE

**Output**: [`research.md`](./research.md)

Key decisions documented:
- Data model reuse from parent feature
- Optimistic locking with `version` attribute
- 7-day TTL for purchased items
- `STORE#UNASSIGNED` sentinel for null stores
- RESTful API under `/api/families/{familyId}/shopping-list`

### Phase 1: Design ✅ COMPLETE

**Outputs**:

| Artifact | Description | Status |
|----------|-------------|--------|
| [`data-model.md`](./data-model.md) | Extended ShoppingListItem entity with `version` and `ttl` attributes | ✅ Complete |
| [`contracts/api-spec.yaml`](./contracts/api-spec.yaml) | OpenAPI 3.0 specification for 5 endpoints | ✅ Complete |
| [`quickstart.md`](./quickstart.md) | Developer setup guide with test-first examples | ✅ Complete |
| [`.roo/rules/specify-rules.md`](../../.roo/rules/specify-rules.md) | Agent context updated with feature technologies | ✅ Complete |

**Key Design Decisions**:
1. **Data Model**: Extended parent's ShoppingListItem with `version: number` and `ttl: number | null`
2. **API Endpoints**: 6 Lambda functions (list, add, get, update, updateStatus, remove)
3. **Concurrency**: Optimistic locking with conditional writes
4. **Cleanup**: DynamoDB TTL for automatic 7-day retention
5. **Authorization**: Admin role for writes, any member for reads

### NEEDS CLARIFICATION Items: None

All technical decisions have been resolved. No open questions remain.

---

**Plan Status**: Phase 1 Complete
**Constitution Check**: ✅ ALL PASS (verified post-design)
**Next Phase**: Phase 2 - Task Generation (`/speckit.tasks`)
**Research Document**: [research.md](./research.md)
