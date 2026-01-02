# Research: Inventory Management Dashboards

**Feature**: 014-inventory-dashboards  
**Date**: January 2, 2026  
**Phase**: 0 (Pre-Design Research)

## Overview

This document resolves technical unknowns identified in the planning phase, particularly around:
1. Dashboard ID format and security (similar to NFC URL IDs)
2. Location-based vs item-based dashboard query strategies
3. Debounced quantity adjustments for multiple items
4. Compact mobile UI layout for multiple items
5. Real-time synchronization across concurrent users

## Research Areas

### 1. Dashboard ID Format and Security

**Question**: Should dashboard IDs follow the same pattern as NFC URL IDs, or is a different format more appropriate for multi-item access?

**Decision**: Use familyId-encoded format: `{familyId}_{randomString}`

**Rationale**:
- Builds on successful NFC URL pattern from feature 006
- Encoding familyId in dashboard ID enables O(1) lookup without GSI
- 22-character random string provides 122 bits of entropy (UUID v4 equivalent)
- Family isolation enforced at URL level
- Example: `f47ac10b_7pQm3nX8kD5wZ2gS9YbN4`
- No additional DynamoDB index cost
- Consistent with infrastructure-as-code principle (avoid manual GSI creation)

**Implementation**:
```typescript
import { randomUUID } from 'crypto';

function generateDashboardId(familyId: string): string {
  const randomPart = uuidToBase62(randomUUID()); // 22 chars
  return `${familyId}_${randomPart}`;
}

function parseDashboardId(dashboardId: string): { familyId: string; randomPart: string } {
  const [familyId, randomPart] = dashboardId.split('_');
  if (!familyId || !randomPart) {
    throw new Error('Invalid dashboard ID format');
  }
  return { familyId, randomPart };
}

// Lookup dashboard without GSI
async function getDashboard(dashboardId: string): Promise<Dashboard | null> {
  const { familyId } = parseDashboardId(dashboardId);
  
  return await docClient.send(
    new GetCommand({
      TableName: TABLE_NAME,
      Key: {
        PK: `FAMILY#${familyId}`,
        SK: `DASHBOARD#${dashboardId}`
      }
    })
  );
}
```

**Alternatives Considered**:
- Pure random ID with GSI: Adds DynamoDB cost, more complex
- Sequential IDs: Guessable, security risk
- Same pattern as NFC (no familyId encoding): Requires GSI for family isolation

**References**:
- Feature 006 (NFC): Established base62 UUID pattern
- OWASP: Sufficient entropy requirements (>= 128 bits)
- AWS DynamoDB: GetItem is cheaper than Query with GSI

---

### 2. Location-Based vs Item-Based Dashboard Query Strategies

**Question**: What's the most efficient way to query items for location-based dashboards vs item-based dashboards?

**Decision**: Use different query strategies optimized for each type

**Location-Based Dashboard Query**:
```typescript
async function getLocationBasedItems(
  familyId: string,
  locationIds: string[]
): Promise<InventoryItem[]> {
  // Query all family items, filter by location
  const result = await docClient.send(
    new QueryCommand({
      TableName: TABLE_NAME,
      KeyConditionExpression: 'PK = :pk AND begins_with(SK, :sk)',
      FilterExpression: 'locationId IN (:loc1, :loc2, :loc3) AND #status = :status',
      ExpressionAttributeNames: {
        '#status': 'status'
      },
      ExpressionAttributeValues: {
        ':pk': `FAMILY#${familyId}`,
        ':sk': 'ITEM#',
        ':loc1': locationIds[0],
        ':loc2': locationIds[1],
        ':loc3': locationIds[2],
        ':status': 'active'
      }
    })
  );
  
  return result.Items as InventoryItem[];
}
```

**Item-Based Dashboard Query**:
```typescript
async function getItemBasedItems(
  familyId: string,
  itemIds: string[]
): Promise<InventoryItem[]> {
  // Use BatchGetItem for specific items
  const keys = itemIds.map(itemId => ({
    PK: `FAMILY#${familyId}`,
    SK: `ITEM#${itemId}`
  }));
  
  const result = await docClient.send(
    new BatchGetCommand({
      RequestItems: {
        [TABLE_NAME]: {
          Keys: keys
        }
      }
    })
  );
  
  const items = result.Responses?.[TABLE_NAME] as InventoryItem[] || [];
  
  // Filter out archived items
  return items.filter(item => item.status === 'active');
}
```

**Rationale**:
- Location-based: Query with filter is efficient when locationIds are small set (1-5 locations)
- Item-based: BatchGetItem is optimal for direct item lookups (up to 100 items, well within expected 5-20 range)
- Both strategies filter archived items to keep dashboard current
- Location-based provides "live" behavior (new items in location appear automatically)
- Item-based provides "static collection" behavior (only explicitly selected items)

**Performance Considerations**:
- Location-based: May scan many items if family has 100+ items, but acceptable for household use
- Item-based: O(N) where N = number of items on dashboard, very fast for typical 5-20 items
- Consider pagination if dashboards exceed 50 items
- Cache results for 30 seconds to reduce DynamoDB read costs

**Alternatives Considered**:
- Using GSI2 for location-based queries: Unnecessary complexity, filtering is sufficient
- Storing denormalized item list in dashboard: Would create data consistency issues

---

### 3. Debounced Quantity Adjustments for Multiple Items

**Question**: How do we handle debounced updates when users are rapidly adjusting multiple different items?

**Decision**: Per-item debounce with individual loading states

**Implementation Pattern**:
```typescript
// Frontend component state
interface DashboardState {
  items: DashboardItem[];
  pendingUpdates: Map<string, number>; // itemId -> pending quantity
  savingItems: Set<string>; // itemIds currently saving
}

