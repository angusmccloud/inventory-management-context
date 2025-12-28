# Implementation Plan: Suggester Workflow

**Branch**: `004-suggester-workflow` | **Date**: 2025-12-28 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/004-suggester-workflow/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Enable suggester role family members (typically children) to participate in household inventory management by viewing inventory items and submitting suggestions for shopping list additions or new item creation. Suggestions require admin approval, creating a safe workflow that teaches responsibility while maintaining data integrity.

The feature builds upon existing infrastructure (001-family-inventory-mvp and 003-member-management) by adding a new Suggestion entity with approval workflow, dedicated API endpoints for suggestion CRUD operations, and UI components for suggester submission and admin review.

## Technical Context

**Language/Version**: TypeScript 5 with strict mode enabled  
**Primary Dependencies**: 
- Frontend: Next.js 16 (App Router), React 18+, Vite (build tool), React Testing Library, common component library
- Backend: AWS SDK v3 (modular imports), AWS Lambda runtime (Node.js 24.x)
- Infrastructure: AWS SAM (Serverless Application Model)
- Deployment: AWS S3 + CloudFront (frontend), AWS Lambda (backend)

**Storage**: Amazon DynamoDB (single-table design pattern, extends existing table from 001)  
**Testing**: Jest and React Testing Library (80% coverage required for critical paths)  
**Target Platform**: Web browsers (Chrome, Firefox, Safari, Edge) with serverless backend on AWS Lambda  
**Project Type**: Web application (frontend + backend serverless APIs)  
**Performance Goals**: 
- API response time: <200ms p95 for read operations, <300ms p95 for write operations (suggestion approval may include item creation)
- Frontend: <30 seconds to submit suggestion, <15 seconds to review/approve suggestion

**Constraints**: 
- Must integrate with existing DynamoDB single-table design from 001-family-inventory-mvp
- Must use existing Lambda authorizer for role-based access control (suggester vs admin)
- Suggestions must maintain family isolation (familyId filtering)
- Must handle edge cases: deleted items, removed suggesters, duplicate names
- Approval operations must be atomic (status update + action execution)
- MUST use common component library (components/common/) per Constitution Principle VIII

**Scale/Scope**: 
- 4 new backend API endpoints (create, list, approve, reject suggestions)
- 2 new frontend pages (suggester submission, admin review)
- 1 new entity type (Suggestion)
- Extends existing DynamoDB table with new entity patterns
- ~200 lines backend code, ~300 lines frontend code

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### I. TypeScript Type Safety (NON-NEGOTIABLE)
- ✅ All code will be TypeScript 5 with strict mode
- ✅ No implicit `any` types allowed
- ✅ Explicit typing for Suggestion entity, API request/response types
- ✅ Shared types in dedicated type definition files (types/entities.ts extension)
- ✅ Generic types for reusable components

**Status**: PASS - Architecture supports strict TypeScript throughout

### II. Serverless Architecture
- ✅ Backend logic implemented as AWS Lambda functions (suggestion CRUD handlers)
- ✅ Extends existing DynamoDB single-table design
- ✅ Lambda functions stateless and idempotent
- ✅ Infrastructure defined in AWS SAM templates (extends template.yaml)
- ✅ Cold start optimization via tree-shaking and minimal dependencies

**Status**: PASS - Serverless-first architecture planned

### III. Testing Excellence (NON-NEGOTIABLE)
- ✅ Test-first development for suggestion workflow
- ✅ Unit tests for suggestion model and service logic
- ✅ Integration tests for all suggestion API handlers
- ✅ 80% code coverage for critical paths (approval workflow, edge cases)
- ✅ Jest and React Testing Library
- ✅ Mock DynamoDB operations in unit tests

**Status**: PASS - Test-driven approach mandatory

### IV. AWS Best Practices
- ✅ AWS SDK v3 with modular imports
- ✅ DynamoDB Document Client for suggestion data operations
- ✅ CloudWatch for structured logging
- ✅ IAM least-privilege principle (suggestion handlers require item read/write for approval)
- ✅ Queries with proper indexes (no scans, filter by familyId + status)
- ✅ Atomic operations for approval (transactional writes if needed)

**Status**: PASS - AWS best practices integrated

