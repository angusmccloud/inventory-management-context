# Tasks: Inventory Management Dashboards

**Feature**: 014-inventory-dashboards  
**Input**: Design documents from `/specs/014-inventory-dashboards/`  
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/  

**Tests**: Tests are NOT explicitly requested in the specification, so test tasks are EXCLUDED per SpecKit guidelines.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `- [ ] [ID] [P?] [Story?] Description`

- **Checkbox**: All tasks start with `- [ ]` (markdown checkbox)
- **[P]**: Can run in parallel (different files, no dependencies on incomplete tasks)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3) - only for user story phases
- **File paths**: All tasks include exact file paths for clarity

## Path Conventions

This project uses web application structure:
- **Backend**: `inventory-management-backend/src/`, `inventory-management-backend/tests/`
- **Frontend**: `inventory-management-frontend/app/`, `inventory-management-frontend/components/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and shared utilities required by all dashboard components

- [X] T001 Add dashboard types to inventory-management-backend/src/types/dashboard.ts
- [X] T002 [P] Add dashboard ID utilities to inventory-management-backend/src/lib/dashboardId.ts (generateDashboardId, parseDashboardId)
- [X] T003 [P] Add Dashboard entity to inventory-management-backend/src/models/dashboard.ts
- [X] T004 [P] Add DashboardService to inventory-management-backend/src/services/dashboardService.ts
- [X] T005 Add dashboard Lambda functions to inventory-management-backend/template.yaml
- [X] T006 [P] Add dashboard types to inventory-management-frontend/types/dashboard.ts
- [X] T007 [P] Add dashboard API client to inventory-management-frontend/lib/api/dashboards.ts

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T008 Add warmup configuration for dashboard handlers in inventory-management-backend/template.yaml
- [X] T009 [P] Implement base CORS response utilities validation for dashboard endpoints in inventory-management-backend/src/lib/response.ts
- [X] T010 [P] Add requireAdmin middleware validation for dashboard management routes
- [X] T011 Configure CloudWatch log groups for dashboard handlers in inventory-management-backend/template.yaml

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Access Dashboard via Link (Priority: P1) 🎯 MVP

**Goal**: Users can open dashboard URLs and view multiple inventory items without authentication

**Independent Test**: Generate a dashboard URL, open it in a browser (without being logged in), and verify all configured items are displayed with their quantities

### Implementation for User Story 1

- [X] T012 [US1] Create Next.js dynamic route at inventory-management-frontend/app/d/[dashboardId]/page.tsx
- [X] T013 [US1] Create DashboardView component at inventory-management-frontend/components/dashboard/DashboardView.tsx
- [X] T014 [US1] Create DashboardItemCard component at inventory-management-frontend/components/dashboard/DashboardItemCard.tsx
- [X] T015 [US1] Implement getDashboardPublic handler in inventory-management-backend/src/handlers/dashboardAccessHandler.ts
- [X] T016 [US1] Add getLocationBasedItems method to DashboardService in inventory-management-backend/src/services/dashboardService.ts
- [X] T017 [US1] Add getItemBasedItems method to DashboardService in inventory-management-backend/src/services/dashboardService.ts
- [X] T018 [US1] Add getById method to DashboardModel in inventory-management-backend/src/models/dashboard.ts
- [X] T019 [US1] Add API route configuration for GET /d/{dashboardId} in inventory-management-backend/template.yaml
- [X] T020 [US1] Create not-found page at inventory-management-frontend/app/d/[dashboardId]/not-found.tsx
- [X] T021 [US1] Add mobile-responsive styling for DashboardView with 80px card height
- [X] T022 [US1] Add low-stock visual indicator to DashboardItemCard component
- [X] T023 [US1] Add zero-quantity visual indicator to DashboardItemCard component
- [X] T024 [US1] Implement 404 error handling for invalid dashboard IDs
- [X] T025 [US1] Implement 410 Gone error handling for inactive dashboards

**Checkpoint**: At this point, users can access dashboards via URL and view items (read-only)

---

## Phase 4: User Story 2 - Manual Quantity Adjustments (Priority: P1) 🎯 MVP

**Goal**: Users can manually increase/decrease item quantities with debounced updates and visual feedback

**Independent Test**: Open a dashboard, click +/- buttons on multiple items, and verify quantities update correctly with appropriate debouncing and feedback

### Implementation for User Story 2

- [X] T026 [P] [US2] Create useQuantityDebounce custom hook in inventory-management-frontend/hooks/useQuantityDebounce.ts
- [X] T027 [P] [US2] Implement adjustItemQuantity API handler in inventory-management-backend/src/handlers/dashboardAdjustmentHandler.ts
- [X] T028 [US2] Add adjustItemQuantity method to DashboardService in inventory-management-backend/src/services/dashboardService.ts
- [X] T029 [US2] Add API route configuration for POST /api/public/dashboards/{id}/items/{itemId}/adjust in inventory-management-backend/template.yaml
- [X] T030 [US2] Integrate useQuantityDebounce hook into DashboardItemCard component with 500ms debounce
- [X] T031 [US2] Add increment button with 44px touch target to DashboardItemCard
- [X] T032 [US2] Add decrement button with 44px touch target to DashboardItemCard
- [X] T033 [US2] Add "Saving..." visual indicator during debounce period
- [X] T034 [US2] Add success feedback (checkmark or "+1"/"-1" badge) after adjustment completes
- [X] T035 [US2] Add error feedback with quantity revert on API failure
- [X] T036 [US2] Add minimum quantity validation (cannot go below 0)
- [X] T037 [US2] Implement optimistic UI updates for quantity changes
- [X] T038 [US2] Add refresh-on-focus handler for real-time sync in DashboardView component
- [X] T039 [US2] Add 30-second polling interval for dashboard refresh

**Checkpoint**: At this point, User Story 1 AND 2 are complete - dashboards are fully functional for viewing and adjusting items

---

## Phase 5: User Story 3 - Create Dashboard from Storage Locations (Priority: P2)

**Goal**: Admins can create location-based dashboards showing all items in selected storage locations with live updates

**Independent Test**: As an admin, create a dashboard selecting "Pantry" and "Fridge" locations, verify all items in those locations appear on the dashboard, and confirm new items added to those locations automatically appear

### Implementation for User Story 3

- [X] T040 [P] [US3] Create DashboardManager component in inventory-management-frontend/components/dashboard/DashboardManager.tsx
- [X] T041 [P] [US3] Create dashboard creation form in DashboardManager with location selection
- [X] T042 [P] [US3] Implement createDashboard API handler in inventory-management-backend/src/handlers/dashboardHandler.ts
- [X] T043 [US3] Add create method to Dashboard model in inventory-management-backend/src/models/dashboard.ts
- [X] T044 [US3] Add validateDashboardConfig to DashboardService for location count validation (1-10)
- [X] T045 [US3] Add API route configuration for POST /api/dashboards in inventory-management-backend/template.yaml
- [X] T046 [US3] Add requireAdmin middleware to POST /api/dashboards route
- [X] T047 [US3] Add title input validation (1-100 characters) in creation form
- [X] T048 [US3] Generate unique dashboard URL in format /d/{familyId}_{randomString}
- [X] T049 [US3] Display generated shareable URL to admin after creation
- [X] T050 [US3] Add Copy URL button with clipboard API integration

**Checkpoint**: At this point, admins can create location-based dashboards and users can access them

---

## Phase 6: User Story 4 - Create Dashboard from Specific Items (Priority: P2)

**Goal**: Admins can create item-based dashboards by selecting specific inventory items, independent of storage locations

**Independent Test**: As an admin, create a dashboard by manually selecting 3-5 items from different storage locations, verify only those items appear on the dashboard regardless of location changes

### Implementation for User Story 4

- [X] T051 [P] [US4] Add item-based dashboard creation mode to DashboardManager component
- [X] T052 [P] [US4] Create item selection interface with search/browse in DashboardManager
- [X] T053 [US4] Add item-based validation to validateDashboardConfig in DashboardService (1-100 items)
- [X] T054 [US4] Update create method in Dashboard model to handle itemIds array
- [X] T055 [US4] Update getItemBasedItems query to use BatchGetItem for selected items
- [X] T056 [US4] Add location-independence test: verify items remain on dashboard after location change
- [X] T057 [US4] Add multi-select UI component for item selection with active item filtering

**Checkpoint**: At this point, admins can create both location-based and item-based dashboards

---

## Phase 7: User Story 5 - Manage Dashboard Settings (Priority: P2)

**Goal**: Admins can view, edit, and manage existing dashboards including changing title, updating selections, and rotating URLs

**Independent Test**: As an admin, edit an existing dashboard to change its title and add/remove items or locations, then verify changes are reflected immediately

### Implementation for User Story 5

- [X] T058 [P] [US5] Create dashboard list view in DashboardManager component
- [X] T059 [P] [US5] Implement listDashboards API handler in inventory-management-backend/src/handlers/dashboardHandler.ts
- [X] T060 [P] [US5] Add listByFamily method to Dashboard model in inventory-management-backend/src/models/dashboard.ts
- [X] T061 [US5] Add API route configuration for GET /api/dashboards in inventory-management-backend/template.yaml
- [X] T062 [US5] Display dashboard metadata: title, type, created date, access count
- [X] T063 [US5] Create dashboard edit form in DashboardManager
- [X] T064 [US5] Implement updateDashboard API handler in inventory-management-backend/src/handlers/dashboardHandler.ts
- [X] T065 [US5] Add update method to Dashboard model in inventory-management-backend/src/models/dashboard.ts
- [X] T066 [US5] Add API route configuration for PATCH /api/dashboards/{id} in inventory-management-backend/template.yaml
- [X] T067 [US5] Implement URL rotation functionality in DashboardService.rotateDashboard
- [X] T068 [US5] Implement rotateDashboard API handler in inventory-management-backend/src/handlers/dashboardHandler.ts
- [X] T069 [US5] Add API route configuration for POST /api/dashboards/{id}/rotate in inventory-management-backend/template.yaml
- [X] T070 [US5] Add deactivate method to Dashboard model to set isActive=false
- [X] T071 [US5] Add Rotate URL button with confirmation dialog
- [X] T072 [US5] Display old and new dashboard URLs after rotation
- [X] T073 [US5] Implement deleteDashboard API handler in inventory-management-backend/src/handlers/dashboardHandler.ts
- [X] T074 [US5] Add API route configuration for DELETE /api/dashboards/{id} in inventory-management-backend/template.yaml
- [X] T075 [US5] Add Delete button with confirmation dialog
- [X] T076 [US5] Add access statistics display: last accessed, total access count

**Checkpoint**: At this point, all dashboard management features are complete

---

## Phase 8: User Story 6 - Dashboard URL Management (Priority: P3)

**Goal**: Admins can copy dashboard URLs, share them via various channels, and monitor usage statistics

**Independent Test**: As an admin, copy a dashboard URL to clipboard, share it via different methods, and verify access statistics are tracked

### Implementation for User Story 6

- [X] T077 [P] [US6] Implement recordAccess API handler in inventory-management-backend/src/handlers/dashboardAccessHandler.ts
- [X] T078 [P] [US6] Add incrementAccessCount method to Dashboard model in inventory-management-backend/src/models/dashboard.ts
- [X] T079 [US6] Call recordAccess from getDashboardPublic handler to track usage
- [X] T080 [US6] Add API route configuration for POST /api/public/dashboards/{id}/access in inventory-management-backend/template.yaml
- [X] T081 [US6] Add sortable columns to dashboard list (name, date, access count)
- [~] T082 [US6] Add QR code generation for dashboard URLs using qrcode library (SKIPPED - NFC app)
- [~] T083 [US6] Add share button with messaging/email/QR options (SKIPPED - QR not needed)
- [~] T084 [US6] Display usage trends chart (optional enhancement) (SKIPPED)

**Checkpoint**: All user stories are now complete - full dashboard feature is functional

---

## Phase 9: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories and production readiness

- [~] T085 [P] Add virtualized scrolling with react-window for dashboards with 50+ items (SKIPPED - not needed yet)
- [~] T086 [P] Add WCAG 2.1 AA color contrast validation for all dashboard components (SKIPPED - using theme colors)
- [X] T087 [P] Add dark theme support to DashboardView and DashboardItemCard
- [X] T088 [P] Add loading skeleton screens for dashboard loading states
- [X] T089 [P] Optimize bundle size: verify tree-shaking for AWS SDK v3 imports
- [X] T090 Add structured CloudWatch logging with correlation IDs for all dashboard operations
- [X] T091 Add empty state UI for location dashboards with no items
- [X] T092 Add empty state UI for item dashboards with all items deleted
- [X] T093 Add concurrent adjustment handling with atomic DynamoDB updates
- [X] T094 Add performance monitoring for dashboard page load (<3s target)
- [X] T095 Add performance monitoring for API response times (<500ms target)
- [ ] T096 Validate quickstart.md examples against implementation
- [X] T097 Update API documentation in inventory-management-backend/README.md
- [X] T098 Add Lambda cold start optimization review
- [X] T099 Verify all dashboard endpoints use response utilities (successResponse/errorResponse)
- [X] T100 Run full integration test suite across all user stories
- [X] T101 Integrate DashboardManager into Inventory page with tabbed navigation (inventory-management-frontend/app/(dashboard)/inventory/page.tsx)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-8)**: All depend on Foundational phase completion
  - User stories can proceed in parallel (if staffed)
  - Or sequentially in priority order (P1 → P2 → P3)
- **Polish (Phase 9)**: Depends on all desired user stories being complete

### User Story Dependencies

```text
Phase 2 (Foundational) [BLOCKS ALL]
    ↓
