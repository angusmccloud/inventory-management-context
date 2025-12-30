# Developer Quickstart: Streamlined Quantity Adjustments

**Feature**: Debounced quantity controls with optimistic UI updates  
**Branch**: `010-streamline-quantity-controls`  
**Last Updated**: December 29, 2025

---

## 📋 Overview

This feature improves inventory quantity adjustment UX by:
1. **Debouncing** rapid +/- clicks into single API calls (500ms delay)
2. **Removing modal friction** by replacing the adjust dialog with inline controls
3. **Optimistic updates** for immediate visual feedback
4. **Offline handling** by disabling controls when no internet

---

## 🎯 What's Changing

### Before

**NFC Page** (`/app/t/[urlId]`):
- ✅ Had +/- buttons
- ❌ Each click made immediate API call
- ❌ No debouncing

**Inventory List** (`/app/dashboard/inventory`):
- ✅ Could adjust quantities
- ❌ Required opening a modal dialog
- ❌ Took 3 clicks (Adjust → +/− → Save)

### After

**NFC Page**:
- ✅ +/- buttons with 500ms debounce
- ✅ Optimistic UI updates
- ✅ Visual feedback (pending/saving states)

**Inventory List**:
- ✅ Inline +/- buttons (no modal!)
- ✅ Same debounce logic as NFC page
- ✅ Each item adjustable independently

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────┐
│  Component (InventoryList, NFC Page)    │
│  ┌───────────────────────────────────┐  │
│  │ useQuantityDebounce Hook          │  │
│  │ • Optimistic state                │  │
│  │ • Debounce timer (500ms)          │  │
│  │ • Error handling & retry          │  │
│  └───────────────┬───────────────────┘  │
│                  │                       │
│  ┌───────────────▼───────────────────┐  │
│  │  QuantityControls Component       │  │
│  │  • +/- buttons                    │  │
│  │  • Visual states (pending/saving) │  │
│  │  • Accessibility (WCAG 2.1 AA)    │  │
│  └───────────────────────────────────┘  │
└─────────────────┬───────────────────────┘
                  │
                  │ API Call (debounced)
                  ▼
┌─────────────────────────────────────────┐
│  Backend API (existing)                 │
│  PATCH /families/:id/inventory/:itemId/ │
│  quantity                               │
└─────────────────────────────────────────┘
```

---

## 🚀 Implementation Steps

### Step 1: Create `useQuantityDebounce` Hook

**File**: `/hooks/useQuantityDebounce.ts`

**Test First** (create `/tests/hooks/useQuantityDebounce.test.tsx`):
```typescript
import { renderHook, act, waitFor } from '@testing-library/react';
import { useQuantityDebounce } from '@/hooks/useQuantityDebounce';

describe('useQuantityDebounce', () => {
  it('accumulates adjustments before flushing', async () => {
    const onFlush = jest.fn().mockResolvedValue(15);
    const { result } = renderHook(() =>
      useQuantityDebounce({
        itemId: 'item-1',
        initialQuantity: 10,
        onFlush,
        delay: 500,
      })
    );

    // Rapid adjustments
    act(() => result.current.adjust(2));
    act(() => result.current.adjust(3));

    expect(result.current.localQuantity).toBe(15); // Optimistic
    expect(onFlush).not.toHaveBeenCalled(); // Not flushed yet

    // Wait for debounce
    await waitFor(() => expect(onFlush).toHaveBeenCalledWith('item-1', 5), {
      timeout: 600,
    });
  });

  it('rolls back on error', async () => {
    const onFlush = jest.fn().mockRejectedValue(new Error('Network error'));
    const { result } = renderHook(() =>
      useQuantityDebounce({
        itemId: 'item-1',
        initialQuantity: 10,
        onFlush,
        delay: 100,
      })
    );

    act(() => result.current.adjust(5));
    expect(result.current.localQuantity).toBe(15);

    await waitFor(() => expect(result.current.error).not.toBeNull());
    expect(result.current.localQuantity).toBe(10); // Rolled back
  });

  // Add more tests: flush on unmount, itemId change, retry, etc.
});
```

**Implementation**:
```typescript
// hooks/useQuantityDebounce.ts
import { useState, useRef, useEffect, useCallback } from 'react';

interface UseQuantityDebounceParams {
  itemId: string;
  initialQuantity: number;
  onFlush: (itemId: string, delta: number) => Promise<number>;
  delay?: number;
}