### V. Security First
- ✅ No secrets in version control
- ✅ Input validation with Zod (suggestion type, proposed item details)
- ✅ Role-based access control (suggester can create, admin can approve/reject)
- ✅ Family isolation enforced (all queries scoped by familyId from JWT)
- ✅ Prevent status manipulation (only pending→approved/rejected transitions allowed)

**Status**: PASS - Security designed into architecture

### VI. Performance Optimization
- ✅ DynamoDB query optimization (GSI for status filtering if needed)
- ✅ Lambda cold start optimization
- ✅ Code splitting for suggestion components
- ✅ Common component library reduces bundle size

**Status**: PASS - Performance considerations included

### VII. Code Organization
- ✅ Next.js 16 App Router directory structure
- ✅ Business logic separated from presentation (services/suggestions.ts)
- ✅ File colocation (components, styles, tests)
- ✅ SAM template extension in project root
- ✅ Type definitions colocated with modules

**Status**: PASS - Organization follows Next.js conventions

### VIII. Component Library (NON-NEGOTIABLE)
- ✅ UI components sourced from components/common/ library
- ✅ Use existing Button, Input, Card, Select components
- ✅ No one-off component implementations in feature directory
- ✅ Feature-specific components compose common components

**Status**: PASS - Common component library will be used

**OVERALL GATE STATUS: ✅ PASS - All constitutional requirements satisfied**

---

## Project Structure

### Documentation (this feature)

```text
specs/004-suggester-workflow/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
inventory-management-backend/
├── src/
│   ├── handlers/
│   │   ├── suggestions/              # NEW: Suggestion API handlers
│   │   │   ├── create-suggestion.ts
│   │   │   ├── list-suggestions.ts
│   │   │   ├── approve-suggestion.ts
│   │   │   └── reject-suggestion.ts
│   ├── models/
│   │   ├── suggestion.ts             # NEW: Suggestion DynamoDB model
│   ├── services/
│   │   ├── suggestions.ts            # NEW: Suggestion business logic
│   ├── types/
│   │   ├── entities.ts               # EXTEND: Add Suggestion type
│   │   ├── api.ts                    # EXTEND: Add suggestion API types
├── tests/
│   ├── unit/
│   │   ├── services/
│   │   │   └── suggestions.test.ts   # NEW: Service unit tests
│   ├── integration/
│   │   ├── handlers/
│   │   │   └── suggestions.test.ts   # NEW: Handler integration tests
├── template.yaml                      # EXTEND: Add suggestion Lambda functions

inventory-management-frontend/
├── app/
│   ├── dashboard/
│   │   ├── suggestions/              # NEW: Suggestion pages
│   │   │   ├── page.tsx              # List/review suggestions (admin view)
│   │   │   └── suggest/
│   │   │       └── page.tsx          # Submit suggestions (suggester view)
├── components/
│   ├── common/                       # USE: Button, Input, Card, Select, Badge, etc.
│   ├── suggestions/                  # NEW: Feature-specific suggestion components
│   │   ├── SuggestionForm.tsx        # Compose common components
│   │   ├── SuggestionList.tsx        # Compose common components
│   │   ├── SuggestionCard.tsx        # Compose common components
│   │   └── __tests__/
│   │       ├── SuggestionForm.test.tsx
│   │       ├── SuggestionList.test.tsx
│   │       └── SuggestionCard.test.tsx
├── lib/
│   ├── api/
│   │   ├── suggestions.ts            # NEW: Suggestion API client
├── types/
│   ├── entities.ts                   # EXTEND: Add Suggestion type

inventory-management-context/
├── specs/
│   └── 004-suggester-workflow/
│       ├── spec.md                   # Feature specification (input)
│       ├── plan.md                   # This file
│       ├── research.md               # Phase 0 output (to be generated)
│       ├── data-model.md             # Phase 1 output (to be generated)
│       ├── quickstart.md             # Phase 1 output (to be generated)
│       └── contracts/                # API contracts (to be generated)
```

**Structure Decision**: This feature extends the existing web application architecture by adding suggestion-specific handlers, models, services, and UI components. Backend adds 4 new Lambda function handlers for suggestion CRUD operations. Frontend adds 2 new pages under dashboard/suggestions/ and suggestion-specific components that compose common library components. The Suggestion entity extends the existing DynamoDB single-table design. This approach maintains separation of concerns while integrating seamlessly with the existing family inventory system (001) and member management (003).

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

No violations detected. All architectural decisions align with constitutional principles.

---

## Post-Design Constitutional Re-Evaluation