Phase 3 (US1 - P1) ─────────────┐
    ↓                           │
Phase 4 (US2 - P1) ─────────────┼─→ Phases 5-8 can run in parallel
    ↓                           │   (each story is independent)
Phase 5 (US3 - P2) ─────────────┤
Phase 6 (US4 - P2) ─────────────┤
Phase 7 (US5 - P2) ─────────────┤
Phase 8 (US6 - P3) ─────────────┘
    ↓
Phase 9 (Polish) [Depends on desired stories]
```

**MVP Scope** (Recommended first delivery):
- Phase 1: Setup (T001-T007)
- Phase 2: Foundational (T008-T011)
- Phase 3: User Story 1 (T012-T025)
- Phase 4: User Story 2 (T026-T039)

This delivers core dashboard viewing and quantity adjustment functionality.

### Within Each User Story

- Models before services
- Services before handlers
- Handlers before API route configuration
- Core implementation before UI components
- Base components before integration
- Story complete before moving to next priority

### Parallel Opportunities Per Phase

**Phase 1 (Setup)**:
- T002, T003, T004, T006, T007 can all run in parallel (different files)

**Phase 2 (Foundational)**:
- T009, T010 can run in parallel (different concerns)

**Phase 3 (User Story 1)**:
- T012, T013, T014 can run in parallel initially (different repos)
- T016, T017, T018 can run in parallel (different model methods)

**Phase 4 (User Story 2)**:
- T026, T027 can run in parallel (frontend hook + backend handler)

**Phase 5 (User Story 3)**:
- T040, T041, T042 can run in parallel initially

**Phase 6 (User Story 4)**:
- T051, T052 can run in parallel

**Phase 7 (User Story 5)**:
- T058, T059, T060 can run in parallel

**Phase 8 (User Story 6)**:
- T077, T078 can run in parallel

**Phase 9 (Polish)**:
- T085, T086, T087, T088, T089 can all run in parallel (different concerns)

### Parallel Example: User Story 1

```bash
# Backend developer
T015: Implement getDashboardPublic handler
T016: Add getLocationBasedItems service method
T017: Add getItemBasedItems service method
T018: Add getById model method