// Debounce hook per item
function useQuantityDebounce(
  itemId: string,
  currentQuantity: number,
  onSave: (itemId: string, quantity: number) => Promise<void>
) {
  const [displayQuantity, setDisplayQuantity] = useState(currentQuantity);
  const [isSaving, setIsSaving] = useState(false);
  
  // Debounce timer per item
  const debouncedSave = useMemo(
    () => debounce(async (qty: number) => {
      setIsSaving(true);
      try {
        await onSave(itemId, qty);
      } finally {
        setIsSaving(false);
      }
    }, 500),
    [itemId, onSave]
  );
  
  const adjustQuantity = (delta: number) => {
    const newQty = Math.max(0, displayQuantity + delta);
    setDisplayQuantity(newQty);
    debouncedSave(newQty);
  };
  
  return { displayQuantity, adjustQuantity, isSaving };
}
```

**UI Feedback**:
- Each item card shows its own loading spinner during save
- Quantity displays immediately (optimistic UI)
- "+1" or "-1" badge briefly animates on button click
- Error state reverts quantity to last known value

**Rationale**:
- Independent debounce per item allows users to quickly adjust multiple items
- No need to wait for one item to save before adjusting another
- Optimistic UI provides immediate feedback
- Error handling per item prevents one failure from blocking others

**Alternatives Considered**:
- Global debounce: Would serialize all updates, poor UX for multi-item adjustments
- No debounce: Would create excessive API calls (one per button click)
- Batch updates: Complex state management, not needed for household usage

**References**:
- Feature 006 (NFC): Established debounce pattern for single-item adjustments
- Feature 010 (Streamline Quantity Controls): Quantity control UX patterns
- React useDebounce hooks: Common pattern for input debouncing

---

### 4. Compact Mobile UI Layout for Multiple Items

**Question**: How do we fit multiple items on mobile screens while maintaining usability (44px touch targets)?

**Decision**: Vertical card list with compact layout, ~80px height per item

**Layout Design**:
```
┌─────────────────────────────────────────┐
│ Dashboard Title                         │
│ 15 items                                │
├─────────────────────────────────────────┤
│ ┌─────────────────────────────────────┐ │
│ │ Paper Towels            3 rolls     │ │
│ │ [−]  3  [+]                         │ │  
│ └─────────────────────────────────────┘ │ <- 80px
│ ┌─────────────────────────────────────┐ │
│ │ Dish Soap               1 bottle   │ │
│ │ [−]  1  [+]                         │ │
│ └─────────────────────────────────────┘ │
│ ┌─────────────────────────────────────┐ │
│ │ Trash Bags              0 boxes    │ │
│ │ [−]  0  [+]            ⚠️ Low     │ │
│ └─────────────────────────────────────┘ │
│                                         │
└─────────────────────────────────────────┘
```

**Dimensions**:
- Item card height: 80px (vs NFC page: 200px)
- Font sizes: 
  - Item name: 16px (medium weight)
  - Quantity: 16px (regular weight)
  - Unit: 14px (light weight)
- Button size: 44px × 44px (WCAG AA touch target)
- Spacing: 8px between cards, 16px padding inside cards

**Responsive Breakpoints**:
- Mobile (< 640px): Single column, full width
- Tablet (640-1024px): Single column, max-width 600px centered
- Desktop (> 1024px): Single column, max-width 700px centered

**Virtualization for Large Lists**:
```typescript
// Use react-window for lists > 50 items
import { FixedSizeList } from 'react-window';

<FixedSizeList
  height={600}
  itemCount={items.length}
  itemSize={88} // 80px + 8px spacing
  width="100%"
>
  {({ index, style }) => (
    <div style={style}>
      <DashboardItemCard item={items[index]} />
    </div>
  )}
