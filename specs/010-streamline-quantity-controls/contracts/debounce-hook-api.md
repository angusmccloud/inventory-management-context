# API Contract: `useQuantityDebounce` Hook

**Purpose**: Reusable React hook for debouncing quantity adjustments with optimistic UI updates  
**Location**: `/hooks/useQuantityDebounce.ts`  
**Created**: December 29, 2025

---

## TypeScript Interface

```typescript
interface UseQuantityDebounceParams {
  /**
   * Unique identifier for the item being adjusted
   */
  itemId: string;

  /**
   * Initial quantity value from server
   */
  initialQuantity: number;

  /**
   * Callback to flush accumulated changes to server
   * @param itemId - ID of item being updated
   * @param delta - Net change in quantity (can be positive or negative)
   * @returns Promise resolving to new server quantity
   */
  onFlush: (itemId: string, delta: number) => Promise<number>;

  /**
   * Debounce delay in milliseconds
   * @default 500
   */
  delay?: number;
}

interface UseQuantityDebounceReturn {
  /**
   * Current local quantity (includes optimistic updates)
   */
  localQuantity: number;

  /**
   * Accumulated delta not yet flushed to server
   */
  pendingDelta: number;

  /**
   * Whether there are changes pending flush
   */
  hasPendingChanges: boolean;

  /**
   * Whether an API call is currently in flight
   */
  isFlushing: boolean;

  /**
   * Error from last flush attempt, if any
   */
  error: Error | null;

  /**
   * Adjust quantity by delta (positive or negative)
   * Updates local state immediately and schedules debounced flush
   */
  adjust: (delta: number) => void;

  /**
   * Immediately flush pending changes to server
   * Cancels any pending debounced flush
   * Safe to call multiple times (no-op if nothing pending)
   */
  flush: () => Promise<void>;

  /**
   * Retry last failed flush
   * Only available when error is not null
   */
  retry: () => Promise<void>;

  /**
   * Clear error state
   */
  clearError: () => void;
}

/**
 * Custom hook for debounced quantity adjustments
 * 
 * @example
 * ```tsx
 * const { localQuantity, adjust, hasPendingChanges, flush } = useQuantityDebounce({
 *   itemId: 'item-123',
 *   initialQuantity: 10,
 *   onFlush: async (itemId, delta) => {
 *     const result = await api.adjustQuantity(itemId, delta);
 *     return result.quantity;
 *   },
 *   delay: 500
 * });
 * 
 * // In component
 * <button onClick={() => adjust(1)}>+</button>
 * <span>{localQuantity}</span>
 * <button onClick={() => adjust(-1)}>-</button>
 * 
 * // Flush on navigation
 * useEffect(() => {
 *   return () => {
 *     if (hasPendingChanges) flush();
 *   };
 * }, [flush, hasPendingChanges]);
 * ```
 */
export function useQuantityDebounce(
  params: UseQuantityDebounceParams
): UseQuantityDebounceReturn;
```

---

## Behavior Specification

### 1. Optimistic Updates

- **Immediate feedback**: `localQuantity` updates instantly when `adjust()` is called
- **Accumulation**: Multiple `adjust()` calls accumulate in `pendingDelta` before flush
- **Net calculation**: `adjust(+3)` followed by `adjust(-1)` results in `pendingDelta = +2`

### 2. Debounce Timer

- **Reset on each adjust**: Each `adjust()` call resets the debounce timer
- **Delay default**: 500ms unless overridden in params
- **Auto-flush**: Timer automatically calls `flush()` when expired
- **Manual flush**: Calling `flush()` cancels pending timer and executes immediately

### 3. Server Synchronization

- **Success**: On successful flush, `pendingDelta` resets to 0, `localQuantity` syncs to server value
- **Failure**: On error, `localQuantity` rolls back to last known server value, `error` is set
- **Retry**: User can call `retry()` to attempt flush again with same `pendingDelta`

### 4. Lifecycle Management

- **Mount**: Initializes `localQuantity` from `initialQuantity` param
- **ItemId change**: Flushes pending changes for old itemId before switching to new item
- **Unmount**: Cancels pending timer but does NOT auto-flush (caller responsible)

### 5. Edge Cases

| Scenario | Behavior |
|----------|----------|
| Adjust to negative quantity | Allowed; validation should happen in `onFlush` callback or UI layer |
| Flush with `pendingDelta === 0` | No-op, returns immediately |
| Multiple simultaneous flush calls | Queued (second flush waits for first to complete) |
| ItemId changes mid-flush | Old flush completes, then switches to new item |
| Component unmounts mid-flush | Flush completes in background, state updates ignored |
| Network offline during adjust | Adjust continues optimistically; flush will fail and set error |

---

## Error Handling Contract

### Error States

```typescript
interface QuantityAdjustmentError extends Error {
  code: 'NETWORK_ERROR' | 'VALIDATION_ERROR' | 'AUTH_ERROR' | 'UNKNOWN_ERROR';
  retryable: boolean;
  originalDelta: number;
}
```

### Error Behavior

1. **Network Error**: `retryable: true`, user can click retry
2. **Validation Error** (e.g., negative quantity): `retryable: false`, rollback to server value
3. **Auth Error**: `retryable: false`, redirect to login (handled by parent component)
4. **Unknown Error**: `retryable: true`, user can retry

### Error Recovery

- Calling `retry()` attempts flush with original `pendingDelta`
- Calling `clearError()` dismisses error but does NOT retry
- New `adjust()` call clears error state

---

## Testing Requirements

### Unit Tests

1. **Debounce Timing**
   - Verify adjust() resets timer
   - Verify flush triggers after delay
   - Verify multiple adjusts accumulate

2. **Optimistic Updates**
   - Verify immediate localQuantity update
   - Verify rollback on error
   - Verify sync on success

3. **Lifecycle**
   - Verify timer cleanup on unmount
   - Verify flush on itemId change
   - Verify no memory leaks

4. **Error Handling**
   - Verify error state on flush failure
   - Verify retry functionality
   - Verify clearError resets state

### Integration Tests

1. **Component Integration**
   - Test with actual QuantityControls component
   - Verify UI updates match hook state
   - Verify navigation flush behavior

2. **API Integration**
   - Mock API calls with delays
   - Test concurrent adjustments
   - Test network failure scenarios

---

## Dependencies

- `react` (v18+): useState, useEffect, useRef, useCallback
- No external libraries required

---

## Migration Notes

### Existing Components to Update

1. **AdjustmentClient.tsx** (NFC page)
   - Replace direct state management with `useQuantityDebounce`
   - Remove existing debounce logic
   - Add flush on unmount

2. **InventoryList.tsx**
   - Remove `onAdjustQuantity` callback (no more modal)
   - Add inline +/- buttons using `useQuantityDebounce`
   - Each list item gets own hook instance

3. **AdjustQuantity.tsx** (modal)
   - Component will be deleted
   - Functionality absorbed into inline controls

---

## Performance Considerations

- **Memory**: Each item in list maintains own hook instance (~1KB per item)
- **Re-renders**: Hook uses `useCallback` to memoize adjust/flush functions
- **API Calls**: Debouncing reduces calls by ~80% for rapid adjustments (3 calls → 1 call)

---

**Contract Status**: ✅ Complete  
**Implementation Ready**: Yes - Ready for test-first development
