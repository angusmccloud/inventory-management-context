# Tasks: Reference Data Management

**Input**: Design documents from `/specs/005-reference-data/`
**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅, data-model.md ✅, contracts/api-spec.yaml ✅, quickstart.md ✅

**Tests**: 80% coverage required for critical paths per constitution. Tests are included for all layers.

**Organization**: Tasks are organized by User Story 6 (Adults Manage Reference Data) with separate phases for Storage Location and Store management to enable independent implementation and testing.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[US6]**: User Story 6 - Adults Manage Reference Data (Priority: P3)
- Include exact file paths in descriptions

## Path Conventions

- **Single project**: `src/`, `tests/` at repository root
- Paths follow Next.js App Router conventions per plan.md

---

## Phase 1: Setup

**Purpose**: Verify project structure and dependencies are in place

- [X] T001 Create directory structure for reference data feature in `src/lib/reference-data/`
- [X] T002 Create directory structure for reference data components in `src/components/reference-data/`
- [X] T003 [P] Create directory structure for reference data tests in `tests/lib/reference-data/` and `tests/components/reference-data/`
- [X] T004 [P] Install use-debounce dependency for real-time validation: `npm install use-debounce`
- [X] T005 Verify existing dependencies: `@aws-sdk/client-dynamodb`, `@aws-sdk/lib-dynamodb`, `zod`, `uuid`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before User Story 6 scenarios can be implemented

**⚠️ CRITICAL**: No scenario work can begin until this phase is complete

### Zod Validation Schemas

- [X] T006 Create StorageLocationNameSchema with trim and length validation (1-50 chars) in `src/lib/reference-data/schemas.ts`
- [X] T007 [P] Create StorageLocationDescriptionSchema with trim and optional handling (0-200 chars) in `src/lib/reference-data/schemas.ts`
- [X] T008 Create StorageLocationSchema for full entity validation in `src/lib/reference-data/schemas.ts`
- [X] T009 [P] Create CreateStorageLocationSchema for create requests in `src/lib/reference-data/schemas.ts`
- [X] T010 [P] Create UpdateStorageLocationSchema with version field for optimistic locking in `src/lib/reference-data/schemas.ts`
- [X] T011 Create StoreNameSchema with trim and length validation (1-100 chars) in `src/lib/reference-data/schemas.ts`
- [X] T012 [P] Create StoreAddressSchema with trim and optional handling (0-200 chars) in `src/lib/reference-data/schemas.ts`
- [X] T013 Create StoreSchema for full entity validation in `src/lib/reference-data/schemas.ts`
- [X] T014 [P] Create CreateStoreSchema for create requests in `src/lib/reference-data/schemas.ts`
- [X] T015 [P] Create UpdateStoreSchema with version field for optimistic locking in `src/lib/reference-data/schemas.ts`
- [X] T016 [P] Create CheckNameRequestSchema for name availability checks in `src/lib/reference-data/schemas.ts`

### Custom Error Classes

- [X] T017 Create DuplicateNameError class in `src/lib/reference-data/errors.ts`
- [X] T018 [P] Create ReferenceExistsError class with references property in `src/lib/reference-data/errors.ts`
- [X] T019 [P] Create VersionConflictError class with currentVersion and currentEntity properties in `src/lib/reference-data/errors.ts`
- [X] T020 [P] Create NotFoundError class in `src/lib/reference-data/errors.ts`

### Repository Layer