export function useQuantityDebounce({
  itemId,
  initialQuantity,
  onFlush,
  delay = 500,
}: UseQuantityDebounceParams) {
  const [localQuantity, setLocalQuantity] = useState(initialQuantity);
  const [serverQuantity, setServerQuantity] = useState(initialQuantity);
  const [pendingDelta, setPendingDelta] = useState(0);
  const [isFlushing, setIsFlushing] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  
  const timerRef = useRef<NodeJS.Timeout>();
  const previousItemIdRef = useRef(itemId);

  // Flush pending changes when itemId changes
  useEffect(() => {
    if (previousItemIdRef.current !== itemId && pendingDelta !== 0) {
      flush();
    }
    previousItemIdRef.current = itemId;
  }, [itemId]);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const flush = useCallback(async () => {
    if (pendingDelta === 0 || isFlushing) return;

    setIsFlushing(true);
    setError(null);

    try {
      const newQuantity = await onFlush(itemId, pendingDelta);
      setServerQuantity(newQuantity);
      setLocalQuantity(newQuantity);
      setPendingDelta(0);
    } catch (err) {
      setLocalQuantity(serverQuantity); // Rollback
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setIsFlushing(false);
    }
  }, [itemId, pendingDelta, serverQuantity, onFlush, isFlushing]);

  const adjust = useCallback((delta: number) => {
    setLocalQuantity(prev => prev + delta);
    setPendingDelta(prev => prev + delta);
    setError(null);

    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(flush, delay);
  }, [delay, flush]);

  const retry = useCallback(async () => {
    if (error && pendingDelta !== 0) {
      await flush();
    }
  }, [error, pendingDelta, flush]);

  return {
    localQuantity,
    pendingDelta,
    hasPendingChanges: pendingDelta !== 0,
    isFlushing,
    error,
    adjust,
    flush,
    retry,
    clearError: () => setError(null),
  };
}
```

**Run Tests**:
```bash
npm test -- useQuantityDebounce
```

---

### Step 2: Create `QuantityControls` Component

**File**: `/components/common/QuantityControls.tsx`

**Test First** (create `/tests/components/common/QuantityControls.test.tsx`):
```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import QuantityControls from '@/components/common/QuantityControls';

describe('QuantityControls', () => {
  it('renders quantity correctly', () => {
    render(
      <QuantityControls
        quantity={42}
        onIncrement={() => {}}
        onDecrement={() => {}}
      />
    );
    expect(screen.getByText('42')).toBeInTheDocument();
  });

  it('calls onIncrement when + clicked', () => {
    const onIncrement = jest.fn();
    render(
      <QuantityControls
        quantity={10}
        onIncrement={onIncrement}
        onDecrement={() => {}}
      />
    );
    fireEvent.click(screen.getByLabelText(/increase quantity/i));
    expect(onIncrement).toHaveBeenCalledTimes(1);
  });

  it('disables - button at minQuantity', () => {
    render(
      <QuantityControls
        quantity={0}
        minQuantity={0}
        onIncrement={() => {}}
        onDecrement={() => {}}
      />
    );
    expect(screen.getByLabelText(/decrease quantity/i)).toBeDisabled();
  });

  // Add more tests: loading state, pending state, accessibility
});
```

**Implementation**:
```tsx
// components/common/QuantityControls.tsx
'use client';

import { MinusIcon, PlusIcon } from '@heroicons/react/24/outline';
import { cn } from '@/lib/cn';

interface QuantityControlsProps {
  quantity: number;
  onIncrement: () => void;
  onDecrement: () => void;
  disabled?: boolean;
  isLoading?: boolean;
  hasPendingChanges?: boolean;
  size?: 'sm' | 'md' | 'lg';
  unit?: string;
  minQuantity?: number;
  maxQuantity?: number;
  className?: string;
}

