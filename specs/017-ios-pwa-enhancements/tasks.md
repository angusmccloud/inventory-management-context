# Tasks: 017 — iOS PWA Mobile Experience Enhancements

**Input**: Design documents from `/specs/017-ios-pwa-enhancements/`
**Prerequisites**: [plan.md](./plan.md), [spec.md](./spec.md), [research.md](./research.md), [data-model.md](./data-model.md), [contracts/api-contracts.md](./contracts/api-contracts.md)

**Repository**: All changes in `inventory-management-frontend` — backend has zero changes.

## Format: `[ID] [P?] [Story?] Description`

- **[P]**: Can run in parallel (different files, no blocking dependencies)
- **[Story]**: Maps to user story (US1–US5)
- File paths are relative to `inventory-management-frontend/`

---

## Phase 1: Setup

**Purpose**: Create the shared TypeScript types that all phases depend on.

- [x] T001 Create client-side PWA types in `types/pwa.ts` — define `PWAModeState` (`isPWA: boolean, isReady: boolean`), `PullToRefreshPhase` (`'idle' | 'pulling' | 'releasing' | 'refreshing'`)

**Checkpoint**: `types/pwa.ts` exists and exports both types

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that ALL user stories depend on. No story work can begin until this phase is complete.

**⚠️ CRITICAL**: T002 is required by US1, US2, US3, and US4. T003 is required by US1 and US4. T004 is required by US2. All must complete before user story phases.

- [x] T002 [P] Create `hooks/usePWAMode.ts` — export `usePWAMode(): { isPWA: boolean; isReady: boolean }`; return `{ isPWA: false, isReady: false }` on server (SSR-safe); in `useEffect`, set `isPWA = (window.navigator as Navigator & { standalone?: boolean }).standalone === true`; write unit tests in `hooks/usePWAMode.test.ts` covering: returns false on SSR, returns true when standalone is true, returns false when standalone is false/undefined
- [x] T003 [P] Add safe-area CSS utilities and viewport meta — (a) in `app/layout.tsx`, add `viewport-fit: 'cover'` to the `viewport` export and change `themeColor` placeholder to `'#2563EB'` (keeps existing structure intact; actual multi-theme update done in Phase 7); (b) in `app/globals.css`, add `.safe-top { padding-top: env(safe-area-inset-top); }` and `.safe-bottom { padding-bottom: env(safe-area-inset-bottom); }` utility classes
- [x] T004 Add `isRootPage(pathname: string): boolean` helper and `getLogicalParent(pathname: string): string` utility in `lib/navigation.ts` — root pages are paths derived from `getNavigationItems()` hrefs (e.g. `/inventory`, `/shopping-list`, `/dashboard`, `/members`, `/settings`, `/suggestions`, `/notifications`); `getLogicalParent` returns parent route segment (e.g. `/inventory/item-123` → `/inventory`)

**Checkpoint**: `usePWAMode` hook usable, safe-area CSS utilities available in all components, navigation helpers ready

---

## Phase 3: User Story 1 — Sticky Header (Priority: P1) 🎯 MVP

**Goal**: The navigation header remains fixed at the top of the screen when the app is in iOS PWA mode, with the content area padded so nothing is hidden behind the header.

**Independent Test**: Install app as iOS PWA, navigate to a page with long content (e.g., Inventory), scroll down — header must remain visible at top, first content item must be fully visible (not clipped).

- [x] T005 [US1] Apply sticky header in `app/(dashboard)/layout.tsx` — import `usePWAMode`; when `isPWA`, add Tailwind classes `sticky top-0 z-50` plus `safe-top` to the `<nav>` element; when not PWA, apply no new classes (zero regression condition; existing class list unchanged for non-PWA)
- [x] T006 [US1] Add compensating top padding to `<main>` in `app/(dashboard)/layout.tsx` — use a `useRef` on the `<nav>` element and a `useEffect` / `ResizeObserver` to measure its rendered height; set `paddingTop` on `<main>` to that value when `isPWA`; this ensures first content item is never hidden behind the sticky header at any device size (FR-002a)

**Checkpoint**: US1 fully functional and independently testable. Run `npx tsc --noEmit` — must show 0 errors.