- [X] T021 Create DynamoDB key helper functions (buildLocationKeys, buildStoreKeys) in `src/lib/reference-data/repository.ts`
- [X] T022 Implement createStorageLocation function with uniqueness check in `src/lib/reference-data/repository.ts`
- [X] T023 Implement listStorageLocations function with Query operation in `src/lib/reference-data/repository.ts`
- [X] T024 [P] Implement getStorageLocation function with GetItem operation in `src/lib/reference-data/repository.ts`
- [X] T025 Implement updateStorageLocation function with optimistic locking in `src/lib/reference-data/repository.ts`
- [X] T026 Implement deleteStorageLocation function with reference check in `src/lib/reference-data/repository.ts`
- [X] T027 [P] Implement checkStorageLocationNameExists function for uniqueness validation in `src/lib/reference-data/repository.ts`
- [X] T028 [P] Implement hasLocationReferences function for deletion check in `src/lib/reference-data/repository.ts`
- [X] T029 [P] Implement getLocationReferenceCount function for error details in `src/lib/reference-data/repository.ts`
- [X] T030 Implement createStore function with uniqueness check in `src/lib/reference-data/repository.ts`
- [X] T031 Implement listStores function with Query operation in `src/lib/reference-data/repository.ts`
- [X] T032 [P] Implement getStore function with GetItem operation in `src/lib/reference-data/repository.ts`
- [X] T033 Implement updateStore function with optimistic locking in `src/lib/reference-data/repository.ts`
- [X] T034 Implement deleteStore function with reference check in `src/lib/reference-data/repository.ts`
- [X] T035 [P] Implement checkStoreNameExists function for uniqueness validation in `src/lib/reference-data/repository.ts`
- [X] T036 [P] Implement hasStoreReferences function for deletion check (InventoryItems + ShoppingListItems) in `src/lib/reference-data/repository.ts`
- [X] T037 [P] Implement getStoreReferenceCount function for error details in `src/lib/reference-data/repository.ts`

### Unit Tests for Foundational Layer

- [X] T038 [P] Unit tests for Zod schemas validation in `tests/lib/reference-data/schemas.test.ts`
- [X] T039 [P] Unit tests for DynamoDB key helper functions in `tests/lib/reference-data/repository.test.ts`
- [X] T040 [P] Unit tests for error classes in `tests/lib/reference-data/errors.test.ts`

**Checkpoint**: Foundation ready - User Story 6 scenario implementation can now begin

---

## Phase 3: User Story 6 - Storage Location Management (Priority: P3)

**Goal**: Enable adults to create, read, update, and delete storage locations with case-insensitive uniqueness, optimistic locking, and reference checking.

**Independent Test**: Can be tested by creating storage locations, verifying uniqueness enforcement, updating with version conflicts, and attempting deletion of referenced locations.

### Service Layer - Storage Locations

- [X] T041 [US6] Implement createStorageLocation service function with role validation in `src/lib/reference-data/storage-location.service.ts`
- [X] T042 [US6] Implement listStorageLocations service function in `src/lib/reference-data/storage-location.service.ts`
- [X] T043 [US6] Implement getStorageLocation service function in `src/lib/reference-data/storage-location.service.ts`
- [X] T044 [US6] Implement updateStorageLocation service function with optimistic locking in `src/lib/reference-data/storage-location.service.ts`
- [X] T045 [US6] Implement deleteStorageLocation service function with reference check in `src/lib/reference-data/storage-location.service.ts`
- [X] T046 [US6] Implement checkStorageLocationName service function for real-time validation in `src/lib/reference-data/storage-location.service.ts`

### API Routes - Storage Locations

- [X] T047 [US6] Implement GET handler for `/families/{familyId}/locations` (list) in `src/handlers/reference-data/listStorageLocations.ts`
- [X] T048 [US6] Implement POST handler for `/families/{familyId}/locations` (create) in `src/handlers/reference-data/createStorageLocation.ts`
- [X] T049 [US6] Implement GET handler for `/families/{familyId}/locations/{locationId}` in `src/handlers/reference-data/getStorageLocation.ts`
- [X] T050 [US6] Implement PUT handler for `/families/{familyId}/locations/{locationId}` in `src/handlers/reference-data/updateStorageLocation.ts`
- [X] T051 [US6] Implement DELETE handler for `/families/{familyId}/locations/{locationId}` in `src/handlers/reference-data/deleteStorageLocation.ts`
- [X] T052 [US6] Implement POST handler for `/families/{familyId}/locations/check-name` in `src/handlers/reference-data/checkStorageLocationName.ts`

### Unit Tests - Storage Location Service

