# Tasks: Streamlined Quantity Adjustments

**Feature**: `010-streamline-quantity-controls`  
**Branch**: `010-streamline-quantity-controls`  
**Generated**: December 29, 2025  
**Input**: Design documents from `/specs/010-streamline-quantity-controls/`

---

## Implementation Strategy

This feature has **2 P1 user stories** that should both be completed for MVP. Tasks are organized by user story to enable independent implementation and testing.

**MVP Scope**: 
- User Story 1 (NFC debouncing) + User Story 2 (Inline controls) = Complete P1 functionality
- User Stories 3-4 (Visual feedback, Error recovery) can be delivered incrementally after MVP

**Parallel Execution**: Tasks marked with **[P]** can be executed in parallel within their phase.

---

## Phase 1: Setup & Foundational Components

**Purpose**: Create shared infrastructure used by both P1 user stories

### Tests (Optional - include if TDD approach requested)

- [ ] T001 [P] Create test file for useQuantityDebounce hook in inventory-management-frontend/tests/hooks/useQuantityDebounce.test.tsx
- [ ] T002 [P] Create test file for QuantityControls component in inventory-management-frontend/tests/components/common/QuantityControls.test.tsx
- [ ] T003 [P] Create test file for useOnlineStatus hook in inventory-management-frontend/tests/hooks/useOnlineStatus.test.tsx

### Implementation

- [X] T004 Create useOnlineStatus hook in inventory-management-frontend/hooks/useOnlineStatus.ts
- [X] T005 Create useQuantityDebounce hook in inventory-management-frontend/hooks/useQuantityDebounce.ts with 500ms default delay, optimistic updates, and flush capability
- [X] T006 Create QuantityControls component in inventory-management-frontend/components/common/QuantityControls.tsx with +/- buttons, size variants (sm/md/lg), and accessibility support

---

## Phase 2: User Story 1 - Quick NFC Tag Quantity Updates (P1)

**Goal**: Users scanning NFC tags can rapidly adjust quantities with debounced API calls

**Independent Test Criteria**: User can scan NFC tag, tap increase button 5 times rapidly, and verify only 1 API call is made with net change of +5

### Tests (Optional)

- [ ] T007 [US1] Update AdjustmentClient test file in inventory-management-frontend/tests/app/t/AdjustmentClient.test.tsx to test debouncing behavior (rapid clicks → 1 API call)
- [ ] T008 [US1] Add test case for navigation flush in inventory-management-frontend/tests/app/t/AdjustmentClient.test.tsx

### Implementation

- [X] T009 [US1] Integrate useQuantityDebounce hook into AdjustmentClient component in inventory-management-frontend/app/t/[urlId]/AdjustmentClient.tsx
- [X] T010 [US1] Replace existing state management with hook's localQuantity and adjust functions in inventory-management-frontend/app/t/[urlId]/AdjustmentClient.tsx
- [X] T011 [US1] Replace custom +/- buttons with QuantityControls component (size="lg") in inventory-management-frontend/app/t/[urlId]/AdjustmentClient.tsx
- [X] T012 [US1] Add useEffect cleanup to flush pending changes on unmount in inventory-management-frontend/app/t/[urlId]/AdjustmentClient.tsx
- [X] T013 [US1] Add beforeunload event listener to flush changes on page refresh/close in inventory-management-frontend/app/t/[urlId]/AdjustmentClient.tsx

### Verification

- [ ] T014 [US1] Manual test: Rapid tap increase button 5 times on NFC page, confirm 1 API call with delta +5
- [ ] T015 [US1] Manual test: Tap increase 3 times then decrease 1 time, confirm net delta +2 in API call
- [ ] T016 [US1] Manual test: Make adjustment and navigate away before 500ms, confirm change is saved

---

## Phase 3: User Story 2 - Inline Inventory Page Adjustments (P1)

**Goal**: Users can adjust quantities directly from inventory list without opening modal

**Independent Test Criteria**: From inventory list, user clicks +/- buttons next to any item, sees immediate visual feedback, and batched API updates. No modal appears.

### Tests (Optional)