</FixedSizeList>
```

**Rationale**:
- 80px height allows 7-8 items visible on typical mobile screen (vs NFC's 2-3)
- 44px buttons meet WCAG AA accessibility requirements
- Compact design maintains readability while maximizing visible items
- Virtualization ensures smooth scrolling even with 100+ items
- Single column layout simplifies responsive design

**Alternatives Considered**:
- Grid layout: Wastes space on mobile, harder to scan vertically
- Horizontal scrolling: Poor UX for list-based data
- Accordion sections: Adds unnecessary interaction steps

**References**:
- Feature 011 (Mobile Responsive UI): Established mobile-first patterns
- WCAG 2.1 AA: Touch target size requirements (44×44px minimum)
- React Window: Efficient virtualization library

---

### 5. Real-Time Synchronization Across Concurrent Users

**Question**: How do we handle multiple users viewing the same dashboard and making concurrent adjustments?

**Decision**: Optimistic UI with polling-based refresh, DynamoDB conditional updates for consistency

**Implementation Strategy**:

**Backend - Atomic Updates**:
```typescript
async function adjustQuantity(
  familyId: string,
  itemId: string,
  delta: number
): Promise<number> {
  try {
    const result = await docClient.send(
      new UpdateCommand({
        TableName: TABLE_NAME,
        Key: {
          PK: `FAMILY#${familyId}`,
          SK: `ITEM#${itemId}`
        },
        UpdateExpression: 'SET quantity = if_not_exists(quantity, :zero) + :delta, updatedAt = :now',
        ConditionExpression: 'quantity + :delta >= :zero', // Prevent negative
        ExpressionAttributeValues: {
          ':delta': delta,
          ':zero': 0,
          ':now': new Date().toISOString()
        },
        ReturnValues: 'ALL_NEW'
      })
    );
    
    return result.Attributes?.quantity as number;
  } catch (err) {
    if (err.name === 'ConditionalCheckFailedException') {
      // Would go negative, return 0
      return 0;
    }
    throw err;
  }
}
```

**Frontend - Polling Refresh**:
```typescript
function DashboardView({ dashboardId }: Props) {
  const [items, setItems] = useState<DashboardItem[]>([]);
  const [lastRefresh, setLastRefresh] = useState(Date.now());
  
  // Refresh on window focus
  useEffect(() => {
    const handleFocus = () => {
      loadDashboardItems(dashboardId);
      setLastRefresh(Date.now());
    };
    
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [dashboardId]);
  
  // Optional: Poll every 30 seconds if tab is active
  useEffect(() => {
    const interval = setInterval(() => {
      if (document.visibilityState === 'visible') {
        loadDashboardItems(dashboardId);
      }
    }, 30000);
    
    return () => clearInterval(interval);
  }, [dashboardId]);
}
```

**Rationale**:
- DynamoDB conditional updates ensure atomic operations (no race conditions)
- Optimistic UI provides immediate feedback (no waiting for server)
- Refresh on focus catches changes made by other users
- 30-second polling is lightweight for household usage
- No WebSocket complexity needed for this use case

**Trade-offs**:
- Not truly real-time (30s lag possible)
- Acceptable for household inventory (not mission-critical)
- Simpler than WebSocket/SSE infrastructure
- Lower operational cost (no persistent connections)

**Alternatives Considered**:
- WebSockets with API Gateway: Complex, expensive, overkill for household use
- Server-Sent Events: Similar complexity to WebSocket
- Shorter polling interval (5s): Higher DynamoDB costs, marginal UX benefit

**References**:
- Feature 006 (NFC): Atomic update pattern with DynamoDB
- AWS DynamoDB: Conditional update expressions
- React useEffect: Focus and visibility detection patterns

---

## Summary of Decisions

| Area | Decision | Key Rationale |
|------|----------|---------------|
| Dashboard ID Format | `{familyId}_{randomString}` | O(1) lookup without GSI, family isolation |
| Location-Based Query | Query with filter | Simple, live-updating behavior |
| Item-Based Query | BatchGetItem | Fast O(N) lookups for selected items |
| Quantity Debounce | Per-item, 500ms delay | Independent updates, optimistic UI |
| Mobile Layout | Vertical list, 80px cards | 7-8 items visible, 44px touch targets |
| Virtualization | react-window for 50+ items | Smooth scrolling performance |
| Concurrent Updates | Atomic updates + polling | Simple, cost-effective, sufficient for household use |
| Real-Time Sync | Refresh on focus + 30s poll | Lightweight, no WebSocket complexity |

All decisions align with constitution principles: TypeScript strict typing, AWS best practices, performance optimization, and code organization patterns established in feature 006 (NFC).