- [X] T053 [P] [US6] Unit test for createStorageLocation service (success case) in `tests/lib/reference-data/storage-location.service.test.ts`
- [X] ~~T054 [P] [US6] Unit test for createStorageLocation service (duplicate name error) - REMOVED: No longer checking for duplicates~~
- [X] T055 [P] [US6] Unit test for createStorageLocation service (whitespace trimming) in `tests/lib/reference-data/storage-location.service.test.ts`
- [X] T056 [P] [US6] Unit test for listStorageLocations service in `tests/lib/reference-data/storage-location.service.test.ts`
- [X] T057 [P] [US6] Unit test for getStorageLocation service (success and not found) in `tests/lib/reference-data/storage-location.service.test.ts`
- [X] T058 [P] [US6] Unit test for updateStorageLocation service (success case) in `tests/lib/reference-data/storage-location.service.test.ts`
- [X] T059 [P] [US6] Unit test for updateStorageLocation service (version conflict) in `tests/lib/reference-data/storage-location.service.test.ts`
- [X] ~~T060 [P] [US6] Unit test for updateStorageLocation service (duplicate name on rename) - REMOVED: No longer checking for duplicates~~
- [X] T061 [P] [US6] Unit test for deleteStorageLocation service (success case) in `tests/lib/reference-data/storage-location.service.test.ts`
- [X] T062 [P] [US6] Unit test for deleteStorageLocation service (reference exists error) in `tests/lib/reference-data/storage-location.service.test.ts`
- [X] T063 [P] [US6] Unit test for checkStorageLocationName service in `tests/lib/reference-data/storage-location.service.test.ts`

### Integration Tests - Storage Location API

- [ ] T064 [US6] Integration test for GET /families/{familyId}/locations in `tests/integration/api/locations.test.ts`
- [ ] T065 [US6] Integration test for POST /families/{familyId}/locations (success) in `tests/integration/api/locations.test.ts`
- [ ] ~~T066 [US6] Integration test for POST /families/{familyId}/locations (409 duplicate) - REMOVED: No longer checking for duplicates~~
- [ ] T067 [US6] Integration test for GET /families/{familyId}/locations/{locationId} in `tests/integration/api/locations.test.ts`
- [ ] T068 [US6] Integration test for PUT /families/{familyId}/locations/{locationId} (success) in `tests/integration/api/locations.test.ts`
- [ ] T069 [US6] Integration test for PUT /families/{familyId}/locations/{locationId} (409 version conflict) in `tests/integration/api/locations.test.ts`
- [ ] T070 [US6] Integration test for DELETE /families/{familyId}/locations/{locationId} (success) in `tests/integration/api/locations.test.ts`
- [ ] T071 [US6] Integration test for DELETE /families/{familyId}/locations/{locationId} (409 reference exists) in `tests/integration/api/locations.test.ts`
- [ ] T072 [US6] Integration test for POST /families/{familyId}/locations/check-name in `tests/integration/api/locations.test.ts`

**Checkpoint**: Storage Location Management complete - can be tested independently

---

## Phase 4: User Story 6 - Store Management (Priority: P3)

**Goal**: Enable adults to create, read, update, and delete stores with case-insensitive uniqueness, optimistic locking, and reference checking (both InventoryItems and ShoppingListItems).

**Independent Test**: Can be tested by creating stores, verifying uniqueness enforcement, updating with version conflicts, and attempting deletion of referenced stores.

### Service Layer - Stores

- [X] T073 [US6] Implement createStore service function with role validation in `src/lib/reference-data/store.service.ts`
- [X] T074 [US6] Implement listStores service function in `src/lib/reference-data/store.service.ts`
- [X] T075 [US6] Implement getStore service function in `src/lib/reference-data/store.service.ts`
- [X] T076 [US6] Implement updateStore service function with optimistic locking in `src/lib/reference-data/store.service.ts`
- [X] T077 [US6] Implement deleteStore service function with reference check in `src/lib/reference-data/store.service.ts`
- [X] T078 [US6] Implement checkStoreName service function for real-time validation in `src/lib/reference-data/store.service.ts`

### API Routes - Stores

