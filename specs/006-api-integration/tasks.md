# Tasks: NFC Inventory Tap

**Feature**: 006-nfc-inventory-tap  
**Input**: Design documents from `/specs/006-api-integration/`  
**Prerequisites**: plan.md, spec.md, data-model.md, contracts/, research.md, quickstart.md

## Format: `- [ ] [ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: User story label (US1, US2, US3)
- Includes exact file paths in descriptions

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [X] T001 Create TypeScript types for NFCUrl entity in inventory-management-backend/src/types/nfcUrl.ts
- [X] T002 [P] Create TypeScript types for NFCUrl entity in inventory-management-frontend/types/entities.ts (extend existing)
- [X] T003 [P] Add Zod validation schemas for NFC URL requests in inventory-management-backend/src/lib/validation/nfcSchemas.ts
- [X] T004 [P] Install any new dependencies (none expected, verify in package.json)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T005 Create URL ID generator utility using crypto.randomUUID() and base62 encoding in inventory-management-backend/src/lib/urlGenerator.ts
- [X] T006 [P] Write unit tests for URL generator (uniqueness, format, entropy) in inventory-management-backend/tests/unit/urlGenerator.test.ts
- [X] T007 Create NFCUrl DynamoDB model with CRUD operations in inventory-management-backend/src/models/nfcUrl.ts
- [X] T008 [P] Write unit tests for NFCUrl model (create, read, update queries) in inventory-management-backend/tests/unit/models/nfcUrl.test.ts
- [X] T009 Create NFC service layer with business logic in inventory-management-backend/src/services/nfcService.ts
- [X] T010 [P] Write unit tests for NFC service (generate, rotate, validate) in inventory-management-backend/tests/unit/services/nfcService.test.ts
- [X] T011 Update AWS SAM template.yaml with new Lambda functions (NfcAdjustmentFunction, NfcUrlManagementFunction) and API Gateway routes
- [X] T012 [P] Create API client for NFC operations in inventory-management-frontend/lib/api/nfcUrls.ts

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Quick Inventory Adjustment via NFC Tap (Priority: P1) 🎯 MVP

**Goal**: User taps NFC tag → browser opens page → quantity auto-adjusts → feedback displayed

**Independent Test**: Program NFC tag with URL, tap with phone, verify page opens, adjustment occurs, and Continue feedback shown

### Implementation for User Story 1

- [X] T013 [P] [US1] Create Lambda handler for unauthenticated adjustment API POST /api/adjust/{urlId} in inventory-management-backend/src/handlers/nfcAdjustmentHandler.ts
- [X] T014 [P] [US1] Implement atomic inventory adjustment logic with DynamoDB UpdateExpression in inventory-management-backend/src/services/inventoryService.ts (extend existing)
- [X] T015 [P] [US1] Create Next.js page component for NFC adjustment at /t/[urlId] in inventory-management-frontend/app/t/[urlId]/page.tsx
- [X] T016 [US1] Implement server-side rendering logic to fetch item info and apply initial -1 adjustment in inventory-management-frontend/app/t/[urlId]/page.tsx
- [X] T017 [US1] Create mobile-responsive UI with item name, feedback message, and current quantity display in inventory-management-frontend/app/t/[urlId]/page.tsx
- [X] T018 [US1] Implement error handling for invalid/inactive URL IDs (404 error page) in inventory-management-frontend/app/t/[urlId]/error.tsx
- [X] T019 [US1] Add WCAG 2.1 AA compliant styling (color contrast, focus states) to NFC page in inventory-management-frontend/app/t/[urlId]/page.tsx
- [X] T020 [P] [US1] Write integration test for NFC adjustment API with concurrent requests in inventory-management-backend/tests/integration/nfcAdjustmentHandler.test.ts
- [X] T021 [P] [US1] Write integration test for minimum quantity enforcement (cannot go below 0) in inventory-management-backend/tests/integration/nfcAdjustmentHandler.test.ts
- [X] T022 [P] [US1] Add CloudWatch structured logging for NFC page accesses in inventory-management-backend/src/handlers/nfcAdjustmentHandler.ts
- [ ] T023 [US1] Test NFC page renders correctly on iOS Safari and Android Chrome (manual testing)
- [ ] T024 [US1] Verify low-stock notifications trigger when threshold crossed via NFC adjustment (integration with existing notification system)

