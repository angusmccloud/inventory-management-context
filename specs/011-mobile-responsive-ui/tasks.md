# Tasks: Mobile Responsive UI Improvements

**Input**: Design documents from `/specs/011-mobile-responsive-ui/`  
**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅, data-model.md ✅, contracts/ ✅

**Tests**: Not explicitly requested in specification - focusing on implementation tasks only

**Organization**: Tasks are grouped by user story (P1, P2, P3) to enable independent implementation and testing of each responsive feature.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2, US3, US4, US5)
- Include exact file paths in descriptions

## Path Conventions

- **Frontend**: `inventory-management-frontend/` repository
- Components: `components/common/`, `components/inventory/`, etc.
- Pages: `app/dashboard/inventory/`, `app/dashboard/shopping-list/`, etc.

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Verify Tailwind configuration and common component library structure

- [X] T001 Verify Tailwind CSS configuration includes default breakpoints (sm: 640px, md: 768px, lg: 1024px) in inventory-management-frontend/tailwind.config.js
- [X] T002 [P] Review common component library structure in inventory-management-frontend/components/common/ and document existing components
- [X] T003 [P] Create responsive testing utilities in inventory-management-frontend/tests/utils/responsive.ts for viewport mocking

---

## Phase 2: Foundational (Component Library Enhancements)

**Purpose**: Add responsive capabilities to common components that ALL user stories depend on

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T004 [P] Enhance Button component with responsive touch target sizing (min-h-[44px] min-w-[44px] md:min-h-[36px]) in inventory-management-frontend/components/common/Button/Button.tsx
- [X] T005 [P] Add optional responsiveText prop to Button component for conditional text rendering in inventory-management-frontend/components/common/Button/Button.tsx
- [X] T006 [P] Enhance PageHeader component with mobileVertical prop for vertical layout stacking in inventory-management-frontend/components/common/PageHeader/PageHeader.tsx
- [X] T007 [P] Update PageHeader secondaryActions container to support responsive flex direction (flex-col md:flex-row) in inventory-management-frontend/components/common/PageHeader/PageHeader.tsx
- [X] T008 Enhance TabNavigation component with responsiveMode prop ('tabs' | 'dropdown' | 'auto') in inventory-management-frontend/components/common/TabNavigation/TabNavigation.tsx
- [X] T009 Add conditional rendering logic to TabNavigation to render Select dropdown on mobile (<md breakpoint) in inventory-management-frontend/components/common/TabNavigation/TabNavigation.tsx
- [X] T010 [P] Verify IconButton component supports aria-label and title attributes for accessibility in inventory-management-frontend/components/common/IconButton/IconButton.tsx

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - View Inventory Items on Mobile (Priority: P1) 🎯 MVP

**Goal**: Inventory cards display in single-column layout on mobile with non-overlapping, accessible action buttons

**Independent Test**: Load /dashboard/inventory at 320px, 375px, 640px, 768px widths and verify buttons remain accessible and non-overlapping

### Implementation for User Story 1

- [X] T011 [US1] Update InventoryList component container to use flex-col layout on mobile in inventory-management-frontend/components/inventory/InventoryList.tsx
- [X] T012 [US1] Modify InventoryListItem layout to stack content vertically (flex flex-col md:flex-row items-start md:items-center gap-4) in inventory-management-frontend/components/inventory/InventoryList.tsx
- [X] T013 [US1] Update action button container to use flex-wrap gap-2 with full width on mobile (w-full md:w-auto) in inventory-management-frontend/components/inventory/InventoryList.tsx
- [X] T014 [US1] Apply responsive touch target sizing to all action buttons (Add to Shopping List, Edit, Archive, Delete, NFC URLs, Suggest) in inventory-management-frontend/components/inventory/InventoryList.tsx
- [X] T015 [US1] Update QuantityControls component to ensure touch targets meet 44px minimum on mobile in inventory-management-frontend/components/common/QuantityControls.tsx
- [ ] T016 [US1] Test inventory page responsive layout at 320px (iPhone SE), 375px (iPhone 12), 640px (tablet) widths manually
- [X] T017 [US1] Run pre-completion checks: npx tsc --noEmit, npm run build, npm test, npm run lint

