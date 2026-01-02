# Data Model: Inventory Management Dashboards

**Feature**: 014-inventory-dashboards  
**Date**: January 2, 2026  
**Database**: Amazon DynamoDB (Single-Table Design Extension)

## Overview

This document extends the existing `InventoryManagement` DynamoDB table with a new `Dashboard` entity. The design follows the single-table pattern established in feature 001 and builds on patterns from feature 006 (NFC). Dashboards enable multi-item inventory views accessible via shareable URLs.

## Table Structure (Existing)

**Table Name**: `InventoryManagement`

**Primary Key**:
- **PK** (Partition Key): String - Entity identifier
- **SK** (Sort Key): String - Entity type and sub-identifier

**Global Secondary Indexes** (Existing):
- **GSI1**: PK=GSI1PK, SK=GSI1SK
- **GSI2**: PK=GSI2PK, SK=GSI2SK

## New Entity: Dashboard

### Purpose

Maps cryptographically random dashboard IDs to collections of inventory items. Two types supported:
1. **Location-based**: Shows all items in selected storage locations (live, dynamic)
2. **Item-based**: Shows explicitly selected items (static collection)

Dashboard IDs encode familyId to enable O(1) lookups without additional GSI.

### Dashboard ID Format

**Format**: `{familyId}_{randomString}`

**Example**: `f47ac10b-58cc-4372-a567-0e02b2c3d479_7pQm3nX8kD5wZ2gS9YbN4`

**Components**:
- `familyId`: 36-character UUID (with hyphens)
- `_`: Separator
- `randomString`: 22-character base62-encoded UUID v4

**Benefits**:
- Family isolation enforced at URL level
- O(1) lookup via GetItem (no GSI required)
- 122 bits of entropy in random portion (cryptographically secure)
- Consistent with infrastructure-as-code principles

### Access Patterns

1. **Get dashboard by dashboardId** (public access)
   - Parse familyId from dashboardId
   - GetItem: PK = `FAMILY#{familyId}`, SK = `DASHBOARD#{dashboardId}`
   - Returns: Dashboard configuration

2. **List all dashboards for a family** (admin UI)
   - Query: PK = `FAMILY#{familyId}`, SK begins_with `DASHBOARD#`
   - Returns: All dashboards for family

3. **Get items for location-based dashboard** (dashboard view)
   - Query: PK = `FAMILY#{familyId}`, SK begins_with `ITEM#`
   - FilterExpression: `locationId IN (:loc1, :loc2, ...) AND status = :active`
   - Returns: All active items in specified locations

4. **Get items for item-based dashboard** (dashboard view)
   - BatchGetItem: Multiple keys `PK = FAMILY#{familyId}`, `SK = ITEM#{itemId}`
   - Filter: status = 'active'
   - Returns: Specified active items only

### Key Structure

**Main Table**:
- **PK**: `FAMILY#{familyId}`
- **SK**: `DASHBOARD#{dashboardId}` (full dashboardId including familyId prefix)

**Note**: No GSI required because dashboardId encodes familyId, enabling direct GetItem lookup.

### Attributes

```typescript
interface Dashboard {
  // Partition/Sort Keys
  PK: string;                    // FAMILY#{familyId}
  SK: string;                    // DASHBOARD#{dashboardId}
  
  // Entity Data
  entityType: 'Dashboard';
  dashboardId: string;           // Format: {familyId}_{randomString}
  familyId: string;              // UUID of family
  title: string;                 // Human-readable name
  type: 'location' | 'items';    // Dashboard type
  
  // Configuration (based on type)
  locationIds?: string[];        // For location-based: array of locationId UUIDs
  itemIds?: string[];            // For item-based: array of itemId UUIDs
  
  // Metadata
  isActive: boolean;             // false if rotated/deleted
  createdAt: string;             // ISO 8601 timestamp
  createdBy: string;             // memberId who created dashboard
  lastAccessedAt?: string;       // ISO 8601 timestamp (updated on each view)
  accessCount: number;           // Incremented on each access (for analytics)
  rotatedAt?: string;            // ISO 8601 timestamp when URL rotated
  rotatedBy?: string;            // memberId who rotated URL
  deletedAt?: string;            // ISO 8601 timestamp when deleted
  deletedBy?: string;            // memberId who deleted dashboard
  updatedAt: string;             // ISO 8601 timestamp of last modification
  
  // Version
  version: number;               // For optimistic locking
}
```

