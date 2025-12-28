# Tasks: Suggester Workflow

**Feature**: 004-suggester-workflow  
**Date**: 2025-12-28  
**Input**: Design documents from `/specs/004-suggester-workflow/`

**Organization**: Tasks are grouped by implementation phase. User Story 5 is the single story for this feature, following the established pattern from parent features.

## Format: `- [ ] [ID] [P?] [Story?] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: User story label (US5 for this feature)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Extend existing project structure for suggestion workflow

- [X] T001 Review existing backend structure in `inventory-management-backend/src/` and verify DynamoDB table exists
- [X] T002 Review existing frontend structure in `inventory-management-frontend/app/dashboard/` and verify common component library available
- [X] T003 [P] Create suggestion types file `inventory-management-backend/src/types/suggestions.ts` with Suggestion interface
- [X] T004 [P] Extend `inventory-management-frontend/types/entities.ts` with Suggestion type definition

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core suggestion infrastructure that MUST be complete before implementation

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T005 Create Zod validation schemas for suggestions in `inventory-management-backend/src/models/validation/suggestionSchemas.ts`
- [X] T006 [P] Create suggestion model `inventory-management-backend/src/models/suggestion.ts` with DynamoDB operations (get, query, create, update)
- [X] T007 [P] Create inventory repository helpers for suggestion validation in `inventory-management-backend/src/models/inventory.ts` (getItemByIdAndFamily)
- [X] T008 Create suggestion service `inventory-management-backend/src/services/suggestions.ts` with business logic (validateSuggestion, validateItemNameUnique)
- [X] T009 Update SAM template `inventory-management-backend/template.yaml` to add suggestion Lambda functions and API Gateway routes

**Checkpoint**: Foundation ready - user story implementation can now begin

---

## Phase 3: User Story 5 - Suggesters View Inventory and Submit Suggestions (Priority: P2)

**Goal**: Enable suggester members to view inventory, create suggestions for shopping list additions or new items, and allow admins to approve/reject suggestions with atomic execution

**Independent Test**: Log in as suggester, submit "add_to_shopping" and "create_item" suggestions, then log in as admin to approve/reject and verify shopping list item or inventory item is created/rejected correctly

### Backend Implementation for User Story 5

#### Suggestion Creation (FR-005 to FR-011)

- [X] T010 [P] [US5] Implement createSuggestion handler in `inventory-management-backend/src/handlers/suggestions/create-suggestion.ts`
- [X] T011 [P] [US5] Add role validation (suggester only) in createSuggestion handler using `lib/auth.ts` requireRole function
- [X] T012 [P] [US5] Implement "add_to_shopping" suggestion validation (check item exists, snapshot itemName) in suggestion service
- [X] T013 [P] [US5] Implement "create_item" suggestion validation (validate proposedItemName, quantity, threshold) in suggestion service
- [X] T014 [US5] Add error handling for missing/archived referenced items (FR-029) with user-friendly error messages

#### Suggestion Viewing (FR-012 to FR-017)

- [X] T015 [P] [US5] Implement listSuggestions handler in `inventory-management-backend/src/handlers/suggestions/list-suggestions.ts`
- [X] T016 [P] [US5] Add status filtering using GSI1 (PK=`FAMILY#<familyId>#STATUS#<status>`) in suggestion model
- [X] T017 [P] [US5] Implement cursor-based pagination with nextToken encoding/decoding in suggestion service
- [X] T018 [P] [US5] Implement getSuggestion handler in `inventory-management-backend/src/handlers/suggestions/get-suggestion.ts`
- [X] T019 [US5] Add suggester name display with "(removed)" suffix when member deleted in list response

#### Suggestion Approval (FR-018 to FR-023, FR-029, FR-030)

- [X] T020 [US5] Implement approveSuggestion handler in `inventory-management-backend/src/handlers/suggestions/approve-suggestion.ts`
- [X] T021 [US5] Add role validation (admin only) in approveSuggestion handler using requireRole function
- [X] T022 [US5] Implement optimistic locking check (status=pending AND version match) in approval logic
- [X] T023 [US5] Implement atomic "add_to_shopping" approval using TransactWriteItems (update suggestion + create ShoppingListItem) in suggestion service
- [X] T024 [US5] Implement atomic "create_item" approval using TransactWriteItems (update suggestion + create InventoryItem) in suggestion service
- [X] T025 [US5] Add duplicate item name validation (FR-030) before "create_item" approval using validateItemNameUnique
- [X] T026 [US5] Add orphaned item check (FR-029) for "add_to_shopping" approval - return 422 if item deleted/archived
- [X] T027 [US5] Handle TransactionCanceledException errors (concurrent approval, duplicate name) with descriptive 409 responses

