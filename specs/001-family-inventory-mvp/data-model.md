# Data Model: Family Inventory Management System MVP

**Feature**: 001-family-inventory-mvp  
**Date**: 2025-12-08  
**Database**: Amazon DynamoDB (Single-Table Design)

## Overview

This document defines the data model for the Family Inventory Management System using DynamoDB's single-table design pattern. All entities are stored in a single table with composite keys and Global Secondary Indexes (GSIs) for efficient querying.

## Table Structure

**Table Name**: `InventoryManagement`

**Primary Key**:
- **PK** (Partition Key): String - Entity identifier
- **SK** (Sort Key): String - Entity type and sub-identifier

**Attributes**:
- **GSI1PK**: String - Global Secondary Index 1 Partition Key
- **GSI1SK**: String - Global Secondary Index 1 Sort Key
- **GSI2PK**: String - Global Secondary Index 2 Partition Key
- **GSI2SK**: String - Global Secondary Index 2 Sort Key
- **entityType**: String - Type discriminator (Family, Member, InventoryItem, etc.)
- **createdAt**: String - ISO 8601 timestamp
- **updatedAt**: String - ISO 8601 timestamp
- Additional entity-specific attributes

## Entities

### 1. Family

The root organizational unit representing a household.

**Access Pattern**: Get family by ID, list all families (admin)

**Key Structure**:
- PK: `FAMILY#{familyId}`
- SK: `FAMILY#{familyId}`

**Attributes**:
```typescript
{
  familyId: string;           // UUID
  name: string;               // Family display name
  createdBy: string;          // memberId of creator
  entityType: 'Family';
  createdAt: string;          // ISO 8601
  updatedAt: string;          // ISO 8601
}
```

**Validation Rules**:
- `familyId`: UUID v4 format
- `name`: 1-100 characters, required
- `createdBy`: Must reference valid member

**Example**:
```json
{
  "PK": "FAMILY#f47ac10b-58cc-4372-a567-0e02b2c3d479",
  "SK": "FAMILY#f47ac10b-58cc-4372-a567-0e02b2c3d479",
  "familyId": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
  "name": "Smith Family",
  "createdBy": "550e8400-e29b-41d4-a716-446655440000",
  "entityType": "Family",
  "createdAt": "2025-12-08T10:00:00Z",
  "updatedAt": "2025-12-08T10:00:00Z"
}
```

---

### 2. Member

A user belonging to a family with a specific role.

**⚠️ ARCHITECTURE NOTE**: Member familyId and role are stored **ONLY in DynamoDB**, NOT as Cognito custom attributes. Cognito handles authentication only (username/password). The Lambda authorizer validates the JWT, extracts the Cognito `sub` (memberId), then queries DynamoDB to retrieve the member's familyId and role for authorization decisions.

**Access Pattern**: 
- Get member by ID
- List all members in a family
- Get member's family membership

**Key Structure**:
- PK: `FAMILY#{familyId}`
- SK: `MEMBER#{memberId}`
- GSI1PK: `MEMBER#{memberId}`
- GSI1SK: `FAMILY#{familyId}`

**Attributes**:
```typescript
{
  memberId: string;           // UUID (Cognito user sub)
  familyId: string;           // UUID
  email: string;              // User email
  name: string;               // Display name
  role: 'admin' | 'suggester'; // Role within family
  status: 'active' | 'removed'; // Member status
  entityType: 'Member';
  createdAt: string;          // ISO 8601
  updatedAt: string;          // ISO 8601
}
```

**Validation Rules**:
- `memberId`: UUID v4 format (matches Cognito sub)
- `email`: Valid email format, unique per family
- `name`: 1-100 characters, required
- `role`: Must be 'admin' or 'suggester'
- `status`: Must be 'active' or 'removed'
- At least one admin must exist per family

**Relationships**:
- Belongs to one Family
- Can create multiple InventoryItems, Notifications, Suggestions

