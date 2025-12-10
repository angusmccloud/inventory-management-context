# Research: Reference Data Management

**Feature**: 005-reference-data  
**Date**: 2025-12-10  
**Status**: Phase 0 Complete

## Overview

This document captures research decisions made during the planning phase for the Reference Data Management feature. Each decision includes rationale, alternatives considered, and implementation notes.

---

## 1. Optimistic Locking for Concurrent Edits

### Decision
Implement optimistic locking using a `version` attribute with DynamoDB conditional writes, consistent with the pattern established in 002-shopping-lists and 003-member-management.

### Rationale
- Spec risk consideration explicitly mentions "Concurrent Modifications: Multiple admins editing the same reference data could cause conflicts"
- Optimistic locking is simpler than pessimistic locking for web applications
- DynamoDB conditional expressions provide atomic check-and-update semantics
- Consistent with existing patterns in the codebase (002-shopping-lists, 003-member-management)
- Prevents race conditions when multiple admins manage reference data simultaneously

### Alternatives Considered
- **Last-write-wins**: Rejected because it can cause unintended data loss when multiple family members edit simultaneously
- **Pessimistic locking with DynamoDB transactions**: Rejected due to added complexity and cost; optimistic locking is sufficient for reference data management
- **Distributed locks (Redis/DynamoDB)**: Rejected due to operational complexity

### Implementation Notes

**Add `version` attribute to StorageLocation and Store entities:**
```typescript
{
  // Existing attributes
  locationId: string;
  familyId: string;
  name: string;
  description: string | null;
  entityType: 'StorageLocation';
  createdAt: string;
  updatedAt: string;
  
  // NEW: Optimistic locking
  version: number;  // Starting at 1, incremented on each update
}
```

