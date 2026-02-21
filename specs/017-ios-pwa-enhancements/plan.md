# Implementation Plan: 017-ios-pwa-enhancements

**Branch**: `017-ios-pwa-enhancements` | **Date**: 2026-02-21 | **Spec**: [spec.md](./spec.md)  
**Input**: Feature specification from `/specs/017-ios-pwa-enhancements/spec.md`

## Summary

When users install the Inventory HQ app on their iOS home screen and launch it as a PWA, Safari removes all browser chrome (address bar, back button, pull-to-refresh). This feature adds four PWA-only enhancements — sticky header with safe-area insets, in-app back button, pull-to-refresh gesture, and theme-matching status bar color — all gated behind runtime detection of `window.navigator.standalone === true`. No backend changes are required; all implementation lives in the frontend.

## Technical Context

**Language/Version**: TypeScript 5 (strict), React 18, Next.js 16 App Router  
**Primary Dependencies**: Tailwind CSS (existing), Next.js viewport metadata API, CSS `env(safe-area-inset-*)`, pointer events API (no new npm packages)  
**Storage**: N/A — no new data stored; pull-to-refresh reuses existing API fetch functions  
**Testing**: Jest + React Testing Library (existing)  
**Target Platform**: iOS 15+ Safari standalone (home-screen PWA); zero regressions on all other platforms  
**Project Type**: Web application — frontend only  
**Performance Goals**: Pull-to-refresh loading indicator appears within 150ms of gesture activation (SC-002)  
**Constraints**: All enhancements MUST be fully conditional on `isPWA === true`; zero visual or behavioral regressions in standard browser mode  
**Scale/Scope**: ~5 data pages need pull-to-refresh wiring; single shared nav layout modified; 2 new frontend artifacts (hook + component)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Gate | Status | Notes |
|------|--------|-------|
| TypeScript strict mode | ✅ PASS | All new types explicitly defined in `types/pwa.ts` and component type files; no implicit `any` |
| No implicit `any` | ✅ PASS | `window.navigator.standalone` typed via intersection: `Navigator & { standalone?: boolean }` |
| Tests required (80% critical paths) | ✅ REQUIRED | `usePWAMode.test.ts`, `PullToRefresh.test.tsx`, back button visibility logic tested |
| Jest + React Testing Library | ✅ PASS | Existing test framework used; no new testing dependencies |
| No DynamoDB scan operations | ✅ N/A | No backend changes |
| AWS SDK v3 modular imports | ✅ N/A | No backend changes |
| Lambda warmup pattern | ✅ N/A | No new Lambda functions |
| Component library (Principle VIII) | ✅ PASS | `PullToRefresh` added to `components/common/`; `usePWAMode` in `hooks/`; back button inline in layout |
| No third-party deployment platforms | ✅ PASS | No deployment changes; existing S3+CloudFront pipeline unchanged |
| Pre-completion checks | ✅ REQUIRED | `npx tsc --noEmit`, `npm run build`, `npm test`, `npm run lint` must pass |
| WCAG 2.1 AA accessibility | ✅ REQUIRED | Back button must have `aria-label`; pull-to-refresh indicator needs `aria-live` region |
| `viewport-fit=cover` safe area | ✅ REQUIRED | Must pair with `env(safe-area-inset-*)` padding; no content hidden behind hardware |

**Post-Phase 1 Re-check**: No new violations introduced. All design decisions (see `research.md`) align with constitution principles.

## Project Structure

### Documentation (this feature)

```text
specs/017-ios-pwa-enhancements/
├── plan.md              ← this file
├── research.md          ← Phase 0: PWA detection, gesture, safe area decisions
├── data-model.md        ← Phase 1: client-side types; no new DynamoDB entities
├── quickstart.md        ← Phase 1: setup + implementation checklist
├── contracts/
│   └── api-contracts.md ← Phase 1: no new APIs; lists existing functions reused
└── tasks.md             ← Phase 2 (created by /speckit.tasks, NOT this command)
```

### Source Code (frontend repository)