**Checkpoint**: Inventory page should display properly on all mobile devices with accessible buttons

---

## Phase 4: User Story 2 - Manage Shopping List Filters on Mobile (Priority: P2)

**Goal**: Shopping list filter controls stack vertically on mobile with proper spacing and touch-friendly targets

**Independent Test**: Load /dashboard/shopping-list at mobile widths and verify store filter and other controls remain accessible

### Implementation for User Story 2

- [X] T018 [US2] Apply mobileVertical prop to PageHeader in ShoppingList component in inventory-management-frontend/components/shopping-list/ShoppingList.tsx
- [X] T019 [US2] Update PageHeader secondaryActions to use responsive stacking (flex-col space-y-2 md:flex-row md:space-x-4 md:space-y-0) in inventory-management-frontend/components/shopping-list/ShoppingList.tsx
- [X] T020 [US2] Verify StoreFilter component Select dropdown displays properly on mobile (already mobile-friendly) in inventory-management-frontend/components/shopping-list/StoreFilter.tsx
- [X] T021 [US2] Ensure all filter controls have minimum 44px touch targets on mobile in inventory-management-frontend/components/shopping-list/ShoppingList.tsx
- [ ] T022 [US2] Test shopping list page filter controls at 320px, 375px, 640px widths manually
- [X] T023 [US2] Run pre-completion checks: npx tsc --noEmit, npm run build, npm test, npm run lint

**Checkpoint**: Shopping list filters should stack vertically on mobile and remain fully accessible

---

## Phase 5: User Story 3 - Filter Suggestions on Mobile (Priority: P2)

**Goal**: Suggestion filter controls adapt from toggle buttons to dropdown selector on mobile

**Independent Test**: Load /dashboard/suggestions at mobile widths and verify filter switches to dropdown; load at desktop widths and verify tabs display

### Implementation for User Story 3

- [ ] T024 [US3] Replace toggle button filter UI with TabNavigation component in suggestions page in inventory-management-frontend/app/dashboard/suggestions/page.tsx
- [X] T024 [US3] Replace toggle button filter UI with TabNavigation component in suggestions page in inventory-management-frontend/app/dashboard/suggestions/page.tsx
- [X] T025 [US3] Configure TabNavigation with responsiveMode='auto' to enable dropdown on mobile in inventory-management-frontend/app/dashboard/suggestions/page.tsx
- [X] T026 [US3] Pass filter options (Pending, Approved, Rejected, All) as tabs array to TabNavigation in inventory-management-frontend/app/dashboard/suggestions/page.tsx
- [X] T027 [US3] Update filter state management to work with TabNavigation onChange handler in inventory-management-frontend/app/dashboard/suggestions/page.tsx
- [ ] T028 [US3] Test suggestions page at 320px (dropdown), 768px (tabs), 1024px (tabs) widths manually
- [ ] T029 [US3] Verify filter state persists correctly when switching between mobile and desktop views
- [X] T030 [US3] Run pre-completion checks: npx tsc --noEmit, npm run build, npm test, npm run lint

**Checkpoint**: Suggestion filters should render as dropdown on mobile and tabs on desktop

---

## Phase 6: User Story 4 - View Family Members on Mobile (Priority: P3)

**Goal**: Family Members page header stacks title and action button vertically on mobile

**Independent Test**: Load /dashboard/members at mobile widths and verify title displays above member count and invite button

### Implementation for User Story 4

- [X] T031 [US4] Apply mobileVertical={true} prop to PageHeader component in members page in inventory-management-frontend/app/dashboard/members/page.tsx
- [X] T032 [US4] Ensure page title uses full width on mobile with responsive font sizing (text-xl md:text-2xl) in inventory-management-frontend/app/dashboard/members/page.tsx
- [X] T033 [US4] Verify "+ Invite Member" button maintains proper touch target size on mobile in inventory-management-frontend/app/dashboard/members/page.tsx
- [ ] T034 [US4] Test family members page layout at 320px, 375px, 640px, 768px widths manually
- [X] T035 [US4] Run pre-completion checks: npx tsc --noEmit, npm run build, npm test, npm run lint