**Conditional update pattern:**
```typescript
await docClient.send(new UpdateCommand({
  TableName: 'InventoryManagement',
  Key: { 
    PK: `FAMILY#${familyId}`, 
    SK: `LOCATION#${locationId}` 
  },
  UpdateExpression: 'SET #name = :name, #description = :description, #version = #version + :one, #updatedAt = :now',
  ConditionExpression: '#version = :expectedVersion',
  ExpressionAttributeNames: {
    '#name': 'name',
    '#description': 'description',
    '#version': 'version',
    '#updatedAt': 'updatedAt'
  },
  ExpressionAttributeValues: {
    ':name': newName,
    ':description': newDescription,
    ':one': 1,
    ':expectedVersion': currentVersion,
    ':now': new Date().toISOString()
  }
}));
```

**Conflict resolution UI pattern:**
- On `ConditionalCheckFailedException`, return HTTP 409 Conflict with current entity state
- Client displays conflict dialog: "This item was modified by another user. Your version: X, Current version: Y"
- Options: "Refresh and lose my changes" or "Overwrite with my changes"
- If user chooses overwrite, retry with new version number

---

## 2. Reference Counting/Checking Patterns

### Decision
Use efficient DynamoDB Query operations to check for references before deletion, with a two-phase approach: quick count check followed by detailed reference list if needed.

### Rationale
- Spec requirements FR-044 and FR-054 mandate preventing deletion of referenced entities
- Spec requirements FR-045 and FR-055 require displaying which items reference the entity
- DynamoDB Query operations are efficient and avoid table scans
- Two-phase approach optimizes for the common case (no references) while providing detail when needed

### Alternatives Considered
- **Maintain reference counts as denormalized attributes**: Rejected because it adds complexity to maintain counts on every item create/update/delete
- **Table scan with filter**: Rejected per constitution (avoid table scans)
- **GSI for reverse lookups**: Considered but rejected; existing access patterns are sufficient

### Implementation Notes

**Phase 1: Quick reference check for StorageLocation:**
```typescript
async function hasLocationReferences(familyId: string, locationId: string): Promise<boolean> {
  const result = await docClient.send(new QueryCommand({
    TableName: 'InventoryManagement',
    KeyConditionExpression: 'PK = :pk AND begins_with(SK, :skPrefix)',
    FilterExpression: 'locationId = :locationId',
    ExpressionAttributeValues: {
      ':pk': `FAMILY#${familyId}`,
      ':skPrefix': 'ITEM#',
      ':locationId': locationId
    },
    Limit: 1,  // Only need to know if at least one exists
    ProjectionExpression: 'itemId, #name',
    ExpressionAttributeNames: { '#name': 'name' }
  }));
  
  return (result.Items?.length ?? 0) > 0;
}
```

**Phase 2: Get detailed references (only if Phase 1 returns true):**
```typescript
async function getLocationReferences(familyId: string, locationId: string): Promise<ReferenceInfo[]> {
  const result = await docClient.send(new QueryCommand({
    TableName: 'InventoryManagement',
    KeyConditionExpression: 'PK = :pk AND begins_with(SK, :skPrefix)',
    FilterExpression: 'locationId = :locationId',
    ExpressionAttributeValues: {
      ':pk': `FAMILY#${familyId}`,
      ':skPrefix': 'ITEM#',
      ':locationId': locationId
    },
    ProjectionExpression: 'itemId, #name',
    ExpressionAttributeNames: { '#name': 'name' },
    Limit: 50  // Reasonable limit for UI display
  }));
  
  return result.Items?.map(item => ({
    itemId: item.itemId,
    name: item.name
  })) ?? [];
}
```

**Store reference check (more complex - checks both InventoryItems and ShoppingListItems):**
```typescript
async function hasStoreReferences(familyId: string, storeId: string): Promise<boolean> {
  // Check InventoryItems (preferredStoreId or alternateStoreIds)
  const inventoryResult = await docClient.send(new QueryCommand({
    TableName: 'InventoryManagement',
    KeyConditionExpression: 'PK = :pk AND begins_with(SK, :skPrefix)',
    FilterExpression: 'preferredStoreId = :storeId OR contains(alternateStoreIds, :storeId)',
    ExpressionAttributeValues: {
      ':pk': `FAMILY#${familyId}`,
      ':skPrefix': 'ITEM#',
      ':storeId': storeId
    },
    Limit: 1,
    ProjectionExpression: 'itemId'
  }));
  
  if ((inventoryResult.Items?.length ?? 0) > 0) return true;
  
  // Check ShoppingListItems
  const shoppingResult = await docClient.send(new QueryCommand({
    TableName: 'InventoryManagement',
    KeyConditionExpression: 'PK = :pk AND begins_with(SK, :skPrefix)',
    FilterExpression: 'storeId = :storeId',
    ExpressionAttributeValues: {
      ':pk': `FAMILY#${familyId}`,
      ':skPrefix': 'SHOPPING#',
      ':storeId': storeId
    },
    Limit: 1,
    ProjectionExpression: 'shoppingItemId'
  }));
  
  return (shoppingResult.Items?.length ?? 0) > 0;
}
```

**Performance considerations:**
- For families with many items (< 100 per spec assumption), these queries are efficient
- FilterExpression is applied after Query, but with family-scoped partition key, result sets are small
- Limit: 1 for existence check minimizes read capacity consumption
- Consider caching reference counts in memory for frequently accessed reference data (future optimization)

---

## 3. Case-Insensitive Uniqueness Enforcement

### Decision
Store a normalized `nameLower` attribute alongside the original `name`, and use conditional writes with a check against existing items with the same normalized name.

### Rationale
- Spec requirements FR-046 and FR-056 mandate case-insensitive unique names per family
- DynamoDB doesn't support case-insensitive queries natively
- Storing normalized name enables efficient uniqueness checking without table scans
- Preserves original casing for display while enforcing uniqueness

### Alternatives Considered
- **GSI with normalized name as sort key**: Rejected because it adds GSI cost and complexity; conditional writes are sufficient for this use case
- **Application-level check with Query + filter**: Rejected because it's not atomic and has race condition potential
- **Store only lowercase names**: Rejected because users expect to see their original casing (e.g., "Kitchen Pantry" not "kitchen pantry")

### Implementation Notes

**Extended entity attributes:**
```typescript
{
  // Existing attributes
  locationId: string;
  familyId: string;
  name: string;              // Original casing: "Kitchen Pantry"
  
  // NEW: Normalized name for uniqueness
  nameLower: string;         // Lowercase: "kitchen pantry"
  
  description: string | null;
  entityType: 'StorageLocation';
  createdAt: string;
  updatedAt: string;
  version: number;
}
```

**Create with uniqueness check:**
```typescript
async function createStorageLocation(
  familyId: string, 
  name: string, 
  description: string | null
): Promise<StorageLocation> {
  const trimmedName = name.trim();
  const nameLower = trimmedName.toLowerCase();
  const locationId = uuidv4();
  const now = new Date().toISOString();
  
  // Check for existing location with same normalized name
  const existing = await docClient.send(new QueryCommand({
    TableName: 'InventoryManagement',
    KeyConditionExpression: 'PK = :pk AND begins_with(SK, :skPrefix)',
    FilterExpression: 'nameLower = :nameLower',
    ExpressionAttributeValues: {
      ':pk': `FAMILY#${familyId}`,
      ':skPrefix': 'LOCATION#',
      ':nameLower': nameLower
    },
    Limit: 1,
    ProjectionExpression: 'locationId, #name',
    ExpressionAttributeNames: { '#name': 'name' }
  }));
  
  if ((existing.Items?.length ?? 0) > 0) {
    throw new DuplicateNameError(
      `A storage location named "${existing.Items![0].name}" already exists`
    );
  }
  
  // Create the new location
  await docClient.send(new PutCommand({
    TableName: 'InventoryManagement',
    Item: {
      PK: `FAMILY#${familyId}`,
      SK: `LOCATION#${locationId}`,
      locationId,
      familyId,
      name: trimmedName,
      nameLower,
      description: description?.trim() || null,
      entityType: 'StorageLocation',
      createdAt: now,
      updatedAt: now,
      version: 1
    },
    ConditionExpression: 'attribute_not_exists(PK)'
  }));
  
  return { locationId, familyId, name: trimmedName, description, version: 1, createdAt: now, updatedAt: now };
}
```

**Update with uniqueness check (when name changes):**
```typescript
async function updateStorageLocation(
  familyId: string,
  locationId: string,
  name: string,
  description: string | null,
  expectedVersion: number
): Promise<StorageLocation> {
  const trimmedName = name.trim();
  const nameLower = trimmedName.toLowerCase();
  
  // Check for existing location with same normalized name (excluding self)
  const existing = await docClient.send(new QueryCommand({
    TableName: 'InventoryManagement',
    KeyConditionExpression: 'PK = :pk AND begins_with(SK, :skPrefix)',
    FilterExpression: 'nameLower = :nameLower AND locationId <> :selfId',
    ExpressionAttributeValues: {
      ':pk': `FAMILY#${familyId}`,
      ':skPrefix': 'LOCATION#',
      ':nameLower': nameLower,
      ':selfId': locationId
    },
    Limit: 1
  }));
  
  if ((existing.Items?.length ?? 0) > 0) {
    throw new DuplicateNameError(
      `A storage location named "${existing.Items![0].name}" already exists`
    );
  }
  
  // Update with optimistic locking
  // ... (see optimistic locking section)
}
```

---

## 4. Whitespace Handling

### Decision
Trim whitespace on both client-side (for immediate UX feedback) and server-side (for security and consistency), using Zod's `.trim()` transform.

### Rationale
- Spec requirements FR-047 and FR-057 mandate trimming leading/trailing whitespace
- Client-side trimming provides immediate visual feedback
- Server-side trimming is essential for security (never trust client input)
- Zod's `.trim()` integrates seamlessly with existing validation patterns

### Alternatives Considered
- **Client-side only**: Rejected because server must never trust client input
- **Server-side only**: Rejected because it creates poor UX (user sees spaces, then they disappear)
- **Reject whitespace-only names**: Already handled by `.min(1)` after trim

### Implementation Notes

**Zod schema with trim:**
```typescript
import { z } from 'zod';

