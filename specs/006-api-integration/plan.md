# Implementation Plan: NFC Inventory Tap

**Branch**: `006-nfc-inventory-tap` | **Date**: December 26, 2025 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/006-api-integration/spec.md`

## Summary

Enable frictionless household inventory tracking by tapping passive NFC tags attached to items. The tap opens a web page at inventoryhq.io that automatically applies a default adjustment (-1), displays clear feedback, and provides + / - buttons for additional adjustments. No authentication or app installation required. URL IDs are cryptographically random and rotatable, treating possession as authorization for household convenience.

## Technical Context

**Language/Version**: TypeScript 5.x with strict mode (frontend & backend)  
**Primary Dependencies**: 
- Frontend: Next.js 16 App Router, React 19, Vite build tool
- Backend: AWS Lambda (Node.js 24.x), AWS SDK v3 (modular imports)
- Testing: Jest, React Testing Library

**Storage**: Amazon DynamoDB (single-table design, extends existing InventoryManagement table)  
**Testing**: Jest + React Testing Library (80% coverage for critical paths)  
**Target Platform**: 
- Frontend: Web browsers (mobile-first, iOS Safari + Android Chrome)
- Backend: AWS Lambda functions (serverless)

**Project Type**: Web application (frontend + backend split across repositories)  
**Performance Goals**: 
- NFC page load: <2 seconds on standard mobile connections
- Adjustment response: <1 second per button press
- 95% success rate for NFC page loads

**Constraints**: 
- No authentication/login required for NFC page
- Must work without app installation
- Must work on passive NFC tags (URL-based only)
- Minimum touch target: 44x44px
- WCAG 2.1 AA color contrast required

**Scale/Scope**: 
- New NFCUrl entity in DynamoDB
- New unauthenticated API endpoint (/t/{urlId})
- Admin UI extensions in existing inventory management
- Mobile-optimized web page (single new route)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Principle I: TypeScript Type Safety ✅ PASS
- **Status**: COMPLIANT
- All code will use TypeScript 5 strict mode
- NFCUrl entity types defined explicitly
- API contracts will use Zod for runtime validation
- No implicit any types

### Principle II: Serverless Architecture ✅ PASS
- **Status**: COMPLIANT
- Backend: AWS Lambda functions for NFC URL management and adjustment API
- Frontend: Next.js App Router with API route handlers
- DynamoDB single-table design (extends existing table)
- Stateless, idempotent Lambda functions
- Infrastructure defined in AWS SAM template

### Principle III: Testing Excellence ✅ PASS
- **Status**: COMPLIANT
- Test-first development for all adjustment logic
- Unit tests for URL generation, validation, rotation
- Integration tests for NFC page and API endpoints
- 80% coverage target for critical paths (atomic adjustments, concurrency)
- Jest + React Testing Library

### Principle IV: AWS Best Practices ✅ PASS
- **Status**: COMPLIANT
- AWS SDK v3 with modular imports
- DynamoDB Document Client for all operations
- No table scans (queries using PK/SK and GSI)
- CloudWatch structured logging
- IAM least-privilege (separate roles for read vs write)

### Principle V: Security First ✅ PASS (with justification)
- **Status**: COMPLIANT (intentional security model)
- **Justification**: URL IDs are treated as shared secrets (bearer token model)
  - Cryptographically random (sufficient entropy to prevent guessing)
  - Rotatable when compromised
  - Family isolation enforced (URL maps to specific familyId)
  - HTTPS required for all requests
- No OWASP violation: possession-based access is intentional for household UX
- Input validation via Zod for all adjustment requests

### Principle VI: Performance Optimization ✅ PASS
- **Status**: COMPLIANT
- NFC page optimized for mobile (minimal bundle, lazy loading)
- DynamoDB queries optimized (no scans, proper indexes)
- Lambda cold start optimization (tree-shaking via SDK v3)
- Next.js Image component for any icons/images
- Client-side bundle kept minimal (target <100KB initial load)

### Principle VII: Code Organization ✅ PASS
- **Status**: COMPLIANT
- Frontend: Next.js App Router structure
  - `/app/t/[urlId]/page.tsx` - NFC adjustment page
  - `/app/dashboard/inventory/*` - Admin URL management UI
- Backend: Lambda handlers in `src/handlers/`
  - `nfcUrlHandler.ts` - CRUD operations for NFCUrl
  - `nfcAdjustmentHandler.ts` - Unauthenticated adjustment API
- Shared types in `types/nfcUrl.ts`
- Business logic in `services/nfcService.ts`

### Principle VIII: Component Library ✅ PASS
- **Status**: COMPLIANT
- NFC page will use common components:
  - `Button` (from components/common/)
  - `Card` (from components/common/)
  - Typography components
- Admin URL management will use:
  - `Input` (from components/common/)
  - `Button` (from components/common/)
  - `IconButton` (from components/common/)
- No one-off component implementations

**Overall Gate Status**: ✅ **PASS** - All constitutional principles satisfied

## Project Structure

### Documentation (this feature)

```text
specs/006-nfc-inventory-tap/
├── plan.md              # This file
├── research.md          # Phase 0: URL generation, atomicity, NFC standards
├── data-model.md        # Phase 1: NFCUrl entity design
├── quickstart.md        # Phase 1: Setup and testing guide
├── contracts/           # Phase 1: API contracts
│   ├── nfc-adjustment-api.yaml   # OpenAPI spec for /t/{urlId}
│   └── nfc-url-management-api.yaml # OpenAPI spec for admin CRUD
└── tasks.md             # Phase 2: NOT created by /speckit.plan
```

### Source Code (existing repositories)

```text
# Backend: inventory-management-backend/
src/
├── handlers/
│   ├── nfcUrlHandler.ts          # NEW: Admin CRUD for NFCUrl
│   └── nfcAdjustmentHandler.ts   # NEW: Unauthenticated adjustment
├── services/
│   ├── nfcService.ts             # NEW: Business logic (generate, rotate, adjust)
│   └── inventoryService.ts       # EXTEND: Add NFC adjustment path
├── models/
│   └── nfcUrl.ts                 # NEW: NFCUrl entity model
├── lib/
│   └── urlGenerator.ts           # NEW: Cryptographically random URL ID
└── types/
    └── nfcUrl.ts                 # NEW: NFCUrl TypeScript types

tests/
├── unit/
│   ├── nfcService.test.ts        # NEW: URL generation, rotation, validation
│   └── urlGenerator.test.ts      # NEW: Randomness, collision testing
└── integration/
    ├── nfcUrlHandler.test.ts     # NEW: Admin CRUD integration
    └── nfcAdjustmentHandler.test.ts # NEW: Adjustment API integration

template.yaml                      # EXTEND: Add new Lambda functions and API routes

# Frontend: inventory-management-frontend/
app/
├── t/
│   └── [urlId]/
│       ├── page.tsx              # NEW: NFC adjustment page (unauthenticated)
│       └── AdjustmentClient.tsx  # NEW: Client component for +/- buttons
└── dashboard/
    └── inventory/
        └── [itemId]/
            └── nfc-urls.tsx      # NEW: Admin UI for URL management

components/
├── common/                       # USE EXISTING: Button, Card, Input, etc.
└── inventory/
    └── NFCUrlManager.tsx         # NEW: Reusable URL display/copy/rotate component

lib/
└── api/
    └── nfcUrls.ts                # NEW: API client for NFCUrl operations

types/
└── entities.ts                   # EXTEND: Add NFCUrl type

tests/
└── components/
    └── inventory/
        └── NFCUrlManager.test.tsx # NEW: Admin UI component tests
```

**Structure Decision**: Using existing multi-repo structure (backend / frontend). Backend handles Lambda functions and DynamoDB operations. Frontend handles NFC page UI and admin management. Follows established patterns from feature 001-family-inventory-mvp.

## Complexity Tracking

**No constitutional violations** - All complexity is justified and necessary:
- Multi-repo structure: Inherited from existing architecture (001-family-inventory-mvp)
- DynamoDB single-table design: Standard pattern for serverless applications
- Unauthenticated API: Intentional security model for household UX (URL as bearer token)

## Phase Completion Status

### ✅ Phase 0: Research & Outline (COMPLETE)

**Artifacts Created**:
- [research.md](research.md) - All technical unknowns resolved

**Key Decisions**:
1. URL ID generation: Base62-encoded UUID v4 (22 characters, 122 bits entropy)
2. Atomic adjustments: DynamoDB UpdateExpression with conditional checks
3. NFC format: NDEF URI record with full HTTPS URL
4. Security model: URL as bearer token + family isolation + HTTPS + rotation
5. Browser behavior: Direct open on iOS Safari and Android Chrome

**Status**: ✅ All NEEDS CLARIFICATION items resolved

---

### ✅ Phase 1: Design & Contracts (COMPLETE)

**Artifacts Created**:
1. [data-model.md](data-model.md) - NFCUrl entity design with DynamoDB access patterns
2. [contracts/nfc-adjustment-api.yaml](contracts/nfc-adjustment-api.yaml) - OpenAPI spec for unauthenticated adjustment API
3. [contracts/nfc-url-management-api.yaml](contracts/nfc-url-management-api.yaml) - OpenAPI spec for admin CRUD operations
4. [quickstart.md](quickstart.md) - Developer setup and testing guide

**Key Designs**:
- **NFCUrl Entity**: Extends existing DynamoDB table with proper GSI coverage
- **Access Patterns**: All queries use PK/SK or GSI (no table scans)
- **API Contracts**: RESTful with clear error codes and validation
- **Denormalization**: itemName cached in NFCUrl for fast display

**Agent Context**: ✅ Updated via `.specify/scripts/bash/update-agent-context.sh copilot`

**Constitution Re-Check**: ✅ All principles still compliant after design

---

### ⏳ Phase 2: Task Breakdown (PENDING)

**Next Command**: `/speckit.tasks`

This command (NOT part of `/speckit.plan`) will generate:
- [tasks.md](tasks.md) - Implementation task breakdown with test-first approach
- Task format: `- [ ] [TaskID] [P?] [Story?] Description with file path`
- Test-first workflow: Write tests → Ensure they fail → Implement → Tests pass

---

## Implementation Readiness

**Status**: ✅ **READY FOR IMPLEMENTATION**

All planning artifacts are complete:
- ✅ Technical unknowns resolved (research.md)
- ✅ Data model designed (data-model.md)
- ✅ API contracts defined (contracts/*.yaml)
- ✅ Development guide created (quickstart.md)
- ✅ Constitution compliance verified
- ✅ Agent context updated

**Next Steps**:
1. Run `/speckit.tasks` to generate implementation tasks
2. Create task tracking issues (via `/speckit.taskstoissues` if desired)
3. Begin test-first implementation following tasks.md

**Estimated Complexity**: Medium
- **Backend**: 3-4 new Lambda handlers, 1 new service, 1 new model (~800 LOC)
- **Frontend**: 2 new pages, 1 new component, API client updates (~600 LOC)
- **Tests**: Unit + integration tests (~400 LOC)
- **Infrastructure**: SAM template updates, CloudFront config (~100 LOC)

**Estimated Timeline**: 2-3 sprints (4-6 weeks)
- Sprint 1: Backend NFC URL management + data model
- Sprint 2: Backend adjustment API + atomicity testing
- Sprint 3: Frontend NFC page + admin UI

---

## References

- Feature Specification: [spec.md](spec.md)
- Specification Checklist: [checklists/requirements.md](checklists/requirements.md)
- Parent Feature: [001-family-inventory-mvp](../001-family-inventory-mvp/)
- Constitution: [.specify/memory/constitution.md](../../.specify/memory/constitution.md)
