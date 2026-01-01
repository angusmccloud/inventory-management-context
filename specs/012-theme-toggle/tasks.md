# Tasks: Theme Toggle (Light/Dark Mode)

**Feature**: 012-theme-toggle  
**Input**: Design documents from `/specs/012-theme-toggle/`  
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/theme-preference-api.yaml

**Tests**: NOT explicitly requested in specification - focusing on implementation with manual testing checklist

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `- [ ] [ID] [P?] [Story?] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2, US3)
- Exact file paths included in descriptions

## Path Conventions

- **Frontend**: `inventory-management-frontend/`
- **Backend**: `inventory-management-backend/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Type definitions and utilities needed by all user stories

- [ ] T001 [P] Create theme type definitions in `inventory-management-frontend/types/theme.ts`
- [ ] T002 [P] Create localStorage utility module in `inventory-management-frontend/lib/theme-storage.ts`
- [ ] T003 [P] Create backend theme preference types in `inventory-management-backend/src/types/preference.ts`

**Completion Criteria**:
- All type files compile without errors
- TypeScript strict mode passes
- No implicit `any` types

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before user story implementation

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [ ] T004 Extract useTheme hook from existing ThemeProvider to `inventory-management-frontend/hooks/useTheme.ts`
- [ ] T005 Update existing ThemeProvider context interface to support new ThemeContextValue type in `inventory-management-frontend/components/common/ThemeProvider.tsx`

**Completion Criteria**:
- Existing ThemeProvider continues to work (no regressions)
- Context properly typed with new interface
- Hook export available for consumption

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - System Preference Detection (Priority: P1) 🎯 MVP

**Goal**: App automatically detects and applies OS theme preference for users who have never set a preference

**Independent Test**: Open app with OS in light mode → verify light theme applied. Change OS to dark mode → verify app switches to dark theme automatically.

### Implementation for User Story 1

- [ ] T006 [US1] Update ThemeProvider to detect system preference using `prefers-color-scheme` media query in `inventory-management-frontend/components/common/ThemeProvider.tsx`
- [ ] T007 [US1] Implement system preference listener (auto mode only) in ThemeProvider in `inventory-management-frontend/components/common/ThemeProvider.tsx`
- [ ] T008 [US1] Add inline script to prevent flash of wrong theme in `inventory-management-frontend/app/layout.tsx`
- [ ] T009 [US1] Update layout.tsx to add `suppressHydrationWarning` to html element in `inventory-management-frontend/app/layout.tsx`

**Completion Criteria**:
- App detects system theme on first load
- Theme updates when OS theme changes (if mode is auto)
- No flash of wrong theme on page load
- Works in browsers that support `prefers-color-scheme`
- Gracefully degrades to light mode in unsupported browsers

**Pre-Completion Checks (Frontend)**:
- [ ] Run `npx tsc --noEmit` - all type checks pass
- [ ] Run `npm run build` - production build succeeds
- [ ] Run `npm test` - all tests pass
- [ ] Run `npm run lint` - no linting errors

**Checkpoint**: User Story 1 complete - app respects system preference

---

## Phase 4: User Story 2 - Manual Theme Toggle (Priority: P2)

**Goal**: Users can manually override system preference with a three-state toggle (Light/Dark/Auto)

**Independent Test**: Click "Light" → app switches to light. Click "Dark" → app switches to dark. Click "Auto" → app follows OS preference.

### Implementation for User Story 2

- [ ] T010 [P] [US2] Create ThemeToggle component with three-state segmented button UI in `inventory-management-frontend/components/common/ThemeToggle.tsx`
- [ ] T011 [P] [US2] Add ARIA attributes for accessibility (role="radiogroup", role="radio", aria-checked) in `inventory-management-frontend/components/common/ThemeToggle.tsx`
- [ ] T012 [P] [US2] Add keyboard navigation support (Tab, Arrow keys, Enter/Space) in `inventory-management-frontend/components/common/ThemeToggle.tsx`
- [ ] T013 [US2] Update ThemeProvider.setMode to write to localStorage on theme change in `inventory-management-frontend/components/common/ThemeProvider.tsx`
- [ ] T014 [US2] Update ThemeProvider to read from localStorage on initialization in `inventory-management-frontend/components/common/ThemeProvider.tsx`
- [ ] T015 [US2] Add ThemeToggle to user menu or dashboard header (choose appropriate location based on UI design)

**Completion Criteria**:
- Three-state toggle renders with Light/Dark/Auto options
- Clicking any option immediately changes theme
- Active state visually indicated
- Theme persists in localStorage
- Keyboard accessible (Tab to focus, Arrow keys to select, Enter to activate)
- Screen reader announces current selection
- Works on all pages without re-render issues