**Example**:
```json
{
  "PK": "FAMILY#f47ac10b-58cc-4372-a567-0e02b2c3d479",
  "SK": "MEMBER#550e8400-e29b-41d4-a716-446655440000",
  "GSI1PK": "MEMBER#550e8400-e29b-41d4-a716-446655440000",
  "GSI1SK": "FAMILY#f47ac10b-58cc-4372-a567-0e02b2c3d479",
  "memberId": "550e8400-e29b-41d4-a716-446655440000",
  "familyId": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
  "email": "john@example.com",
  "name": "John Smith",
  "role": "admin",
  "status": "active",
  "entityType": "Member",
  "createdAt": "2025-12-08T10:00:00Z",
  "updatedAt": "2025-12-08T10:00:00Z"
}
```

---

### 3. InventoryItem

A consumable good tracked by the family.

**Access Pattern**:
- Get item by ID
- List all items for a family
- Query low-stock items for a family

**Key Structure**:
- PK: `FAMILY#{familyId}`
- SK: `ITEM#{itemId}`
- GSI2PK: `FAMILY#{familyId}#ITEMS`
- GSI2SK: `STATUS#{status}#QUANTITY#{paddedQuantity}`

**Attributes**:
```typescript
{
  itemId: string;             // UUID
  familyId: string;           // UUID
  name: string;               // Item display name
  quantity: number;           // Current quantity (integer >= 0)
  threshold: number;          // Low-stock threshold (integer >= 0)
  locationId: string | null;  // UUID of StorageLocation
  preferredStoreId: string | null; // UUID of Store
  alternateStoreIds: string[]; // Array of Store UUIDs
  status: 'active' | 'archived'; // Item status
  entityType: 'InventoryItem';
  createdAt: string;          // ISO 8601
  updatedAt: string;          // ISO 8601
  createdBy: string;          // memberId
}
```

**Validation Rules**:
- `itemId`: UUID v4 format
- `name`: 1-100 characters, required
- `quantity`: Integer >= 0
- `threshold`: Integer >= 0
- `locationId`: Must reference valid StorageLocation or null
- `preferredStoreId`: Must reference valid Store or null
- `alternateStoreIds`: Array of valid Store UUIDs
- `status`: Must be 'active' or 'archived'

**Relationships**:
- Belongs to one Family
- References one StorageLocation (optional)
- References one or more Stores (optional)
- Can have multiple ShoppingListItems
- Can trigger multiple Notifications

**State Transitions**:
- When `quantity < threshold`: Generate low-stock Notification
- When `quantity >= threshold` after being low: Clear/resolve Notification
- When archived: `status` changes to 'archived', item hidden from active views

**Example**:
```json
{
  "PK": "FAMILY#f47ac10b-58cc-4372-a567-0e02b2c3d479",
  "SK": "ITEM#6ba7b810-9dad-11d1-80b4-00c04fd430c8",
  "GSI2PK": "FAMILY#f47ac10b-58cc-4372-a567-0e02b2c3d479#ITEMS",
  "GSI2SK": "STATUS#active#QUANTITY#0000000003",
  "itemId": "6ba7b810-9dad-11d1-80b4-00c04fd430c8",
  "familyId": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
  "name": "Paper Towels",
  "quantity": 3,
  "threshold": 5,
  "locationId": "7c9e6679-7425-40de-944b-e07fc1f90ae7",
  "preferredStoreId": "123e4567-e89b-12d3-a456-426614174000",
  "alternateStoreIds": ["223e4567-e89b-12d3-a456-426614174001"],
  "status": "active",
  "entityType": "InventoryItem",
  "createdAt": "2025-12-08T10:00:00Z",
  "updatedAt": "2025-12-08T11:30:00Z",
  "createdBy": "550e8400-e29b-41d4-a716-446655440000"
}
```

---

### 4. StorageLocation

A reference location where items are kept (e.g., pantry, garage).

**Access Pattern**: List all locations for a family

**Key Structure**:
- PK: `FAMILY#{familyId}`
- SK: `LOCATION#{locationId}`