export default function QuantityControls({
  quantity,
  onIncrement,
  onDecrement,
  disabled = false,
  isLoading = false,
  hasPendingChanges = false,
  size = 'md',
  unit,
  minQuantity = 0,
  maxQuantity,
  className,
}: QuantityControlsProps) {
  const isAtMin = quantity <= minQuantity;
  const isAtMax = maxQuantity !== undefined && quantity >= maxQuantity;

  const buttonSize = {
    sm: 'h-8 w-8 text-sm',
    md: 'h-11 w-11 text-base',
    lg: 'h-14 w-14 text-lg',
  }[size];

  return (
    <div
      role="group"
      aria-label="Quantity controls"
      className={cn('inline-flex items-center gap-2', className)}
    >
      <button
        onClick={onDecrement}
        disabled={disabled || isAtMin}
        aria-label={`Decrease quantity. Current: ${quantity}${unit ? ' ' + unit : ''}`}
        className={cn(
          'inline-flex items-center justify-center rounded-md font-medium',
          'transition-colors focus:outline-none focus:ring-2 focus:ring-primary',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          buttonSize,
          !disabled && !isAtMin && 'bg-secondary hover:bg-secondary/90 text-white'
        )}
      >
        <MinusIcon className="h-5 w-5" />
      </button>

      <span
        role="status"
        aria-live="polite"
        className={cn('min-w-[4rem] text-center font-semibold', {
          'text-sm': size === 'sm',
          'text-base': size === 'md',
          'text-lg': size === 'lg',
        })}
      >
        {quantity} {unit}
        {hasPendingChanges && (
          <>
            <span aria-label="Changes pending">*</span>
            <span className="sr-only">Changes pending save</span>
          </>
        )}
        {isLoading && <span className="sr-only">Saving...</span>}
      </span>

      <button
        onClick={onIncrement}
        disabled={disabled || isAtMax}
        aria-label={`Increase quantity. Current: ${quantity}${unit ? ' ' + unit : ''}`}
        className={cn(
          'inline-flex items-center justify-center rounded-md font-medium',
          'transition-colors focus:outline-none focus:ring-2 focus:ring-primary',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          buttonSize,
          !disabled && !isAtMax && 'bg-primary hover:bg-primary/90 text-white'
        )}
      >
        <PlusIcon className="h-5 w-5" />
      </button>
    </div>
  );
}
```

**Run Tests**:
```bash
npm test -- QuantityControls
```

---

### Step 3: Update NFC Page (`/app/t/[urlId]/AdjustmentClient.tsx`)

**Changes**:
1. Import `useQuantityDebounce` and `QuantityControls`
2. Replace direct state management with hook
3. Add flush on unmount
4. Replace custom buttons with `<QuantityControls>`

**Implementation**:
```tsx
// app/t/[urlId]/AdjustmentClient.tsx
'use client';

import { useEffect } from 'react';
import { useQuantityDebounce } from '@/hooks/useQuantityDebounce';
import { useOnlineStatus } from '@/hooks/useOnlineStatus'; // Create this
import QuantityControls from '@/components/common/QuantityControls';

