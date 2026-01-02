# Quickstart Guide: Inventory Management Dashboards

**Feature**: 014-inventory-dashboards  
**Date**: January 2, 2026  
**Prerequisites**: Feature 001 (MVP), Feature 005 (Reference Data), Feature 006 (NFC)

## Overview

This guide provides implementation patterns for building the Inventory Management Dashboards feature. Dashboards allow families to create shareable web pages displaying multiple inventory items with manual quantity adjustment controls.

## Key Architectural Patterns

### 1. Dashboard ID Format with Family Isolation

Dashboard IDs encode the familyId to enable O(1) lookups without a GSI.

**Generation**:
```typescript
import { randomUUID } from 'crypto';
import { uuidToBase62 } from '../lib/encoding';

function generateDashboardId(familyId: string): string {
  const randomPart = uuidToBase62(randomUUID()); // 22 chars
  return `${familyId}_${randomPart}`;
}

// Example: f47ac10b-58cc-4372-a567-0e02b2c3d479_7pQm3nX8kD5wZ2gS9YbN4
```

**Parsing and Lookup**:
```typescript
function parseDashboardId(dashboardId: string): { familyId: string; randomPart: string } {
  const [familyId, randomPart] = dashboardId.split('_');
  
  if (!familyId || !randomPart || randomPart.length !== 22) {
    throw new Error('Invalid dashboard ID format');
  }
  
  return { familyId, randomPart };
}

// O(1) lookup without GSI
async function getDashboardById(dashboardId: string): Promise<Dashboard | null> {
  const { familyId } = parseDashboardId(dashboardId);
  
  const result = await docClient.send(
    new GetCommand({
      TableName: TABLE_NAME,
      Key: {
        PK: `FAMILY#${familyId}`,
        SK: `DASHBOARD#${dashboardId}`
      }
    })
  );
  
  const dashboard = result.Item as Dashboard | undefined;
  
  // Return null for inactive dashboards
  if (dashboard && !dashboard.isActive) {
    return null;
  }
  
  return dashboard || null;
}
```

---

### 2. Type-Specific Dashboard Queries

Location-based and item-based dashboards use different query strategies.

**Location-Based Dashboard**:
```typescript
async function getLocationBasedItems(
  familyId: string,
  locationIds: string[]
): Promise<InventoryItem[]> {
  // Build dynamic filter for multiple locations
  const locationPlaceholders = locationIds.map((_, i) => `:loc${i}`).join(', ');
  const locationValues = Object.fromEntries(
    locationIds.map((id, i) => [`:loc${i}`, id])
  );
  
  const result = await docClient.send(
    new QueryCommand({
      TableName: TABLE_NAME,
      KeyConditionExpression: 'PK = :pk AND begins_with(SK, :sk)',
      FilterExpression: `locationId IN (${locationPlaceholders}) AND #status = :status`,
      ExpressionAttributeNames: {
        '#status': 'status'
      },
      ExpressionAttributeValues: {
        ':pk': `FAMILY#${familyId}`,
        ':sk': 'ITEM#',
        ':status': 'active',
        ...locationValues
      }
    })
  );
  
  return (result.Items as InventoryItem[]).sort((a, b) => 
    a.name.localeCompare(b.name)
  );
}
```

**Item-Based Dashboard**:
```typescript
async function getItemBasedItems(
  familyId: string,
  itemIds: string[]
): Promise<InventoryItem[]> {
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
  
  const items = (result.Responses?.[TABLE_NAME] as InventoryItem[]) || [];
  
  // Filter active items and sort
  return items
    .filter(item => item.status === 'active')
    .sort((a, b) => a.name.localeCompare(b.name));
}
```

---

### 3. Atomic Quantity Adjustments

Reuse the existing inventory adjustment pattern from Feature 006 (NFC).

**Backend Service**:
```typescript
import { InventoryService } from './inventoryService';