**Attributes**:
```typescript
{
  locationId: string;         // UUID
  familyId: string;           // UUID
  name: string;               // Location name
  description: string | null; // Optional description
  entityType: 'StorageLocation';
  createdAt: string;          // ISO 8601
  updatedAt: string;          // ISO 8601
}
```

**Validation Rules**:
- `locationId`: UUID v4 format
- `name`: 1-50 characters, required, unique per family
- `description`: 0-200 characters, optional

**Relationships**:
- Belongs to one Family
- Referenced by multiple InventoryItems

**Example**:
```json
{
  "PK": "FAMILY#f47ac10b-58cc-4372-a567-0e02b2c3d479",
  "SK": "LOCATION#7c9e6679-7425-40de-944b-e07fc1f90ae7",
  "locationId": "7c9e6679-7425-40de-944b-e07fc1f90ae7",
  "familyId": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
  "name": "Pantry",
  "description": "Kitchen pantry cabinet",
  "entityType": "StorageLocation",
  "createdAt": "2025-12-08T10:00:00Z",
  "updatedAt": "2025-12-08T10:00:00Z"
}
```

---

### 5. Store

A reference location where items can be purchased (e.g., grocery store).

**Access Pattern**: List all stores for a family

**Key Structure**:
- PK: `FAMILY#{familyId}`
- SK: `STORE#{storeId}`

**Attributes**:
```typescript
{
  storeId: string;            // UUID
  familyId: string;           // UUID
  name: string;               // Store name
  address: string | null;     // Optional address
  entityType: 'Store';
  createdAt: string;          // ISO 8601
  updatedAt: string;          // ISO 8601
}
```

**Validation Rules**:
- `storeId`: UUID v4 format
- `name`: 1-100 characters, required, unique per family
- `address`: 0-200 characters, optional

**Relationships**:
- Belongs to one Family
- Referenced by multiple InventoryItems
- Referenced by multiple ShoppingListItems

**Example**:
```json
{
  "PK": "FAMILY#f47ac10b-58cc-4372-a567-0e02b2c3d479",
  "SK": "STORE#123e4567-e89b-12d3-a456-426614174000",
  "storeId": "123e4567-e89b-12d3-a456-426614174000",
  "familyId": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
  "name": "Whole Foods Market",
  "address": "123 Main St, Anytown, USA",
  "entityType": "Store",
  "createdAt": "2025-12-08T10:00:00Z",
  "updatedAt": "2025-12-08T10:00:00Z"
}
```

---

### 6. ShoppingListItem

An item that needs to be purchased.

**Access Pattern**: List all shopping list items for a family, grouped by store

**Key Structure**:
- PK: `FAMILY#{familyId}`
- SK: `SHOPPING#{shoppingItemId}`
- GSI2PK: `FAMILY#{familyId}#SHOPPING`
- GSI2SK: `STORE#{storeId}#STATUS#{status}`

**Attributes**:
```typescript
{
  shoppingItemId: string;     // UUID
  familyId: string;           // UUID
  itemId: string | null;      // UUID of InventoryItem (if linked)
  name: string;               // Item name
  storeId: string | null;     // UUID of Store
  status: 'pending' | 'purchased'; // Purchase status
  quantity: number | null;    // Optional quantity to purchase
  notes: string | null;       // Optional notes
  entityType: 'ShoppingListItem';
  createdAt: string;          // ISO 8601
  updatedAt: string;          // ISO 8601
  addedBy: string;            // memberId
}
```

**Validation Rules**:
- `shoppingItemId`: UUID v4 format
- `itemId`: Must reference valid InventoryItem or null (for free-text items)
- `name`: 1-100 characters, required
- `storeId`: Must reference valid Store or null
- `status`: Must be 'pending' or 'purchased'
- `quantity`: Integer > 0 or null

**Relationships**:
- Belongs to one Family
- Optionally references one InventoryItem
- Optionally references one Store

**State Transitions**:
- When created: `status` = 'pending'
- When checked off: `status` = 'purchased'
- Does NOT automatically update InventoryItem quantity when purchased