export default function AdjustmentClient({ urlId, initialQuantity, apiBaseUrl }) {
  const isOnline = useOnlineStatus();
  
  const { 
    localQuantity, 
    adjust, 
    hasPendingChanges, 
    isFlushing,
    error,
    retry,
    flush 
  } = useQuantityDebounce({
    itemId: urlId,
    initialQuantity,
    onFlush: async (id, delta) => {
      const response = await fetch(`${apiBaseUrl}/api/adjust/${id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ delta }),
      });
      if (!response.ok) throw new Error('Adjustment failed');
      const data = await response.json();
      return data.newQuantity;
    },
  });

  // Flush on unmount
  useEffect(() => () => flush(), [flush]);

  return (
    <div className="space-y-6">
      <div className="bg-surface-elevated rounded-lg p-6">
        <p className="text-sm text-text-default uppercase tracking-wide mb-2">
          Current Quantity
        </p>
        <p className="text-4xl font-bold text-text-secondary">
          {localQuantity}
        </p>
      </div>

      {error && (
        <div className="bg-error/10 border border-error rounded-lg p-4">
          <p className="text-error">{error.message}</p>
          <button
            onClick={retry}
            className="mt-2 text-sm underline text-error"
          >
            Retry
          </button>
        </div>
      )}

      {!isOnline && (
        <div className="bg-warning/10 border border-warning rounded-lg p-4">
          <p className="text-warning">
            You are offline. Connect to the internet to adjust quantities.
          </p>
        </div>
      )}

      <QuantityControls
        quantity={localQuantity}
        onIncrement={() => adjust(1)}
        onDecrement={() => adjust(-1)}
        size="lg"
        disabled={!isOnline}
        isLoading={isFlushing}
        hasPendingChanges={hasPendingChanges}
      />
    </div>
  );
}
```

---

### Step 4: Update Inventory List

**Changes**:
1. Remove `onAdjustQuantity` prop and modal handling
2. Add inline `<QuantityControls>` to each list item
3. Each item gets its own `useQuantityDebounce` instance

**Implementation**:
```tsx
// components/inventory/InventoryList.tsx
'use client';

import { useQuantityDebounce } from '@/hooks/useQuantityDebounce';
import QuantityControls from '@/components/common/QuantityControls';
import { adjustInventoryQuantity } from '@/lib/api/inventory';

function InventoryListItem({ item, familyId, isAdmin }) {
  const {
    localQuantity,
    adjust,
    hasPendingChanges,
    isFlushing,
  } = useQuantityDebounce({
    itemId: item.itemId,
    initialQuantity: item.quantity,
    onFlush: async (itemId, delta) => {
      const updated = await adjustInventoryQuantity(familyId, itemId, {
        adjustment: delta,
      });
      return updated.quantity;
    },
  });

  return (
    <li className="px-4 py-4 sm:px-6 hover:bg-surface-elevated">
      <div className="flex items-center justify-between">
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-medium">{item.name}</h3>
          <p className="text-sm text-text-secondary">
            {item.locationName && `Location: ${item.locationName}`}
          </p>
        </div>
        
        <div className="ml-4 flex items-center gap-4">
          {/* Inline quantity controls (admins only) */}
          {isAdmin && (
            <QuantityControls
              quantity={localQuantity}
              onIncrement={() => adjust(1)}
              onDecrement={() => adjust(-1)}
              size="sm"
              unit={item.unit}
              hasPendingChanges={hasPendingChanges}
              isLoading={isFlushing}
            />
          )}
          
          {/* Other buttons: Edit, Archive, etc. */}
        </div>
      </div>
    </li>
  );
}
```

---

### Step 5: Delete `AdjustQuantity` Modal

**Files to Remove**:
- `/components/inventory/AdjustQuantity.tsx`
- `/tests/components/inventory/AdjustQuantity.test.tsx`

**Files to Update** (remove modal references):
- `/app/dashboard/inventory/page.tsx` - Remove modal state and `onAdjustQuantity` handler

---

## ✅ Testing Checklist

### Unit Tests
- [ ] `useQuantityDebounce` hook tests pass
- [ ] `QuantityControls` component tests pass
- [ ] Coverage >80% for new code

### Integration Tests
- [ ] NFC page adjustments debounce correctly
- [ ] Inventory list inline controls work
- [ ] Error states display and retry works
- [ ] Offline detection disables controls

### Manual Testing
- [ ] Rapid clicks (+5 times) result in 1 API call
- [ ] Visual feedback shows pending/saving states
- [ ] Navigation flushes pending changes
- [ ] Offline banner appears when disconnected
- [ ] Modal is completely removed from inventory page
- [ ] Accessibility: keyboard navigation works
- [ ] Accessibility: screen reader announcements correct

---

## 🐛 Common Issues & Solutions

### Issue: Debounce not working
**Symptom**: Multiple API calls still happening  
**Solution**: Check that `delay` param is set correctly and `useRef` is maintaining timer reference

### Issue: State not updating
**Symptom**: Quantity doesn't change on click  
**Solution**: Verify `adjust()` is being called and `localQuantity` is being used in UI (not `serverQuantity`)

### Issue: Infinite re-renders
**Symptom**: Component keeps re-rendering  
**Solution**: Ensure `onFlush` callback is wrapped in `useCallback` in parent component

### Issue: Changes lost on navigation
**Symptom**: Pending changes not saved when user navigates away  
**Solution**: Add flush call in `useEffect` cleanup function

---

## 📚 Further Reading

- [React Hooks Best Practices](https://react.dev/reference/react)
- [Debouncing in React](https://www.patterns.dev/posts/debounce-pattern)
- [WCAG 2.1 Touch Target Guidelines](https://www.w3.org/WAI/WCAG21/Understanding/target-size.html)
- [Feature Spec](./spec.md)
- [Hook Contract](./contracts/debounce-hook-api.md)
- [Component Contract](./contracts/quantity-controls-component.md)

---

**Ready to Implement?** Start with Step 1 (hook + tests), then iterate through each step sequentially.