- [X] T079 [US6] Implement GET handler for `/families/{familyId}/stores` (list) in `src/handlers/reference-data/listStores.ts`
- [X] T080 [US6] Implement POST handler for `/families/{familyId}/stores` (create) in `src/handlers/reference-data/createStore.ts`
- [X] T081 [US6] Implement GET handler for `/families/{familyId}/stores/{storeId}` in `src/handlers/reference-data/getStore.ts`
- [X] T082 [US6] Implement PUT handler for `/families/{familyId}/stores/{storeId}` in `src/handlers/reference-data/updateStore.ts`
- [X] T083 [US6] Implement DELETE handler for `/families/{familyId}/stores/{storeId}` in `src/handlers/reference-data/deleteStore.ts`
- [X] T084 [US6] Implement POST handler for `/families/{familyId}/stores/check-name` in `src/handlers/reference-data/checkStoreName.ts`

### Unit Tests - Store Service

- [X] T085 [P] [US6] Unit test for createStore service (success case) in `tests/lib/reference-data/store.service.test.ts`
- [X] ~~T086 [P] [US6] Unit test for createStore service (duplicate name error) - REMOVED: No longer checking for duplicates~~
- [X] T087 [P] [US6] Unit test for createStore service (whitespace trimming) in `tests/lib/reference-data/store.service.test.ts`
- [X] T088 [P] [US6] Unit test for listStores service in `tests/lib/reference-data/store.service.test.ts`
- [X] T089 [P] [US6] Unit test for getStore service (success and not found) in `tests/lib/reference-data/store.service.test.ts`
- [X] T090 [P] [US6] Unit test for updateStore service (success case) in `tests/lib/reference-data/store.service.test.ts`
- [X] T091 [P] [US6] Unit test for updateStore service (version conflict) in `tests/lib/reference-data/store.service.test.ts`
- [X] ~~T092 [P] [US6] Unit test for updateStore service (duplicate name on rename) - REMOVED: No longer checking for duplicates~~
- [X] T093 [P] [US6] Unit test for deleteStore service (success case) in `tests/lib/reference-data/store.service.test.ts`
- [X] T094 [P] [US6] Unit test for deleteStore service (reference exists - inventory items) in `tests/lib/reference-data/store.service.test.ts`
- [X] T095 [P] [US6] Unit test for deleteStore service (reference exists - shopping list items) in `tests/lib/reference-data/store.service.test.ts`
- [X] T096 [P] [US6] Unit test for checkStoreName service in `tests/lib/reference-data/store.service.test.ts`

### Integration Tests - Store API

- [ ] T097 [US6] Integration test for GET /families/{familyId}/stores in `tests/integration/api/stores.test.ts`
- [ ] T098 [US6] Integration test for POST /families/{familyId}/stores (success) in `tests/integration/api/stores.test.ts`
- [ ] ~~T099 [US6] Integration test for POST /families/{familyId}/stores (409 duplicate) - REMOVED: No longer checking for duplicates~~
- [ ] T100 [US6] Integration test for GET /families/{familyId}/stores/{storeId} in `tests/integration/api/stores.test.ts`
- [ ] T101 [US6] Integration test for PUT /families/{familyId}/stores/{storeId} (success) in `tests/integration/api/stores.test.ts`
- [ ] T102 [US6] Integration test for PUT /families/{familyId}/stores/{storeId} (409 version conflict) in `tests/integration/api/stores.test.ts`
- [ ] T103 [US6] Integration test for DELETE /families/{familyId}/stores/{storeId} (success) in `tests/integration/api/stores.test.ts`
- [ ] T104 [US6] Integration test for DELETE /families/{familyId}/stores/{storeId} (409 reference exists) in `tests/integration/api/stores.test.ts`
- [ ] T105 [US6] Integration test for POST /families/{familyId}/stores/check-name in `tests/integration/api/stores.test.ts`

**Checkpoint**: Store Management complete - can be tested independently

---

## Phase 5: User Story 6 - UI Components (Priority: P3)

**Goal**: Build React components for managing storage locations and stores with real-time validation, empty states, and delete confirmation dialogs.

**Independent Test**: Can be tested by rendering components, verifying form validation, testing empty states, and confirming delete dialogs work correctly.

### Shared UI Components

- [X] T106 [US6] Create ReferenceDataEmptyState component with type prop (locations/stores) in `src/components/reference-data/ReferenceDataEmptyState.tsx`
- [X] T107 [US6] Create DeleteConfirmDialog component with reference display in `src/components/reference-data/DeleteConfirmDialog.tsx`