#### Suggestion Rejection (FR-024 to FR-028)

- [X] T028 [P] [US5] Implement rejectSuggestion handler in `inventory-management-backend/src/handlers/suggestions/reject-suggestion.ts`
- [X] T029 [P] [US5] Add role validation (admin only) in rejectSuggestion handler using requireRole function
- [X] T030 [P] [US5] Implement optimistic locking check in rejection logic (status=pending AND version match)
- [X] T031 [P] [US5] Add optional rejectionNotes field to rejection with 500-char validation

### Frontend Implementation for User Story 5

#### Suggester UI - Suggestion Creation

- [X] T032 [P] [US5] Create suggestion API client in `inventory-management-frontend/lib/api/suggestions.ts` with createSuggestion, listSuggestions, approveSuggestion, rejectSuggestion functions
- [X] T033 [US5] Create SuggestionForm component in `inventory-management-frontend/components/suggestions/SuggestionForm.tsx` composing Button, Input, Select, Card from common library
- [X] T034 [US5] Add type selection (add_to_shopping/create_item) with conditional field rendering in SuggestionForm
- [X] T035 [US5] Add item selection dropdown (for add_to_shopping) loading inventory items in SuggestionForm
- [X] T036 [US5] Add proposed item fields (name, quantity, threshold) for create_item in SuggestionForm
- [X] T037 [US5] Add optional notes field (500 char limit) with client-side validation in SuggestionForm
- [X] T038 [US5] Create suggester suggestion submission page in `inventory-management-frontend/app/dashboard/suggestions/suggest/page.tsx`
- [X] T039 [US5] Add success toast and redirect to suggestions list after submission in suggest page
- [X] T040 [US5] Add error handling with user-friendly messages (404 for missing item, 403 for permission denied) in suggest page

#### Admin UI - Suggestion Review

- [X] T041 [P] [US5] Create SuggestionCard component in `inventory-management-frontend/components/suggestions/SuggestionCard.tsx` composing Card, Badge, Button from common library
- [X] T042 [P] [US5] Add status badge styling (pending=yellow, approved=green, rejected=red) using Badge variants in SuggestionCard
- [X] T043 [P] [US5] Add suggester name display with "(removed)" badge if member deleted in SuggestionCard
- [X] T044 [P] [US5] Add approve/reject buttons (visible only to admins on pending suggestions) in SuggestionCard
- [X] T045 [P] [US5] Add rejection notes modal using Modal component from common library in SuggestionCard
- [X] T046 [US5] Create SuggestionList component in `inventory-management-frontend/components/suggestions/SuggestionList.tsx` with filtering and infinite scroll
- [X] T047 [US5] Add status filter (pending/approved/rejected) with Select component in SuggestionList
- [X] T048 [US5] Implement infinite scroll pagination using nextToken in SuggestionList
- [X] T049 [US5] Create admin suggestion review page in `inventory-management-frontend/app/dashboard/suggestions/page.tsx`
- [X] T050 [US5] Add optimistic UI updates (immediate status change) with rollback on error in review page
- [X] T051 [US5] Add error handling for conflicts (409: duplicate name, already reviewed, item deleted) with Modal dialogs
- [X] T052 [US5] Add success toast notifications on approve/reject actions in review page

#### Inventory View for Suggesters (FR-001 to FR-004)

- [X] T053 [P] [US5] Verify existing inventory list component prevents modification for suggester role (read-only display)
- [X] T054 [P] [US5] Add "Suggest" action button on inventory items for suggesters in `inventory-management-frontend/app/dashboard/inventory/page.tsx`
- [X] T055 [US5] Link "Suggest" button to suggestion form with pre-filled itemId for add_to_shopping

### Testing for User Story 5

