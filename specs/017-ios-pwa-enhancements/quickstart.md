# Quickstart: 017-ios-pwa-enhancements

**Feature**: iOS PWA Mobile Experience Enhancements  
**Date**: 2026-02-21

---

## Setup

No backend changes. No new dependencies. All work is in `inventory-management-frontend`.

```bash
cd inventory-management-frontend
npm install   # no new packages required
npm run dev   # start dev server
```

---

## Testing in iOS PWA Mode

### Recommended: iOS Simulator (Xcode)

1. Open Xcode → Simulator → Choose an iPhone model (e.g., iPhone 15 Pro)
2. Open Safari in the Simulator
3. Navigate to your dev server (use your Mac's local IP, e.g., `http://192.168.x.x:3000`)
4. Tap Share → "Add to Home Screen"
5. Open the app from the Simulator home screen
6. `window.navigator.standalone` is now `true`

### Alternative: Real iOS Device

1. Ensure your Mac and iPhone are on the same WiFi network
2. Open Safari on iPhone, navigate to `http://<your-mac-ip>:3000`
3. Share → "Add to Home Screen" → Open

### Simulating in Chrome DevTools (Partial)

Chrome DevTools can simulate `(display-mode: standalone)` CSS media query but does NOT set `window.navigator.standalone = true`. Use this only for CSS/layout testing, not for PWA mode detection logic.

---

## Key Files

| File | What Changes |
|------|-------------|
| `app/layout.tsx` | Viewport `viewport-fit=cover` + updated `themeColor` |
| `app/globals.css` | Safe-area utility CSS classes |
| `app/(dashboard)/layout.tsx` | Sticky nav + back button in PWA mode |
| `hooks/usePWAMode.ts` | **New** — detects iOS standalone mode |
| `components/common/PullToRefresh/` | **New** — pull-to-refresh common component |
| each page that has server data | Wrap content with `<PullToRefresh>` |

---

## Implementation Checklist

### Step 1 — Viewport & Safe Area Foundation

- [ ] Add `viewport-fit=cover` to viewport metadata in `app/layout.tsx`
- [ ] Update `themeColor` from `#FFFFFF` to brand primary colors (light + dark)
- [ ] Add `.safe-top` and `.safe-bottom` utility classes in `app/globals.css`

### Step 2 — `usePWAMode` Hook

- [ ] Create `hooks/usePWAMode.ts`
- [ ] Export `{ isPWA, isReady }` state
- [ ] Handle SSR safely (return `false` until mounted)
- [ ] Write unit tests: `hooks/usePWAMode.test.ts`

### Step 3 — Sticky Nav with Back Button

- [ ] Import and use `usePWAMode` in `app/(dashboard)/layout.tsx`
- [ ] Add `sticky top-0 z-50` CSS to `<nav>` when `isPWA === true`
- [ ] Add `safe-top` padding to nav when `isPWA === true`
- [ ] Add compensating top padding to `<main>` to prevent content hiding
- [ ] Extract set of root paths from `getNavigationItems()` utility
- [ ] Render back button in nav when `isPWA && !isRootPage(pathname)`
- [ ] Implement `handleBack()` with history fallback logic
- [ ] Write tests for back button visibility logic

### Step 4 — `PullToRefresh` Component

- [ ] Create `components/common/PullToRefresh/PullToRefresh.tsx`
- [ ] Create `components/common/PullToRefresh/PullToRefresh.types.ts`
- [ ] Create `components/common/PullToRefresh/index.ts`
- [ ] Implement pointer-event gesture detection
- [ ] Add loading indicator animation
- [ ] Export from `components/common/index.ts`
- [ ] Write unit tests: `components/common/PullToRefresh/PullToRefresh.test.tsx`

### Step 5 — Wire Up Pull-to-Refresh on Data Pages

- [ ] Inventory page (`app/(dashboard)/inventory/page.tsx` or similar)
- [ ] Shopping List page
- [ ] Dashboard page
- [ ] Members page
- [ ] Suggestions page
  - Wrap page content with `<PullToRefresh onRefresh={refetchData}>`
  - Only render inside `{isPWA && <PullToRefresh>}`

### Step 6 — Pre-Completion Checks

```bash
cd inventory-management-frontend
npx tsc --noEmit    # zero TypeScript errors required
npm run build       # production build must succeed
npm test            # all tests must pass
npm run lint        # no lint errors
```

---

## Useful References

- [Apple: Configuring Web Applications for iPhone](https://developer.apple.com/library/archive/documentation/AppleApplications/Reference/SafariWebContent/ConfiguringWebApplications/ConfiguringWebApplications.html)
- [MDN: CSS env() — safe-area-inset-*](https://developer.mozilla.org/en-US/docs/Web/CSS/env)
- [MDN: viewport-fit](https://developer.mozilla.org/en-US/docs/Web/HTML/Viewport_meta_tag#viewport-fit)
- [Next.js: viewport metadata](https://nextjs.org/docs/app/api-reference/functions/generate-viewport)