export const StorageLocationNameSchema = z
  .string()
  .trim()                    // Remove leading/trailing whitespace
  .min(1, 'Name is required')
  .max(50, 'Name must be 50 characters or less');

export const StorageLocationDescriptionSchema = z
  .string()
  .trim()
  .max(200, 'Description must be 200 characters or less')
  .optional()
  .nullable()
  .transform(val => val || null);  // Convert empty string to null

export const CreateStorageLocationSchema = z.object({
  name: StorageLocationNameSchema,
  description: StorageLocationDescriptionSchema
});

export const StoreNameSchema = z
  .string()
  .trim()
  .min(1, 'Name is required')
  .max(100, 'Name must be 100 characters or less');

export const StoreAddressSchema = z
  .string()
  .trim()
  .max(200, 'Address must be 200 characters or less')
  .optional()
  .nullable()
  .transform(val => val || null);

export const CreateStoreSchema = z.object({
  name: StoreNameSchema,
  address: StoreAddressSchema
});
```

**Client-side handling (React):**
```typescript
// In form component
const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  // Trim on blur for better UX (allow typing spaces mid-word)
  setName(e.target.value);
};

const handleNameBlur = () => {
  setName(name.trim());
};
```

---

## 5. Real-Time Validation Patterns

### Decision
Implement client-side validation with Zod for immediate feedback, plus debounced uniqueness checking against the backend API (300ms debounce).

### Rationale
- Spec requirement FR-072 mandates real-time validation feedback during data entry
- Client-side Zod validation provides instant format/length feedback
- Debounced API calls prevent excessive backend requests while typing
- 300ms debounce balances responsiveness with API efficiency

### Alternatives Considered
- **Validate only on submit**: Rejected because spec requires real-time feedback
- **Validate on every keystroke (no debounce)**: Rejected due to excessive API calls
- **Longer debounce (500ms+)**: Rejected because it feels sluggish to users
- **Shorter debounce (100ms)**: Rejected because it still generates too many API calls

### Implementation Notes

**Debounced uniqueness check hook:**
```typescript
import { useState, useEffect, useCallback } from 'react';
import { useDebouncedCallback } from 'use-debounce';