- [X] T056 [P] [US5] Unit test: suggestion validation (type, required fields, role check) in `inventory-management-backend/tests/unit/services/suggestions.test.ts`
- [X] T057 [P] [US5] Unit test: item name uniqueness validation in suggestions unit test
- [X] T058 [P] [US5] Unit test: item snapshot storage for add_to_shopping in suggestions unit test
- [X] T059 [P] [US5] Unit test: optimistic locking logic (version check) in suggestions unit test
- [X] T060 [P] [US5] Integration test: POST /suggestions (create add_to_shopping) in `inventory-management-backend/tests/integration/handlers/suggestions.test.ts`
- [X] T061 [P] [US5] Integration test: POST /suggestions (create create_item) in suggestions integration test
- [X] T062 [P] [US5] Integration test: POST /suggestions (403 when admin tries to create) in suggestions integration test
- [X] T063 [P] [US5] Integration test: GET /suggestions (list with status filter) in suggestions integration test
- [X] T064 [P] [US5] Integration test: POST /suggestions/:id/approve (add_to_shopping success) with TransactWriteItems mock in suggestions integration test
- [X] T065 [P] [US5] Integration test: POST /suggestions/:id/approve (create_item success) with TransactWriteItems mock in suggestions integration test
- [X] T066 [P] [US5] Integration test: POST /suggestions/:id/approve (409 when duplicate item name) in suggestions integration test
- [X] T067 [P] [US5] Integration test: POST /suggestions/:id/approve (422 when item deleted) in suggestions integration test
- [X] T068 [P] [US5] Integration test: POST /suggestions/:id/approve (409 when concurrent approval) in suggestions integration test
- [X] T069 [P] [US5] Integration test: POST /suggestions/:id/reject (admin success) in suggestions integration test
- [X] T070 [P] [US5] Integration test: POST /suggestions/:id/reject (403 when suggester tries) in suggestions integration test
- [X] T071 [P] [US5] Component test: SuggestionForm type selection and field rendering in `inventory-management-frontend/tests/components/suggestions/SuggestionForm.test.tsx`
- [X] T072 [P] [US5] Component test: SuggestionForm validation and submission in SuggestionForm test
- [X] T073 [P] [US5] Component test: SuggestionCard approve/reject button visibility (admin vs suggester) in `inventory-management-frontend/tests/components/suggestions/SuggestionCard.test.tsx`
- [X] T074 [P] [US5] Component test: SuggestionList filtering and pagination in `inventory-management-frontend/tests/components/suggestions/SuggestionList.test.tsx`

**Checkpoint**: User Story 5 should be fully functional and independently testable

---

## Phase 4: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that enhance the suggestion workflow

- [X] T075 [P] Add structured logging for suggestion operations (create, approve, reject) in all handlers
- [X] T076 [P] Add CloudWatch metrics for suggestion counts by status in suggestion service
- [X] T077 [P] Update API documentation in `specs/004-suggester-workflow/contracts/api-spec.md`
- [X] T078 [P] Add accessibility testing (focus management, ARIA labels) for suggestion components
- [X] T079 [P] Performance optimization: batch inventory item lookups in listSuggestions
- [X] T080 Run quickstart validation per `specs/004-suggester-workflow/quickstart.md`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup (Phase 1) - BLOCKS all user story work
- **User Story 5 (Phase 3)**: Depends on Foundational (Phase 2) completion
- **Polish (Phase 4)**: Depends on User Story 5 (Phase 3) completion

### User Story 5 Internal Dependencies

**Backend Flow**:
1. Types and validation (T003, T005) → Foundation for all backend work
2. Models (T006, T007) → Foundation for services
3. Service logic (T008) → Foundation for handlers
4. Create handler (T010-T014) → Can test suggestion creation
5. List handler (T015-T019) → Can test suggestion viewing
6. Approve handler (T020-T027) → Requires create + list complete
7. Reject handler (T028-T031) → Can work in parallel with approve

**Frontend Flow**:
1. API client (T032) → Foundation for all frontend work
2. SuggestionForm (T033-T037) → Suggester can create
3. Suggest page (T038-T040) → Complete suggester flow
4. SuggestionCard (T041-T045) → Admin can view details
5. SuggestionList (T046-T048) → Admin can browse all
6. Review page (T049-T052) → Complete admin flow
7. Inventory integration (T053-T055) → Suggester convenience feature