**Checkpoint**: Family Members page header should stack vertically on mobile for improved readability

---

## Phase 7: User Story 5 - Navigate Settings on Mobile (Priority: P3)

**Goal**: Settings page action buttons display as icon-only on narrow screens (<640px)

**Independent Test**: Load settings pages at 320px and verify buttons show icons only; load at 768px and verify text labels appear

### Implementation for User Story 5

- [ ] T036 [US5] Identify all action buttons on settings pages (reference data management, family settings) in inventory-management-frontend/app/dashboard/settings/ or inventory-management-frontend/app/dashboard/reference-data/
- [ ] T037 [P] [US5] Update reference data buttons (Add Storage Location, Add Store, Edit, Delete) to use IconButton with conditional text rendering in inventory-management-frontend/components/reference-data/
- [ ] T038 [P] [US5] Add responsive text spans with hidden md:inline classes to show labels only on desktop in inventory-management-frontend/components/reference-data/
- [ ] T039 [US5] Ensure all icon-only buttons have proper aria-label attributes for screen reader accessibility in inventory-management-frontend/components/reference-data/
- [ ] T040 [US5] Add title attributes to icon-only buttons for tooltip on hover/long-press in inventory-management-frontend/components/reference-data/
- [ ] T041 [US5] Test settings pages at 320px (icons only), 640px (icons only), 768px (icons + text) widths manually
- [ ] T042 [US5] Run pre-completion checks: npx tsc --noEmit, npm run build, npm test, npm run lint

**Checkpoint**: Settings page buttons should display icon-only on mobile and icon+text on desktop

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Final improvements, documentation, and validation

- [ ] T043 [P] Update quickstart.md with responsive pattern examples and testing guide in inventory-management-context/specs/011-mobile-responsive-ui/quickstart.md
- [ ] T044 [P] Document responsive component usage in component README files (PageHeader, TabNavigation, Button)
- [ ] T045 Perform cross-browser testing on iOS Safari, Chrome Mobile, Firefox Mobile
- [ ] T046 Test all pages at breakpoint boundaries (639px, 640px, 767px, 768px, 1023px, 1024px)
- [ ] T047 Validate touch target sizes meet WCAG 2.1 AA standards (44x44px minimum) across all interactive elements
- [ ] T048 Test responsive behavior during window resize (smooth transition, no layout shift)
- [ ] T049 Verify no horizontal scrolling on any page at mobile widths (320px to 767px)
- [ ] T050 [P] Add responsive design patterns to component library documentation
- [ ] T051 Run full test suite and ensure 100% pass rate: npm test
- [ ] T052 Run final build validation: npm run build
- [ ] T053 Create responsive design checklist for future feature development

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-7)**: All depend on Foundational phase completion
  - US1 (Inventory) can proceed independently - highest priority
  - US2 (Shopping List) can proceed independently after Foundational
  - US3 (Suggestions) can proceed independently after Foundational
  - US4 (Family Members) can proceed independently after Foundational
  - US5 (Settings) can proceed independently after Foundational
- **Polish (Phase 8)**: Depends on completion of desired user stories (at minimum US1 for MVP)

### User Story Dependencies

- **User Story 1 (P1 - Inventory)**: Depends on Foundational Phase 2 - No dependencies on other stories - **MVP PRIORITY**
- **User Story 2 (P2 - Shopping List)**: Depends on Foundational Phase 2 - No dependencies on other stories
- **User Story 3 (P2 - Suggestions)**: Depends on Foundational Phase 2 - No dependencies on other stories
- **User Story 4 (P3 - Family Members)**: Depends on Foundational Phase 2 - No dependencies on other stories
- **User Story 5 (P3 - Settings)**: Depends on Foundational Phase 2 - No dependencies on other stories