interface UseNameValidationResult {
  isChecking: boolean;
  isDuplicate: boolean;
  error: string | null;
}

export function useStorageLocationNameValidation(
  familyId: string,
  name: string,
  excludeLocationId?: string  // For edit mode
): UseNameValidationResult {
  const [isChecking, setIsChecking] = useState(false);
  const [isDuplicate, setIsDuplicate] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const checkUniqueness = useDebouncedCallback(
    async (nameToCheck: string) => {
      if (!nameToCheck.trim()) {
        setIsDuplicate(false);
        setError(null);
        return;
      }
      
      setIsChecking(true);
      try {
        const response = await fetch(
          `/api/families/${familyId}/locations/check-name?` +
          `name=${encodeURIComponent(nameToCheck)}` +
          (excludeLocationId ? `&exclude=${excludeLocationId}` : '')
        );
        
        const data = await response.json();
        setIsDuplicate(data.exists);
        setError(data.exists ? `A location named "${data.existingName}" already exists` : null);
      } catch (err) {
        setError('Unable to check name availability');
      } finally {
        setIsChecking(false);
      }
    },
    300  // 300ms debounce
  );
  
  useEffect(() => {
    checkUniqueness(name);
  }, [name, checkUniqueness]);
  
  return { isChecking, isDuplicate, error };
}
```

**API endpoint for name check:**
```typescript
// GET /api/families/{familyId}/locations/check-name?name=xxx&exclude=yyy
export async function GET(
  request: Request,
  { params }: { params: { familyId: string } }
) {
  const { searchParams } = new URL(request.url);
  const name = searchParams.get('name');
  const excludeId = searchParams.get('exclude');
  
  if (!name) {
    return Response.json({ exists: false });
  }
  
  const nameLower = name.trim().toLowerCase();
  
  const result = await docClient.send(new QueryCommand({
    TableName: 'InventoryManagement',
    KeyConditionExpression: 'PK = :pk AND begins_with(SK, :skPrefix)',
    FilterExpression: excludeId 
      ? 'nameLower = :nameLower AND locationId <> :excludeId'
      : 'nameLower = :nameLower',
    ExpressionAttributeValues: {
      ':pk': `FAMILY#${params.familyId}`,
      ':skPrefix': 'LOCATION#',
      ':nameLower': nameLower,
      ...(excludeId && { ':excludeId': excludeId })
    },
    Limit: 1,
    ProjectionExpression: '#name',
    ExpressionAttributeNames: { '#name': 'name' }
  }));
  
  return Response.json({
    exists: (result.Items?.length ?? 0) > 0,
    existingName: result.Items?.[0]?.name
  });
}
```

**Error message display pattern:**
```typescript
// In form component
<div className="form-field">
  <label htmlFor="name">Location Name</label>
  <input
    id="name"
    type="text"
    value={name}
    onChange={handleNameChange}
    onBlur={handleNameBlur}
    aria-invalid={!!validationError || isDuplicate}
    aria-describedby="name-error"
  />
  {isChecking && <span className="checking">Checking availability...</span>}
  {(validationError || error) && (
    <span id="name-error" className="error" role="alert">
      {validationError || error}
    </span>
  )}
