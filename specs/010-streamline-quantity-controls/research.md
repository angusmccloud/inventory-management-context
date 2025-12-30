# Research: Streamlined Quantity Adjustments

**Phase**: 0 (Outline & Research)  
**Date**: December 29, 2025  
**Feature**: [spec.md](./spec.md)

## Research Questions

1. What are the best practices for implementing debounce in React hooks?
2. How should we handle debounce cleanup on unmount and navigation?
3. What patterns exist for optimistic UI updates with rollback?
4. How to detect offline status and disable controls in Next.js?
5. How to flush pending debounced changes before navigation?

---

## 1. React Debounce Hook Best Practices

### Decision: Custom `useQuantityDebounce` Hook with `useRef` + `useEffect`

**Rationale**:
- `useRef` maintains timer reference across renders without causing re-renders
- `useEffect` cleanup function cancels pending timers on unmount
- Separate state for pending vs persisted quantity enables optimistic updates
- Returns both immediate state update and debounced flush function

**Pattern**:
```typescript
function useQuantityDebounce(
  itemId: string,
  initialQuantity: number,
  onFlush: (itemId: string, delta: number) => Promise<void>,
  delay: number = 500
) {
  const [pendingDelta, setPendingDelta] = useState(0);
  const [localQuantity, setLocalQuantity] = useState(initialQuantity);
  const timerRef = useRef<NodeJS.Timeout>();

  // Clear timer on unmount or itemId change
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [itemId]);

  const adjust = (delta: number) => {
    // Optimistic update
    setLocalQuantity(prev => prev + delta);
    setPendingDelta(prev => prev + delta);

    // Clear existing timer
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    // Set new timer
    timerRef.current = setTimeout(() => {
      flush();
    }, delay);
  };

  const flush = async () => {
    if (pendingDelta !== 0) {
      await onFlush(itemId, pendingDelta);
      setPendingDelta(0);
    }
  };

  return { localQuantity, pendingDelta, adjust, flush };
}
```

**Alternatives Considered**:
- **Lodash `_.debounce`**: Rejected because it doesn't integrate well with React's lifecycle and doesn't provide optimistic UI state
- **`useDeferredValue`**: Rejected because it's for deferring expensive computations, not for batching API calls
- **Library like `use-debounce`**: Rejected to minimize dependencies for such a focused use case

**References**:
- React Hooks documentation: https://react.dev/reference/react/useEffect
- React useRef best practices: https://react.dev/reference/react/useRef

---

## 2. Debounce Cleanup on Unmount and Navigation

### Decision: Use `useEffect` Cleanup + Explicit Flush on Navigation

**Rationale**:
- `useEffect` cleanup automatically cancels pending timers when component unmounts
- For intentional navigation, expose `flush()` function that components call before navigation
- Next.js `useRouter` events can trigger flush before route change
- `beforeunload` event can trigger flush for browser close/refresh

**Implementation Pattern**:
```typescript
// In component using the hook
const router = useRouter();
const { flush } = useQuantityDebounce(...);

useEffect(() => {
  // Flush on navigation
  const handleRouteChange = () => {
    flush();
  };

  router.events?.on('routeChangeStart', handleRouteChange);
  
  // Flush on browser close/refresh
  const handleBeforeUnload = (e: BeforeUnloadEvent) => {
    if (pendingDelta !== 0) {
      flush();
      e.preventDefault();
      e.returnValue = '';
    }
  };
  
  window.addEventListener('beforeunload', handleBeforeUnload);

  return () => {
    router.events?.off('routeChangeStart', handleRouteChange);
    window.removeEventListener('beforeunload', handleBeforeUnload);
  };
}, [flush, pendingDelta]);
```

