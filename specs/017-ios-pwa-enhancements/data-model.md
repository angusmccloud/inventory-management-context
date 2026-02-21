# Data Model: 017-ios-pwa-enhancements

**Feature**: iOS PWA Mobile Experience Enhancements  
**Phase**: 1 — Design  
**Date**: 2026-02-21

---

## Summary

This feature introduces **no new DynamoDB entities** and **no backend data changes**. All behavior is client-side, driven by runtime state and CSS.

The only "model" introduced is a set of **client-side TypeScript types** representing in-memory runtime state that drives conditional PWA behaviors.

---

## Client-Side Types

### `PWAModeState`

Represents the current runtime detection state of iOS PWA mode.

```typescript
// types/pwa.ts

/**
 * Runtime detection state for iOS PWA (standalone) mode.
 * Derived from window.navigator.standalone at component mount time.
 * Not persisted; re-derived on every app launch.
 */
export interface PWAModeState {
  /** True when running as an iOS home-screen PWA (window.navigator.standalone === true) */
  isPWA: boolean;
  /** True after the initial mount check has completed (avoids SSR/hydration flicker) */
  isReady: boolean;
}
```

### `PullToRefreshState`

Internal state for the `PullToRefresh` component gesture tracking.

```typescript
// components/common/PullToRefresh/PullToRefresh.types.ts

export type PullToRefreshPhase = 'idle' | 'pulling' | 'releasing' | 'refreshing';

export interface PullToRefreshProps {
  /**
   * Async callback invoked when the user completes a valid pull-to-refresh gesture.
   * The loading indicator remains visible until this promise resolves.
   */
  onRefresh: () => Promise<void>;
  /**
   * Minimum downward drag distance (in px) to trigger a refresh.
   * @default 80
   */
  threshold?: number;
  /**
   * Whether pull-to-refresh is currently enabled.
   * Pass false to disable when a load is already in progress externally.
   * @default true
   */
  enabled?: boolean;
  children: React.ReactNode;
}
```

### `BackButtonProps`

Props for the inline back button rendered in the dashboard nav.

```typescript
// Defined inline in app/(dashboard)/layout.tsx or extracted to types/navigation.ts

export interface PWABackButtonConfig {
  /** Whether to show the in-app back button */
  visible: boolean;
  /** Handler: router.back() or navigate to logical parent */
  onPress: () => void;
  /** Label for accessibility */
  label: string;
}
```

---

## Runtime State Flow

```
App Launch
    │
    ▼
usePWAMode() hook mounts
    │
    ├── isPWA = window.navigator.standalone === true?
    │         │
    │    YES  │  NO
    │         │───────────────────────────────┐
    │                                         │
    ▼                                         ▼
PWA Enhancements Active              Standard Browser Mode
  - nav becomes sticky top-0          - no changes
  - safe-area padding applied         - no back button
  - back button shown (non-root)      - no pull-to-refresh
  - PullToRefresh wraps content          (not rendered)
  - theme-color meta updated
```

---

## No DynamoDB Schema Changes

| Entity | Change | Reason |
|--------|--------|--------|
| `FAMILY#` / `MEMBER#` | None | User preferences not involved |
| Any other entity | None | Feature is entirely client-side |

---

## Dependencies on Existing Entities

None. This feature reads no DynamoDB data and writes no DynamoDB data.

The pull-to-refresh gesture **invokes existing data-fetching functions** (e.g., `listInventoryItems`, `listShoppingListItems`) — it does not create new ones. Those functions already read from existing DynamoDB records.

---

## State Persistence

| State | Persisted? | Where |
|-------|-----------|-------|
| `isPWA` | No | Derived at runtime from `window.navigator.standalone` |
| Pull-to-refresh phase | No | React component state, reset on unmount |
| Back button visibility | No | Derived from `pathname` + root page list |
| Theme color meta | N/A | Static metadata from `layout.tsx` |