---

## Phase 4: User Story 2 — Back Button Navigation (Priority: P1)

**Goal**: An in-app back button appears in the nav header on non-root pages in PWA mode, allowing users to navigate backwards without browser controls.

**Independent Test**: Install app as iOS PWA, navigate from Inventory to an item detail page — back button must appear; tap it — must return to Inventory. From Inventory (root page) — back button must NOT appear.

- [x] T007 [P] [US2] Add back button UI in `app/(dashboard)/layout.tsx` — in the nav's left slot (before the "Inventory HQ" brand text), conditionally render a `<button>` with `aria-label="Go back"`, a `ChevronLeftIcon` from `@heroicons/react/20/solid`, and "Back" label text; show only when `isPWA && !isRootPage(pathname)`; apply theme-consistent Tailwind classes (e.g. `flex items-center gap-1 text-sm text-text-secondary hover:text-text-default`)
- [x] T008 [US2] Implement `handleBack()` in `app/(dashboard)/layout.tsx` — if `window.history.length > 2`, call `router.back()`; otherwise call `router.push(getLogicalParent(pathname))` as cold-launch fallback (FR-005); attach as `onClick` handler to the back button created in T007

**Checkpoint**: US2 fully functional. Back button visible only on non-root pages in PWA mode. Back navigation works both for in-session history and cold-launch deep-link entry.

---

## Phase 5: User Story 3 — Pull-to-Refresh (Priority: P2)

**Goal**: A pull-down gesture from the top of data-driven pages triggers a data refresh in iOS PWA mode.

**Independent Test**: Install app as iOS PWA, navigate to Inventory page, pull down from top of content — spinner must appear within 150ms of gesture threshold, fresh data must load.

- [x] T009 [P] [US3] Create `components/common/PullToRefresh/PullToRefresh.types.ts` — export `PullToRefreshProps`: `onRefresh: () => Promise<void>`, `threshold?: number` (default 80), `enabled?: boolean` (default true), `children: React.ReactNode`; export `PullToRefreshPhase` re-exported from `types/pwa.ts`
- [x] T010 [US3] Create `components/common/PullToRefresh/PullToRefresh.tsx` — `'use client'` component implementing pointer-event gesture detection: (a) attach `onPointerDown` to record start Y when `scrollTop === 0`; (b) `onPointerMove` compute delta Y, update pull indicator translate offset, set phase to `'pulling'` once delta > 0; (c) `onPointerUp` trigger `onRefresh()` if delta ≥ threshold (phase → `'refreshing'`), otherwise reset (phase → `'idle'`); guard against concurrent refresh (`enabled` prop + `phase === 'refreshing'`); render a `<div aria-live="polite" aria-label="Refreshing content" />` status region and an animated spinner indicator that becomes visible when phase is `'pulling'` or `'refreshing'`; import `PullToRefreshPhase` from `types/pwa.ts`; all pointer handlers respect `touch-action: pan-y` via inline style on wrapper; write unit tests in `components/common/PullToRefresh/PullToRefresh.test.tsx` covering: no refresh below threshold, refresh fires above threshold, concurrent refresh blocked, onRefresh promise rejection shows error via Snackbar
- [x] T011 [US3] Create `components/common/PullToRefresh/index.ts` barrel (`export { PullToRefresh } from './PullToRefresh'`); add `PullToRefresh` export to `components/common/index.ts`
- [x] T012 [P] [US3] Wire PullToRefresh on `app/(dashboard)/inventory/page.tsx` — import `usePWAMode` and `PullToRefresh`; wrap page content JSX with `{isPWA ? <PullToRefresh onRefresh={refetchInventory}>{content}</PullToRefresh> : content}` where `refetchInventory` calls the existing inventory fetch function; extract fetch into a named `refetch` callback
- [x] T013 [P] [US3] Wire PullToRefresh on `app/(dashboard)/shopping-list/page.tsx` — same pattern as T012 using existing shopping list fetch logic
- [x] T014 [P] [US3] Wire PullToRefresh on `app/(dashboard)/dashboard/page.tsx` — same pattern as T012 using existing dashboard data fetch
- [x] T015 [P] [US3] Wire PullToRefresh on `app/(dashboard)/notifications/page.tsx` — same pattern as T012 using existing notifications fetch
- [x] T016 [P] [US3] Wire PullToRefresh on `app/(dashboard)/suggestions/page.tsx` — same pattern as T012 using existing suggestions fetch

