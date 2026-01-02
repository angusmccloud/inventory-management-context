# Implementation Plan: Inventory Management Dashboards

**Branch**: `014-inventory-dashboards` | **Date**: January 2, 2026 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/014-inventory-dashboards/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Create shareable, unauthenticated web pages that display multiple inventory items in a compact layout. Users can manually adjust quantities via +/- buttons with debounced updates. Dashboards can be based on storage locations (dynamic, live-updating) or specific item selections (static collection). Admin-controlled creation with URL rotation capability. Similar security model to NFC pages but supporting multiple items with manual controls instead of auto-decrement.

## Technical Context

**Language/Version**: TypeScript 5 with strict mode enabled  
**Primary Dependencies**: Next.js 16 (App Router), React 19, AWS SDK v3, DynamoDB Document Client, Zod validation  
**Storage**: Amazon DynamoDB (single-table design with GSI for dashboard ID lookups)  
**Testing**: Jest and React Testing Library, 80% coverage required for critical paths  
**Target Platform**: Web (AWS Lambda + S3/CloudFront), Mobile browsers (iOS Safari, Android Chrome)  
**Project Type**: Web application (backend: AWS SAM Lambda functions, frontend: Next.js static pages)  
**Performance Goals**: <3s dashboard page load, <500ms quantity adjustment API, <1s debounced updates  
**Constraints**: No authentication for dashboard viewing, mobile-first responsive design, WCAG 2.1 AA compliance, touch targets ≥44px  
**Scale/Scope**: ~5-20 items per dashboard (some may reach 50+), household-level usage, single-family isolation

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### ✅ I. TypeScript Type Safety (NON-NEGOTIABLE)
- All code written in TypeScript 5 strict mode
- Dashboard entity types defined in `types/dashboard.ts`
- No implicit `any` types
- Shared types for DashboardConfig, DashboardItem view models

### ✅ II. Serverless Architecture
- Backend: AWS Lambda functions via SAM template
- Frontend: Next.js App Router with `/d/[dashboardId]` dynamic route
- DynamoDB single-table design for Dashboard entity
- Stateless, idempotent Lambda handlers

### ✅ III. Testing Excellence (NON-NEGOTIABLE)
- Jest + React Testing Library
- 80% coverage for dashboard creation, URL validation, quantity adjustments
- Integration tests for dashboard CRUD operations
- Unit tests for dashboard query logic (location-based vs item-based)

### ✅ IV. AWS Best Practices
- AWS SDK v3 with modular imports
- DynamoDB Document Client for all operations
- Lambda warmup support for all new handlers
- Response utilities (successResponse/errorResponse) for CORS headers
- CloudWatch structured logging with correlation IDs

### ✅ V. Security First
- Dashboard IDs are cryptographically random (similar to NFC URL IDs)
- Admin-only creation/management with `requireAdmin()` checks
- Family isolation enforced at query level
- URL rotation capability for compromised dashboards
- No secrets in code (environment variables for config)

### ✅ VI. Performance Optimization
- Dashboard ID format encodes familyId to avoid GSI lookup
- Query optimization: location-based uses filtered query, item-based uses BatchGetItem
- Debounced quantity adjustments (500ms) to reduce API calls
- Mobile-responsive layout with virtualized scrolling for 50+ items

### ✅ VII. Code Organization
- Backend: `src/handlers/dashboardHandler.ts`, `src/services/dashboardService.ts`, `src/models/dashboard.ts`
- Frontend: `app/d/[dashboardId]/page.tsx`, `components/dashboard/DashboardView.tsx`
- Types: `types/dashboard.ts` (feature-specific types, NOT generic entities.ts)
- Related files colocated

### ✅ VIII. Component Library (NON-NEGOTIABLE)
- Reuse existing components: Button, LoadingSpinner, ErrorMessage from `components/common/`
- Debounced quantity controls similar to NFC page implementation
- Compact card layout custom to dashboard feature (justified as feature-specific)
- Theme-aware styling using centralized theme configuration