*Re-evaluated after Phase 1 design completion (2025-12-28)*

### Verification Against Completed Artifacts

✅ **TypeScript Type Safety**: 
- Data model defines strict TypeScript types for Suggestion entity
- All suggestion attributes have explicit type definitions
- API contracts enforce typed request/response schemas for suggestion endpoints
- No implicit `any` types in suggestion workflow

✅ **Serverless Architecture**:
- Data model extends existing DynamoDB single-table design (constitutional requirement)
- API contracts define REST endpoints suitable for Lambda handlers
- Research confirms atomic operations using TransactWriteItems
- Suggestion entity follows established entity patterns from 001

✅ **Testing Excellence**:
- Research documents comprehensive testing strategy (RT-010)
- Unit, integration, and component test patterns defined
- 80% coverage target for critical paths (approval workflow, edge cases)
- Mock strategies defined for AWS services

✅ **AWS Best Practices**:
- Data model uses DynamoDB best practices (single-table, GSI for status filtering)
- Research documents AWS SDK v3 usage with modular imports
- TransactWriteItems ensures atomic approval operations
- Optimistic locking pattern for concurrent approval handling
- Role-based access control using existing Lambda authorizer

✅ **Security First**:
- API contracts include authentication (Bearer JWT) for all endpoints
- Family isolation enforced in data model (all queries scoped by familyId)
- Role-based access control enforced (suggester can create, admin can approve/reject)
- Input validation with Zod schemas for suggestion types and proposed item details
- Defense-in-depth validation at both authorizer and service layers

✅ **Performance Optimization**:
- DynamoDB queries optimized (GSI1 for status filtering, no scans)
- Cursor-based pagination for suggestion lists
- Lambda cold start optimization through common library usage
- Efficient atomic operations reduce DynamoDB calls

✅ **Code Organization**:
- Project structure follows Next.js App Router conventions
- Backend organized by handlers, services, models (extends existing structure)
- Frontend suggestion components in dashboard/suggestions/
- Type definitions extend existing entities.ts
- Colocation of tests with source code

✅ **Component Library**:
- Research RT-008 confirms use of common components (Button, Input, Card, Badge, Modal)
- Feature-specific components compose common library components
- No one-off component implementations
- Maintains visual consistency and accessibility (WCAG 2.1 AA)

**POST-DESIGN GATE STATUS: ✅ PASS - All constitutional requirements validated in design artifacts**

**Artifacts Generated**:
- ✅ `research.md` - 10 research tasks with technical decisions and rationale
- ✅ `data-model.md` - Suggestion entity definition with DynamoDB patterns
- ✅ `contracts/api-spec.yaml` - OpenAPI 3.0 specification for suggestion endpoints
- ✅ `contracts/api-spec.md` - Human-readable API documentation
- ✅ `quickstart.md` - Developer implementation guide for suggestion workflow
- ✅ `.github/agents/copilot-instructions.md` - Agent context updated with tech stack

**Phase 1 Status**: ✅ COMPLETE

---

## Implementation Plan Execution Summary

**Executed**: 2025-12-28  
**Command**: `/speckit.plan`  
**Branch**: `004-suggester-workflow`

### Phases Completed

#### ✅ Phase 0: Outline & Research
**Status**: Complete  
**Output**: `research.md` (10 research tasks completed)

Key decisions documented:
- DynamoDB single-table extension with SUGGESTION# pattern and GSI1
- Atomic approval operations using TransactWriteItems
- Item snapshot storage for orphaned suggestion handling
- Pre-query validation for duplicate item names
- Role-based access control reusing existing Lambda authorizer
- GSI1 for status filtering with cursor-based pagination
- Indefinite retention policy for audit trail
- Common component library usage for UI (Button, Input, Card, Badge)
- Structured error responses with user-friendly messages
- Multi-layered testing strategy with mocked AWS services

#### ✅ Phase 1: Design & Contracts
**Status**: Complete  
**Outputs**: 
- `data-model.md` - Suggestion entity with complete schema
- `contracts/api-spec.yaml` - OpenAPI 3.0 specification (4 suggestion endpoints)
- `contracts/api-spec.md` - Human-readable API documentation
- `quickstart.md` - Developer onboarding guide
- `.github/agents/copilot-instructions.md` - Agent context updated