**Checkpoint**: At this point, User Story 1 should be fully functional - users can tap tags and adjust inventory

---

## Phase 4: User Story 2 - Additional Adjustments from NFC Page (Priority: P2)

**Goal**: After NFC page loads, user can press + and - buttons for additional adjustments without reload

**Independent Test**: Open NFC page, press + and - buttons multiple times, verify quantity updates immediately without page reload

### Implementation for User Story 2

- [X] T025 [P] [US2] Create client component for +/- buttons with state management in inventory-management-frontend/app/t/[urlId]/AdjustmentClient.tsx
- [X] T026 [US2] Implement onClick handlers for + and - buttons that call POST /api/adjust/{urlId} in inventory-management-frontend/app/t/[urlId]/AdjustmentClient.tsx
- [X] T027 [US2] Add optimistic UI updates for immediate feedback before API response in inventory-management-frontend/app/t/[urlId]/AdjustmentClient.tsx
- [X] T028 [US2] Implement error recovery for failed adjustments (revert optimistic update, show error) in inventory-management-frontend/app/t/[urlId]/AdjustmentClient.tsx
- [X] T029 [US2] Ensure minimum 44x44px touch targets for + and - buttons (mobile usability) in inventory-management-frontend/app/t/[urlId]/AdjustmentClient.tsx
- [X] T030 [US2] Add loading states and disable buttons during API calls to prevent double-submission in inventory-management-frontend/app/t/[urlId]/AdjustmentClient.tsx
- [X] T031 [US2] Display feedback message when quantity is 0 and user presses - button in inventory-management-frontend/app/t/[urlId]/AdjustmentClient.tsx
- [X] T032 [P] [US2] Write component tests for AdjustmentClient (+/- button behavior, error states) in inventory-management-frontend/tests/components/AdjustmentClient.test.tsx
- [ ] T033 [US2] Test rapid button presses to verify atomicity and no lost updates (manual + integration test)
- [ ] T034 [US2] Verify adjustment API response time is < 1 second (performance testing)

**Checkpoint**: User Stories 1 AND 2 should both work - tap tag auto-adjusts, then +/- buttons work

---

## Phase 5: User Story 3 - NFC URL Management for Items (Priority: P2)

**Goal**: Family admins can generate, view, copy, and rotate NFC URLs for inventory items

**Independent Test**: From inventory UI, generate NFC URL, copy it, verify it works, then rotate it and verify old URL shows error

### Implementation for User Story 3

