# API Contract: `QuantityControls` Component

**Purpose**: Reusable +/- button controls for quantity adjustments  
**Location**: `/components/common/QuantityControls.tsx`  
**Created**: December 29, 2025

---

## TypeScript Interface

```typescript
interface QuantityControlsProps {
  /**
   * Current quantity to display
   */
  quantity: number;

  /**
   * Callback when + button clicked
   */
  onIncrement: () => void;

  /**
   * Callback when - button clicked
   */
  onDecrement: () => void;

  /**
   * Whether controls are disabled (e.g., offline, loading)
   * @default false
   */
  disabled?: boolean;

  /**
   * Whether to show a loading indicator
   * @default false
   */
  isLoading?: boolean;

  /**
   * Whether to show a pending changes indicator
   * @default false
   */
  hasPendingChanges?: boolean;

  /**
   * Size variant for buttons
   * @default 'md'
   */
  size?: 'sm' | 'md' | 'lg';

  /**
   * Layout orientation
   * @default 'horizontal'
   */
  orientation?: 'horizontal' | 'vertical';

  /**
   * Whether to show the quantity display between buttons
   * @default true
   */
  showQuantity?: boolean;

  /**
   * Optional unit label (e.g., 'units', 'kg', 'bottles')
   */
  unit?: string;

  /**
   * Minimum quantity allowed (disables - button at this value)
   * @default 0
   */
  minQuantity?: number;

  /**
   * Maximum quantity allowed (disables + button at this value)
   */
  maxQuantity?: number;

  /**
   * Accessibility label for + button
   * @default 'Increase quantity'
   */
  incrementLabel?: string;

  /**
   * Accessibility label for - button
   * @default 'Decrease quantity'
   */
  decrementLabel?: string;

  /**
   * Custom className for container
   */
  className?: string;
}
```

---

## Component Behavior

### Visual States

1. **Default State**
   ```tsx
   <QuantityControls 
     quantity={5} 
     onIncrement={() => {}} 
     onDecrement={() => {}} 
   />
   // Shows: [−] 5 units [+]
   ```

2. **Loading State**
   ```tsx
   <QuantityControls 
     quantity={5} 
     isLoading={true}
     onIncrement={() => {}} 
     onDecrement={() => {}} 
   />
   // Shows: [−] 5 units ⌛ [+]
   // Buttons appear slightly dimmed but not fully disabled
   ```

3. **Pending Changes**
   ```tsx
   <QuantityControls 
     quantity={5} 
     hasPendingChanges={true}
     onIncrement={() => {}} 
     onDecrement={() => {}} 
   />
   // Shows: [−] 5 units* [+]
   // Asterisk or subtle icon indicates unsaved changes
   ```

4. **Disabled State**
   ```tsx
   <QuantityControls 
     quantity={5} 
     disabled={true}
     onIncrement={() => {}} 
     onDecrement={() => {}} 
   />
   // Shows: [−] 5 units [+]
   // Buttons grayed out, cursor not-allowed
   ```

5. **Min/Max Constraints**
   ```tsx
   <QuantityControls 
     quantity={0} 
     minQuantity={0}
     onIncrement={() => {}} 
     onDecrement={() => {}} 
   />
   // Shows: [−] 0 units [+]
   // Minus button disabled (at minimum)
   ```

### Size Variants

| Size | Button Height | Quantity Text | Use Case |
|------|---------------|---------------|----------|
| `sm` | 32px | text-sm | Inline in table rows |
| `md` | 44px | text-base | Default, inventory list |
| `lg` | 56px | text-lg | NFC page, touch-friendly |

### Orientation Layouts

**Horizontal** (default):
```
[−] 42 units [+]
```

**Vertical**:
```
    [+]
  42 units
    [−]
```

---

## Accessibility Requirements

### WCAG 2.1 AA Compliance

- **Touch Targets**: Minimum 44x44px (enforced in `md` and `lg` sizes)
- **Keyboard Navigation**: Both buttons focusable with Tab, activatable with Enter/Space
- **Screen Readers**: 
  - Buttons have `aria-label` with context (e.g., "Increase quantity of Milk")
  - Quantity display has `role="status"` for live updates
  - Loading state announced via `aria-live="polite"`
- **Color Contrast**: Text and icons meet 4.5:1 ratio minimum
- **Focus Indicators**: Visible focus ring on keyboard navigation

### ARIA Attributes

```tsx
<div role="group" aria-label="Quantity controls">
  <button
    aria-label={`${decrementLabel}. Current quantity: ${quantity}${unit ? ' ' + unit : ''}`}
    aria-disabled={disabled || quantity <= minQuantity}
    disabled={disabled || quantity <= minQuantity}
  >
    −
  </button>
  
  <span role="status" aria-live="polite">
    {quantity} {unit}
    {hasPendingChanges && <span className="sr-only">. Changes pending save.</span>}
    {isLoading && <span className="sr-only">. Saving...</span>}
  </span>
  
  <button
    aria-label={`${incrementLabel}. Current quantity: ${quantity}${unit ? ' ' + unit : ''}`}
    aria-disabled={disabled || (maxQuantity && quantity >= maxQuantity)}
    disabled={disabled || (maxQuantity && quantity >= maxQuantity)}
  >
    +
  </button>
</div>
```

---

## Styling & Theme Integration