```text
inventory-management-frontend/
├── app/
│   ├── layout.tsx                          ← (MODIFY) viewport-fit + themeColor update
│   ├── globals.css                         ← (MODIFY) .safe-top, .safe-bottom CSS utilities
│   └── (dashboard)/
│       ├── layout.tsx                      ← (MODIFY) sticky nav + back button + safe area
│       ├── inventory/page.tsx              ← (MODIFY) wrap content with PullToRefresh
│       ├── shopping-list/page.tsx          ← (MODIFY) wrap content with PullToRefresh
│       ├── dashboard/page.tsx              ← (MODIFY) wrap content with PullToRefresh
│       ├── notifications/page.tsx          ← (MODIFY) wrap content with PullToRefresh
│       └── suggestions/page.tsx            ← (MODIFY) wrap content with PullToRefresh
├── hooks/
│   ├── usePWAMode.ts                       ← (NEW) iOS standalone mode detection hook
│   └── usePWAMode.test.ts                  ← (NEW) unit tests
├── components/
│   └── common/
│       ├── PullToRefresh/
│       │   ├── PullToRefresh.tsx           ← (NEW) pull-to-refresh gesture component
│       │   ├── PullToRefresh.types.ts      ← (NEW) TypeScript types
│       │   ├── PullToRefresh.test.tsx      ← (NEW) unit tests
│       │   └── index.ts                    ← (NEW) barrel export
│       └── index.ts                        ← (MODIFY) add PullToRefresh export
└── types/
    └── pwa.ts                              ← (NEW) PWAModeState, PullToRefreshPhase types
```

**Structure Decision**: Frontend-only. All changes in `inventory-management-frontend`. The `inventory-management-backend` repository has zero changes for this feature.

## Complexity Tracking

No constitution violations. No complexity justification required.

## Phase 0: Research Summary

All unknowns resolved. See [research.md](./research.md) for full details.

| Unknown | Resolution |
|---------|-----------|
| PWA detection mechanism | `window.navigator.standalone === true` — iOS-only, evaluated client-side after mount |
| Sticky header + safe area | `position: sticky; top: 0` + `viewport-fit=cover` + `env(safe-area-inset-top)` CSS padding |
| Back button — cold launch deep URL | Fall back to logical parent URL (e.g., `/inventory` for `/inventory/:id`) |
| Pull-to-refresh implementation | Pointer events (no library), 80px threshold, blocks concurrent refreshes |
| Theme color meta | Updated static `themeColor` in `layout.tsx` to brand primary colors (light + dark) |
| Backend changes needed | **None** — confirmed by spec and research |

## Phase 1: Design Summary

### Data Model

No new DynamoDB entities. Client-side types only:
- `PWAModeState` — runtime detection state (`isPWA: boolean`, `isReady: boolean`)
- `PullToRefreshProps` — component interface (`onRefresh`, `threshold`, `enabled`, `children`)

See [data-model.md](./data-model.md).

### API Contracts

No new API endpoints. Pull-to-refresh reuses existing `lib/api/*` fetch functions.  
See [contracts/api-contracts.md](./contracts/api-contracts.md).

### Component Design

#### `usePWAMode` hook
```typescript
// hooks/usePWAMode.ts
export function usePWAMode(): { isPWA: boolean; isReady: boolean }
```
- Returns `{ isPWA: false, isReady: false }` on server (SSR-safe)
- Sets `isPWA = window.navigator.standalone === true` after mount

#### `PullToRefresh` component
```tsx
// components/common/PullToRefresh/PullToRefresh.tsx
<PullToRefresh onRefresh={async () => fetchData()} threshold={80}>
  {children}
</PullToRefresh>
```
- Pointer event gesture detection (pointerdown → pointermove → pointerup)
- State machine: `idle → pulling → refreshing → idle`
- Visual: animated spinner during pull + refresh; `aria-live="polite"` region for a11y
- Disabled automatically when `scrollTop > 0` (prevents mid-scroll false triggers)

#### Dashboard Layout changes
- `<nav>` gets conditional classes: `isPWA ? 'sticky top-0 z-50 safe-top' : ''`
- `<main>` gets `isPWA ? 'mt-[var(--nav-height)]' : ''` (height measured via ref)
- Back button shown when `isPWA && !isRootPage(pathname)` → renders `← Back` in nav left slot with `aria-label="Go back"`

## Developer Notes

### Testing Without Real iOS Device

Use iOS Simulator (Xcode) or a real iPhone on the same WiFi network. Full setup in [quickstart.md](./quickstart.md).

### Key Constraint: PWA-only behaviors

Every PWA enhancement MUST be wrapped in `isPWA` guards. Tests must verify both `isPWA = true` and `isPWA = false` branches to prove zero regressions.

### Pre-Completion Checks

```bash
cd inventory-management-frontend
npx tsc --noEmit   # Must show 0 errors
npm run build      # Must succeed
npm test           # Must pass
npm run lint       # Must show 0 errors
```