- [X] T035 [P] [US3] Create Lambda handler for authenticated NFC URL management API in inventory-management-backend/src/handlers/nfcUrlHandler.ts
- [X] T036 [P] [US3] Implement GET /api/items/{itemId}/nfc-urls endpoint (list URLs for item) in inventory-management-backend/src/handlers/nfcUrlHandler.ts
- [X] T037 [P] [US3] Implement POST /api/items/{itemId}/nfc-urls endpoint (create new URL) in inventory-management-backend/src/handlers/nfcUrlHandler.ts
- [X] T038 [P] [US3] Implement POST /api/items/{itemId}/nfc-urls/{urlId}/rotate endpoint (rotate URL) in inventory-management-backend/src/handlers/nfcUrlHandler.ts
- [X] T039 [P] [US3] Implement GET /api/nfc-urls endpoint (list all URLs for family) in inventory-management-backend/src/handlers/nfcUrlHandler.ts
- [X] T040 [US3] Add authorization checks (admin role required) to all NFC URL management endpoints in inventory-management-backend/src/handlers/nfcUrlHandler.ts
- [X] T041 [US3] Implement URL rotation logic (deactivate old, create new) in inventory-management-backend/src/services/nfcService.ts
- [X] T042 [P] [US3] Create NFCUrlManager reusable component in inventory-management-frontend/components/inventory/NFCUrlManager.tsx
- [X] T043 [US3] Implement UI for displaying existing NFC URLs (list with active/inactive status) in inventory-management-frontend/components/inventory/NFCUrlManager.tsx
- [X] T044 [US3] Add "Generate NFC URL" button that calls create endpoint in inventory-management-frontend/components/inventory/NFCUrlManager.tsx
- [X] T045 [US3] Implement copy-to-clipboard functionality for NFC URLs in inventory-management-frontend/components/inventory/NFCUrlManager.tsx
- [X] T046 [US3] Add "Rotate URL" button with confirmation dialog in inventory-management-frontend/components/inventory/NFCUrlManager.tsx
- [X] T047 [US3] Display full URL format (https://inventoryhq.io/t/{urlId}) in admin UI in inventory-management-frontend/components/inventory/NFCUrlManager.tsx
- [X] T048 [US3] Integrate NFCUrlManager component into inventory item detail page in inventory-management-frontend/app/dashboard/inventory/[itemId]/page.tsx
- [X] T049 [P] [US3] Write integration tests for NFC URL management API (create, list, rotate) in inventory-management-backend/tests/integration/nfcUrlHandler.test.ts
- [X] T050 [P] [US3] Write component tests for NFCUrlManager (generate, copy, rotate actions) in inventory-management-frontend/tests/components/inventory/NFCUrlManager.test.tsx
- [X] T051 [US3] Verify admin-only access (suggester role cannot access NFC URL management) in inventory-management-backend/tests/integration/nfcUrlHandler.test.ts
- [X] T052 [US3] Test URL rotation flow: old URL shows error, new URL works correctly (end-to-end test)

**Checkpoint**: All user stories should now be independently functional - complete NFC feature

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories or enhance overall quality

- [X] T053 [P] Add itemName denormalization update logic when InventoryItem name changes in inventory-management-backend/src/services/inventoryService.ts
- [X] T054 [P] Implement accessCount atomic increment on each NFC page load in inventory-management-backend/src/handlers/nfcAdjustmentHandler.ts
- [X] T055 [P] Add lastAccessedAt timestamp update on NFC page access in inventory-management-backend/src/handlers/nfcAdjustmentHandler.ts
- [X] T056 [P] Create CloudWatch alarms for suspicious access patterns (high frequency from single URL) in template.yaml
- [X] T057 [P] Add error tracking for invalid URL attempts (potential security monitoring) in inventory-management-backend/src/handlers/nfcAdjustmentHandler.ts
- [X] T058 [P] Optimize DynamoDB queries (verify no table scans, proper index usage) in inventory-management-backend/src/models/nfcUrl.ts
- [ ] T059 [P] Add performance monitoring for NFC page load time (<2s target) in inventory-management-frontend/app/t/[urlId]/page.tsx
- [ ] T060 [P] Implement client-side bundle size optimization (lazy loading, code splitting) in inventory-management-frontend/app/t/[urlId]/page.tsx
- [ ] T061 [P] Add HTTPS enforcement check at CloudFront level (update infrastructure) in template.yaml or CloudFront config
- [ ] T062 [P] Create seed script for test data (family, item, NFC URL) in inventory-management-backend/scripts/seed-nfc-test-data.ts
- [ ] T063 [P] Update quickstart.md with actual local development steps (verify accuracy) in specs/006-api-integration/quickstart.md
- [ ] T064 [P] Add JSDoc comments to all public functions in NFC modules in inventory-management-backend/src/services/nfcService.ts and nfcUrl.ts
- [ ] T065 [P] Run accessibility audit with axe-core on NFC page (WCAG 2.1 AA compliance) in CI pipeline
- [X] T066 [P] Verify TypeScript strict mode compliance across all new files (npm run type-check) in CI pipeline
- [X] T067 [P] Run Vite production build and verify no build errors (npm run build) in CI pipeline
- [X] T068 [P] Update API documentation with NFC endpoints (OpenAPI specs already created, verify accuracy) in specs/006-api-integration/contracts/
- [ ] T069 Add rate limiting configuration (optional but recommended for production) in template.yaml or API Gateway settings
- [X] T070 Create admin dashboard widget showing NFC URL usage statistics (optional enhancement) in inventory-management-frontend/app/dashboard/page.tsx

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - **BLOCKS all user stories**
- **User Story 1 (Phase 3)**: Depends on Foundational completion (T005-T012)
- **User Story 2 (Phase 4)**: Depends on Foundational completion (T005-T012) - **Can run parallel with US1**
- **User Story 3 (Phase 5)**: Depends on Foundational completion (T005-T012) - **Can run parallel with US1 & US2**
- **Polish (Phase 6)**: Depends on desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - **MVP - highest priority**
  - No dependencies on other user stories
  - Delivers core value: tap NFC tag → adjust inventory
  
- **User Story 2 (P2)**: Can start after Foundational (Phase 2) - **Enhances US1**
  - Technically independent (adds client-side +/- buttons)
  - Practically extends US1 (same page, adds interactivity)
  - Can be developed in parallel with US1 by different developer
  
- **User Story 3 (P2)**: Can start after Foundational (Phase 2) - **Admin setup for US1 & US2**
  - Fully independent implementation (different UI, different API)
  - Enables users to create URLs for US1 & US2 to consume
  - Can be developed in parallel with US1 & US2

### Within Each User Story

**User Story 1** (T013-T024):
- T013 (adjustment API handler) and T014 (atomic adjustment logic) can start in parallel
- T015-T017 (Next.js page) can start in parallel with backend
- T018-T019 (error handling, styling) depend on T015-T017
- T020-T022 (tests, logging) can run in parallel after core implementation
- T023-T024 (manual testing, integration) happen last

**User Story 2** (T025-T034):
- T025 (client component) starts after US1's page exists (T015)
- T026-T031 (button handlers, optimistic UI, error handling) are sequential in T025
- T032 (component tests) can run in parallel with T026-T031
- T033-T034 (manual/performance testing) happen last

**User Story 3** (T035-T052):
- T035-T039 (API endpoints) can all run in parallel
- T040-T041 (authorization, rotation logic) can run in parallel with T035-T039
- T042 (NFCUrlManager component) can start after API contracts are clear
- T043-T047 (UI features) are sequential in T042
- T048 (integration into item page) depends on T042-T047
- T049-T052 (tests) can run in parallel with frontend work

### Parallel Opportunities

**Within Setup (Phase 1)**:
- T001-T004: All can run in parallel (different files, no dependencies)

**Within Foundational (Phase 2)**:
- T005 (URL generator) and T006 (tests) are sequential
- T007 (model) and T008 (tests) are sequential
- T009 (service) and T010 (tests) are sequential
- But T005-T006, T007-T008, T009-T010 can run in parallel as groups
- T011 (SAM template) and T012 (frontend API client) can run in parallel with above

**Across User Stories**:
- Once Foundational (T005-T012) is complete, US1, US2, and US3 can ALL proceed in parallel
- If team has 3 developers: Dev1→US1, Dev2→US2, Dev3→US3
- If team has 2 developers: Dev1→US1+US2 (same page), Dev2→US3 (separate UI)
- If team has 1 developer: US1 → US2 → US3 (priority order)

**Within Polish (Phase 6)**:
- T053-T070: Most can run in parallel (different files/concerns)
- T063-T064 (docs) and T065-T067 (CI checks) and T068 (API docs) are fully independent
- T053-T055 (denormalization, metrics) can run in parallel

---

## Parallel Example: Complete Feature with 3 Developers

```bash
# After Foundational phase completes, split work:

# Developer 1: User Story 1 (MVP - Core NFC Tap)
git checkout -b feature/us1-nfc-tap
# Implement T013-T024 (backend API + frontend page + tests)

# Developer 2: User Story 2 (Interactive Buttons)
git checkout -b feature/us2-interactive-buttons
# Implement T025-T034 (client component + tests)

# Developer 3: User Story 3 (Admin URL Management)
git checkout -b feature/us3-admin-management
# Implement T035-T052 (backend API + admin UI + tests)

# All three can merge independently when complete
# Feature is fully functional when all three are merged
```

---

## Implementation Strategy

### MVP Scope (Minimum Viable Product)

**Include**:
- Phase 1: Setup (T001-T004)
- Phase 2: Foundational (T005-T012)
- Phase 3: User Story 1 (T013-T024) - Core NFC tap functionality

**Total Tasks for MVP**: 24 tasks (T001-T024)
**Estimated Effort**: 1-1.5 sprints for single developer

**MVP Delivers**: Users can tap NFC tags and adjust inventory automatically

---

### Full Feature Scope

**Include**:
- MVP (T001-T024)
- Phase 4: User Story 2 (T025-T034) - Interactive +/- buttons
- Phase 5: User Story 3 (T035-T052) - Admin URL management
- Phase 6: Polish (T053-T070) - Cross-cutting improvements

**Total Tasks for Full Feature**: 70 tasks (T001-T070)
**Estimated Effort**: 2-3 sprints for single developer, 1-2 sprints for team of 3

**Full Feature Delivers**: Complete NFC inventory tracking with admin controls

---

## Success Criteria Verification

Map tasks to success criteria from spec.md:

- **SC-001** (NFC tap feedback in <3s): Verified by T023, T024, T059
- **SC-002** (95% success rate): Verified by T020, T049, monitoring in T056
- **SC-003** (Atomic adjustments): Verified by T014, T020, T021, T033
- **SC-004** (Works on iOS/Android): Verified by T023 (manual testing)
- **SC-005** (Admin generates URL in <10s): Verified by T044, T050
- **SC-006** (Button adjustments <1s): Verified by T034
- **SC-007** (Invalid URL error in <2s): Verified by T018, T027

---

## Testing Strategy

### Test-First Approach (Constitutional Requirement)

For business-critical paths:
1. Write test first (T006, T008, T010, T020, T021, etc.)
2. Run test - **verify it FAILS** (no implementation yet)
3. Implement feature (T005, T007, T009, T013, T014, etc.)
4. Run test - verify it PASSES
5. Refactor if needed while keeping test passing

### Test Coverage Target

**80% coverage required for critical paths**:
- URL generation (T006)
- Atomic adjustment logic (T020, T021)
- Concurrent request handling (T020, T033)
- URL rotation logic (T049)
- Error handling (T018, T028, T051)

### Test Types

- **Unit Tests**: T006, T008, T010, T032, T050
- **Integration Tests**: T020, T021, T024, T049, T051
- **Component Tests**: T032, T050
- **Manual Tests**: T023, T033, T052
- **Performance Tests**: T034, T059

---

## Risk Mitigation

### Critical Path Tasks (Cannot Fail)

- **T005**: URL generator (security foundation)
- **T014**: Atomic adjustment logic (data integrity)
- **T020**: Concurrent request handling (prevents race conditions)
- **T040**: Authorization checks (security)

### High-Risk Areas

1. **Concurrency**: T014, T020, T021, T033 - Test thoroughly with load testing
2. **Security**: T005, T040, T051, T056 - Multiple layers of validation
3. **Mobile Compatibility**: T023 - Test on real devices (iOS + Android)
4. **Performance**: T034, T059 - Monitor and optimize if targets not met

---

## References

- Feature Specification: [spec.md](spec.md)
- Implementation Plan: [plan.md](plan.md)
- Data Model: [data-model.md](data-model.md)
- API Contracts: [contracts/](contracts/)
- Research Decisions: [research.md](research.md)
- Developer Guide: [quickstart.md](quickstart.md)