### Theme Variables (from `lib/theme.ts`)

```typescript
// Uses existing theme tokens:
- Button background: theme.colors.primary / theme.colors.secondary
- Button text: theme.colors.text.default
- Disabled state: theme.colors.surface.elevated with reduced opacity
- Loading spinner: theme.colors.primary with animate-spin
- Pending indicator: theme.colors.warning
```

### CSS Classes (Tailwind)

```tsx
// Button base classes
const buttonClasses = cn(
  'inline-flex items-center justify-center',
  'font-medium rounded-md transition-colors',
  'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary',
  'disabled:opacity-50 disabled:cursor-not-allowed',
  // Size-specific
  size === 'sm' && 'h-8 w-8 text-sm',
  size === 'md' && 'h-11 w-11 text-base',
  size === 'lg' && 'h-14 w-14 text-lg',
  // State-specific
  !disabled && 'hover:bg-primary/90 active:bg-primary/80',
  disabled && 'bg-surface-elevated text-text-secondary'
);
```

---

## Usage Examples

### Example 1: Inventory List (Inline, Small)

```tsx
import { useQuantityDebounce } from '@/hooks/useQuantityDebounce';
import QuantityControls from '@/components/common/QuantityControls';

function InventoryListItem({ item, familyId }) {
  const { localQuantity, adjust, hasPendingChanges, isFlushing } = useQuantityDebounce({
    itemId: item.itemId,
    initialQuantity: item.quantity,
    onFlush: async (id, delta) => {
      const result = await api.adjustQuantity(familyId, id, delta);
      return result.quantity;
    },
  });

  return (
    <tr>
      <td>{item.name}</td>
      <td>
        <QuantityControls
          quantity={localQuantity}
          onIncrement={() => adjust(1)}
          onDecrement={() => adjust(-1)}
          size="sm"
          unit={item.unit}
          hasPendingChanges={hasPendingChanges}
          isLoading={isFlushing}
        />
      </td>
    </tr>
  );
}
```

### Example 2: NFC Page (Large, Touch-Friendly)

```tsx
function NFCAdjustmentPage({ urlId, initialQuantity }) {
  const isOnline = useOnlineStatus();
  const { localQuantity, adjust, hasPendingChanges, flush } = useQuantityDebounce({
    itemId: urlId,
    initialQuantity,
    onFlush: async (id, delta) => {
      const response = await fetch(`/api/adjust/${id}`, {
        method: 'POST',
        body: JSON.stringify({ delta }),
      });
      const data = await response.json();
      return data.newQuantity;
    },
  });

  // Flush on unmount
  useEffect(() => () => flush(), [flush]);

  return (
    <div className="flex flex-col items-center gap-6">
      <QuantityControls
        quantity={localQuantity}
        onIncrement={() => adjust(1)}
        onDecrement={() => adjust(-1)}
        size="lg"
        orientation="vertical"
        unit="units"
        disabled={!isOnline}
        hasPendingChanges={hasPendingChanges}
      />
      {!isOnline && (
        <p className="text-error text-sm">
          You are offline. Connect to the internet to adjust quantities.
        </p>
      )}
    </div>
  );
}
```

### Example 3: With Min/Max Constraints

```tsx
<QuantityControls
  quantity={localQuantity}
  onIncrement={() => adjust(1)}
  onDecrement={() => adjust(-1)}
  minQuantity={0}
  maxQuantity={100}
  size="md"
  unit="kg"
  incrementLabel="Add 1 kilogram"
  decrementLabel="Remove 1 kilogram"
/>
```

---

## Testing Requirements

### Unit Tests

```typescript
describe('QuantityControls', () => {
  it('renders with correct quantity', () => {});
  it('calls onIncrement when + clicked', () => {});
  it('calls onDecrement when - clicked', () => {});
  it('disables - button at minQuantity', () => {});
  it('disables + button at maxQuantity', () => {});
  it('shows loading indicator when isLoading', () => {});
  it('shows pending indicator when hasPendingChanges', () => {});
  it('applies disabled state correctly', () => {});
  it('renders with different size variants', () => {});
  it('renders with vertical orientation', () => {});
  it('includes unit label when provided', () => {});
  it('has accessible labels for screen readers', () => {});
  it('is keyboard navigable', () => {});
});
```

### Visual Regression Tests

- Screenshot tests for each size variant
- Dark mode vs light mode
- All visual states (default, loading, pending, disabled)

---

## Migration Path

### Phase 1: Create Component

1. Implement `QuantityControls.tsx` with full functionality
2. Write comprehensive unit tests
3. Document in Storybook (optional)

### Phase 2: Update NFC Page

1. Integrate `useQuantityDebounce` in `AdjustmentClient.tsx`
2. Replace custom buttons with `<QuantityControls>`
3. Update integration tests

### Phase 3: Update Inventory List

1. Add `useQuantityDebounce` to `InventoryList.tsx`
2. Replace "Adjust" button with inline `<QuantityControls>`
3. Remove `onAdjustQuantity` prop
4. Update parent component to remove modal handling

### Phase 4: Remove Legacy Code

1. Delete `AdjustQuantity.tsx` modal component
2. Remove modal-related tests
3. Update documentation

---

**Contract Status**: ✅ Complete  
**Implementation Ready**: Yes - Component can be implemented independently and integrated