**Example**:
```json
{
  "PK": "FAMILY#f47ac10b-58cc-4372-a567-0e02b2c3d479",
  "SK": "SHOPPING#8f14e45f-ceea-467a-9b36-34f6c3b3e7d1",
  "GSI2PK": "FAMILY#f47ac10b-58cc-4372-a567-0e02b2c3d479#SHOPPING",
  "GSI2SK": "STORE#123e4567-e89b-12d3-a456-426614174000#STATUS#pending",
  "shoppingItemId": "8f14e45f-ceea-467a-9b36-34f6c3b3e7d1",
  "familyId": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
  "itemId": "6ba7b810-9dad-11d1-80b4-00c04fd430c8",
  "name": "Paper Towels",
  "storeId": "123e4567-e89b-12d3-a456-426614174000",
  "status": "pending",
  "quantity": 2,
  "notes": "Prefer double-roll",
  "entityType": "ShoppingListItem",
  "createdAt": "2025-12-08T12:00:00Z",
  "updatedAt": "2025-12-08T12:00:00Z",
  "addedBy": "550e8400-e29b-41d4-a716-446655440000"
}
```

---

### 7. Notification

An alert generated when inventory items fall below thresholds.

**Access Pattern**: List all notifications for a family, ordered by date

**Key Structure**:
- PK: `FAMILY#{familyId}`
- SK: `NOTIFICATION#{notificationId}`
- GSI2PK: `FAMILY#{familyId}#NOTIFICATIONS`
- GSI2SK: `STATUS#{status}#CREATED#{createdAt}`

**Attributes**:
```typescript
{
  notificationId: string;     // UUID
  familyId: string;           // UUID
  itemId: string;             // UUID of InventoryItem
  itemName: string;           // Snapshot of item name
  type: 'low_stock';          // Notification type
  status: 'active' | 'resolved' | 'acknowledged'; // Notification status
  currentQuantity: number;    // Quantity when notification created
  threshold: number;          // Threshold at time of notification
  entityType: 'Notification';
  createdAt: string;          // ISO 8601
  updatedAt: string;          // ISO 8601
  resolvedAt: string | null;  // ISO 8601 when resolved
}
```

**Validation Rules**:
- `notificationId`: UUID v4 format
- `itemId`: Must reference valid InventoryItem
- `type`: Currently only 'low_stock' (extensible for future types)
- `status`: Must be 'active', 'resolved', or 'acknowledged'
- `currentQuantity`: Integer >= 0
- `threshold`: Integer >= 0

**Relationships**:
- Belongs to one Family
- References one InventoryItem

**State Transitions**:
- Created when `InventoryItem.quantity < InventoryItem.threshold`
- `status` = 'active' on creation
- `status` = 'acknowledged' when user views notification
- `status` = 'resolved' when `InventoryItem.quantity >= InventoryItem.threshold`

**Example**:
```json
{
  "PK": "FAMILY#f47ac10b-58cc-4372-a567-0e02b2c3d479",
  "SK": "NOTIFICATION#9f14e45f-ceea-467a-9b36-34f6c3b3e7d2",
  "GSI2PK": "FAMILY#f47ac10b-58cc-4372-a567-0e02b2c3d479#NOTIFICATIONS",
  "GSI2SK": "STATUS#active#CREATED#2025-12-08T11:30:00Z",
  "notificationId": "9f14e45f-ceea-467a-9b36-34f6c3b3e7d2",
  "familyId": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
  "itemId": "6ba7b810-9dad-11d1-80b4-00c04fd430c8",
  "itemName": "Paper Towels",
  "type": "low_stock",
  "status": "active",
  "currentQuantity": 3,
  "threshold": 5,
  "entityType": "Notification",
  "createdAt": "2025-12-08T11:30:00Z",
  "updatedAt": "2025-12-08T11:30:00Z",
  "resolvedAt": null
}
```

---

### 8. Suggestion

