# Research: 017-ios-pwa-enhancements

**Feature**: iOS PWA Mobile Experience Enhancements  
**Phase**: 0 — Research  
**Date**: 2026-02-21

---

## R-001: iOS PWA Standalone Mode Detection

**Decision**: Use `window.navigator.standalone === true` for iOS PWA detection.

**Rationale**: This is the canonical, Apple-documented mechanism for detecting whether the app is running as an iOS home-screen PWA (standalone mode). It is only set to `true` on iOS Safari standalone. On Android Chrome and desktop PWAs, `standalone` is `undefined` (not `true`), so it naturally scopes behavior to iOS only as required by the spec.

**Implementation pattern**:
```typescript
// hooks/usePWAMode.ts
const isPWA = typeof window !== 'undefined' &&
  (window.navigator as Navigator & { standalone?: boolean }).standalone === true;
```

**SSR safety**: `window` is not available during Next.js server-side rendering, so the check must be wrapped in `typeof window !== 'undefined'` or executed inside a `useEffect`. The hook returns `false` on the server, then updates on mount — standard hydration-safe pattern.

**Alternatives considered**:
- `matchMedia('(display-mode: standalone)')` — works on Android/desktop PWAs and some browsers, but NOT on iOS Safari standalone (Safari does not implement the CSS `display-mode` media query for home-screen apps). Not suitable for this feature.
- Checking the `standalone` display mode via meta — not inspectable at runtime.

---

## R-002: Sticky Header with Safe Area Insets (iOS Notch / Dynamic Island)

**Decision**: Apply `position: sticky; top: 0; z-index: 50` to the `<nav>` in the dashboard layout, conditional on PWA mode. Add `viewport-fit=cover` to the viewport meta tag and use `padding-top: env(safe-area-inset-top)` on the nav bar to respect iOS status bar / Dynamic Island area.