**Checkpoint**: US3 fully functional. Pull-to-refresh gesture works on all data pages in PWA mode; no gesture activation in standard browser mode (component not rendered). Run `npx tsc --noEmit` — must show 0 errors.

---

## Phase 6: User Story 4 — Safe Area and Viewport Handling (Priority: P2)

**Goal**: All interactive content is safely within the visible area on iPhones with notches, Dynamic Islands, and Home Indicators — no content obscured by hardware.

**Independent Test**: Launch PWA on an iPhone with notch/Dynamic Island — header must sit below the status bar. On a device with Home Indicator — no bottom navigation is obscured.

- [x] T017 [US4] Apply bottom safe-area to any fixed/sticky bottom elements in `app/(dashboard)/layout.tsx` — check if any bottom action bars or mobile-only bottom nav exist; if so, apply `safe-bottom` (or `pb-[env(safe-area-inset-bottom)]`) conditionally when `isPWA`; if none exist currently, add a note in the layout explaining bottom inset must be applied to any future bottom-fixed elements
- [x] T018 [P] [US4] Add landscape safe-area side padding to `app/globals.css` — add `.safe-sides { padding-left: env(safe-area-inset-left); padding-right: env(safe-area-inset-right); }` utility class; document its usage: apply to full-width containers in PWA landscape mode to prevent content abutting the sensor islands on newer iPhones

**Checkpoint**: US4 complete. On all modern iOS devices (tested via Simulator), no UI element is obscured by device hardware in PWA mode.

---

## Phase 7: User Story 5 — PWA Launch Experience and Status Bar (Priority: P3)

**Goal**: The iOS status bar icons match the app's color scheme, and the launch splash background is the app's primary brand color rather than blank white.

**Independent Test**: Cold-launch the PWA from the iOS home screen — the splash background must show the brand color. With light theme: status bar shows dark icons. With dark theme: status bar shows light icons.

- [x] T019 [P] [US5] Update `themeColor` in `app/layout.tsx` `viewport` export to brand-aware values — replace the single `'#2563EB'` placeholder set in T003 with an array: `[{ media: '(prefers-color-scheme: light)', color: '#2563EB' }, { media: '(prefers-color-scheme: dark)', color: '#1E40AF' }]` (using the primary brand color values from CSS vars `--color-primary`); verify these hex values match what `globals.css` defines for `--color-primary` in light vs. dark themes
- [x] T020 [P] [US5] Update `public/site.webmanifest` — set `"background_color"` and `"theme_color"` to the light-mode brand primary hex (e.g. `"#2563EB"`) so the iOS launch splash screen background matches the app header color rather than defaulting to white; verify `"display": "standalone"` is set

**Checkpoint**: US5 complete. Cold-launching the PWA shows brand color splash. Status bar icons are readable in both light and dark themes.

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Final validation pass across all user stories.

- [x] T021 Run pre-completion checks in `inventory-management-frontend/` — `npx tsc --noEmit` (zero errors required), `npm run build` (must succeed), `npm test` (must pass with coverage for `usePWAMode`, `PullToRefresh`, and back button logic), `npm run lint` (zero errors); fix any issues before marking complete

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: No dependencies — start immediately
- **Phase 2 (Foundation)**: Depends on Phase 1 — BLOCKS all user story phases; T002 and T003 can run in parallel
- **Phase 3 (US1)**: Depends on Phase 2 complete (needs `usePWAMode`, `safe-top` CSS)
- **Phase 4 (US2)**: Depends on Phase 2 complete (needs `usePWAMode`, `isRootPage`, `getLogicalParent`); can run in parallel with Phase 3
- **Phase 5 (US3)**: Depends on Phase 2 complete (needs `usePWAMode`, `PullToRefreshPhase` from types); T012–T016 all depend on T011
- **Phase 6 (US4)**: Depends on Phase 2 complete (safe-area CSS in T003); can run in parallel with Phases 3–5
- **Phase 7 (US5)**: Depends on Phase 2 complete (T003 sets initial themeColor); T019–T020 can run in parallel
- **Phase 8 (Polish)**: Depends on all story phases complete

