# Tasks: Suggester Workflow

**Input**: Design documents from `/specs/004-suggester-workflow/`
**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅, data-model.md ✅, contracts/api-spec.md ✅, quickstart.md ✅

**Tests**: 80% coverage required for critical paths per constitution. Tests are included for all layers.

**Organization**: Tasks are organized by User Story 5 acceptance scenarios to enable independent implementation and testing.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[US5]**: User Story 5 - Suggesters View Inventory and Submit Suggestions
- Include exact file paths in descriptions

## Path Conventions

- **Single project**: `src/`, `tests/` at repository root
- Paths follow Next.js App Router conventions per plan.md

---

## Phase 1: Setup

**Purpose**: Verify project structure and dependencies are in place

- [ ] T001 Verify project structure exists per plan.md in `src/app/api/families/[familyId]/`
- [ ] T002 Verify dependencies installed: `@aws-sdk/client-dynamodb`, `@aws-sdk/lib-dynamodb`, `zod`, `uuid`
- [ ] T003 [P] Verify environment variables configured: `DYNAMODB_TABLE_NAME`, `AWS_REGION`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before User Story 5 scenarios can be implemented

**⚠️ CRITICAL**: No scenario work can begin until this phase is complete

### Type Definitions

- [ ] T004 Create Suggestion type enums (SuggestionTypeSchema, SuggestionStatusSchema) in `src/types/suggestion.ts`
- [ ] T005 Create Suggestion entity Zod schema (SuggestionSchema) in `src/types/suggestion.ts`
- [ ] T006 [P] Create CreateAddToShoppingSuggestionRequestSchema in `src/types/suggestion.ts`
- [ ] T007 [P] Create CreateItemSuggestionRequestSchema in `src/types/suggestion.ts`
- [ ] T008 Create CreateSuggestionRequestSchema discriminated union in `src/types/suggestion.ts`
- [ ] T009 [P] Create ApproveSuggestionRequestSchema in `src/types/suggestion.ts`
- [ ] T010 [P] Create RejectSuggestionRequestSchema in `src/types/suggestion.ts`
- [ ] T011 Create DynamoDB key helper functions (buildSuggestionKeys, parseSuggestionKeys) in `src/types/suggestion.ts`

### Error Classes

- [ ] T012 [P] Create ForbiddenError class in `src/services/suggestionService.ts`
- [ ] T013 [P] Create NotFoundError class in `src/services/suggestionService.ts`
- [ ] T014 [P] Create ConflictError class with currentState property in `src/services/suggestionService.ts`
- [ ] T015 [P] Create UnprocessableError class with itemStatus property in `src/services/suggestionService.ts`

### Unit Tests for Type Definitions

- [ ] T016 [P] Unit tests for Zod schemas validation in `tests/unit/types/suggestion.test.ts`
- [ ] T017 [P] Unit tests for DynamoDB key helper functions in `tests/unit/types/suggestion.test.ts`

**Checkpoint**: Foundation ready - User Story 5 scenario implementation can now begin

---

## Phase 3: User Story 5 - Suggesters View Inventory and Submit Suggestions (Priority: P2)

**Goal**: Enable suggester users to view family inventory and submit suggestions for adding items to shopping list or creating new inventory items. Admins review and approve or reject these suggestions.

**Independent Test**: Can be tested by logging in as a suggester, submitting suggestions for shopping list additions and new items, then logging in as an adult to approve/reject and verify the results.

---

### Scenario 1: Suggester Views Inventory (Read-Only)

**Acceptance**: Given a suggester is logged in, When they view inventory, Then they can see all current items and quantities

#### Repository Layer - Scenario 1

- [ ] T018 [US5] Implement listInventoryItems function in `src/lib/dynamodb/inventoryRepository.ts` (if not exists from parent feature)

#### Service Layer - Scenario 1

- [ ] T019 [US5] Implement getInventoryForSuggester function with role validation in `src/services/suggestionService.ts`

#### API Route - Scenario 1

- [ ] T020 [US5] Implement GET handler for `/families/{familyId}/inventory` in `src/app/api/families/[familyId]/inventory/route.ts`

#### Unit Tests - Scenario 1

- [ ] T021 [P] [US5] Unit test for listInventoryItems repository function in `tests/unit/lib/inventoryRepository.test.ts`
- [ ] T022 [P] [US5] Unit test for getInventoryForSuggester service function in `tests/unit/services/suggestionService.test.ts`

#### Integration Tests - Scenario 1