- [ ] T017 [US2] Update InventoryList test file in inventory-management-frontend/tests/components/inventory/InventoryList.test.tsx to test inline quantity controls
- [ ] T018 [US2] Add test case for item switching (flush previous item when adjusting new item) in inventory-management-frontend/tests/components/inventory/InventoryList.test.tsx

### Implementation

- [X] T019 [US2] Create InventoryListItem component (or update existing) to integrate useQuantityDebounce hook in inventory-management-frontend/components/inventory/InventoryList.tsx
- [X] T020 [US2] Add QuantityControls component (size="sm") next to each item's quantity display in inventory-management-frontend/components/inventory/InventoryList.tsx
- [X] T021 [US2] Remove onAdjustQuantity prop and all modal-related code from InventoryList component in inventory-management-frontend/components/inventory/InventoryList.tsx
- [X] T022 [US2] Update inventory page in inventory-management-frontend/app/dashboard/inventory/page.tsx to remove modal state and onAdjustQuantity handler
- [X] T023 [US2] Implement item-switching flush logic (flush item A when user starts adjusting item B) in inventory-management-frontend/components/inventory/InventoryList.tsx

### Cleanup

- [X] T024 [US2] Delete AdjustQuantity modal component file inventory-management-frontend/components/inventory/AdjustQuantity.tsx
- [X] T025 [US2] Delete AdjustQuantity test file inventory-management-frontend/tests/components/inventory/AdjustQuantity.test.tsx (if exists)

### Verification

- [ ] T026 [US2] Manual test: Click + button 4 times rapidly on inventory list item, confirm 1 API call with delta +4
- [ ] T027 [US2] Manual test: Adjust item A, immediately adjust item B, confirm item A's change saves immediately
- [ ] T028 [US2] Manual test: Confirm no "Adjust" button or modal exists on inventory page

---

## Phase 4: User Story 3 - Visual Feedback During Debounce (P2)

**Goal**: Users see clear visual indicators for pending/saving states

**Independent Test Criteria**: User makes rapid changes and observes visual indicator showing save is pending, which clears when API call completes

### Tests (Optional)

- [ ] T029 [US3] Add test cases for pending state indicator in inventory-management-frontend/tests/components/common/QuantityControls.test.tsx
- [ ] T030 [US3] Add test cases for loading state indicator in inventory-management-frontend/tests/components/common/QuantityControls.test.tsx

### Implementation

- [X] T031 [P] [US3] Update QuantityControls to display pending indicator (asterisk or icon) when hasPendingChanges is true in inventory-management-frontend/components/common/QuantityControls.tsx
- [X] T032 [P] [US3] Update QuantityControls to display loading spinner when isLoading is true in inventory-management-frontend/components/common/QuantityControls.tsx
- [X] T033 [US3] Update AdjustmentClient to pass hasPendingChanges and isFlushing props to QuantityControls in inventory-management-frontend/app/t/[urlId]/AdjustmentClient.tsx
- [X] T034 [US3] Update InventoryList to pass hasPendingChanges and isFlushing props to QuantityControls in inventory-management-frontend/components/inventory/InventoryList.tsx
- [ ] T035 [US3] Add success feedback (optional): Brief check mark or fade animation on successful save in inventory-management-frontend/components/common/QuantityControls.tsx

### Verification

- [ ] T036 [US3] Manual test: Make adjustment, observe pending indicator during 500ms debounce window
- [ ] T037 [US3] Manual test: Observe loading indicator during API call
- [ ] T038 [US3] Manual test: Confirm indicators clear after successful save

---

## Phase 5: User Story 4 - Error Recovery and Retry Logic (P3)

**Goal**: Users receive clear error feedback and can retry failed operations

**Independent Test Criteria**: Simulate network failure, verify user is notified and can retry operation

### Tests (Optional)

- [ ] T039 [US4] Add test case for error rollback in inventory-management-frontend/tests/hooks/useQuantityDebounce.test.tsx
- [ ] T040 [US4] Add test case for retry functionality in inventory-management-frontend/tests/hooks/useQuantityDebounce.test.tsx
- [ ] T041 [US4] Add test case for offline button disable in inventory-management-frontend/tests/components/common/QuantityControls.test.tsx