### Storage Location UI Components

- [X] T108 [US6] Create useStorageLocationNameValidation hook with 300ms debounce in `src/hooks/useReferenceDataValidation.ts`
- [X] T109 [US6] Create StorageLocationForm component with real-time validation in `src/components/reference-data/StorageLocationForm.tsx`
- [X] T110 [US6] Create StorageLocationList component with empty state handling in `src/components/reference-data/StorageLocationList.tsx`
- [X] T111 [US6] Create StorageLocationItem component for list display in `src/components/reference-data/StorageLocationItem.tsx`

### Store UI Components

- [X] T112 [US6] Create useStoreNameValidation hook with 300ms debounce in `src/hooks/useReferenceDataValidation.ts`
- [X] T113 [US6] Create StoreForm component with real-time validation in `src/components/reference-data/StoreForm.tsx`
- [X] T114 [US6] Create StoreList component with empty state handling in `src/components/reference-data/StoreList.tsx`
- [X] T115 [US6] Create StoreItem component for list display in `src/components/reference-data/StoreItem.tsx`

### Component Tests

- [X] T116 [P] [US6] Component test for ReferenceDataEmptyState in `tests/components/reference-data/ReferenceDataEmptyState.test.tsx`
- [X] T117 [P] [US6] Component test for DeleteConfirmDialog in `tests/components/reference-data/DeleteConfirmDialog.test.tsx`
- [X] T118 [P] [US6] Component test for StorageLocationForm (validation, trimming) in `tests/components/reference-data/StorageLocationForm.test.tsx`
- [X] ~~T119 [P] [US6] Component test for StorageLocationForm (duplicate name error from API) - REMOVED: No longer checking for duplicates~~
- [ ] T120 [P] [US6] Component test for StorageLocationList (with items) in `tests/components/reference-data/StorageLocationList.test.tsx`
- [ ] T121 [P] [US6] Component test for StorageLocationList (empty state) in `tests/components/reference-data/StorageLocationList.test.tsx`
- [X] T122 [P] [US6] Component test for StoreForm (validation, trimming) in `tests/components/reference-data/StoreForm.test.tsx`
- [X] ~~T123 [P] [US6] Component test for StoreForm (duplicate name error from API) - REMOVED: No longer checking for duplicates~~
- [ ] T124 [P] [US6] Component test for StoreList (with items) in `tests/components/reference-data/StoreList.test.tsx`
- [ ] T125 [P] [US6] Component test for StoreList (empty state) in `tests/components/reference-data/StoreList.test.tsx`
- [ ] T126 [P] [US6] Component test for useStorageLocationNameValidation hook in `tests/components/reference-data/hooks/useStorageLocationNameValidation.test.ts`
- [ ] T127 [P] [US6] Component test for useStoreNameValidation hook in `tests/components/reference-data/hooks/useStoreNameValidation.test.ts`

**Checkpoint**: UI Components complete - full feature can be tested end-to-end

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple scenarios

### Error Handling Refinement

- [X] T128 [P] Ensure consistent error response format across all endpoints in `src/app/api/families/[familyId]/locations/` and `src/app/api/families/[familyId]/stores/`
- [X] T129 [P] Add request logging for reference data operations in service layer

### Documentation Updates

- [X] T130 [P] Update API documentation with reference data endpoints in `docs/`
- [X] T131 Run quickstart.md validation to verify implementation matches guide

### UI Integration

- [X] T134 Create reference data settings page in `app/dashboard/settings/reference-data/page.tsx`
- [X] T135 Add Settings navigation link to dashboard layout (admin-only)
- [X] T136 [P] Integrate storage location dropdown in AddItemForm component in `components/inventory/AddItemForm.tsx`
- [X] T137 [P] Integrate store dropdown in AddItemForm component in `components/inventory/AddItemForm.tsx`
- [X] T138 [P] Integrate storage location dropdown in EditItemForm component in `components/inventory/EditItemForm.tsx`
- [X] T139 [P] Integrate store dropdown in EditItemForm component in `components/inventory/EditItemForm.tsx`
- [X] T140 [P] Integrate store dropdown in shopping list AddItemForm component in `components/shopping-list/AddItemForm.tsx`
- [X] T141 [P] Integrate store dropdown in shopping list EditShoppingListItemForm component in `components/shopping-list/EditShoppingListItemForm.tsx`
- [X] T142 [P] Pass familyId prop to shopping list forms in `components/shopping-list/ShoppingList.tsx`