- [ ] T023 [US5] Integration test for GET /families/{familyId}/inventory endpoint in `tests/integration/api/inventory.test.ts`

---

### Scenario 2: Suggester Creates add_to_shopping Suggestion

**Acceptance**: Given a suggester views an inventory item, When they request it be added to shopping list, Then a suggestion is created for adult review

#### Repository Layer - Scenario 2

- [ ] T024 [US5] Implement createSuggestion function with PutCommand in `src/lib/dynamodb/suggestionRepository.ts`

#### Service Layer - Scenario 2

- [ ] T025 [US5] Implement createSuggestion function for add_to_shopping type with role validation and item snapshot in `src/services/suggestionService.ts`

#### API Route - Scenario 2

- [ ] T026 [US5] Implement POST handler for `/families/{familyId}/suggestions` in `src/app/api/families/[familyId]/suggestions/route.ts`

#### Unit Tests - Scenario 2

- [ ] T027 [P] [US5] Unit test for createSuggestion repository function in `tests/unit/lib/suggestionRepository.test.ts`
- [ ] T028 [P] [US5] Unit test for createSuggestion service (add_to_shopping) in `tests/unit/services/suggestionService.test.ts`
- [ ] T029 [P] [US5] Unit test for role validation (only suggesters can create) in `tests/unit/services/suggestionService.test.ts`
- [ ] T030 [P] [US5] Unit test for item existence validation in `tests/unit/services/suggestionService.test.ts`

#### Integration Tests - Scenario 2

- [ ] T031 [US5] Integration test for POST /families/{familyId}/suggestions (add_to_shopping) in `tests/integration/api/suggestions.test.ts`

---

### Scenario 3: Suggester Creates create_item Suggestion

**Acceptance**: Given a suggester is on the inventory page, When they request a new item be created, Then a suggestion is submitted for adult approval

#### Service Layer - Scenario 3

- [ ] T032 [US5] Extend createSuggestion function for create_item type in `src/services/suggestionService.ts`

#### Unit Tests - Scenario 3

- [ ] T033 [P] [US5] Unit test for createSuggestion service (create_item) in `tests/unit/services/suggestionService.test.ts`
- [ ] T034 [P] [US5] Unit test for proposedItemName validation in `tests/unit/services/suggestionService.test.ts`

#### Integration Tests - Scenario 3

- [ ] T035 [US5] Integration test for POST /families/{familyId}/suggestions (create_item) in `tests/integration/api/suggestions.test.ts`

---

### Scenario 4: Admin Views Pending Suggestions

**Acceptance**: Given suggestions exist, When an adult views them, Then they can see all pending suggestions with details

#### Repository Layer - Scenario 4

- [ ] T036 [US5] Implement listSuggestions function with GSI2 query and status filter in `src/lib/dynamodb/suggestionRepository.ts`
- [ ] T037 [US5] Implement getSuggestion function with GetCommand in `src/lib/dynamodb/suggestionRepository.ts`

#### Service Layer - Scenario 4

- [ ] T038 [US5] Implement listSuggestions function in `src/services/suggestionService.ts`
- [ ] T039 [US5] Implement getSuggestion function in `src/services/suggestionService.ts`

#### API Routes - Scenario 4

- [ ] T040 [US5] Implement GET handler for `/families/{familyId}/suggestions` with status filter in `src/app/api/families/[familyId]/suggestions/route.ts`
- [ ] T041 [US5] Implement GET handler for `/families/{familyId}/suggestions/{suggestionId}` in `src/app/api/families/[familyId]/suggestions/[suggestionId]/route.ts`

#### Unit Tests - Scenario 4

- [ ] T042 [P] [US5] Unit test for listSuggestions repository function in `tests/unit/lib/suggestionRepository.test.ts`
- [ ] T043 [P] [US5] Unit test for getSuggestion repository function in `tests/unit/lib/suggestionRepository.test.ts`
- [ ] T044 [P] [US5] Unit test for listSuggestions service function in `tests/unit/services/suggestionService.test.ts`
- [ ] T045 [P] [US5] Unit test for getSuggestion service function in `tests/unit/services/suggestionService.test.ts`

#### Integration Tests - Scenario 4

- [ ] T046 [US5] Integration test for GET /families/{familyId}/suggestions in `tests/integration/api/suggestions.test.ts`
- [ ] T047 [US5] Integration test for GET /families/{familyId}/suggestions/{suggestionId} in `tests/integration/api/suggestions.test.ts`

---

