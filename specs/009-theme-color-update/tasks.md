# Implementation Tasks: Theme Color System Update

**Feature**: 009-theme-color-update  
**Branch**: `009-theme-color-update`  
**Spec**: [spec.md](spec.md) | **Plan**: [plan.md](plan.md)  
**Created**: December 28, 2025

## Overview

This document provides a detailed task breakdown for updating the theme color system with new branded colors. Tasks are organized by user story to enable independent, incremental implementation.

## Task Format

```
- [ ] [TaskID] [P] [Story] Description with file path
```

- **TaskID**: Sequential task number (T001, T002, etc.)
- **[P]**: Parallelizable (can be done independently with no blocking dependencies)
- **[Story]**: User story label (US1, US2, US3, US4) - indicates which user story this task serves
- Tasks without story labels are setup/foundational tasks

## Summary Statistics

- **Total Tasks**: 47
- **User Story 1 (P1)**: 15 tasks (theme configuration + base implementation)
- **User Story 2 (P2)**: 10 tasks (interactive elements)
- **User Story 3 (P3)**: 10 tasks (secondary/tertiary elements)
- **User Story 4 (P3)**: 6 tasks (error states)
- **Polish & Testing**: 6 tasks (final validation)

## Dependencies

**User Story Dependencies**:
- US2, US3, US4 depend on US1 (theme configuration must be in place)
- Within each story, common components should be completed before feature components
- No dependencies between US2, US3, and US4 (can be done in parallel after US1)

**Parallel Opportunities**:
- After US1 theme configuration is complete, US2-US4 can proceed in parallel
- Within each story phase, individual component updates can be parallelized
- Testing tasks can run in parallel once implementation is complete

## Phase 1: Setup & Prerequisites

**Goal**: Set up project structure and tooling for theme implementation

- [ ] T001 Create feature branch and ensure all dependencies are installed in frontend repository
- [ ] T002 Install or verify accessibility testing dependencies (axe-core, @axe-core/react) in inventory-management-frontend/package.json
- [ ] T003 Create test directory structure: inventory-management-frontend/tests/theme/ with contrast.test.ts and visual-regression.test.tsx

## Phase 2: Foundational (Blocking Prerequisites)

**Goal**: Update core theme configuration that all components depend on