# Frontend developer (parallel)
T012: Create /d/[dashboardId] route
T013: Create DashboardView component
T014: Create DashboardItemCard component
T020: Create not-found page

# DevOps (parallel)
T019: Add API route in template.yaml
```

All three can work simultaneously, then integrate at T021-T025.

---

## Implementation Strategy

### MVP First (Phases 1-4)

Start with User Stories 1 and 2 (both P1) to deliver core value:
- Users can access dashboards
- Users can adjust quantities
- No admin management needed for initial testing

**Tasks**: T001-T039 (39 tasks)

### Incremental Delivery

After MVP, add features in priority order:
1. **US3 (P2)**: Location-based dashboard creation - most common use case
2. **US4 (P2)**: Item-based dashboard creation - flexible alternative
3. **US5 (P2)**: Dashboard management - administrative features
4. **US6 (P3)**: URL management - nice-to-have enhancements

### Quality Gates

Before moving to next phase:
- ✅ All tasks in current phase complete
- ✅ Manual testing of independent test criteria passed
- ✅ TypeScript strict mode with no errors
- ✅ Linting passing
- ✅ No console errors in browser/terminal
- ✅ Quickstart.md examples validated against implementation

---

## Task Summary

| Phase | User Story | Priority | Task Range | Count | MVP |
|-------|------------|----------|------------|-------|-----|
| 1 | Setup | - | T001-T007 | 7 | ✅ |
| 2 | Foundational | - | T008-T011 | 4 | ✅ |
| 3 | US1 - Access Dashboard | P1 | T012-T025 | 14 | ✅ |
| 4 | US2 - Quantity Adjustments | P1 | T026-T039 | 14 | ✅ |
| 5 | US3 - Create from Locations | P2 | T040-T050 | 11 | - |
| 6 | US4 - Create from Items | P2 | T051-T057 | 7 | - |
| 7 | US5 - Manage Settings | P2 | T058-T076 | 19 | - |
| 8 | US6 - URL Management | P3 | T077-T084 | 8 | - |
| 9 | Polish | - | T085-T100 | 16 | - |
| **Total** | | | **T001-T100** | **100** | **39 MVP** |

**MVP Scope**: 39 tasks (Phases 1-4)  
**Full Feature**: 100 tasks (All phases)

**Parallel Opportunities**: 25+ tasks can run in parallel with proper team coordination

---

## Notes

- **No Tests Included**: The feature specification does not explicitly request tests, so test tasks are excluded per SpecKit guidelines
- **Component Library**: Reuses existing Button, LoadingSpinner, ErrorMessage components from `components/common/`
- **AWS Patterns**: All handlers use warmup support, response utilities, and CloudWatch logging
- **Type Safety**: All code written in TypeScript 5 strict mode with explicit types
- **Infrastructure as Code**: All AWS resources defined in template.yaml (no manual console operations)
- **Debouncing**: Per-item 500ms debounce pattern from Feature 006 (NFC)
- **Dashboard ID Format**: {familyId}_{randomString} enables O(1 lookups without GSI
- **Query Optimization**: Location-based uses filtered Query, item-based uses BatchGetItem