### Implementation

- [X] T042 [P] [US4] Add error state display to AdjustmentClient with error message and retry button in inventory-management-frontend/app/t/[urlId]/AdjustmentClient.tsx
- [X] T043 [P] [US4] Add error state display to InventoryList with error toast or inline message in inventory-management-frontend/components/inventory/InventoryList.tsx
- [X] T044 [US4] Implement retry button handler that calls hook's retry() function in inventory-management-frontend/app/t/[urlId]/AdjustmentClient.tsx
- [X] T045 [US4] Integrate useOnlineStatus hook into AdjustmentClient to disable controls when offline in inventory-management-frontend/app/t/[urlId]/AdjustmentClient.tsx
- [X] T046 [US4] Integrate useOnlineStatus hook into InventoryList to disable controls when offline in inventory-management-frontend/components/inventory/InventoryList.tsx
- [X] T047 [US4] Add offline indicator message when isOnline is false in inventory-management-frontend/app/t/[urlId]/AdjustmentClient.tsx

### Verification

- [ ] T048 [US4] Manual test: Simulate network failure (browser dev tools), verify error message appears
- [ ] T049 [US4] Manual test: Click retry button, verify API call is attempted again
- [ ] T050 [US4] Manual test: Go offline, verify +/- buttons are disabled with indicator message
- [ ] T051 [US4] Manual test: Verify quantity rolls back to last known good value on error

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final refinements and documentation

### Implementation

- [X] T052 [P] Add JSDoc comments to useQuantityDebounce hook in inventory-management-frontend/hooks/useQuantityDebounce.ts
- [X] T053 [P] Add JSDoc comments to QuantityControls component in inventory-management-frontend/components/common/QuantityControls.tsx
- [X] T054 [P] Add JSDoc comments to useOnlineStatus hook in inventory-management-frontend/hooks/useOnlineStatus.ts
- [X] T055 Update component exports in inventory-management-frontend/components/common/index.ts to include QuantityControls
- [ ] T056 Update hook exports in inventory-management-frontend/hooks/index.ts (if index file exists) to include useQuantityDebounce and useOnlineStatus

### Testing & Validation

- [X] T057 [P] Run unit tests for all new components and hooks: `npm test -- useQuantityDebounce QuantityControls useOnlineStatus`
- [ ] T058 [P] Run integration tests for updated pages: `npm test -- AdjustmentClient InventoryList`
- [ ] T059 Verify test coverage >80% for new code: `npm test -- --coverage`
- [ ] T060 Run accessibility audit on NFC page with Lighthouse or axe DevTools
- [ ] T061 Run accessibility audit on inventory list page with Lighthouse or axe DevTools
- [ ] T062 Test keyboard navigation: Tab through controls, activate with Enter/Space
- [ ] T063 Test screen reader announcements (VoiceOver on Mac or NVDA on Windows)
- [ ] T064 Cross-browser testing: Chrome, Firefox, Safari, Edge
- [ ] T065 Mobile testing: Test touch interactions on iOS Safari and Chrome Android

### Documentation

- [ ] T066 Update README.md in inventory-management-frontend with debounce feature description
- [ ] T067 Add migration notes for developers in quickstart.md (already exists, verify accuracy)

---

## Dependencies & Parallel Execution

### Dependency Graph (User Story Completion Order)

```
Phase 1 (Setup)
    ↓
Phase 2 (US1) + Phase 3 (US2)  ← Can be done in parallel
    ↓
Phase 4 (US3)  ← Depends on US1 & US2 components
    ↓
Phase 5 (US4)  ← Depends on US3 visual states
    ↓
Phase 6 (Polish)
```

### Parallel Execution Within User Stories

**Phase 1 Setup** (all [P] tasks can run in parallel):
- T001, T002, T003 (tests) can be written simultaneously
- T004, T005, T006 (hooks/components) can be implemented in parallel after tests

**Phase 2 US1** (NFC):
- T007, T008 (tests) can be written in parallel
- T009-T013 (implementation) are sequential