### Scenario 5: Admin Approves Suggestion (Atomic Execution)

**Acceptance**: Given a pending suggestion, When an adult approves it, Then the suggested action is executed (item added to list or inventory)

#### Repository Layer - Scenario 5

- [ ] T048 [US5] Implement approveSuggestionWithTransaction function using TransactWriteCommand in `src/lib/dynamodb/suggestionRepository.ts`
- [ ] T049 [US5] Add transaction item for ShoppingListItem creation (add_to_shopping) in `src/lib/dynamodb/suggestionRepository.ts`
- [ ] T050 [US5] Add transaction item for InventoryItem creation (create_item) in `src/lib/dynamodb/suggestionRepository.ts`

#### Service Layer - Scenario 5

- [ ] T051 [US5] Implement approveSuggestion function with admin role validation in `src/services/suggestionService.ts`
- [ ] T052 [US5] Add optimistic locking check (version + status) in approveSuggestion in `src/services/suggestionService.ts`
- [ ] T053 [US5] Add orphaned item validation for add_to_shopping approval in `src/services/suggestionService.ts`

#### API Route - Scenario 5

- [ ] T054 [US5] Implement POST handler for `/families/{familyId}/suggestions/{suggestionId}/approve` in `src/app/api/families/[familyId]/suggestions/[suggestionId]/approve/route.ts`

#### Unit Tests - Scenario 5

- [ ] T055 [P] [US5] Unit test for approveSuggestionWithTransaction repository function in `tests/unit/lib/suggestionRepository.test.ts`
- [ ] T056 [P] [US5] Unit test for approveSuggestion service (add_to_shopping) in `tests/unit/services/suggestionService.test.ts`
- [ ] T057 [P] [US5] Unit test for approveSuggestion service (create_item) in `tests/unit/services/suggestionService.test.ts`
- [ ] T058 [P] [US5] Unit test for admin role validation in approveSuggestion in `tests/unit/services/suggestionService.test.ts`
- [ ] T059 [P] [US5] Unit test for optimistic locking conflict handling in `tests/unit/services/suggestionService.test.ts`
- [ ] T060 [P] [US5] Unit test for orphaned item handling (422 response) in `tests/unit/services/suggestionService.test.ts`

#### Integration Tests - Scenario 5

- [ ] T061 [US5] Integration test for POST /families/{familyId}/suggestions/{suggestionId}/approve (add_to_shopping) in `tests/integration/api/suggestions.test.ts`
- [ ] T062 [US5] Integration test for POST /families/{familyId}/suggestions/{suggestionId}/approve (create_item) in `tests/integration/api/suggestions.test.ts`
- [ ] T063 [US5] Integration test for 409 Conflict response on concurrent approval in `tests/integration/api/suggestions.test.ts`
- [ ] T064 [US5] Integration test for 422 Unprocessable response on deleted item in `tests/integration/api/suggestions.test.ts`

---

### Scenario 6: Admin Rejects Suggestion

**Acceptance**: Given a pending suggestion, When an adult rejects it, Then the suggestion is dismissed without changes

#### Repository Layer - Scenario 6

- [ ] T065 [US5] Implement rejectSuggestion function with UpdateCommand in `src/lib/dynamodb/suggestionRepository.ts`

#### Service Layer - Scenario 6

- [ ] T066 [US5] Implement rejectSuggestion function with admin role validation in `src/services/suggestionService.ts`
- [ ] T067 [US5] Add optimistic locking check (version + status) in rejectSuggestion in `src/services/suggestionService.ts`

#### API Route - Scenario 6

- [ ] T068 [US5] Implement POST handler for `/families/{familyId}/suggestions/{suggestionId}/reject` in `src/app/api/families/[familyId]/suggestions/[suggestionId]/reject/route.ts`

#### Unit Tests - Scenario 6

- [ ] T069 [P] [US5] Unit test for rejectSuggestion repository function in `tests/unit/lib/suggestionRepository.test.ts`
- [ ] T070 [P] [US5] Unit test for rejectSuggestion service function in `tests/unit/services/suggestionService.test.ts`
- [ ] T071 [P] [US5] Unit test for admin role validation in rejectSuggestion in `tests/unit/services/suggestionService.test.ts`
- [ ] T072 [P] [US5] Unit test for rejectionNotes handling in `tests/unit/services/suggestionService.test.ts`

#### Integration Tests - Scenario 6