### Within Each User Story

- Tasks within a user story should be executed sequentially unless marked [P]
- Each user story must run pre-completion checks before being marked complete
- Story should be independently testable at multiple viewport sizes

### Parallel Opportunities

#### Phase 1: Setup (All can run in parallel)
```bash
# Terminal 1
T001 - Verify Tailwind config

# Terminal 2
T002 - Review component library

# Terminal 3
T003 - Create testing utilities
```

#### Phase 2: Foundational (Most can run in parallel)
```bash
# Terminal 1
T004 - Button touch targets
T005 - Button responsiveText prop

# Terminal 2
T006 - PageHeader mobileVertical prop
T007 - PageHeader secondaryActions responsive

# Terminal 3
T008 - TabNavigation responsiveMode prop
T009 - TabNavigation conditional rendering

# Terminal 4
T010 - IconButton accessibility verification
```

#### User Stories (Can be parallelized across team members)
```bash
# Developer 1 (Priority: P1 - MVP)
Phase 3: User Story 1 (T011-T017) - Inventory

# Developer 2 (Priority: P2)
Phase 4: User Story 2 (T018-T023) - Shopping List

# Developer 3 (Priority: P2)
Phase 5: User Story 3 (T024-T030) - Suggestions

# Developer 4 (Priority: P3)
Phase 6: User Story 4 (T031-T035) - Family Members

# Developer 5 (Priority: P3)
Phase 7: User Story 5 (T036-T042) - Settings
```

#### Phase 8: Polish (Some can run in parallel)
```bash
# Terminal 1
T043 - Update quickstart.md
T044 - Document component usage
T050 - Add to component docs

# Terminal 2
T045 - Cross-browser testing
T046 - Breakpoint boundary testing
T047 - Touch target validation
T048 - Resize behavior testing
T049 - Horizontal scroll testing

# Terminal 3 (After all testing)
T051 - Run test suite
T052 - Run build validation
T053 - Create checklist
```

---

## Implementation Strategy

### MVP Scope (Minimum Viable Product)

**Recommended MVP**: User Story 1 (Inventory) + Foundational Components

This provides:
- Core responsive pattern in most-used feature
- Reusable component library enhancements
- Foundation for remaining stories
- Immediate value to mobile users

**Tasks for MVP**: T001-T017 (Setup + Foundational + US1) = ~17 tasks

### Incremental Delivery

1. **Sprint 1**: MVP (Setup + Foundational + US1)
2. **Sprint 2**: US2 + US3 (Shopping List + Suggestions)
3. **Sprint 3**: US4 + US5 + Polish (Family Members + Settings + Cross-cutting)

### Pre-Completion Checks (MANDATORY)

Before marking any task complete, the following commands MUST pass:

```bash
# 1. TypeScript type checking
npx tsc --noEmit

# 2. Production build validation
npm run build

# 3. Full test suite execution
npm test

# 4. Code style validation
npm run lint
```

**If any command fails, the task is NOT complete.**

---

## Task Summary

- **Total Tasks**: 53
- **Setup Phase**: 3 tasks
- **Foundational Phase**: 7 tasks (BLOCKING)
- **User Story 1 (P1 - MVP)**: 7 tasks
- **User Story 2 (P2)**: 6 tasks
- **User Story 3 (P2)**: 7 tasks
- **User Story 4 (P3)**: 5 tasks
- **User Story 5 (P3)**: 7 tasks
- **Polish Phase**: 11 tasks

**Parallel Opportunities**: 15+ tasks marked [P] can run in parallel  
**Independent Stories**: All 5 user stories can be developed in parallel after Foundational phase  
**MVP Tasks**: 17 tasks (Setup + Foundational + US1)  
**Estimated Duration**: 2-3 days with proper parallelization

---

**Ready for Implementation**: ✅  
**Next Step**: Begin Phase 1 (Setup) tasks  
**Success Criteria**: All pages responsive 320px-767px, touch targets ≥44px, zero CSS duplication