A request from a suggester to add an item to the shopping list or create a new inventory item.

**Access Pattern**: List all suggestions for a family, filtered by status

**Key Structure**:
- PK: `FAMILY#{familyId}`
- SK: `SUGGESTION#{suggestionId}`
- GSI2PK: `FAMILY#{familyId}#SUGGESTIONS`
- GSI2SK: `STATUS#{status}#CREATED#{createdAt}`

**Attributes**:
```typescript
{
  suggestionId: string;       // UUID
  familyId: string;           // UUID
  suggestedBy: string;        // memberId (must be suggester role)
  type: 'add_to_shopping' | 'create_item'; // Suggestion type
  status: 'pending' | 'approved' | 'rejected'; // Suggestion status
  itemId: string | null;      // UUID of existing InventoryItem (if type = add_to_shopping)
  proposedItemName: string | null; // Name for new item (if type = create_item)
  proposedQuantity: number | null; // Quantity for new item
  proposedThreshold: number | null; // Threshold for new item
  notes: string | null;       // Optional notes from suggester
  reviewedBy: string | null;  // memberId of admin who reviewed
  reviewedAt: string | null;  // ISO 8601 when reviewed
  entityType: 'Suggestion';
  createdAt: string;          // ISO 8601
  updatedAt: string;          // ISO 8601
}
```

**Validation Rules**:
- `suggestionId`: UUID v4 format
- `suggestedBy`: Must be a member with 'suggester' role
- `type`: Must be 'add_to_shopping' or 'create_item'
- `status`: Must be 'pending', 'approved', or 'rejected'
- If `type` = 'add_to_shopping': `itemId` required, proposed fields null
- If `type` = 'create_item': `proposedItemName` required, `itemId` null
- `reviewedBy`: Must be a member with 'admin' role (when reviewed)

**Relationships**:
- Belongs to one Family
- Created by one Member (suggester)
- Reviewed by one Member (admin)
- Optionally references one InventoryItem

**State Transitions**:
- Created: `status` = 'pending'
- When admin approves: `status` = 'approved', action executed
- When admin rejects: `status` = 'rejected', no action taken

**Example**:
```json
{
  "PK": "FAMILY#f47ac10b-58cc-4372-a567-0e02b2c3d479",
  "SK": "SUGGESTION#af14e45f-ceea-467a-9b36-34f6c3b3e7d3",
  "GSI2PK": "FAMILY#f47ac10b-58cc-4372-a567-0e02b2c3d479#SUGGESTIONS",
  "GSI2SK": "STATUS#pending#CREATED#2025-12-08T13:00:00Z",
  "suggestionId": "af14e45f-ceea-467a-9b36-34f6c3b3e7d3",
  "familyId": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
  "suggestedBy": "660e8400-e29b-41d4-a716-446655440001",
  "type": "create_item",
  "status": "pending",
  "itemId": null,
  "proposedItemName": "Snack Bars",
  "proposedQuantity": 10,
  "proposedThreshold": 5,
  "notes": "We're running low on after-school snacks",
  "reviewedBy": null,
  "reviewedAt": null,
  "entityType": "Suggestion",
  "createdAt": "2025-12-08T13:00:00Z",
  "updatedAt": "2025-12-08T13:00:00Z"
}
```

---

## Global Secondary Indexes (GSIs)

### GSI1: Member-to-Family Lookup

**Purpose**: Efficiently query which family a member belongs to

- **GSI1PK**: `MEMBER#{memberId}`
- **GSI1SK**: `FAMILY#{familyId}`

**Use Cases**:
- On login, determine user's family membership
- Validate member access to family resources

### GSI2: Family-Scoped Queries

**Purpose**: Efficiently query entity collections within a family with sorting/filtering

- **GSI2PK**: `FAMILY#{familyId}#{entityType}`
- **GSI2SK**: Varies by entity type (status, date, quantity, etc.)