**Pre-Completion Checks (Frontend)**:
- [ ] Run `npx tsc --noEmit` - all type checks pass
- [ ] Run `npm run build` - production build succeeds
- [ ] Run `npm test` - all tests pass
- [ ] Run `npm run lint` - no linting errors

**Checkpoint**: User Story 2 complete - users can manually control theme

---

## Phase 5: User Story 3 - Persistent User Preference (Priority: P3)

**Goal**: Logged-in users' theme preference syncs to backend and persists across devices

**Independent Test**: Login → set theme to Dark → logout → login on different device → Dark theme applied.

### Implementation for User Story 3

#### Backend Tasks

- [ ] T016 [P] [US3] Create Lambda handler for GET theme preference in `inventory-management-backend/src/handlers/userPreference.ts`
- [ ] T017 [P] [US3] Create Lambda handler for PUT theme preference in `inventory-management-backend/src/handlers/userPreference.ts`
- [ ] T018 [P] [US3] Add Zod validation for theme preference input in `inventory-management-backend/src/handlers/userPreference.ts`
- [ ] T019 [US3] Add GET /users/{userId}/preferences/theme endpoint to SAM template in `inventory-management-backend/template.yaml`
- [ ] T020 [US3] Add PUT /users/{userId}/preferences/theme endpoint to SAM template in `inventory-management-backend/template.yaml`
- [ ] T021 [US3] Configure CORS for theme preference endpoints in `inventory-management-backend/template.yaml`

**Pre-Completion Checks (Backend)**:
- [ ] Run `npm run build` - TypeScript compilation succeeds
- [ ] Run `npm test` - all tests pass
- [ ] Run `sam validate` - template is valid
- [ ] Test locally with `sam local start-api`

#### Frontend Tasks

- [ ] T022 [P] [US3] Add getThemePreference API client method in `inventory-management-frontend/lib/api-client.ts`
- [ ] T023 [P] [US3] Add updateThemePreference API client method in `inventory-management-frontend/lib/api-client.ts`
- [ ] T024 [US3] Update ThemeProvider.setMode to sync with backend when user is logged in in `inventory-management-frontend/components/common/ThemeProvider.tsx`
- [ ] T025 [US3] Add effect to load theme from backend on user login in `inventory-management-frontend/components/common/ThemeProvider.tsx`
- [ ] T026 [US3] Handle backend sync errors gracefully (log error, keep localStorage) in `inventory-management-frontend/components/common/ThemeProvider.tsx`

**Completion Criteria**:
- Backend API endpoints deployed and accessible
- GET endpoint returns theme preference (or 'auto' default)
- PUT endpoint validates and stores theme preference
- Frontend calls backend API when user logged in
- Theme preference syncs across devices for logged-in users
- localStorage used for anonymous users
- Backend errors don't break UI (localStorage still works)
- Theme preference persists after cache clear (if logged in)

**Pre-Completion Checks (Frontend)**:
- [ ] Run `npx tsc --noEmit` - all type checks pass
- [ ] Run `npm run build` - production build succeeds
- [ ] Run `npm test` - all tests pass
- [ ] Run `npm run lint` - no linting errors

**Checkpoint**: User Story 3 complete - preference syncs across devices

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final quality improvements and documentation

- [ ] T027 [P] Add theme toggle to all appropriate UI locations (dashboard, settings, user menu)
- [ ] T028 [P] Verify no flash of wrong theme on all routes
- [ ] T029 [P] Test accessibility with keyboard-only navigation
- [ ] T030 [P] Test accessibility with screen reader (manual verification)
- [ ] T031 [P] Update README with theme toggle feature description
- [ ] T032 [P] Verify performance metrics (<100ms detection, <200ms toggle)
- [ ] T033 Test on multiple browsers (Chrome, Firefox, Safari, Edge)
- [ ] T034 Test on mobile devices (iOS Safari, Android Chrome)
- [ ] T035 Validate against quickstart.md manual testing checklist

**Completion Criteria**:
- Theme toggle visible and functional across app
- No accessibility violations
- Performance metrics met
- Cross-browser compatibility verified
- Documentation updated

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup (Phase 1) - BLOCKS all user stories
- **User Story 1 (Phase 3)**: Depends on Foundational (Phase 2)
- **User Story 2 (Phase 4)**: Depends on User Story 1 (Phase 3) - builds on system detection
- **User Story 3 (Phase 5)**: Depends on User Story 2 (Phase 4) - adds persistence to toggle
- **Polish (Phase 6)**: Depends on all user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Foundation for all theme functionality - MUST be first
- **User Story 2 (P2)**: Extends US1 with manual control - depends on US1 completion
- **User Story 3 (P3)**: Extends US2 with backend sync - depends on US2 completion