- [ ] T073 [US5] Integration test for POST /families/{familyId}/suggestions/{suggestionId}/reject in `tests/integration/api/suggestions.test.ts`
- [ ] T074 [US5] Integration test for 409 Conflict response on already-reviewed suggestion in `tests/integration/api/suggestions.test.ts`

---

## Phase 4: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple scenarios

### SAM Template Updates

- [ ] T075 Add Lambda function definition for suggestions API in `template.yaml`
- [ ] T076 Add IAM role with least-privilege DynamoDB permissions in `template.yaml`
- [ ] T077 [P] Add API Gateway route configuration for suggestion endpoints in `template.yaml`

### Error Handling Refinement

- [ ] T078 [P] Ensure consistent error response format across all endpoints in `src/app/api/families/[familyId]/suggestions/`
- [ ] T079 [P] Add request logging for suggestion operations in `src/services/suggestionService.ts`

### Documentation Updates

- [ ] T080 [P] Update API documentation with suggestion endpoints in `docs/`
- [ ] T081 Run quickstart.md validation to verify implementation matches guide

### Contract Tests

- [ ] T082 [P] Contract test for suggestion API responses in `tests/contract/suggestionApi.contract.test.ts`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all scenarios
- **User Story 5 Scenarios (Phase 3)**: All depend on Foundational phase completion
  - Scenarios can proceed sequentially (1 → 2 → 3 → 4 → 5 → 6)
  - Some scenarios have internal parallelism (tests marked [P])
- **Polish (Phase 4)**: Depends on all scenarios being complete

### Scenario Dependencies

- **Scenario 1 (View Inventory)**: Can start after Foundational - No dependencies on other scenarios
- **Scenario 2 (Create add_to_shopping)**: Depends on Scenario 1 (needs inventory viewing)
- **Scenario 3 (Create create_item)**: Depends on Scenario 2 (extends createSuggestion)
- **Scenario 4 (View Suggestions)**: Can start after Foundational - Independent of Scenarios 1-3
- **Scenario 5 (Approve)**: Depends on Scenarios 2, 3, 4 (needs suggestions to exist)
- **Scenario 6 (Reject)**: Depends on Scenarios 2, 3, 4 (needs suggestions to exist)

### Within Each Scenario

- Repository layer before service layer
- Service layer before API routes
- Implementation before tests (but tests should be written to fail first)
- Unit tests can run in parallel (marked [P])

### Parallel Opportunities

- All Foundational tasks marked [P] can run in parallel (T006-T007, T009-T010, T012-T015, T016-T017)
- All unit tests within a scenario marked [P] can run in parallel
- Scenarios 1 and 4 can run in parallel after Foundational
- Scenarios 5 and 6 can run in parallel after Scenarios 2-4

---

## Task Summary

| Phase | Task Count | Parallel Tasks |
|-------|------------|----------------|
| Phase 1: Setup | 3 | 1 |
| Phase 2: Foundational | 14 | 10 |
| Phase 3: Scenario 1 | 6 | 2 |
| Phase 3: Scenario 2 | 8 | 4 |
| Phase 3: Scenario 3 | 4 | 2 |
| Phase 3: Scenario 4 | 10 | 4 |
| Phase 3: Scenario 5 | 17 | 6 |
| Phase 3: Scenario 6 | 10 | 4 |
| Phase 4: Polish | 8 | 4 |
| **Total** | **80** | **37** |

---

## Independent Test Criteria for User Story 5

To verify User Story 5 is complete and working independently:

1. **As a Suggester**:
   - Log in with suggester role credentials
   - View family inventory (see all items and quantities)
   - Create an add_to_shopping suggestion for an existing item
   - Create a create_item suggestion for a new item
   - View list of suggestions (see pending suggestions)

2. **As an Admin**:
   - Log in with admin role credentials
   - View list of pending suggestions with details
   - Approve an add_to_shopping suggestion → verify ShoppingListItem created
   - Approve a create_item suggestion → verify InventoryItem created
   - Reject a suggestion with notes → verify no action taken

3. **Edge Cases**:
   - Verify suggesters cannot approve/reject suggestions (403 Forbidden)
   - Verify admins cannot create suggestions (403 Forbidden)
   - Verify concurrent approval handling (409 Conflict)
   - Verify orphaned item handling (422 Unprocessable)

---

## Notes

- [P] tasks = different files, no dependencies
- [US5] label maps task to User Story 5 for traceability
- Each scenario should be independently completable and testable
- Verify tests fail before implementing
- Commit after each task or logical group
- Stop at any checkpoint to validate scenario independently
- 80% test coverage required for critical paths per constitution