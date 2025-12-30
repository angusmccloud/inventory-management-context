# Implementation Plan: Streamlined Quantity Adjustments

**Branch**: `010-streamline-quantity-controls` | **Date**: December 29, 2025 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/010-streamline-quantity-controls/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

This feature improves quantity adjustment UX by introducing 500ms debouncing to batch rapid +/- button clicks into single API calls, and by removing the modal dialog on the inventory list page in favor of inline +/- buttons. The NFC tag detail page already has +/- buttons but requires debouncing. Both pages will use the same debounce logic with optimistic UI updates, visual feedback, and error recovery.

## Technical Context

**Language/Version**: TypeScript 5 with strict mode  
**Primary Dependencies**: Next.js 16 App Router, React 19, AWS SDK v3  
**Storage**: Amazon DynamoDB (existing inventory items)  
**Testing**: Jest + React Testing Library  
**Target Platform**: Web (Next.js SSR/CSR, deployed to AWS S3 + CloudFront)
**Project Type**: Web application (frontend + backend separation)  
**Performance Goals**: <500ms debounce delay, <1s total API round-trip for quantity updates  
**Constraints**: 
- Must handle offline scenarios by disabling controls
- Must prevent negative quantities client-side
- Must flush pending changes on navigation or item switching
- Optimistic UI updates required for responsive feel
**Scale/Scope**: 
- 2 pages affected: NFC tag detail (`/app/t/[urlId]`), Inventory list (`/app/dashboard/inventory`)
- 1 existing modal component to remove (`AdjustQuantity.tsx`)
- Shared debounce hook to create for reuse across both pages

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Critical Requirements (MUST Pass)

- ✅ **TypeScript 5 strict mode**: All new code will use explicit types, no implicit `any`
- ✅ **Test-first development**: Unit tests will be written for debounce hook before implementation
- ✅ **Jest + React Testing Library**: All component tests follow this standard
- ✅ **AWS SDK v3 modular imports**: Backend already uses this pattern, no changes needed
- ✅ **No DynamoDB scans**: Feature only updates existing items via itemId, using existing Query patterns
- ✅ **API response format**: Existing `/quantity` endpoint returns `{data: InventoryItem}` format
- ✅ **Authentication**: Existing endpoints already require JWT, no auth changes needed
- ✅ **Input validation**: Zod validation already exists in backend for quantity adjustments

### High Priority Standards

- ✅ **Error handling**: Will implement retry logic with user feedback per FR-011, FR-012
- ✅ **CORS/security headers**: No new endpoints, existing headers sufficient
- ✅ **Performance optimization**: Debouncing specifically addresses this by reducing API calls
- ✅ **Async/await usage**: All API calls use async/await pattern consistently

### Gates Passed

All constitution requirements are satisfied. This is primarily a frontend UX enhancement that leverages existing backend infrastructure.

## Project Structure

### Documentation (this feature)

```text
specs/010-streamline-quantity-controls/
├── spec.md              # Feature specification (complete)
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output - debounce patterns, React hooks best practices
├── quickstart.md        # Phase 1 output - developer guide for implementing debounce
├── checklists/
│   └── requirements.md  # Specification validation (complete)
└── contracts/
    └── debounce-hook-api.md  # Phase 1 output - TypeScript interface for useQuantityDebounce
```

### Source Code (repository root)

```text
inventory-management-frontend/
├── app/
│   ├── dashboard/
│   │   └── inventory/
│   │       └── page.tsx                    # UPDATE: Replace AdjustQuantity modal with inline controls
│   └── t/
│       └── [urlId]/
│           └── AdjustmentClient.tsx        # UPDATE: Add debounce to existing +/- buttons
├── components/
│   ├── inventory/
│   │   ├── AdjustQuantity.tsx              # REMOVE: Modal dialog no longer needed
│   │   └── InventoryList.tsx               # UPDATE: Add inline +/- buttons
│   └── common/
│       └── QuantityControls.tsx            # NEW: Reusable +/- button component
├── hooks/
│   └── useQuantityDebounce.ts              # NEW: Custom hook for debounced quantity updates
├── lib/
│   └── api/
│       └── inventory.ts                    # EXISTING: adjustInventoryQuantity already exists
└── tests/
    ├── components/
    │   ├── inventory/
    │   │   └── InventoryList.test.tsx      # UPDATE: Test inline controls
    │   └── common/
    │       └── QuantityControls.test.tsx   # NEW: Test reusable component
    ├── hooks/
    │   └── useQuantityDebounce.test.tsx    # NEW: Test debounce logic
    └── app/
        └── t/
            └── AdjustmentClient.test.tsx   # UPDATE: Test debounced NFC adjustments
```

**Structure Decision**: This is a web application with frontend/backend separation. Changes are isolated to the frontend repository (`inventory-management-frontend`). No backend changes required as the existing `/quantity` PATCH endpoint already supports the adjustment API. The backend uses AWS Lambda + API Gateway deployed via SAM template.

## Complexity Tracking

> **No violations** - All constitution requirements satisfied, no complexity justification needed.

---