### ⚠️ NO VIOLATIONS - All gates pass

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

```text
# Web application structure (backend + frontend)

inventory-management-backend/
├── src/
│   ├── handlers/
│   │   ├── dashboardHandler.ts          # CRUD operations for dashboards (admin)
│   │   ├── dashboardAccessHandler.ts    # Public dashboard viewing (unauthenticated)
│   │   └── dashboardAdjustmentHandler.ts # Quantity adjustments from dashboards
│   ├── services/
│   │   └── dashboardService.ts          # Business logic for dashboard operations
│   ├── models/
│   │   └── dashboard.ts                 # DynamoDB operations for Dashboard entity
│   ├── types/
│   │   └── dashboard.ts                 # Dashboard, DashboardConfig, DashboardItem types
│   └── lib/
│       ├── dashboardId.ts               # Dashboard ID generation/parsing utilities
│       └── warmup.ts                    # Existing warmup utilities
├── tests/
│   ├── integration/
│   │   ├── dashboardHandler.test.ts
│   │   ├── dashboardAccessHandler.test.ts
│   │   └── dashboardAdjustmentHandler.test.ts
│   └── unit/
│       ├── dashboardService.test.ts
│       └── dashboardId.test.ts
└── template.yaml                        # SAM template with new Lambda functions

inventory-management-frontend/
├── app/
│   └── d/
│       └── [dashboardId]/
│           ├── page.tsx                 # Public dashboard view (unauthenticated)
│           └── not-found.tsx            # Error page for invalid dashboard IDs
├── components/
│   ├── dashboard/
│   │   ├── DashboardView.tsx            # Main dashboard display component
│   │   ├── DashboardItemCard.tsx        # Compact item card with +/- controls
│   │   └── DashboardManager.tsx         # Admin dashboard CRUD interface
│   └── common/                          # Existing reusable components
│       ├── Button.tsx
│       ├── LoadingSpinner.tsx
│       └── ErrorMessage.tsx
├── lib/
│   └── api/
│       └── dashboards.ts                # Dashboard API client methods
├── types/
│   └── dashboard.ts                     # Frontend Dashboard types (may differ from backend)
└── tests/
    └── components/
        └── dashboard/
            ├── DashboardView.test.tsx
            └── DashboardItemCard.test.tsx
```

**Structure Decision**: Web application structure selected. Backend uses AWS Lambda functions deployed via SAM, frontend uses Next.js App Router with dynamic routes. Dashboard feature follows established patterns from NFC feature (006-api-integration) with similar handler/service/model architecture.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

No violations - all constitution gates pass. This feature follows established patterns from NFC feature (006-api-integration) and aligns with all constitutional principles.

---

## Planning Complete ✓

**Status**: Phase 1 complete, ready for implementation

**Generated Artifacts**:
- ✅ [research.md](./research.md) - Pre-design research resolving technical decisions
- ✅ [data-model.md](./data-model.md) - Dashboard entity schema and DynamoDB access patterns  
- ✅ [contracts/dashboard-management-api.yaml](./contracts/dashboard-management-api.yaml) - Admin CRUD operations
- ✅ [contracts/dashboard-public-api.yaml](./contracts/dashboard-public-api.yaml) - Unauthenticated dashboard access
- ✅ [quickstart.md](./quickstart.md) - Developer implementation guide
- ✅ Agent context updated (GitHub Copilot instructions synced)

**Next Steps**:
1. Run `/speckit.tasks` to generate detailed implementation task breakdown with acceptance criteria
2. Review task sequencing and dependencies
3. Begin implementation following task order

**Key Design Decisions**:
- Dashboard ID format encodes familyId for O(1 lookups without GSI
- Location-based dashboards use filtered Query, item-based use BatchGetItem
- Per-item 500ms debounce with independent loading states
- Compact 80px cards with 44px touch targets for mobile accessibility
- Polling-based refresh (focus + 30s interval) for real-time updates