</div>
```

---

## 6. Cascading Updates for Name Changes

### Decision
When a storage location or store name changes, update the `name` attribute on all referencing items using DynamoDB BatchWriteItem for efficiency, with eventual consistency acceptable.

### Rationale
- Spec requirements FR-049 and FR-060 mandate updating all referencing items when names change
- Spec success criteria SC-005 requires changes to propagate within 1 second
- BatchWriteItem is more efficient than individual UpdateItem calls
- Eventual consistency is acceptable since name changes are infrequent and non-critical

### Alternatives Considered
- **Store only IDs, resolve names at read time**: Rejected because it adds latency to every read operation
- **DynamoDB Transactions**: Rejected because transactions are limited to 100 items; families could have more references
- **Don't update references (stale names)**: Rejected because spec explicitly requires updates

### Implementation Notes

**Note on data model**: The current data model stores `locationId` and `storeId` as references, not denormalized names. However, for display purposes, the UI may cache or denormalize names. This decision documents the approach if denormalized names are stored.

**If names are denormalized (stored on referencing items):**
```typescript
async function updateLocationNameCascade(
  familyId: string,
  locationId: string,
  newName: string
): Promise<void> {
  // Get all items referencing this location
  const items = await docClient.send(new QueryCommand({
    TableName: 'InventoryManagement',
    KeyConditionExpression: 'PK = :pk AND begins_with(SK, :skPrefix)',
    FilterExpression: 'locationId = :locationId',
    ExpressionAttributeValues: {
      ':pk': `FAMILY#${familyId}`,
      ':skPrefix': 'ITEM#',
      ':locationId': locationId
    },
    ProjectionExpression: 'PK, SK'
  }));
  
  if (!items.Items || items.Items.length === 0) return;
  
  // Batch update in chunks of 25 (BatchWriteItem limit)
  const chunks = chunkArray(items.Items, 25);
  
  for (const chunk of chunks) {
    const writeRequests = chunk.map(item => ({
      Update: {
        TableName: 'InventoryManagement',
        Key: { PK: item.PK, SK: item.SK },
        UpdateExpression: 'SET locationName = :name, updatedAt = :now',
        ExpressionAttributeValues: {
          ':name': newName,
          ':now': new Date().toISOString()
        }
      }
    }));
    
    // Note: BatchWriteItem doesn't support UpdateItem, use TransactWriteItems for updates
    // or individual UpdateItem calls in parallel
    await Promise.all(
      chunk.map(item =>
        docClient.send(new UpdateCommand({
          TableName: 'InventoryManagement',
          Key: { PK: item.PK, SK: item.SK },
          UpdateExpression: 'SET locationName = :name, updatedAt = :now',
          ExpressionAttributeValues: {
            ':name': newName,
            ':now': new Date().toISOString()
          }
        }))
      )
    );
  }
}
```

**Recommended approach (resolve names at read time):**
Given the complexity of cascading updates and the spec assumption that families have < 100 items, the recommended approach is:
1. Store only `locationId` and `storeId` on referencing items (current design)
2. Resolve names at read time by joining with reference data
3. Cache reference data on the client for performance

```typescript
// Service layer: enrich inventory items with location/store names
async function getInventoryItemsWithNames(familyId: string): Promise<EnrichedInventoryItem[]> {
  // Parallel fetch: items and reference data
  const [itemsResult, locationsResult, storesResult] = await Promise.all([
    docClient.send(new QueryCommand({
      TableName: 'InventoryManagement',
      KeyConditionExpression: 'PK = :pk AND begins_with(SK, :skPrefix)',
      ExpressionAttributeValues: {
        ':pk': `FAMILY#${familyId}`,
        ':skPrefix': 'ITEM#'
      }
    })),
    docClient.send(new QueryCommand({
      TableName: 'InventoryManagement',
      KeyConditionExpression: 'PK = :pk AND begins_with(SK, :skPrefix)',
      ExpressionAttributeValues: {
        ':pk': `FAMILY#${familyId}`,
        ':skPrefix': 'LOCATION#'
      }
    })),
    docClient.send(new QueryCommand({
      TableName: 'InventoryManagement',
      KeyConditionExpression: 'PK = :pk AND begins_with(SK, :skPrefix)',
      ExpressionAttributeValues: {
        ':pk': `FAMILY#${familyId}`,
        ':skPrefix': 'STORE#'
      }
    }))
  ]);
  
  // Build lookup maps
  const locationMap = new Map(
    locationsResult.Items?.map(loc => [loc.locationId, loc.name]) ?? []
  );
  const storeMap = new Map(
    storesResult.Items?.map(store => [store.storeId, store.name]) ?? []
  );
  
  // Enrich items
  return itemsResult.Items?.map(item => ({
    ...item,
    locationName: item.locationId ? locationMap.get(item.locationId) : null,
    preferredStoreName: item.preferredStoreId ? storeMap.get(item.preferredStoreId) : null,
    alternateStoreNames: item.alternateStoreIds?.map(id => storeMap.get(id)).filter(Boolean) ?? []
  })) ?? [];
}
```

---

## 7. Empty State Handling

### Decision
Display helpful empty states with clear calls-to-action when families have no storage locations or stores defined, including contextual guidance for new families.

### Rationale
- Spec edge case asks how to handle families with no reference data
- Empty states are a key UX pattern for guiding new users
- Clear CTAs reduce confusion and encourage feature adoption
- Contextual messaging helps users understand the value of reference data

### Alternatives Considered
- **Show blank list**: Rejected because it provides no guidance
- **Pre-populate with common defaults**: Rejected per spec (out of scope: "Automatic creation of storage locations or stores based on common patterns")
- **Hide reference data section until first item created**: Rejected because it makes the feature less discoverable

### Implementation Notes

**Empty state component:**
```typescript
interface EmptyStateProps {
  type: 'locations' | 'stores';
  onAdd: () => void;
}