export class DashboardService {
  static async adjustItemQuantity(
    familyId: string,
    itemId: string,
    adjustment: number
  ): Promise<{ newQuantity: number; message: string }> {
    // Delegate to existing inventory service
    const result = await InventoryService.adjustQuantity(
      familyId,
      itemId,
      adjustment
    );
    
    const action = adjustment > 0 ? 'Added' : 'Took';
    const absAdjustment = Math.abs(adjustment);
    
    return {
      newQuantity: result.newQuantity,
      message: `${action} ${absAdjustment} ${result.itemName} — now ${result.newQuantity}`
    };
  }
}
```

**Lambda Handler**:
```typescript
export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  // Warmup support
  if (handleWarmup(event, context)) {
    return warmupResponse();
  }
  
  const dashboardId = event.pathParameters?.dashboardId;
  const itemId = event.pathParameters?.itemId;
  const body = JSON.parse(event.body || '{}');
  
  // Validate dashboard exists and is active
  const dashboard = await DashboardModel.getById(dashboardId);
  if (!dashboard || !dashboard.isActive) {
    return errorResponse(404, 'DASHBOARD_NOT_FOUND', 'Dashboard not found or inactive');
  }
  
  // Adjust quantity
  const result = await DashboardService.adjustItemQuantity(
    dashboard.familyId,
    itemId,
    body.adjustment
  );
  
  return successResponse(200, result);
};
```

---

### 4. Per-Item Debounced Updates (Frontend)

Each item has independent debounce logic for concurrent adjustments.

**Custom Hook**:
```typescript
import { useState, useEffect, useMemo } from 'react';
import { debounce } from 'lodash';

interface UseQuantityDebounceProps {
  itemId: string;
  initialQuantity: number;
  onSave: (itemId: string, quantity: number) => Promise<void>;
  debounceMs?: number;
}

export function useQuantityDebounce({
  itemId,
  initialQuantity,
  onSave,
  debounceMs = 500
}: UseQuantityDebounceProps) {
  const [displayQuantity, setDisplayQuantity] = useState(initialQuantity);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Update display when initial changes (from server refresh)
  useEffect(() => {
    setDisplayQuantity(initialQuantity);
  }, [initialQuantity]);
  
  // Debounced save function
  const debouncedSave = useMemo(
    () => debounce(async (qty: number) => {
      setIsSaving(true);
      setError(null);
      
      try {
        await onSave(itemId, qty);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to save');
        setDisplayQuantity(initialQuantity); // Revert on error
      } finally {
        setIsSaving(false);
      }
    }, debounceMs),
    [itemId, onSave, debounceMs, initialQuantity]
  );
  
  const adjustQuantity = (delta: number) => {
    const newQty = Math.max(0, displayQuantity + delta);
    setDisplayQuantity(newQty);
    debouncedSave(newQty);
  };
  
  return {
    displayQuantity,
    adjustQuantity,
    isSaving,
    error
  };
}
```

**Component Usage**:
```typescript
export function DashboardItemCard({ item, dashboardId }: Props) {
  const { displayQuantity, adjustQuantity, isSaving, error } = useQuantityDebounce({
    itemId: item.itemId,
    initialQuantity: item.quantity,
    onSave: async (itemId, quantity) => {
      const adjustment = quantity - item.quantity;
      await adjustItemQuantity(dashboardId, itemId, adjustment);
    }
  });
  
  return (
    <div className="p-4 bg-surface rounded-lg">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="font-medium text-text-default">{item.name}</h3>
          <p className="text-sm text-text-secondary">
            {displayQuantity} {item.unit || 'items'}
            {item.isLowStock && <span className="ml-2 text-warning">⚠️ Low</span>}
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            onClick={() => adjustQuantity(-1)}
            disabled={isSaving || displayQuantity === 0}
            size="lg"
            aria-label="Decrease quantity"
          >
            −
          </Button>
          
          <span className="text-lg font-semibold w-12 text-center">
            {displayQuantity}
          </span>
          
          <Button
            onClick={() => adjustQuantity(1)}
            disabled={isSaving}
            size="lg"
            aria-label="Increase quantity"
          >
            +
          </Button>
        </div>
      </div>
      
      {isSaving && (
        <div className="mt-2 text-xs text-text-secondary flex items-center gap-1">
          <LoadingSpinner size="sm" />
          Saving...
        </div>
      )}
      
      {error && (
        <div className="mt-2 text-xs text-error">{error}</div>
      )}
    </div>
  );
}
```

---

### 5. Dashboard URL Rotation Pattern

Similar to NFC URL rotation from Feature 006.

```typescript
export class DashboardService {
  static async rotateDashboard(
    dashboardId: string,
    rotatedBy: string
  ): Promise<{ oldDashboard: Dashboard; newDashboard: Dashboard }> {
    const oldDashboard = await DashboardModel.getById(dashboardId);
    
    if (!oldDashboard) {
      throw new Error('Dashboard not found');
    }
    
    if (!oldDashboard.isActive) {
      throw new Error('Dashboard is already inactive');
    }
    
    // Deactivate old dashboard
    await DashboardModel.deactivate(dashboardId, rotatedBy);
    
    // Create new dashboard with same config
    const newDashboard = await DashboardModel.create({
      familyId: oldDashboard.familyId,
      title: oldDashboard.title,
      type: oldDashboard.type,
      locationIds: oldDashboard.locationIds,
      itemIds: oldDashboard.itemIds,
      createdBy: rotatedBy
    });
    
    return { oldDashboard, newDashboard };
  }
}
```

---

### 6. Mobile-Responsive Dashboard Layout

Compact vertical card list optimized for mobile screens.

```tsx
export function DashboardView({ dashboardId }: Props) {
  const [dashboard, setDashboard] = useState<PublicDashboard | null>(null);
  const [items, setItems] = useState<DashboardItem[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    loadDashboard();
    
    // Refresh on window focus
    const handleFocus = () => loadDashboard();
    window.addEventListener('focus', handleFocus);
    
    return () => window.removeEventListener('focus', handleFocus);
  }, [dashboardId]);
  
  const loadDashboard = async () => {
    setLoading(true);
    try {
      const data = await getDashboardPublic(dashboardId);
      setDashboard(data.dashboard);
      setItems(data.items);
    } catch (error) {
      // Handle 404/410 errors
    } finally {
      setLoading(false);
    }
  };
  
  if (loading) {
    return <LoadingSpinner />;
  }
  
  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-text-default">
            {dashboard?.title}
          </h1>
          <p className="text-sm text-text-secondary">
            {items.length} items
          </p>
        </div>
        
        {/* Item List */}
        <div className="space-y-3">
          {items.map(item => (
            <DashboardItemCard
              key={item.itemId}
              item={item}
              dashboardId={dashboardId}
            />
          ))}
        </div>
        
        {items.length === 0 && (
          <div className="text-center py-12 text-text-secondary">
            No items available
          </div>
        )}
      </div>
    </div>
  );
}
```

**Responsive CSS**:
```css
/* Mobile (default) */
.dashboard-item-card {
  height: 80px; /* Compact for mobile */
}