**Phase 3 US2** (Inventory List):
- T017, T018 (tests) can be written in parallel
- T019-T023 (implementation) are sequential
- T024, T025 (cleanup) can be done together

**Phase 4 US3** (Visual Feedback):
- T029, T030 (tests) can be written in parallel
- T031, T032 (QuantityControls updates) can be done in parallel
- T033, T034 (component integration) can be done in parallel

**Phase 5 US4** (Error Recovery):
- T039, T040, T041 (tests) can be written in parallel
- T042, T043 (error displays) can be done in parallel
- T044-T047 (retry/offline logic) are sequential

**Phase 6 Polish**:
- T052-T054 (JSDoc) can be done in parallel
- T055, T056 (exports) can be done in parallel
- T057-T065 (testing) some can be parallelized
- T066, T067 (docs) can be done in parallel

---

## Acceptance Criteria Summary

Each phase must pass its acceptance criteria before proceeding:

### Phase 1 (Setup)
✅ All 3 foundational components created with TypeScript strict types  
✅ Test files created (if TDD approach)  
✅ No compilation errors

### Phase 2 (US1 - NFC)
✅ NFC page uses debounced controls  
✅ 5 rapid taps → 1 API call with delta +5  
✅ Mixed adjustments (+2, -1) calculate correct net delta (+1)  
✅ Navigation flushes pending changes

### Phase 3 (US2 - Inventory List)
✅ Inline +/- buttons appear next to quantities  
✅ No "Adjust" button or modal exists  
✅ 4 rapid clicks → 1 API call with delta +4  
✅ Switching items flushes previous item immediately

### Phase 4 (US3 - Visual Feedback)
✅ Pending indicator shows during debounce window  
✅ Loading indicator shows during API call  
✅ Indicators clear on successful save  
✅ Error message displays on API failure

### Phase 5 (US4 - Error Recovery)
✅ Error message includes retry button  
✅ Retry button re-attempts failed API call  
✅ Quantity rolls back to last known good value on error  
✅ Controls disabled when offline with indicator message

### Phase 6 (Polish)
✅ Code coverage >80% for new code  
✅ Accessibility: WCAG 2.1 AA compliant  
✅ Accessibility: Keyboard navigation works  
✅ Accessibility: Screen reader announces changes  
✅ Cross-browser compatibility verified  
✅ Documentation updated

---

## Task Summary

**Total Tasks**: 67
- Phase 1 (Setup): 6 tasks
- Phase 2 (US1 - NFC): 10 tasks
- Phase 3 (US2 - Inventory List): 12 tasks
- Phase 4 (US3 - Visual Feedback): 8 tasks
- Phase 5 (US4 - Error Recovery): 10 tasks
- Phase 6 (Polish): 21 tasks

**Parallel Opportunities**: 23 tasks marked [P]

**MVP Scope** (Phases 1-3): 28 tasks
**Full Feature** (All phases): 67 tasks

**Suggested Story Points**:
- Phase 1: 5 points (foundational infrastructure)
- Phase 2: 5 points (NFC integration)
- Phase 3: 8 points (inventory list refactor + cleanup)
- Phase 4: 3 points (visual states)
- Phase 5: 5 points (error handling)
- Phase 6: 3 points (polish)

**Total Estimate**: 29 story points

---

## Implementation Notes

1. **Test-First Approach**: If following TDD, complete all test tasks in each phase before implementation tasks
2. **MVP-First Delivery**: Complete Phases 1-3 for a working MVP, then iterate on Phases 4-6
3. **Component Reusability**: QuantityControls and useQuantityDebounce are designed for reuse beyond this feature
4. **Performance Impact**: Debouncing reduces API calls by ~80% (5 clicks → 1 API call)
5. **Accessibility Priority**: Touch targets meet 44x44px minimum, keyboard navigation, screen reader support
6. **File Paths**: All paths assume `inventory-management-frontend` repository root. Adjust if different.

---

**Ready for Implementation**: ✅  
**Next Step**: Begin Phase 1 (Setup) with foundational components