**Edge Case Handling**:
- If flush is in-flight during unmount, let it complete (don't abort)
- If user navigates before flush completes, show loading indicator on destination page
- For rapid item switching in inventory list, flush previous item immediately when starting new adjustment

---

## 3. Optimistic UI Updates with Rollback

### Decision: Dual State Pattern (Local + Server)

**Rationale**:
- Maintain local "optimistic" quantity that updates immediately
- Keep separate "last known good" quantity from server
- On API success, sync local to server value
- On API failure, rollback local to last known good value

**Pattern**:
```typescript
const [localQuantity, setLocalQuantity] = useState(initialQuantity);
const [serverQuantity, setServerQuantity] = useState(initialQuantity);

const adjust = (delta: number) => {
  setLocalQuantity(prev => prev + delta); // Optimistic
  // ... debounce timer logic
};

const flush = async () => {
  try {
    const updated = await api.adjustQuantity(itemId, pendingDelta);
    setServerQuantity(updated.quantity); // Sync server state
    setLocalQuantity(updated.quantity);  // Sync local state
  } catch (error) {
    setLocalQuantity(serverQuantity);    // Rollback to last known good
    // Show error to user
  }
};
```

**Visual Feedback**:
- Show subtle indicator (e.g., faded text, spinner icon) when `pendingDelta !== 0`
- Show loading state when API call is in-flight
- Show error toast on failure with retry button

**Alternatives Considered**:
- **React Query / SWR mutations**: Rejected as overkill for this specific use case, though could be adopted project-wide later
- **Redux optimistic updates**: Rejected due to no global state management in current architecture

---

## 4. Offline Detection in Next.js

### Decision: Use Browser `navigator.onLine` + Event Listeners

**Rationale**:
- `navigator.onLine` provides immediate online/offline status
- `online` and `offline` events detect status changes in real-time
- Works in both SSR and CSR contexts (guard with `typeof window !== 'undefined'`)

**Implementation Pattern**:
```typescript
function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(
    typeof window !== 'undefined' ? navigator.onLine : true
  );

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return isOnline;
}
```

**Usage**:
```typescript
const isOnline = useOnlineStatus();

<button disabled={!isOnline || isLoading}>
  +
</button>

{!isOnline && (
  <div className="text-error">
    You are offline. Connect to the internet to adjust quantities.
  </div>
)}
```

**Limitations**:
- `navigator.onLine` can give false positives (reports online but no actual connectivity)
- For production, could enhance with periodic ping to API health endpoint
- Current solution sufficient for FR-013 requirement (disable buttons when offline)

---

## 5. Flush Pending Changes Before Navigation

### Decision: Combine Router Events + `beforeunload` + Explicit Flush

**Rationale**:
- Next.js App Router provides navigation events via `useRouter`
- `beforeunload` catches browser close/refresh
- Expose `flush()` function for manual calls before programmatic navigation
- Use async flush but don't block navigation (fire-and-forget)

**Implementation Strategy**:
```typescript
// Hook provides flush function
const { flush, hasPendingChanges } = useQuantityDebounce(...);

// Component sets up navigation guards
useEffect(() => {
  const router = useRouter();
  
  // Flush on route change
  const handleRouteChange = () => {
    if (hasPendingChanges) {
      flush(); // Fire-and-forget
    }
  };

  // Next.js App Router navigation
  router.events?.on('routeChangeStart', handleRouteChange);

  // Browser navigation
  const handleBeforeUnload = (e: BeforeUnloadEvent) => {
    if (hasPendingChanges) {
      flush();
      // Optionally warn user if change hasn't completed
      e.preventDefault();
      e.returnValue = '';
    }
  };

  window.addEventListener('beforeunload', handleBeforeUnload);

  return () => {
    router.events?.off('routeChangeStart', handleRouteChange);
    window.removeEventListener('beforeunload', handleBeforeUnload);
  };
}, [flush, hasPendingChanges, router]);
```

**Edge Cases**:
- **Rapid item switching**: When user adjusts item A then immediately adjusts item B, flush item A's changes synchronously before starting item B's debounce timer
- **Page refresh during API call**: Accept potential data loss; API is idempotent and user can retry
- **Programmatic navigation**: Caller must call `await flush()` before `router.push()`

---

## Technology Choices Summary

| Decision Point | Choice | Why |
|----------------|--------|-----|
| **Debounce Implementation** | Custom React hook with `useRef` + `useEffect` | Full control, lifecycle integration, optimistic UI support |
| **Timer Management** | `setTimeout` with ref cleanup | Standard, reliable, no external dependencies |
| **Optimistic Updates** | Dual state (local + server) | Simple rollback, clear separation of concerns |
| **Offline Detection** | `navigator.onLine` + event listeners | Browser standard, real-time updates |
| **Navigation Flush** | Router events + `beforeunload` | Catches all navigation scenarios |
| **State Management** | React `useState` + custom hook | No global state needed, keeps logic colocated |
| **Error Handling** | Try-catch with rollback + toast notification | Clear user feedback, preserves data integrity |

---

## Open Questions / Future Enhancements

1. **Question**: Should we add retry logic with exponential backoff for failed API calls?
   - **For now**: Simple retry button in error message (per FR-011)
   - **Future**: Consider exponential backoff if users report frequent transient failures

2. **Question**: Should we log debounced operations for analytics?
   - **For now**: No additional logging beyond standard API logs
   - **Future**: Could track "adjustments per session" metric for UX analysis

3. **Question**: Should we add haptic feedback on mobile devices for button presses?
   - **For now**: Out of scope (primarily web/desktop usage)
   - **Future**: Could add `navigator.vibrate()` for mobile browsers

---

**Research Status**: ✅ Complete  
**Ready for Phase 1**: Yes - All technical decisions made, ready to design contracts and quickstart