### Validation Rules

- `dashboardId`: Must match format `{familyId}_{randomString}` where randomString is 22 chars base62
- `title`: 1-100 characters, required
- `type`: Must be 'location' or 'items'
- `locationIds`: Required if type='location', min 1 location, max 10 locations
- `itemIds`: Required if type='items', min 1 item, max 100 items
- `locationIds` and `itemIds`: Mutually exclusive (one must be undefined)
- `isActive`: Defaults to true, set to false on rotation or deletion

### Example Records

**Location-Based Dashboard**:
```json
{
  "PK": "FAMILY#f47ac10b-58cc-4372-a567-0e02b2c3d479",
  "SK": "DASHBOARD#f47ac10b-58cc-4372-a567-0e02b2c3d479_7pQm3nX8kD5wZ2gS9YbN4",
  "entityType": "Dashboard",
  "dashboardId": "f47ac10b-58cc-4372-a567-0e02b2c3d479_7pQm3nX8kD5wZ2gS9YbN4",
  "familyId": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
  "title": "Pantry & Fridge Inventory",
  "type": "location",
  "locationIds": [
    "loc-a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "loc-b2c3d4e5-f6g7-8901-bcde-fg2345678901"
  ],
  "isActive": true,
  "createdAt": "2026-01-02T10:00:00Z",
  "createdBy": "member-550e8400-e29b-41d4-a716-446655440000",
  "lastAccessedAt": "2026-01-02T15:30:00Z",
  "accessCount": 25,
  "updatedAt": "2026-01-02T10:00:00Z",
  "version": 1
}
```

**Item-Based Dashboard**:
```json
{
  "PK": "FAMILY#f47ac10b-58cc-4372-a567-0e02b2c3d479",
  "SK": "DASHBOARD#f47ac10b-58cc-4372-a567-0e02b2c3d479_3hTAx9AQRc8E6lO4Y9nR89",
  "entityType": "Dashboard",
  "dashboardId": "f47ac10b-58cc-4372-a567-0e02b2c3d479_3hTAx9AQRc8E6lO4Y9nR89",
  "familyId": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
  "title": "Party Supplies",
  "type": "items",
  "itemIds": [
    "item-d5e8f9a0-1234-4567-89ab-cdef01234567",
    "item-e6f9g0b1-2345-5678-90bc-def12345678",
    "item-f7g0h1c2-3456-6789-01cd-efg23456789"
  ],
  "isActive": true,
  "createdAt": "2026-01-02T11:00:00Z",
  "createdBy": "member-550e8400-e29b-41d4-a716-446655440000",
  "lastAccessedAt": "2026-01-02T14:00:00Z",
  "accessCount": 8,
  "updatedAt": "2026-01-02T11:00:00Z",
  "version": 1
}
```

**After Rotation** (old dashboard):
```json
{
  "PK": "FAMILY#f47ac10b-58cc-4372-a567-0e02b2c3d479",
  "SK": "DASHBOARD#f47ac10b-58cc-4372-a567-0e02b2c3d479_7pQm3nX8kD5wZ2gS9YbN4",
  "entityType": "Dashboard",
  "dashboardId": "f47ac10b-58cc-4372-a567-0e02b2c3d479_7pQm3nX8kD5wZ2gS9YbN4",
  "familyId": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
  "title": "Pantry & Fridge Inventory",
  "type": "location",
  "locationIds": ["loc-a1b2c3d4...", "loc-b2c3d4e5..."],
  "isActive": false,
  "createdAt": "2026-01-02T10:00:00Z",
  "createdBy": "member-550e8400-e29b-41d4-a716-446655440000",
  "rotatedAt": "2026-01-02T16:00:00Z",
  "rotatedBy": "member-550e8400-e29b-41d4-a716-446655440000",
  "accessCount": 25,
  "updatedAt": "2026-01-02T16:00:00Z",
  "version": 2
}
```