**Data Model Entities**:
- Suggestion (extends existing DynamoDB table from 001-family-inventory-mvp)
  - Attributes: suggestionId, familyId, suggestedBy, type, status, itemId, proposedItemName, etc.
  - DynamoDB pattern: PK=`FAMILY#<familyId>`, SK=`SUGGESTION#<suggestionId>`
  - GSI1: Status filtering (PK=`FAMILY#<familyId>#STATUS#<status>`, SK=`SUGGESTION#<createdAt>`)

**API Domains**:
- POST /families/{familyId}/suggestions - Create suggestion (suggester only)
- GET /families/{familyId}/suggestions - List suggestions with filtering
- POST /families/{familyId}/suggestions/{suggestionId}/approve - Approve suggestion (admin only)
- POST /families/{familyId}/suggestions/{suggestionId}/reject - Reject suggestion (admin only)

**Agent Context**:
- Technology stack documented for GitHub Copilot
- TypeScript 5 strict mode noted
- DynamoDB single-table design extension recorded
- Common component library usage requirement added

### Constitutional Compliance

**Pre-Design Check**: ✅ PASS (all 8 principles satisfied)  
**Post-Design Check**: ✅ PASS (validated against completed artifacts)

No violations. No complexity justifications required.

### Next Steps

1. ⏳ **Tasks Generation**: Run `/speckit.tasks` to create detailed task breakdown
2. ⏳ **Implementation**: Execute tasks from tasks.md
3. ⏳ **Testing**: Achieve 80% coverage for critical paths
4. ⏳ **Deployment**: Deploy to development environment

### Artifacts Location

All artifacts are in: `/Users/connortyrrell/Repos/inventory-management/inventory-management-context/specs/004-suggester-workflow/`

```
specs/004-suggester-workflow/
├── spec.md              # Feature specification (input)
├── plan.md              # This file (implementation plan)
├── research.md          # Technical decisions and rationale
├── data-model.md        # Suggestion entity schema
├── quickstart.md        # Developer implementation guide
└── contracts/
    ├── api-spec.yaml    # OpenAPI 3.0 API specification
    └── api-spec.md      # Human-readable API documentation
```

---

## Related Features

This specification builds upon and extends the following features:

| Feature ID | Name | Relationship | Status |
|------------|------|--------------|--------|
| `001-family-inventory-mvp` | Family Inventory MVP | **Parent** - Provides foundation (Family, InventoryItem, ShoppingListItem entities) | Implementation Complete |
| `003-member-management` | Family Member Management | **Parent** - Provides suggester role and member permissions | Specification Complete |
| `002-shopping-lists` | Shopping List Management | **Sibling** - Receives shopping list items from approved suggestions | Specification Complete |

**Note**: This specification focuses on the suggester workflow (viewing inventory and creating suggestions) and the admin workflow for reviewing suggestions. The suggester role itself is defined in feature 003-member-management.

---

**Plan Status**: ✅ PHASE 0 & 1 COMPLETE  
**Constitution Compliance**: ✅ VERIFIED  
**Next Command**: `/speckit.tasks` to generate implementation tasks  
**Branch**: `004-suggester-workflow`

## Project Structure

### Documentation (this feature)

```text
specs/[###-feature]/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)
<!--
  ACTION REQUIRED: Replace the placeholder tree below with the concrete layout
  for this feature. Delete unused options and expand the chosen structure with
  real paths (e.g., apps/admin, packages/something). The delivered plan must
  not include Option labels.
-->

```text
# [REMOVE IF UNUSED] Option 1: Single project (DEFAULT)
src/
├── models/
├── services/
├── cli/
└── lib/

tests/
├── contract/
├── integration/
└── unit/

# [REMOVE IF UNUSED] Option 2: Web application (when "frontend" + "backend" detected)
backend/
├── src/
│   ├── models/
│   ├── services/
│   └── api/
└── tests/

frontend/
├── src/
│   ├── components/
│   ├── pages/
│   └── services/
└── tests/

# [REMOVE IF UNUSED] Option 3: Mobile + API (when "iOS/Android" detected)
api/
└── [same as backend above]

ios/ or android/
└── [platform-specific structure: feature modules, UI flows, platform tests]
```

**Structure Decision**: [Document the selected structure and reference the real
directories captured above]

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| [e.g., 4th project] | [current need] | [why 3 projects insufficient] |
| [e.g., Repository pattern] | [specific problem] | [why direct DB access insufficient] |