**Testing Flow**:
- Unit tests (T056-T059) → Can start as soon as service logic exists (after T008)
- Integration tests (T060-T070) → Can start as soon as handlers exist (after T010-T031)
- Component tests (T071-T074) → Can start as soon as components exist (after T033-T046)

### Parallel Opportunities

**Phase 1 (Setup)**:
- T003 and T004 can run in parallel (backend vs frontend types)

**Phase 2 (Foundational)**:
- T006 and T007 can run in parallel (different models)
- After T005-T008 complete, T009 (SAM template) can proceed

**Phase 3 (User Story 5)**:

*Backend - Creation Group (can start after T008)*:
- T010, T011, T012, T013 can run in parallel (different aspects of create handler)

*Backend - Viewing Group (can start after T008)*:
- T015, T016, T017, T018 can run in parallel (different list/get aspects)

*Backend - Rejection Group (can start after T015)*:
- T028, T029, T030, T031 can run in parallel (different aspects of reject handler)

*Frontend - Form Group (can start after T032)*:
- T033-T037 should be sequential (building up the form)

*Frontend - Card Group (can start after T032)*:
- T041, T042, T043, T044, T045 can run in parallel (different card features)

*Testing - All Parallel Within Type*:
- All unit tests (T056-T059) can run in parallel
- All integration tests (T060-T070) can run in parallel
- All component tests (T071-T074) can run in parallel

**Phase 4 (Polish)**:
- T075, T076, T077, T078, T079 can all run in parallel

### Critical Path (Minimum Sequential Tasks for MVP)

1. T001-T002 (Setup review)
2. T003 (Backend types)
3. T005-T008 (Foundation: validation, models, service)
4. T009 (SAM template)
5. T010-T014 (Create handler)
6. T015-T019 (List handler)
7. T020-T027 (Approve handler)
8. T032 (API client)
9. T033-T038 (Suggester form + page)
10. T049-T052 (Admin review page)

**Estimated Critical Path Time**: ~20-25 tasks in sequence, ~15-20 hours

---

## Parallel Example: Backend Handlers

Once Phase 2 (Foundational) is complete, the following backend handler tasks can proceed in parallel:

```bash
# Terminal 1: Suggestion creation
T010-T014: Create and test suggestion creation handler

# Terminal 2: Suggestion listing
T015-T019: Create and test suggestion listing handler

# Terminal 3: Suggestion rejection
T028-T031: Create and test suggestion rejection handler

# After T015 completes, Terminal 3 can switch to:
T020-T027: Create and test suggestion approval handler
```

---

## Parallel Example: Frontend Components

Once T032 (API client) is complete, the following frontend tasks can proceed in parallel:

```bash
# Terminal 1: Suggester form
T033-T040: Build suggester submission UI

# Terminal 2: Admin card
T041-T045: Build admin suggestion card component

# Terminal 3: Admin list
T046-T048: Build admin suggestion list component
```

---

## Parallel Example: Testing

Once handlers are complete, all tests can run in parallel:

```bash
# Terminal 1: Unit tests
npm test tests/unit/services/suggestions.test.ts

# Terminal 2: Integration tests  
npm test tests/integration/handlers/suggestions.test.ts

# Terminal 3: Component tests
npm test tests/components/suggestions/
```

---

## Task Summary

**Total Tasks**: 80

**By Phase**:
- Phase 1 (Setup): 4 tasks
- Phase 2 (Foundational): 5 tasks
- Phase 3 (User Story 5): 65 tasks
  - Backend: 31 tasks (creation: 5, viewing: 5, approval: 8, rejection: 4, testing: 11)
  - Frontend: 24 tasks (form: 9, review: 12, inventory: 3, testing: 4)
- Phase 4 (Polish): 6 tasks

**Parallel Opportunities**: 45 tasks marked [P] can run in parallel with proper coordination

**Critical Path**: 20-25 sequential tasks (~15-20 hours)

**Test Coverage Target**: 80% for critical paths (approval workflow, edge cases)
- 4 unit tests
- 11 integration tests
- 4 component tests
- Total: 19 test tasks

**MVP Scope**: All of User Story 5 (suggester creation + admin review workflow)

---

**Status**: Ready for implementation  
**Next Step**: Execute tasks in order, starting with Phase 1 (Setup)  
**Branch**: `004-suggester-workflow`