### User Story Dependencies

- **US1 (P1)**: Depends on Foundation — no dependency on other user stories
- **US2 (P1)**: Depends on Foundation and US1 (shares `app/(dashboard)/layout.tsx`) — implement US2 additions after T005–T006
- **US3 (P2)**: Depends on Foundation — independent of US1/US2; all page-level wiring tasks (T012–T016) are fully parallel
- **US4 (P2)**: Depends on Foundation — largely completed by T003; only layout bottom-padding addition (T017) may interact with US1/US2 layout work
- **US5 (P3)**: Depends only on Foundation (T003 themeColor placeholder); fully independent of US1–US4

### Parallel Opportunities Per Phase

**Phase 2 Foundation**:
```
T002 (usePWAMode hook) ──────────────┐
T003 (viewport-fit + CSS utilities) ─┤→ T004 (navigation helpers) → User stories
```

**Phase 5 Pull-to-Refresh page wiring** (all run after T011):
```
T012 (inventory)     ─┐
T013 (shopping-list) ─┤
T014 (dashboard)     ─┤→ All complete simultaneously
T015 (notifications) ─┤
T016 (suggestions)   ─┘
```

**Phase 7 Status Bar** (fully parallel):
```
T019 (themeColor viewport meta) ─┐
T020 (site.webmanifest)         ─┘→ Both complete simultaneously
```

---

## Implementation Strategy

### MVP Scope (US1 + US2 only — Phase 1–4)

The two P1 stories (sticky header + back button) share a single file (`app/(dashboard)/layout.tsx`) and together deliver the critical navigation fix that removes the "stranded user" problem in PWA mode.

1. Complete Phase 1 (Setup) — 1 task
2. Complete Phase 2 (Foundation) — 3 tasks
3. Complete Phase 3 (US1 Sticky Header) — 2 tasks → independently testable ✅
4. Complete Phase 4 (US2 Back Button) — 2 tasks → independently testable ✅
5. **STOP and VALIDATE** — install PWA on iOS Simulator, verify sticky header + back button
6. Deploy MVP — users can now navigate in PWA mode

### Full Delivery (All 5 Stories)

After validating MVP:
- Phase 5 (US3 Pull-to-Refresh) — delivers native refresh gesture
- Phase 6 (US4 Safe Area) — ensures content visible on all modern iPhones
- Phase 7 (US5 Status Bar) — polishes launch experience
- Phase 8 (Polish) — final validation pass

### Task Counts

| Phase | User Story | Tasks | Parallelizable |
|-------|-----------|-------|---------------|
| Phase 1: Setup | — | 1 | 0 |
| Phase 2: Foundation | — | 3 | 2 (T002, T003) |
| Phase 3: Sticky Header | US1 (P1) | 2 | 0 |
| Phase 4: Back Button | US2 (P1) | 2 | 1 (T007) |
| Phase 5: Pull-to-Refresh | US3 (P2) | 8 | 5 (T012–T016) |
| Phase 6: Safe Area | US4 (P2) | 2 | 1 (T018) |
| Phase 7: Status Bar | US5 (P3) | 2 | 2 (T019, T020) |
| Phase 8: Polish | — | 1 | 0 |
| **Total** | | **21** | **11** |

---

## Notes

- All file paths are relative to `inventory-management-frontend/`
- `[P]` tasks operate on different files and can be executed concurrently
- **Zero backend changes** — `inventory-management-backend` is untouched
- Every PWA feature MUST be guarded by `isPWA === true`; standard browser mode must see zero changes (FR-015, SC-006)
- Pre-completion checks (`npx tsc --noEmit`, `npm run build`, `npm test`, `npm run lint`) are MANDATORY before marking any task complete per constitution
- Test iOS behavior using iOS Simulator (Xcode) — see [quickstart.md](./quickstart.md) for setup