/* Tablet and above */
@media (min-width: 640px) {
  .dashboard-view {
    max-width: 600px;
    margin: 0 auto;
  }
}

/* Desktop */
@media (min-width: 1024px) {
  .dashboard-view {
    max-width: 700px;
  }
}
```

---

### 7. Virtualized List for Large Dashboards

Use react-window for dashboards with 50+ items.

```tsx
import { FixedSizeList } from 'react-window';

export function DashboardView({ dashboardId, items }: Props) {
  const ITEM_SIZE = 88; // 80px + 8px spacing
  
  if (items.length > 50) {
    // Virtualized list for performance
    return (
      <FixedSizeList
        height={600}
        itemCount={items.length}
        itemSize={ITEM_SIZE}
        width="100%"
      >
        {({ index, style }) => (
          <div style={style}>
            <DashboardItemCard
              item={items[index]}
              dashboardId={dashboardId}
            />
          </div>
        )}
      </FixedSizeList>
    );
  }
  
  // Standard list for smaller dashboards
  return (
    <div className="space-y-3">
      {items.map(item => (
        <DashboardItemCard
          key={item.itemId}
          item={item}
          dashboardId={dashboardId}
        />
      ))}
    </div>
  );
}
```

---

## Testing Patterns

### Unit Tests - Dashboard ID Generation

```typescript
describe('generateDashboardId', () => {
  it('should generate valid dashboard ID format', () => {
    const familyId = 'f47ac10b-58cc-4372-a567-0e02b2c3d479';
    const dashboardId = generateDashboardId(familyId);
    
    expect(dashboardId).toMatch(/^[a-f0-9-]{36}_[a-zA-Z0-9]{22}$/);
    expect(dashboardId).toStartWith(familyId);
  });
  
  it('should parse dashboard ID correctly', () => {
    const dashboardId = 'f47ac10b-58cc-4372-a567-0e02b2c3d479_7pQm3nX8kD5wZ2gS9YbN4';
    const { familyId, randomPart } = parseDashboardId(dashboardId);
    
    expect(familyId).toBe('f47ac10b-58cc-4372-a567-0e02b2c3d479');
    expect(randomPart).toBe('7pQm3nX8kD5wZ2gS9YbN4');
    expect(randomPart.length).toBe(22);
  });
});
```

### Integration Tests - Dashboard CRUD

```typescript
describe('Dashboard API', () => {
  it('should create location-based dashboard', async () => {
    const response = await request(app)
      .post('/api/dashboards')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        title: 'Pantry Inventory',
        type: 'location',
        locationIds: ['loc-123', 'loc-456']
      });
    
    expect(response.status).toBe(201);
    expect(response.body.data.dashboardId).toMatch(/^[a-f0-9-]{36}_[a-zA-Z0-9]{22}$/);
    expect(response.body.data.title).toBe('Pantry Inventory');
    expect(response.body.data.isActive).toBe(true);
  });
  
  it('should prevent non-admin from creating dashboard', async () => {
    const response = await request(app)
      .post('/api/dashboards')
      .set('Authorization', `Bearer ${suggesterToken}`)
      .send({
        title: 'Test Dashboard',
        type: 'location',
        locationIds: ['loc-123']
      });
    
    expect(response.status).toBe(403);
  });
});
```

### Component Tests - Item Card

```typescript
describe('DashboardItemCard', () => {
  it('should adjust quantity on button click', async () => {
    const mockOnSave = jest.fn().mockResolvedValue(undefined);
    
    render(
      <DashboardItemCard
        item={{
          itemId: 'item-123',
          name: 'Paper Towels',
          quantity: 3,
          lowStockThreshold: 2,
          isLowStock: false
        }}
        dashboardId="dash-123"
      />
    );
    
    const incrementBtn = screen.getByLabelText('Increase quantity');
    fireEvent.click(incrementBtn);
    
    // Should show optimistic UI immediately
    expect(screen.getByText('4')).toBeInTheDocument();
    
    // Should debounce and call save after 500ms
    await waitFor(() => {
      expect(mockOnSave).toHaveBeenCalledWith('item-123', 4);
    }, { timeout: 600 });
  });
  
  it('should show low stock indicator', () => {
    render(
      <DashboardItemCard
        item={{
          itemId: 'item-123',
          name: 'Dish Soap',
          quantity: 1,
          lowStockThreshold: 2,
          isLowStock: true
        }}
        dashboardId="dash-123"
      />
    );
    
    expect(screen.getByText(/⚠️ Low/i)).toBeInTheDocument();
  });
});
```

---

## Common Pitfalls

### ❌ Wrong: Creating GSI for Dashboard Lookups
```typescript
// DON'T: Unnecessary GSI
GSI3PK: 'DASHBOARD',
GSI3SK: dashboardId
```

### ✅ Correct: Encoding familyId in Dashboard ID
```typescript
// DO: O(1) lookup without GSI
const dashboardId = `${familyId}_${randomString}`;
```

---

### ❌ Wrong: Manual CORS Header Construction
```typescript
// DON'T: Manual CORS headers
return {
  statusCode: 200,
  headers: {
    'Access-Control-Allow-Origin': '*',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({ data })
};
```

### ✅ Correct: Using Response Utilities
```typescript
// DO: Use shared response utilities
import { successResponse } from '../lib/response';

return successResponse(200, data);
```

---

### ❌ Wrong: Global Debounce for All Items
```typescript
// DON'T: Serializes all updates
const debouncedSave = debounce(async (updates) => {
  await Promise.all(updates.map(saveItem));
}, 500);
```

### ✅ Correct: Per-Item Debounce
```typescript
// DO: Independent debounce per item
function DashboardItemCard({ item }) {
  const debouncedSave = useMemo(
    () => debounce(async (qty) => {
      await saveItem(item.itemId, qty);
    }, 500),
    [item.itemId]
  );
}
```

---

## Deployment Checklist

- [ ] Backend: Add Lambda functions to SAM template
- [ ] Backend: Configure CORS in API Gateway
- [ ] Backend: Add warmup configuration for all handlers
- [ ] Backend: Set up CloudWatch log groups
- [ ] Frontend: Create `/d/[dashboardId]` dynamic route
- [ ] Frontend: Test mobile responsiveness (iOS Safari, Android Chrome)
- [ ] Frontend: Verify WCAG 2.1 AA compliance (44px touch targets)
- [ ] Database: Validate single-table design (no new GSI required)
- [ ] Testing: 80% coverage for critical paths
- [ ] Documentation: Update API docs with new endpoints

---

## Related Features

- **Feature 001 (MVP)**: Core inventory item management
- **Feature 005 (Reference Data)**: Storage location management
- **Feature 006 (NFC)**: URL security pattern, atomic adjustments, debouncing
- **Feature 010 (Streamline Quantity Controls)**: Quantity control UI patterns
- **Feature 011 (Mobile Responsive UI)**: Mobile layout best practices