export function ReferenceDataEmptyState({ type, onAdd }: EmptyStateProps) {
  const config = {
    locations: {
      icon: <MapPinIcon className="w-12 h-12 text-gray-400" />,
      title: 'No storage locations yet',
      description: 'Storage locations help you organize where items are kept in your home. Add locations like "Pantry", "Garage", or "Refrigerator" to get started.',
      buttonText: 'Add First Location',
      examples: ['Pantry', 'Refrigerator', 'Garage', 'Bathroom Cabinet']
    },
    stores: {
      icon: <ShoppingBagIcon className="w-12 h-12 text-gray-400" />,
      title: 'No stores yet',
      description: 'Stores help you track where to buy items and organize your shopping lists. Add your favorite stores to get started.',
      buttonText: 'Add First Store',
      examples: ['Costco', 'Whole Foods', 'Target', 'Local Grocery']
    }
  };
  
  const { icon, title, description, buttonText, examples } = config[type];
  
  return (
    <div className="text-center py-12 px-4">
      <div className="flex justify-center mb-4">{icon}</div>
      <h3 className="text-lg font-medium text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-500 mb-4 max-w-md mx-auto">{description}</p>
      
      <div className="mb-6">
        <p className="text-sm text-gray-400 mb-2">Popular examples:</p>
        <div className="flex flex-wrap justify-center gap-2">
          {examples.map(example => (
            <span 
              key={example}
              className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm"
            >
              {example}
            </span>
          ))}
        </div>
      </div>
      
      <button
        onClick={onAdd}
        className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
      >
        <PlusIcon className="w-5 h-5 mr-2" />
        {buttonText}
      </button>
    </div>
  );
}
```

**Onboarding guidance for new families:**
```typescript
// Show onboarding tip when family has no reference data AND no inventory items
export function ReferenceDataOnboarding() {
  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
      <div className="flex">
        <LightBulbIcon className="w-5 h-5 text-blue-600 mr-3 flex-shrink-0 mt-0.5" />
        <div>
          <h4 className="text-sm font-medium text-blue-800">
            Getting Started Tip
          </h4>
          <p className="text-sm text-blue-700 mt-1">
            Before adding inventory items, consider setting up your storage locations 
            and favorite stores. This will make it easier to organize your inventory 
            and shopping lists later.
          </p>
          <div className="mt-3 flex gap-3">
            <a href="/settings/locations" className="text-sm font-medium text-blue-600 hover:text-blue-800">
              Add Locations →
            </a>
            <a href="/settings/stores" className="text-sm font-medium text-blue-600 hover:text-blue-800">
              Add Stores →
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
```

**List view with empty state:**
```typescript
export function StorageLocationsList() {
  const { data: locations, isLoading } = useStorageLocations();
  const [showAddModal, setShowAddModal] = useState(false);
  
  if (isLoading) {
    return <LoadingSpinner />;
  }
  
  if (!locations || locations.length === 0) {
    return (
      <ReferenceDataEmptyState
        type="locations"
        onAdd={() => setShowAddModal(true)}
      />
    );
  }
  
  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-medium">Storage Locations</h2>
        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center px-3 py-1.5 bg-blue-600 text-white text-sm rounded-md"
        >
          <PlusIcon className="w-4 h-4 mr-1" />
          Add Location
        </button>
      </div>
      <ul className="divide-y divide-gray-200">
        {locations.map(location => (
          <StorageLocationItem key={location.locationId} location={location} />
        ))}
      </ul>
      {showAddModal && (
        <AddStorageLocationModal onClose={() => setShowAddModal(false)} />
      )}
    </div>
  );
}
```

---

## Summary of Key Decisions

| Topic | Decision | Impact |
|-------|----------|--------|
| Optimistic Locking | Version attribute with conditional writes | Add `version` field to StorageLocation and Store |
| Reference Checking | Two-phase Query approach (quick check + detailed list) | Efficient deletion prevention |
| Case-Insensitive Uniqueness | Store `nameLower` attribute | Add `nameLower` field, check before create/update |
| Whitespace Handling | Trim on both client and server with Zod | Use `.trim()` in Zod schemas |
| Real-Time Validation | Debounced API calls (300ms) + client-side Zod | Add name-check endpoint |
| Cascading Updates | Resolve names at read time (recommended) | No denormalized names on referencing items |
| Empty State Handling | Helpful empty states with CTAs and examples | Improve new user onboarding |

---

## Data Model Extensions

Based on the research decisions, the following attributes should be added to the existing StorageLocation and Store entities:

### StorageLocation Extensions
```typescript
{
  // Existing attributes (from 001-family-inventory-mvp)
  locationId: string;
  familyId: string;
  name: string;
  description: string | null;
  entityType: 'StorageLocation';
  createdAt: string;
  updatedAt: string;
  
  // NEW attributes for 005-reference-data
  nameLower: string;    // Lowercase name for case-insensitive uniqueness
  version: number;      // Optimistic locking (starting at 1)
}
```

### Store Extensions
```typescript
{
  // Existing attributes (from 001-family-inventory-mvp)
  storeId: string;
  familyId: string;
  name: string;
  address: string | null;
  entityType: 'Store';
  createdAt: string;
  updatedAt: string;
  
  // NEW attributes for 005-reference-data
  nameLower: string;    // Lowercase name for case-insensitive uniqueness
  version: number;      // Optimistic locking (starting at 1)
}
```

---

## API Endpoints

Based on the research, the following API endpoints are needed:

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/families/{familyId}/locations` | List all storage locations |
| POST | `/api/families/{familyId}/locations` | Create storage location |
| GET | `/api/families/{familyId}/locations/{locationId}` | Get single location |
| PATCH | `/api/families/{familyId}/locations/{locationId}` | Update location |
| DELETE | `/api/families/{familyId}/locations/{locationId}` | Delete location |
| GET | `/api/families/{familyId}/locations/check-name` | Check name availability |
| GET | `/api/families/{familyId}/stores` | List all stores |
| POST | `/api/families/{familyId}/stores` | Create store |
| GET | `/api/families/{familyId}/stores/{storeId}` | Get single store |
| PATCH | `/api/families/{familyId}/stores/{storeId}` | Update store |
| DELETE | `/api/families/{familyId}/stores/{storeId}` | Delete store |
| GET | `/api/families/{familyId}/stores/check-name` | Check name availability |

---

## Open Questions (None)

All technical decisions have been resolved based on the spec, constitution requirements, and patterns established in previous features.

---

**Research Complete**: 2025-12-10
**Next Step**: Generate data-model.md, quickstart.md, and API contracts for Phase 1