- [ ] T004 Update CSS custom properties in inventory-management-frontend/app/globals.css with new light mode colors (Background: #8CC59A, Text: #0A3315, Primary: #0A3315, etc.)
- [ ] T005 Update CSS custom properties in inventory-management-frontend/app/globals.css with new dark mode colors in @media (prefers-color-scheme: dark) block
- [ ] T006 Add hover state color definitions to inventory-management-frontend/app/globals.css for primary and secondary colors
- [ ] T007 Update Tailwind theme configuration in inventory-management-frontend/tailwind.config.js to ensure all color tokens map to CSS custom properties
- [ ] T008 Update or create TypeScript type definitions in inventory-management-frontend/lib/theme.ts for ColorToken type and theme utilities
- [ ] T009 Create accessibility contrast test suite in inventory-management-frontend/tests/theme/contrast.test.ts to validate WCAG AA compliance for all color combinations

**Independent Test Criteria**: 
- Theme configuration loads without errors
- CSS custom properties are defined for all required tokens
- TypeScript types compile without errors
- Contrast tests pass for all color combinations (8.2:1+ ratios)

## Phase 3: User Story 1 - Light/Dark Mode Displays Consistent Brand Colors (P1)

**Story Goal**: Users see consistent branded colors throughout the application in both light and dark modes. All elements use theme tokens instead of hardcoded colors.

**Independent Test**: View any page in light/dark mode and verify all elements use specified theme colors with no Tailwind defaults or hardcoded hex values.

### Common Components Foundation

- [ ] T010 [P] [US1] Update Button component in inventory-management-frontend/components/common/Button.tsx to use bg-primary, text-primary-contrast, hover:bg-primary-hover
- [ ] T011 [P] [US1] Update Card component in inventory-management-frontend/components/common/Card.tsx to use bg-surface, border-border
- [ ] T012 [P] [US1] Update Input component in inventory-management-frontend/components/common/Input.tsx to use border-border, focus:ring-primary, text-text-default
- [ ] T013 [P] [US1] Update Badge component in inventory-management-frontend/components/common/Badge.tsx to use theme colors for all badge variants
- [ ] T014 [P] [US1] Update Alert component in inventory-management-frontend/components/common/Alert.tsx to use theme colors for all alert types

### Component Discovery and Migration

- [ ] T015 [US1] Run grep search to identify all hardcoded colors: `grep -r "bg-\(blue\|gray\|red\|green\|amber\|indigo\)-[0-9]" components/ app/ --include="*.tsx"` and document findings
- [ ] T016 [US1] Run grep search for hex colors: `grep -r "#[0-9a-fA-F]\{6\}" components/ app/ --include="*.tsx"` and document findings  
- [ ] T017 [US1] Create migration checklist from grep results prioritized by component usage frequency

### Layout and Page Structure

- [ ] T018 [US1] Update root layout in inventory-management-frontend/app/layout.tsx to use bg-background and text-text-default
- [ ] T019 [P] [US1] Update dashboard layout in inventory-management-frontend/app/dashboard/layout.tsx to use theme colors for navigation and container
- [ ] T020 [P] [US1] Update login page in inventory-management-frontend/app/(auth)/login/page.tsx to use theme colors
- [ ] T021 [P] [US1] Update invitation acceptance page in inventory-management-frontend/app/accept-invitation/page.tsx to use theme colors

### Visual Verification

- [ ] T022 [US1] Create visual regression test baseline for dashboard page in both light and dark modes
- [ ] T023 [US1] Manual verification checklist: View dashboard, login, and invitation pages in both light/dark modes and verify consistent theme colors
- [ ] T024 [US1] Run accessibility audit on updated pages using axe-core and verify zero color contrast violations

**Story 1 Success Criteria**:
- ✅ All common components use theme tokens
- ✅ Root and dashboard layouts use theme tokens
- ✅ Auth flow pages use theme tokens
- ✅ Zero hardcoded Tailwind default colors in common components
- ✅ All pages display correctly in light and dark modes

## Phase 4: User Story 2 - Primary Actions Use Brand Colors (P2)

**Story Goal**: Primary interactive elements (buttons, links, form inputs) use primary color scheme with clear visual hierarchy.

**Independent Test**: Interact with buttons, links, and forms across all pages and verify primary color usage with appropriate hover/focus states.

### Interactive Component Updates

- [ ] T025 [P] [US2] Update all button instances in inventory pages (inventory-management-frontend/app/dashboard/inventory/) to use primary button styles
- [ ] T026 [P] [US2] Update all button instances in member management pages (inventory-management-frontend/app/dashboard/members/) to use primary button styles
- [ ] T027 [P] [US2] Update all button instances in shopping list pages (inventory-management-frontend/app/dashboard/shopping-list/) to use primary button styles
- [ ] T028 [P] [US2] Update link styling in navigation components to use text-primary with hover:underline or hover:text-primary-hover
- [ ] T029 [P] [US2] Update form input focus states across all forms to use focus:ring-primary and focus:border-primary

### Feature Component Forms

- [ ] T030 [US2] Update inventory item form in inventory-management-frontend/components/inventory/ to ensure all inputs have primary focus states
- [ ] T031 [US2] Update member invitation form in inventory-management-frontend/components/members/ to ensure all inputs have primary focus states
- [ ] T032 [US2] Update shopping list item form in inventory-management-frontend/components/shopping-list/ to ensure all inputs have primary focus states

### Hover State Verification

- [ ] T033 [US2] Test all primary buttons for visible hover state changes using hover:bg-primary-hover
- [ ] T034 [US2] Test all form inputs for visible focus states with primary color ring

**Story 2 Success Criteria**:
- ✅ All primary buttons use bg-primary and hover:bg-primary-hover
- ✅ All links use primary color for text
- ✅ All form inputs have primary color focus rings
- ✅ Hover and focus states are visually distinct and accessible

## Phase 5: User Story 3 - Secondary and Tertiary Elements Use Defined Color Hierarchy (P3)

**Story Goal**: Secondary actions and tertiary UI elements use designated color schemes for clear visual hierarchy.

**Independent Test**: Review pages with multiple action types and verify color hierarchy between primary, secondary, and tertiary elements.

### Secondary Component Updates

- [ ] T035 [P] [US3] Update secondary/cancel buttons across all pages to use bg-secondary and text-secondary-contrast
- [ ] T036 [P] [US3] Update filter buttons in inventory page to use secondary button styling
- [ ] T037 [P] [US3] Update tab navigation in dashboard to use secondary color for active tabs

### Tertiary Component Updates

- [ ] T038 [P] [US3] Update Badge component variants in inventory-management-frontend/components/common/Badge.tsx to use tertiary colors for info badges
- [ ] T039 [P] [US3] Update status indicators in inventory items to use tertiary color scheme
- [ ] T040 [P] [US3] Update metadata tags in member cards to use tertiary colors

### Feature-Specific Updates

- [ ] T041 [US3] Update reference data components in inventory-management-frontend/components/reference-data/ to use appropriate secondary/tertiary colors
- [ ] T042 [US3] Update suggestion components in inventory-management-frontend/components/suggestions/ to use tertiary colors for suggestion badges
- [ ] T043 [US3] Verify color hierarchy across dashboard: primary (main actions) > secondary (filters/tabs) > tertiary (badges/tags)

### Visual Hierarchy Testing

- [ ] T044 [US3] Visual inspection of pages with multiple action types to confirm clear hierarchy (primary stands out, secondary less prominent, tertiary supplementary)

**Story 3 Success Criteria**:
- ✅ Secondary buttons use bg-secondary
- ✅ Tertiary elements (badges, tags) use bg-tertiary
- ✅ Clear visual distinction between primary, secondary, and tertiary elements
- ✅ Color hierarchy is consistent across all pages

## Phase 6: User Story 4 - Error States Use Defined Error Colors (P3)

**Story Goal**: Error messages, validation failures, and warning states use error color scheme consistently.

**Independent Test**: Trigger form validation errors and notifications to verify error color usage.

### Error Component Updates

- [ ] T045 [P] [US4] Update Alert component error variant in inventory-management-frontend/components/common/Alert.tsx to use bg-error and text-error-contrast
- [ ] T046 [P] [US4] Update form validation error messages across all forms to use text-error
- [ ] T047 [P] [US4] Update notification error toasts in inventory-management-frontend/components/notifications/ to use error color scheme
- [ ] T048 [P] [US4] Update invalid input border states to use border-error (e.g., when validation fails)

### Error State Testing

- [ ] T049 [US4] Test form validation by submitting invalid data and verifying error messages display in error color
- [ ] T050 [US4] Test error notification toasts by triggering errors (e.g., network failure) and verify error background color

**Story 4 Success Criteria**:
- ✅ All error messages use text-error or bg-error
- ✅ Error notifications have error background and contrast text
- ✅ Invalid form fields show error border color
- ✅ Error states are visually distinct and accessible

## Phase 7: Polish & Cross-Cutting Concerns

**Goal**: Final validation, documentation updates, and cleanup

- [ ] T051 Final grep search to verify zero remaining hardcoded colors: `grep -r "bg-\(blue\|gray\|red\|green\|amber\|indigo\)-[0-9]\|#[0-9a-fA-F]\{6\}" components/ app/ --include="*.tsx"`
- [ ] T052 Run full test suite: `npm test` and ensure all tests pass
- [ ] T053 Run accessibility audit on all major pages (dashboard, inventory, members, shopping list, login) using Lighthouse or axe DevTools
- [ ] T054 Update THEME.md documentation in inventory-management-frontend/THEME.md with new color values and usage examples
- [ ] T055 Update THEME-QUICK-REF.md with new color palette quick reference
- [ ] T056 Create visual regression test screenshots for before/after comparison in both light and dark modes

## Implementation Strategy

### MVP Scope (Recommended for First PR)

**User Story 1 only** provides immediate value:
- Theme configuration (T004-T009)
- Common components (T010-T014)
- Layout and key pages (T018-T021)
- Basic verification (T022-T024)

This delivers a working theme system that can be iteratively improved.

### Incremental Delivery

1. **PR 1**: US1 (Setup + Core theme + Common components)
2. **PR 2**: US2 (Primary interactive elements)
3. **PR 3**: US3 + US4 (Secondary/tertiary + Error states)
4. **PR 4**: Polish and final testing

### Parallel Execution Opportunities

**After foundational phase (T004-T009) completes**:

**Parallel Group 1** (Common components - US1):
- T010, T011, T012, T013, T014 can all be done simultaneously

**Parallel Group 2** (Layouts - US1):
- T019, T020, T021 can be done simultaneously

**Parallel Group 3** (US2 feature updates):
- T025, T026, T027, T028, T029 can be done simultaneously

**Parallel Group 4** (US3 updates):
- T035, T036, T037, T038, T039, T040 can be done simultaneously

**Parallel Group 5** (US4 error states):
- T045, T046, T047, T048 can be done simultaneously

## Validation Checklist

Before marking feature complete, verify:

- [ ] All 47 tasks completed
- [ ] Zero grep results for hardcoded colors
- [ ] All tests passing (unit + accessibility)
- [ ] WCAG AA compliance verified on all pages
- [ ] Visual regression tests show expected changes only
- [ ] Documentation updated (THEME.md, THEME-QUICK-REF.md)
- [ ] Both light and dark modes manually tested
- [ ] All user story acceptance criteria met

## Notes

- **Test-first recommended**: For US1, consider creating accessibility tests (T009) before updating components
- **Component reuse**: Many feature components compose common components, so updating common components first (T010-T014) reduces total work
- **Grep searches**: T015-T016 help discover all locations needing updates; don't skip this step
- **Visual regression**: T022 and T056 provide confidence that changes are intentional and complete
- **Rollback strategy**: Each user story can be committed separately, allowing partial rollback if needed

## Risk Mitigation

- **Visual Regression Risk**: Mitigated by T022 (baseline) and T056 (comparison)
- **Missed Components Risk**: Mitigated by T015-T016 (grep searches) and T051 (final verification)
- **Accessibility Risk**: Mitigated by T009 (contrast tests) and T053 (accessibility audit)
- **Performance Risk**: None - CSS custom properties have zero runtime cost