## Phase 0: Outline & Research ✅ COMPLETE

**Status**: Complete  
**Artifacts**:
- ✅ [research.md](./research.md) - Debounce patterns, React hooks best practices, offline detection

**Key Decisions Made**:
1. **Debounce Implementation**: Custom React hook with `useRef` + `useEffect` for lifecycle integration
2. **Optimistic Updates**: Dual state pattern (local + server) with rollback on error
3. **Offline Detection**: Browser `navigator.onLine` + event listeners
4. **Navigation Flush**: Router events + `beforeunload` + explicit flush function

---

## Phase 1: Design & Contracts ✅ COMPLETE

**Status**: Complete  
**Artifacts**:
- ✅ [contracts/debounce-hook-api.md](./contracts/debounce-hook-api.md) - `useQuantityDebounce` TypeScript interface
- ✅ [contracts/quantity-controls-component.md](./contracts/quantity-controls-component.md) - `QuantityControls` component API
- ✅ [quickstart.md](./quickstart.md) - Developer implementation guide with code examples

**Design Highlights**:

### Data Model (No new entities)
- Uses existing `InventoryItem` entity from DynamoDB
- No database schema changes required
- Frontend state only (optimistic local quantity + server quantity)

### API Contracts
- **Existing**: `PATCH /families/:familyId/inventory/:itemId/quantity` (already implemented)
- **Request**: `{ adjustment: number }` (delta, can be positive or negative)
- **Response**: `{ data: InventoryItem }` (updated item with new quantity)
- No new endpoints required

### Component Contracts
1. **`useQuantityDebounce` Hook**:
   - Manages debounce timer (500ms configurable)
   - Tracks pending delta and local/server quantities
   - Provides adjust/flush/retry functions
   - Handles errors with rollback

2. **`QuantityControls` Component**:
   - Reusable +/- buttons with quantity display
   - Size variants (sm/md/lg) for different contexts
   - Visual states (loading, pending, disabled)
   - WCAG 2.1 AA compliant (44x44px touch targets, keyboard nav)

### Agent Context Update
- ✅ Updated Copilot instructions with React hooks, debounce patterns, optimistic UI
- ✅ Synced shared context across all agent files

---

## Phase 2: Implementation Tasks (Next Step - Use `/speckit.tasks`)

**Not Generated by `/speckit.plan`** - Run `/speckit.tasks` command next to create detailed task breakdown.

**Expected Task Categories**:
1. **Setup & Infrastructure** (P1)
   - Create `useQuantityDebounce` hook with tests
   - Create `QuantityControls` component with tests
   - Create `useOnlineStatus` helper hook

2. **NFC Page Integration** (P1)
   - Update `AdjustmentClient.tsx` to use new hook
   - Replace custom buttons with `QuantityControls`
   - Add flush on unmount
   - Update integration tests

3. **Inventory List Integration** (P1)
   - Update `InventoryList.tsx` with inline controls
   - Remove `onAdjustQuantity` prop/modal handling
   - Update parent page to remove modal state
   - Update component tests

4. **Cleanup** (P2)
   - Delete `AdjustQuantity.tsx` modal component
   - Delete modal tests
   - Update documentation

5. **Testing & Validation** (P2)
   - End-to-end testing of debounce behavior
   - Accessibility testing (keyboard, screen reader)
   - Performance testing (API call reduction)
   - Cross-browser testing

---

## Constitution Re-Check (Post Phase 1 Design)

**Re-evaluated after design phase:**

### Critical Requirements
- ✅ **TypeScript strict mode**: All contracts use explicit types
- ✅ **Test-first**: Quickstart guide includes test examples before implementation
- ✅ **Jest + RTL**: All test patterns follow standard
- ✅ **API format**: Contracts specify `{data: T}` format
- ✅ **No implementation leakage**: Contracts are technology-agnostic where appropriate

### Design Quality
- ✅ **Reusability**: `useQuantityDebounce` and `QuantityControls` designed for reuse
- ✅ **Separation of concerns**: Hook handles logic, component handles presentation
- ✅ **Error boundaries**: Explicit error handling in all contracts
- ✅ **Accessibility**: WCAG 2.1 AA compliance documented in component contract
- ✅ **Performance**: Debouncing reduces API calls by 80% (measured in success criteria)

**Gates Status**: ✅ All gates pass - Ready for implementation

---

## Next Steps

1. **Run `/speckit.tasks`** to generate detailed task breakdown with file paths and acceptance criteria
2. **Implement** using test-first development approach per quickstart guide
3. **Deploy** to feature branch and create PR
4. **Validate** against success criteria in [spec.md](./spec.md):
   - SC-001: 5 rapid adjustments → 1 API call in <1s
   - SC-002: Inventory workflow improves by 2 clicks (no modal)
   - SC-003: 95% of operations complete successfully
   - SC-004: 10 items adjustable without API blocking
   - SC-005: Net change calculation correct (+5, -2, +1 = +4)

---

**Plan Status**: ✅ COMPLETE (Phases 0-1)  
**Branch**: `010-streamline-quantity-controls`  
**Ready for**: `/speckit.tasks` command