**Use Cases**:
- Query low-stock items: `GSI2PK = FAMILY#123#ITEMS` + `GSI2SK begins_with STATUS#active#QUANTITY#`
- Query pending suggestions: `GSI2PK = FAMILY#123#SUGGESTIONS` + `GSI2SK begins_with STATUS#pending`
- Query active notifications: `GSI2PK = FAMILY#123#NOTIFICATIONS` + `GSI2SK begins_with STATUS#active`
- Query shopping list by store: `GSI2PK = FAMILY#123#SHOPPING` + `GSI2SK begins_with STORE#456`

---

## Access Patterns Summary

| Access Pattern | Query Type | Keys Used |
|----------------|-----------|-----------|
| Get family by ID | GetItem | PK = `FAMILY#{id}`, SK = `FAMILY#{id}` |
| Get member by ID | GetItem | PK = `FAMILY#{familyId}`, SK = `MEMBER#{memberId}` |
| Get member's family | Query | GSI1: PK = `MEMBER#{memberId}` |
| List family members | Query | PK = `FAMILY#{familyId}`, SK begins_with `MEMBER#` |
| Get inventory item | GetItem | PK = `FAMILY#{familyId}`, SK = `ITEM#{itemId}` |
| List all inventory items | Query | PK = `FAMILY#{familyId}`, SK begins_with `ITEM#` |
| List low-stock items | Query | GSI2: PK = `FAMILY#{familyId}#ITEMS`, SK condition |
| List active notifications | Query | GSI2: PK = `FAMILY#{familyId}#NOTIFICATIONS`, SK begins_with `STATUS#active` |
| List shopping list | Query | PK = `FAMILY#{familyId}`, SK begins_with `SHOPPING#` |
| List shopping by store | Query | GSI2: PK = `FAMILY#{familyId}#SHOPPING`, SK begins_with `STORE#{storeId}` |
| List pending suggestions | Query | GSI2: PK = `FAMILY#{familyId}#SUGGESTIONS`, SK begins_with `STATUS#pending` |
| List storage locations | Query | PK = `FAMILY#{familyId}`, SK begins_with `LOCATION#` |
| List stores | Query | PK = `FAMILY#{familyId}`, SK begins_with `STORE#` |

---

## Data Integrity Rules

### Family Isolation
- All queries MUST filter by `familyId` to ensure data isolation
- Lambda authorizer MUST inject `familyId` from JWT claims
- Cross-family access MUST be prevented at the application layer

### Member Roles
- At least one `admin` member MUST exist per family
- Removing last admin MUST be prevented
- Role changes MUST be validated before saving

### Inventory Item Constraints
- Quantity MUST NOT go below 0
- Archived items MUST NOT appear in active views
- Deleting an item MUST handle references (notifications, shopping list)

### Notification Lifecycle
- Low-stock notifications MUST be auto-generated when `quantity < threshold`
- Notifications MUST be auto-resolved when `quantity >= threshold`
- Emails MUST be sent to all admin members when notification created

### Suggestion Workflow
- Only `suggester` members can create suggestions
- Only `admin` members can approve/reject suggestions
- Approved suggestions MUST execute their intended action atomically

---

## TypeScript Type Definitions

All entities will have corresponding TypeScript interfaces with Zod schemas for validation.

**Location**: `inventory-management-backend/src/types/entities.ts`

**Example**:
```typescript
import { z } from 'zod';

export const InventoryItemSchema = z.object({
  itemId: z.string().uuid(),
  familyId: z.string().uuid(),
  name: z.string().min(1).max(100),
  quantity: z.number().int().min(0),
  threshold: z.number().int().min(0),
  locationId: z.string().uuid().nullable(),
  preferredStoreId: z.string().uuid().nullable(),
  alternateStoreIds: z.array(z.string().uuid()),
  status: z.enum(['active', 'archived']),
  entityType: z.literal('InventoryItem'),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  createdBy: z.string().uuid(),
});

export type InventoryItem = z.infer<typeof InventoryItemSchema>;
```

---

**Data Model Complete**: 2025-12-08  
**Status**: Ready for API contract generation