### Coverage Verification

- [ ] T132 Run test coverage report and verify 80% coverage for critical paths
- [ ] T133 [P] Add any missing edge case tests identified by coverage report

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all scenarios
- **Storage Location Management (Phase 3)**: Depends on Foundational phase completion
- **Store Management (Phase 4)**: Depends on Foundational phase completion
  - Can run in parallel with Phase 3 if team capacity allows
- **UI Components (Phase 5)**: Depends on Phases 3 and 4 (needs API endpoints)
- **Polish (Phase 6)**: Depends on all previous phases being complete

### Within Each Phase

- Repository layer before service layer
- Service layer before API routes
- API routes before UI components
- Implementation before tests (but tests should be written to fail first)
- Unit tests can run in parallel (marked [P])

### Parallel Opportunities

- All Setup tasks marked [P] can run in parallel (T003-T004)
- All Foundational schema tasks marked [P] can run in parallel (T007, T009-T010, T012, T014-T016)
- All Foundational error class tasks marked [P] can run in parallel (T018-T020)
- All Foundational repository tasks marked [P] can run in parallel (T024, T027-T029, T032, T35-T037)
- Phases 3 and 4 can run in parallel after Foundational
- All unit tests within a phase marked [P] can run in parallel
- All component tests marked [P] can run in parallel

---

## Task Summary

| Phase | Task Count | Parallel Tasks |
|-------|------------|----------------|
| Phase 1: Setup | 5 | 2 |
| Phase 2: Foundational | 35 | 20 |
| Phase 3: Storage Location Management | 31 | 11 |
| Phase 4: Store Management | 33 | 12 |
| Phase 5: UI Components | 22 | 12 |
| Phase 6: Polish | 6 | 3 |
| **Total** | **132** | **60** |

---

## Independent Test Criteria for User Story 6

To verify User Story 6 is complete and working independently:

1. **Storage Location Management**:
   - Create a storage location with name and description
   - Verify case-insensitive uniqueness (try creating "Pantry" when "pantry" exists)
   - Verify whitespace trimming (create "  Kitchen  " → stored as "Kitchen")
   - Update a storage location name and description
   - Verify optimistic locking (concurrent edit returns 409 with current state)
   - Delete a storage location with no references
   - Verify deletion prevention when referenced by inventory items (409 with reference count)
   - Verify real-time name validation during form entry

2. **Store Management**:
   - Create a store with name and address
   - Verify case-insensitive uniqueness (try creating "Costco" when "COSTCO" exists)
   - Verify whitespace trimming (create "  Whole Foods  " → stored as "Whole Foods")
   - Update a store name and address
   - Verify optimistic locking (concurrent edit returns 409 with current state)
   - Delete a store with no references
   - Verify deletion prevention when referenced by inventory items (409 with reference count)
   - Verify deletion prevention when referenced by shopping list items (409 with reference count)
   - Verify real-time name validation during form entry

3. **UI Components**:
   - Verify empty state displays when no locations/stores exist
   - Verify list displays all locations/stores
   - Verify form validation shows errors for invalid input
   - Verify form shows duplicate name error from API
   - Verify delete confirmation dialog shows reference count when deletion blocked

4. **Edge Cases**:
   - Verify only adults can create/edit/delete reference data (403 Forbidden for suggesters)
   - Verify 404 returned for non-existent location/store
   - Verify 400 returned for invalid request body

---

## Notes

- [P] tasks = different files, no dependencies
- [US6] label maps task to User Story 6 for traceability
- Each phase should be independently completable and testable
- Verify tests fail before implementing
- Commit after each task or logical group
- Stop at any checkpoint to validate phase independently
- 80% test coverage required for critical paths per constitution
- This feature has only one user story (US6) but is split into phases for manageability