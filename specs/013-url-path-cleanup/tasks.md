# Tasks: URL Path Cleanup

**Input**: Design documents from `/specs/013-url-path-cleanup/`
**Prerequisites**: plan.md (complete), spec.md (complete), research.md (complete), quickstart.md (complete)

**Tests**: Integration tests included as per Testing Excellence principle

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- Frontend repository: `inventory-management-frontend/`
- App routes: `inventory-management-frontend/app/`
- Components: `inventory-management-frontend/components/`
- Tests: `inventory-management-frontend/tests/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Prepare for URL restructure implementation

- [X] T001 Create feature branch `013-url-path-cleanup` in frontend repository
- [X] T002 [P] Review current route structure in `app/dashboard/` directory
- [X] T003 [P] Review middleware configuration in `app/middleware.ts`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core redirect infrastructure that MUST be complete before ANY user story URL changes

**⚠️ CRITICAL**: No route moving or link updates can begin until middleware redirect logic is complete and tested

- [ ] T004 Implement redirect logic in `app/middleware.ts` for old `/dashboard/*` URLs (except `/dashboard` itself)
- [ ] T005 Add query parameter preservation to middleware redirect using Next.js URL API
- [ ] T006 Configure middleware matcher pattern to apply redirects to all routes
- [ ] T007 Test middleware redirect locally: verify `/dashboard/inventory` redirects to `/inventory`

**Checkpoint**: Foundation ready - route restructuring and link updates can now begin in parallel

---

## Phase 3: User Story 1 - Simplified Navigation URLs (Priority: P1) 🎯 MVP

**Goal**: Remove `/dashboard` prefix from all section URLs to create cleaner, more intuitive paths

**Independent Test**: Navigate to any section via new URL (e.g., `/inventory`, `/shopping-list`) and verify page loads correctly. Navigation links should point to new URLs.

### Implementation for User Story 1

- [X] T008 [P] [US1] Move `app/dashboard/inventory/` directory to `app/inventory/` (includes page.tsx and [itemId]/)
- [X] T009 [P] [US1] Move `app/dashboard/shopping-list/` directory to `app/shopping-list/`
- [X] T010 [P] [US1] Move `app/dashboard/members/` directory to `app/members/`
- [X] T011 [P] [US1] Move `app/dashboard/suggestions/` directory to `app/suggestions/` (includes suggest/ subdirectory)
- [X] T012 [P] [US1] Move `app/dashboard/notifications/` directory to `app/notifications/`
- [X] T013 [P] [US1] Move `app/dashboard/settings/` directory to `app/settings/` (includes reference-data/ subdirectory)
- [X] T014 [US1] Update navigation links in `components/common/Navigation` component from `/dashboard/inventory` to `/inventory`, etc.
- [X] T015 [US1] Update navigation links in `components/common/MobileNav` component from `/dashboard/*` to `/*`
- [X] T016 [US1] Update navigation links in `components/common/Sidebar` component from `/dashboard/*` to `/*`
- [X] T017 [US1] Update breadcrumb path generation in `components/common/Breadcrumbs` component to handle new URL structure
- [X] T018 [P] [US1] Update suggestion redirect link in `components/inventory/InventoryList.tsx` line 267 from `/dashboard/suggestions/suggest` to `/suggestions/suggest`
- [X] T019 [P] [US1] Update settings link in `components/shopping-list/AddItemForm.tsx` line 150 from `/dashboard/settings` to `/settings`
- [X] T020 [P] [US1] Update settings link in `components/shopping-list/EditShoppingListItemForm.tsx` line 129 from `/dashboard/settings` to `/settings`
- [X] T021 [US1] Run grep search to find any remaining `/dashboard/` links: `grep -r "href=\"/dashboard/" --include="*.tsx" --include="*.ts" app/ components/`
- [X] T022 [US1] Fix any additional hardcoded dashboard URLs found in grep search

**Checkpoint**: At this point, all new URLs should work and all navigation links should point to new simplified paths

---

## Phase 4: User Story 2 - Dashboard Home Remains Accessible (Priority: P1)

**Goal**: Ensure `/dashboard` home page continues to work without disruption

**Independent Test**: Navigate to `/dashboard` and verify home dashboard page loads. Home navigation link should point to `/dashboard`.

### Implementation for User Story 2

- [ ] T023 [US2] Verify `app/dashboard/page.tsx` remains in place (home dashboard page)
- [ ] T024 [US2] Verify home/dashboard navigation link in `components/common/Navigation` points to `/dashboard`
- [ ] T025 [US2] Verify mobile home link in `components/common/MobileNav` points to `/dashboard`
- [ ] T026 [US2] Verify sidebar home link in `components/common/Sidebar` points to `/dashboard`
- [ ] T027 [US2] Verify middleware does NOT redirect `/dashboard` (only `/dashboard/*`)
- [ ] T028 [US2] Test manually: visit `/dashboard` and verify it loads home page without redirect

**Checkpoint**: Home dashboard page accessible at `/dashboard`, all other sections at root-level URLs

---

## Phase 5: User Story 3 - Seamless URL Migration (Priority: P2)

**Goal**: Old dashboard-prefixed URLs automatically redirect to new simplified URLs without errors

**Independent Test**: Access old URLs (e.g., `/dashboard/inventory`, `/dashboard/members`) and verify they redirect to new URLs with query parameters preserved.

### Integration Tests for User Story 3

> **NOTE: Write these tests FIRST, ensure they FAIL before validating redirects**

- [ ] T029 [P] [US3] Create integration test file `tests/integration/routing.test.ts`
- [ ] T030 [P] [US3] Write test: "inventory page loads at /inventory" in routing.test.ts
- [ ] T031 [P] [US3] Write test: "shopping list page loads at /shopping-list" in routing.test.ts
- [ ] T032 [P] [US3] Write test: "members page loads at /members" in routing.test.ts
- [ ] T033 [P] [US3] Write test: "redirects /dashboard/inventory to /inventory" in routing.test.ts
- [ ] T034 [P] [US3] Write test: "redirects /dashboard/shopping-list to /shopping-list" in routing.test.ts
- [ ] T035 [P] [US3] Write test: "redirects /dashboard/members to /members" in routing.test.ts
- [ ] T036 [P] [US3] Write test: "preserves query parameters during redirect (?filter=low-stock)" in routing.test.ts
- [ ] T037 [P] [US3] Write test: "preserves hash fragments during redirect (#section)" in routing.test.ts
- [ ] T038 [P] [US3] Write test: "navigation links point to new URL structure" in routing.test.ts
- [ ] T039 [P] [US3] Write test: "dashboard home page still accessible at /dashboard" in routing.test.ts

### Validation for User Story 3

- [ ] T040 [US3] Run integration tests: `npm test -- routing.test.ts` - verify all tests pass
- [ ] T041 [US3] Manual test: Visit `/dashboard/inventory?filter=low-stock` and verify redirects to `/inventory?filter=low-stock`
- [ ] T042 [US3] Manual test: Visit `/dashboard/members#active` and verify redirects to `/members#active`
- [ ] T043 [US3] Manual test: Visit `/dashboard/suggestions/suggest?itemId=123` and verify redirects correctly
- [ ] T044 [US3] Measure redirect performance: confirm <100ms redirect time (requirement FR-003)

**Checkpoint**: All old URLs redirect correctly to new URLs with query parameters and hash fragments preserved

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final validation and deployment preparation

- [ ] T045 [P] Run TypeScript type check: `npx tsc --noEmit` - verify zero errors
- [ ] T046 [P] Run production build: `npm run build` - verify successful build
- [ ] T047 [P] Run full test suite: `npm test` - verify all tests pass
- [ ] T048 [P] Run linting: `npm run lint` - verify no errors
- [ ] T049 Perform manual testing checklist from quickstart.md (visit each route, test navigation, verify redirects)
- [ ] T050 Run final grep search to confirm no remaining `/dashboard/*` links (except `/dashboard` home)
- [ ] T051 Update feature documentation if needed
- [ ] T052 Verify authentication middleware still applies to all new route paths
- [ ] T053 Test 404 handling for invalid routes (e.g., `/dashboard/nonexistent`)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3, 4, 5)**: All depend on Foundational phase completion
  - User Story 1 and 2 can proceed in parallel (different files)
  - User Story 3 tests depend on User Story 1 routes being moved
- **Polish (Phase 6)**: Depends on all user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
  - Route directory moves are parallelizable [P]
  - Component link updates must happen after routes are moved
- **User Story 2 (P1)**: Can start after Foundational (Phase 2) - Independent verification tasks
  - Can run in parallel with User Story 1
- **User Story 3 (P2)**: Depends on User Story 1 routes being moved
  - Tests can be written in parallel [P]
  - Validation depends on routes being at new locations

### Within Each User Story

**User Story 1**:
- All route directory moves (T008-T013) can run in parallel [P]
- Component updates (T014-T020) can run in parallel after routes moved
- Grep search and fixes (T021-T022) must be sequential

**User Story 2**:
- All verification tasks (T023-T028) can run in parallel

**User Story 3**:
- All test creation tasks (T029-T039) can run in parallel [P]
- Manual validation tasks (T040-T044) should be sequential

### Parallel Opportunities

**Maximum Parallelization** (if team has multiple developers):

1. **Phase 2 (Foundation)**: Single developer - sequential middleware implementation
2. **Phase 3 (US1) + Phase 4 (US2)**: Can run in parallel
   - Developer A: Move routes and update component links (US1)
   - Developer B: Verify dashboard home remains intact (US2)
3. **Phase 5 (US3)**: Single developer - write tests and validate redirects
4. **Phase 6 (Polish)**: Pre-completion checks can run in parallel [P]

---

## Parallel Example: User Story 1

```bash
# All route moves can happen simultaneously (different directories)
git mv app/dashboard/inventory app/inventory &
git mv app/dashboard/shopping-list app/shopping-list &
git mv app/dashboard/members app/members &
git mv app/dashboard/suggestions app/suggestions &
git mv app/dashboard/notifications app/notifications &
git mv app/dashboard/settings app/settings &
wait

# Component updates can happen simultaneously (different files)
# Edit components/common/Navigation
# Edit components/common/MobileNav  
# Edit components/common/Sidebar
# Edit components/common/Breadcrumbs
# Edit components/inventory/InventoryList.tsx
# Edit components/shopping-list/AddItemForm.tsx
# Edit components/shopping-list/EditShoppingListItemForm.tsx
```

---

## Implementation Strategy

### MVP Approach (Minimum Viable Product)

**MVP = User Story 1 + User Story 2**
- Implements simplified URLs for all sections
- Preserves dashboard home page
- Provides immediate value: cleaner URLs that are easier to share

**Rationale**: These two P1 stories deliver the core URL simplification. User Story 3 (redirects) can be added immediately after to ensure backward compatibility.

### Incremental Delivery

1. **Sprint 1**: Implement MVP (US1 + US2) - ~2 hours
   - Get core URL changes live
   - Users can start using new URLs
   
2. **Sprint 2**: Add backward compatibility (US3) - ~1 hour
   - Implement redirects
   - Ensure old bookmarks work
   
3. **Sprint 3**: Polish and optimize - ~30 minutes
   - Performance tuning
   - Additional edge case handling

### Recommended Execution Order

For a single developer working sequentially:

1. **Phase 1 (Setup)**: 10 minutes
2. **Phase 2 (Foundation)**: 20 minutes - implement middleware redirects
3. **Phase 3 (US1)**: 60 minutes - move routes and update all navigation links
4. **Phase 4 (US2)**: 10 minutes - verify dashboard home works
5. **Phase 5 (US3)**: 30 minutes - write tests and validate redirects
6. **Phase 6 (Polish)**: 20 minutes - run all validation checks

**Total Time**: ~2.5 hours

---

## Testing Strategy

### Test Categories

1. **Route Loading Tests**: Verify each new URL loads the correct page
2. **Redirect Tests**: Verify old URLs redirect to new URLs
3. **Query Parameter Tests**: Verify parameters preserved during redirects
4. **Navigation Tests**: Verify navigation links use new URL structure
5. **Authentication Tests**: Verify auth still applies to new routes

### Coverage Target

- 100% of routes tested for loading at new URLs
- 100% of old dashboard URLs tested for redirects
- Query parameter preservation validated for all redirect scenarios
- All navigation components tested for correct href attributes

### Performance Validation

- Redirect time: <100ms (requirement FR-003)
- Page load time: No increase from baseline
- Build time: No significant increase

---

## Rollback Plan

If issues arise during or after implementation:

1. **Quick Fix** (if redirects breaking):
   - Update middleware to redirect new URLs back to old structure temporarily
   - Gives time to fix issues without user impact

2. **Partial Rollback** (if some routes problematic):
   - Keep working routes at new URLs
   - Revert problematic routes to `/dashboard/*` structure
   - Update middleware to handle mixed state

3. **Full Rollback** (if major issues):
   - Revert git commit: `git revert <commit-hash>`
   - Redeploy previous version
   - Old URLs continue to work as before

---

## Success Criteria Validation

After completing all tasks, verify:

- ✅ **SC-001**: All sections accessible via simplified URLs (test each route)
- ✅ **SC-002**: Direct URL entry works without 404 errors (manual test)
- ✅ **SC-003**: Old URLs redirect within 100ms (performance test)
- ✅ **SC-004**: 100% of internal links updated (grep search shows no results)
- ✅ **SC-005**: No page load time increase (compare before/after metrics)
- ✅ **SC-006**: Zero broken links or 404 errors (integration tests + manual testing)

---

## Notes

- **No backend changes required**: This is purely a frontend routing restructure
- **No data model changes**: No database, API, or entity modifications
- **Authentication preserved**: Middleware continues to protect all routes
- **Backward compatibility**: Middleware redirects ensure old URLs continue to work
- **Performance impact**: Minimal (<10ms redirect overhead, no bundle size change)