**New Dashboard After Rotation**:
```json
{
  "PK": "FAMILY#f47ac10b-58cc-4372-a567-0e02b2c3d479",
  "SK": "DASHBOARD#f47ac10b-58cc-4372-a567-0e02b2c3d479_9xYBz2CRSd9F7mP5Z0sT90",
  "entityType": "Dashboard",
  "dashboardId": "f47ac10b-58cc-4372-a567-0e02b2c3d479_9xYBz2CRSd9F7mP5Z0sT90",
  "familyId": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
  "title": "Pantry & Fridge Inventory",
  "type": "location",
  "locationIds": ["loc-a1b2c3d4...", "loc-b2c3d4e5..."],
  "isActive": true,
  "createdAt": "2026-01-02T16:00:00Z",
  "createdBy": "member-550e8400-e29b-41d4-a716-446655440000",
  "accessCount": 0,
  "updatedAt": "2026-01-02T16:00:00Z",
  "version": 1
}
```

## View Model: DashboardItem

**Purpose**: Computed view model for displaying items on a dashboard. Not stored in DynamoDB - generated on-demand from Dashboard config + current InventoryItem records.

```typescript
interface DashboardItem {
  // From InventoryItem
  itemId: string;
  name: string;
  quantity: number;
  unit?: string;
  locationId?: string;
  locationName?: string;
  lowStockThreshold: number;
  status: 'active';
  
  // Computed
  isLowStock: boolean;          // quantity < lowStockThreshold
  
  // For sorting/display
  displayOrder: number;         // Alphabetical by name
}
```

**Generation Logic**:
```typescript
async function getDashboardItems(dashboard: Dashboard): Promise<DashboardItem[]> {
  let items: InventoryItem[];
  
  if (dashboard.type === 'location') {
    // Query with filter
    items = await queryItemsByLocations(dashboard.familyId, dashboard.locationIds);
  } else {
    // Batch get specific items
    items = await batchGetItems(dashboard.familyId, dashboard.itemIds);
  }
  
  // Filter active items only
  items = items.filter(item => item.status === 'active');
  
  // Sort alphabetically
  items.sort((a, b) => a.name.localeCompare(b.name));
  
  // Transform to view model
  return items.map((item, index) => ({
    itemId: item.itemId,
    name: item.name,
    quantity: item.quantity,
    unit: item.unit,
    locationId: item.locationId,
    locationName: item.locationName,
    lowStockThreshold: item.lowStockThreshold,
    status: item.status,
    isLowStock: item.quantity < item.lowStockThreshold,
    displayOrder: index
  }));
}
```

## Query Patterns & Performance

### Pattern 1: Get Dashboard by ID (public access)

**Use Case**: User opens dashboard URL → page needs dashboard config

**Query**:
```typescript
async function getDashboardById(dashboardId: string): Promise<Dashboard | null> {
  // Parse familyId from dashboardId
  const [familyId] = dashboardId.split('_');
  
  const result = await docClient.send(
    new GetCommand({
      TableName: TABLE_NAME,
      Key: {
        PK: `FAMILY#${familyId}`,
        SK: `DASHBOARD#${dashboardId}`
      }
    })
  );
  
  return result.Item as Dashboard | undefined || null;
}
```

**Performance**: O(1) GetItem - fastest possible lookup, no GSI scan

---

### Pattern 2: List All Dashboards for Family (admin UI)

**Use Case**: Admin views dashboard management page

**Query**:
```typescript
async function listDashboards(familyId: string): Promise<Dashboard[]> {
  const result = await docClient.send(
    new QueryCommand({
      TableName: TABLE_NAME,
      KeyConditionExpression: 'PK = :pk AND begins_with(SK, :sk)',
      ExpressionAttributeValues: {
        ':pk': `FAMILY#${familyId}`,
        ':sk': 'DASHBOARD#'
      }
    })
  );
  
  return (result.Items as Dashboard[]).sort((a, b) => 
    b.createdAt.localeCompare(a.createdAt) // Newest first
  );
}
```

**Performance**: Query on primary key, returns all dashboards for family

---

### Pattern 3: Get Items for Location-Based Dashboard

**Use Case**: User views location-based dashboard

**Query**:
```typescript
async function getLocationBasedItems(
  familyId: string,
  locationIds: string[]
): Promise<InventoryItem[]> {
  // Build filter expression dynamically based on number of locations
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
  
  return result.Items as InventoryItem[];
}
```

**Performance**: Query with filter - efficient for small to medium families (<100 items)

---

### Pattern 4: Get Items for Item-Based Dashboard

**Use Case**: User views item-based dashboard

**Query**:
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
  
  // Filter active items
  return items.filter(item => item.status === 'active');
}
```