### Within Each User Story

**User Story 1**:
- T006, T007 can be developed together in ThemeProvider
- T008, T009 can be done in parallel with T006/T007
- All US1 tasks must complete before US2

**User Story 2**:
- T010, T011, T012 (ThemeToggle component) can develop in parallel with T013, T014 (ThemeProvider updates)
- T015 (add to UI) depends on T010-T014 completion
- All US2 tasks must complete before US3

**User Story 3**:
- Backend tasks (T016-T021) can all run in parallel
- Frontend tasks (T022-T023) can run in parallel with backend
- T024-T026 (integration) depend on T022-T023 completion

### Parallel Opportunities

**Phase 1 (Setup)**: All 3 tasks (T001-T003) can run in parallel (different files)

**Phase 2 (Foundational)**: T004 and T005 can run in parallel if careful with ThemeProvider file coordination

**User Story 1**: 
- T006+T007 (ThemeProvider logic) parallel with T008+T009 (layout updates)

**User Story 2**:
- T010+T011+T012 (ThemeToggle) parallel with T013+T014 (ThemeProvider)

**User Story 3**:
- All backend tasks (T016-T021) parallel
- Frontend API methods (T022-T023) parallel with backend
- Integration (T024-T026) sequential after API methods

**Phase 6 (Polish)**: Most tasks (T027-T032) can run in parallel

---

## Parallel Example: User Story 1

If you have multiple developers:

```bash
# Developer A: ThemeProvider system detection
git checkout -b feat/us1-system-detection
# Work on T006, T007 in ThemeProvider.tsx

# Developer B: Flash prevention
git checkout -b feat/us1-flash-prevention
# Work on T008, T009 in layout.tsx

# Both merge when complete
```

---

## Parallel Example: User Story 3

If you have multiple developers:

```bash
# Developer A: Backend API
cd inventory-management-backend
git checkout -b feat/us3-backend-api
# Work on T016-T021 (handlers, SAM template)

# Developer B: Frontend API client
cd inventory-management-frontend
git checkout -b feat/us3-frontend-api-client
# Work on T022-T023 (api-client.ts methods)

# Developer C: Integration (after A and B complete)
git checkout -b feat/us3-integration
# Work on T024-T026 (ThemeProvider sync)
```

---

## Implementation Strategy

### MVP Scope (Minimum Viable Product)

For fastest time-to-value, implement in this order:

1. **Phase 1**: Setup (30 min)
2. **Phase 2**: Foundational (30 min)
3. **Phase 3**: User Story 1 - System Preference Detection (1 hour) ← **MVP STOP HERE**

**MVP Delivers**: App automatically respects user's OS theme preference - immediate value with zero user action required.

### Full Feature

Continue after MVP:

4. **Phase 4**: User Story 2 - Manual Toggle (1.5 hours)
5. **Phase 5**: User Story 3 - Persistent Preference (1.5 hours)
6. **Phase 6**: Polish (1 hour)

**Total Implementation Time**: 5-6 hours for complete feature

---

## Task Summary

| Phase | Tasks | Parallelizable | Estimated Time |
|-------|-------|----------------|----------------|
| Setup | 3 tasks (T001-T003) | All 3 | 30 min |
| Foundational | 2 tasks (T004-T005) | 2 | 30 min |
| User Story 1 | 4 tasks (T006-T009) | 2 groups | 1 hour |
| User Story 2 | 6 tasks (T010-T015) | 2 groups | 1.5 hours |
| User Story 3 | 11 tasks (T016-T026) | 3 groups | 1.5 hours |
| Polish | 9 tasks (T027-T035) | Most | 1 hour |
| **Total** | **35 tasks** | **14 parallel opportunities** | **5-6 hours** |

---

## Notes

- **Tests**: No automated tests included (not requested in spec). Manual testing checklist in quickstart.md.
- **Pre-completion checks**: Frontend tasks require TypeScript, build, test, and lint validation before marking complete.
- **Backend deployment**: Use `sam build && sam deploy` after backend tasks complete.
- **Frontend deployment**: Use existing S3 + CloudFront deployment process.
- **Accessibility**: WCAG 2.1 AA compliance required (keyboard nav, screen reader support).
- **Performance**: Monitor that theme detection <100ms, toggle <200ms.
- **Browser support**: Modern browsers with `prefers-color-scheme` support (graceful degradation for older browsers).