**Rationale**:
- `position: sticky` is supported in all modern browsers and does not require a library. When the scroll container is `<main>` (child of the nav's sibling), the nav sticking to the top of the viewport is achieved with `top: 0; position: sticky` on the nav.
- `viewport-fit=cover` is required to allow the page to extend under the iOS status bar and Dynamic Island. Without it, iOS adds automatic whitespace above the page. With it, the page fills edge-to-edge, but content can be obscured — the app is then responsible for applying `safe-area-inset-*` padding.
- `env(safe-area-inset-top)` is the CSS environment variable that gives the height of the iOS status bar / Dynamic Island area. Applying it as padding-top on the sticky nav ensures the nav content starts below the status bar.

**Non-PWA behavior**: In standard browser mode, no sticky class or safe-area padding is applied — the browser handles its own status bar and the nav flows normally. Zero regression.

**Implementation**:
- Add `viewport-fit=cover` to `app/layout.tsx` viewport config.
- Add Tailwind-compatible utility via `globals.css`:
  ```css
  .safe-top { padding-top: env(safe-area-inset-top); }
  .safe-bottom { padding-bottom: env(safe-area-inset-bottom); }
  ```
- In `DashboardLayout`, conditionally apply `sticky top-0 z-50 safe-top` to `<nav>` when `isPWA === true`.
- Add compensating `paddingTop` to the scrollable `<main>` equal to the nav height so the first content item is not obscured.

**Alternatives considered**:
- CSS `position: fixed` — requires manual offset for all content below to avoid it being hidden. `sticky` is simpler because it stays in flow when not scrolled past.
- Always-sticky header (not PWA-conditional) — spec acceptance scenario 3 explicitly requires no regression in browser mode; always-sticky could change scrolling behavior on desktop.

---

## R-003: In-App Back Button (PWA Mode Navigation)

**Decision**: Detect "on root page" by comparing `usePathname()` against the list of root navigation destinations (`/inventory`, `/shopping-list`, `/dashboard`, `/members`, `/settings`, `/suggestions`, `/notifications`). Show a back button in the nav header when in PWA mode AND not on a root page. Use `router.back()` for normal history-based navigation; fall back to the logical parent URL when `history.length <= 2` (cold launch to a deep URL).

**Rationale**: Next.js `usePathname()` hook is the idiomatic way to get the current path. The existing `getNavigationItems()` utility in `lib/navigation.ts` already defines root-level nav items with their `href` values — extract this set of root paths from it to keep the definition DRY.

`router.back()` correctly handles the in-session history stack. The cold-launch edge case (navigated directly to a deep URL) requires extracting the logical parent from the current path (e.g., `/inventory/item-123` → `/inventory`).

**Logical parent derivation**:
```typescript
const getLogicalParent = (pathname: string): string => {
  const segments = pathname.split('/').filter(Boolean);
  if (segments.length <= 1) return '/';
  return '/' + segments.slice(0, -1).join('/');
};
```

**Back button visibility**:
```typescript
const showBackButton = isPWA && !isRootPage(pathname);
```

**Back button press handler**:
```typescript
const handleBack = () => {
  if (window.history.length > 2) {
    router.back();
  } else {
    router.push(getLogicalParent(pathname));
  }
};
```

**Alternatives considered**:
- Always show back button in PWA mode on all pages (including roots) — spec AC 1 explicitly prohibits this.
- Using breadcrumbs from `PageHeader` as back navigation — duplicates logic and breadcrumbs aren't always present.

---

## R-004: Pull-to-Refresh Implementation

**Decision**: Implement a reusable `PullToRefresh` common component using native `pointer events` (or `touch events`). It wraps page content and calls an `onRefresh: () => Promise<void>` callback when the user drags beyond a configurable threshold (default: 80px). A CSS-animated loading spinner is shown during the drag and while the refresh promise is pending.

**Rationale**:
- iOS Safari in standalone mode disables the default browser pull-to-refresh behavior, so implementing our own is safe (no conflict).
- Pointer events (`onPointerDown/Move/Up`) are preferred over touch events as they work on both touch and mouse, and avoid passive event listener warnings.
- No third-party library needed — the gesture is simple enough to implement directly:
  1. On pointer-down at scroll position 0, capture start Y.
  2. On pointer-move, compute delta Y. If positive (downward) and delta exceeds threshold, show indicator.
  3. On pointer-up, if threshold exceeded, call `onRefresh()`.
- The component prevents default scroll behavior only when actively capturing a pull gesture (avoids blocking normal scrolling).

**Key implementation details**:
- `touch-action: pan-y` CSS on the container allows normal vertical scroll but captures the gesture.
- Disabled when `scrollTop > 0` to avoid triggering mid-scroll.
- State: `pulling` (tracking delta), `refreshing` (awaiting promise), `idle`.
- Must call `onRefresh()` only once even if pointer moves further (guard with `refreshing` state).

**Component API**:
```tsx
<PullToRefresh onRefresh={async () => { await fetchData(); }}>
  {children}
</PullToRefresh>
```

**Alternatives considered**:
- `react-pull-to-refresh` npm package — adds a dependency for a simple gesture; better to own 60 lines of code.
- `react-spring` drag gesture — overkill; no spring animation needed.
- Only enabling in PWA mode inside the component — considered, but the spec says the gesture only activates because iOS already disables browser PTR, so the component is inherently safe to render only in PWA contexts (callers gate it).

---

## R-005: Theme Color Meta Tag (Splash Screen / Status Bar Color)

**Decision**: Update `app/layout.tsx` to emit a `<meta name="theme-color">` tag reflecting the app's primary brand color (not plain white). Use the existing CSS variable `--color-secondary` value as the static launch color, set once at build time. Do not attempt to dynamically update it per the spec clarification: _"Set once at launch reflecting whichever theme is active at that moment; the updated style takes effect on the next cold-launch after a theme change."_

**Rationale**: The viewport `themeColor` property in Next.js metadata accepts an array of theme-color entries with optional `media` queries. We can emit both light and dark values:
```typescript
themeColor: [
  { media: '(prefers-color-scheme: light)', color: '#2563EB' }, // primary brand color
  { media: '(prefers-color-scheme: dark)', color: '#1E40AF' },
],
```
This is set once per page load. On subsequent theme changes (via toggle), the meta tag update requires a new cold-launch, which aligns with the spec clarification.

The current `layout.tsx` has `themeColor: '#FFFFFF'` (white) — updating this to match the app's actual primary brand color satisfies SC-005.

**Alternatives considered**:
- Dynamically updating `<meta name="theme-color">` via `document.querySelector('meta[name="theme-color"]')` on theme toggle — spec explicitly says this is not required; it takes effect on next cold-launch.
- Using CSS variable values directly in metadata — not possible since metadata is resolved server-side and CSS vars are runtime values.

---

## R-006: No Backend Changes Required

**Decision**: Zero backend (Lambda/DynamoDB) changes needed for this feature.

**Rationale**: All PWA enhancements are client-side behaviors:
- PWA detection: client-side via `window.navigator.standalone`
- Sticky header, back button: CSS + React component state
- Pull-to-refresh: invokes existing page data-fetch functions (no new API endpoints)
- Safe area: CSS environment variables
- Theme color: Next.js metadata

The spec explicitly confirms: _"no new backend API endpoints are required."_

This means:
- `inventory-management-backend` repository: **no changes**
- `template.yaml` (SAM): **no changes**
- DynamoDB schema: **no changes**

---

## R-007: File Locations & Component Strategy

**Decision**: All new code lives in the frontend repository. New hook and component added to common library per Constitution Principle VIII.

| Artifact | Path | Type |
|---|---|---|
| PWA mode hook | `hooks/usePWAMode.ts` | New custom hook |
| Pull-to-refresh component | `components/common/PullToRefresh/` | New common component |
| Back button logic | Inline in `app/(dashboard)/layout.tsx` | Layout modification |
| Safe area CSS | `app/globals.css` | CSS utility classes |
| Viewport meta update | `app/layout.tsx` | Metadata modification |
| Dashboard nav sticky | `app/(dashboard)/layout.tsx` | Conditional CSS |

**Rationale**: `usePWAMode` is a standalone concern reusable by any component (e.g., PullToRefresh and the nav back button both need it). `PullToRefresh` is a reusable interaction component with no feature-specific logic, making it an ideal common library addition. The back button logic is tightly coupled to the dashboard nav structure, so it's inline in the layout rather than a separate component.