**Performance**: BatchGetItem - O(N) where N = number of items, very fast for typical 5-20 items

---

## Relationships

### Dashboard → StorageLocation (for location-based)
- Dashboard stores array of `locationIds`
- No foreign key constraint (DynamoDB limitation)
- Application validates location existence during dashboard creation
- If location is deleted, items simply won't match filter (graceful degradation)

### Dashboard → InventoryItem (for item-based)
- Dashboard stores array of `itemIds`
- No foreign key constraint (DynamoDB limitation)
- Application validates item existence during dashboard creation
- If item is archived/deleted, it's filtered out during query (status = 'active')

### Dashboard → Member (creator/modifier)
- Dashboard stores `createdBy`, `rotatedBy`, `deletedBy` as memberIds
- No foreign key constraint (DynamoDB limitation)
- Used for audit trail only, not enforced

## Data Integrity Rules

1. **Type-specific configuration validation**:
   - If `type = 'location'`: `locationIds` must be non-empty array, `itemIds` must be undefined
   - If `type = 'items'`: `itemIds` must be non-empty array, `locationIds` must be undefined

2. **Active status**:
   - `isActive = false` when dashboard is rotated or deleted
   - Inactive dashboards return 404 on public access
   - Admin UI can still view inactive dashboards for audit trail

3. **URL rotation**:
   - Old dashboard: Set `isActive = false`, set `rotatedAt` and `rotatedBy`
   - New dashboard: Copy `title`, `type`, location/item config, set new `dashboardId`
   - Both dashboards remain in database (audit trail)

4. **Archived/deleted items**:
   - Location-based dashboards: Items automatically filtered by `status = 'active'`
   - Item-based dashboards: Items automatically filtered by `status = 'active'`
   - No manual cleanup required

5. **Denormalization consistency**:
   - No denormalized data in Dashboard entity (unlike NFCUrl which caches itemName)
   - Dashboard only stores IDs, queries live item data on each access
   - Trade-off: Slightly slower reads, but perfect consistency

## Migration Notes

**No schema changes to existing entities**:
- InventoryItem: No changes
- StorageLocation: No changes  
- Member: No changes

**New entity only**:
- Dashboard entity added to existing single table
- No new GSI required (dashboardId encodes familyId)
- No data migration needed (net new feature)

## Access Pattern Summary Table

| Pattern | Query Type | Keys Used | Performance | Use Case |
|---------|-----------|-----------|-------------|----------|
| Get dashboard by ID | GetItem | PK=FAMILY#{familyId}, SK=DASHBOARD#{dashboardId} | O(1) | Public access |
| List family dashboards | Query | PK=FAMILY#{familyId}, SK begins_with DASHBOARD# | O(N) | Admin UI |
| Location-based items | Query + Filter | PK=FAMILY#{familyId}, SK begins_with ITEM#, filter locationId | O(M) | Dashboard view |
| Item-based items | BatchGetItem | Multiple PK/SK pairs | O(N) | Dashboard view |

**Legend**:
- N = number of dashboards per family (typically 1-10)
- M = number of items per family (typically 10-100)
- N = number of items on dashboard (typically 5-20)

All queries maintain family isolation through PK filtering.
