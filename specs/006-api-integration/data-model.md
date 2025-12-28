# Data Model: NFC Inventory Tap

**Feature**: 006-nfc-inventory-tap  
**Date**: December 26, 2025  
**Database**: Amazon DynamoDB (Single-Table Design Extension)

## Overview

This document extends the existing `InventoryManagement` DynamoDB table with a new `NFCUrl` entity. The design follows the single-table pattern established in feature 001-family-inventory-mvp and enables efficient queries for URL validation, item lookups, and admin management.

## Table Structure (Existing)

**Table Name**: `InventoryManagement`

**Primary Key**:
- **PK** (Partition Key): String - Entity identifier
- **SK** (Sort Key): String - Entity type and sub-identifier

**Global Secondary Indexes** (Existing):
- **GSI1**: PK=GSI1PK, SK=GSI1SK
- **GSI2**: PK=GSI2PK, SK=GSI2SK

## New Entity: NFCUrl

### Purpose

Maps cryptographically random URL IDs to inventory items, enabling unauthenticated adjustments via NFC tag taps. Multiple URLs can map to the same item for different physical locations (e.g., pantry tag, fridge tag).

### Access Patterns

1. **Get URL details by urlId** (primary use case: NFC page load)
   - Query: GSI1 where GSI1PK = `URL#{urlId}`
   - Returns: itemId, familyId, isActive, item name

2. **List all URLs for an item** (admin UI)
   - Query: Table where PK = `FAMILY#{familyId}`, SK begins_with `ITEM#{itemId}#URL#`
   - Returns: All URLs for that item

3. **List all URLs for a family** (admin management)
   - Query: GSI2 where GSI2PK = `FAMILY#{familyId}#URLS`, sorted by createdAt
   - Returns: All URLs across all items

### Key Structure

**Main Table**:
- **PK**: `FAMILY#{familyId}`
- **SK**: `ITEM#{itemId}#URL#{urlId}`
- **GSI1PK**: `URL#{urlId}` (enables fast lookup by URL ID)
- **GSI1SK**: `ITEM#{itemId}`
- **GSI2PK**: `FAMILY#{familyId}#URLS` (list all URLs for family)
- **GSI2SK**: `CREATED#{createdAt}#URL#{urlId}` (sorted by creation time)

### Attributes

```typescript
interface NFCUrl {
  // Partition/Sort Keys
  PK: string;                    // FAMILY#{familyId}
  SK: string;                    // ITEM#{itemId}#URL#{urlId}
  
  // GSI Keys
  GSI1PK: string;                // URL#{urlId}
  GSI1SK: string;                // ITEM#{itemId}
  GSI2PK: string;                // FAMILY#{familyId}#URLS
  GSI2SK: string;                // CREATED#{createdAt}#URL#{urlId}
  
  // Entity Data
  entityType: 'NFCUrl';
  urlId: string;                 // Base62-encoded UUID (22 chars), e.g., "2gSZw8ZQPb7D5kN3X8mQ7"
  itemId: string;                // UUID of inventory item
  familyId: string;              // UUID of family
  itemName: string;              // Denormalized for fast display (cached)
  isActive: boolean;             // false if rotated/revoked
  createdAt: string;             // ISO 8601 timestamp
  createdBy: string;             // memberId who created URL
  lastAccessedAt?: string;       // ISO 8601 timestamp (updated on each tap)
  accessCount: number;           // Incremented on each access (for analytics)
  rotatedAt?: string;            // ISO 8601 timestamp when deactivated
  rotatedBy?: string;            // memberId who rotated URL
}
```

### Example Records

```json
{
  "PK": "FAMILY#f47ac10b-58cc-4372-a567-0e02b2c3d479",
  "SK": "ITEM#d5e8f9a0-1234-4567-89ab-cdef01234567#URL#2gSZw8ZQPb7D5kN3X8mQ7",
  "GSI1PK": "URL#2gSZw8ZQPb7D5kN3X8mQ7",
  "GSI1SK": "ITEM#d5e8f9a0-1234-4567-89ab-cdef01234567",
  "GSI2PK": "FAMILY#f47ac10b-58cc-4372-a567-0e02b2c3d479#URLS",
  "GSI2SK": "CREATED#2025-12-26T10:00:00Z#URL#2gSZw8ZQPb7D5kN3X8mQ7",
  "entityType": "NFCUrl",
  "urlId": "2gSZw8ZQPb7D5kN3X8mQ7",
  "itemId": "d5e8f9a0-1234-4567-89ab-cdef01234567",
  "familyId": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
  "itemName": "Paper Towels",
  "isActive": true,
  "createdAt": "2025-12-26T10:00:00Z",
  "createdBy": "550e8400-e29b-41d4-a716-446655440000",
  "lastAccessedAt": "2025-12-26T15:30:00Z",
  "accessCount": 12
}
```

**After Rotation** (old URL):
```json
{
  // ... same keys ...
  "isActive": false,
  "rotatedAt": "2025-12-27T09:00:00Z",
  "rotatedBy": "550e8400-e29b-41d4-a716-446655440000"
}
```

**New URL after rotation**:
```json
{
  "PK": "FAMILY#f47ac10b-58cc-4372-a567-0e02b2c3d479",
  "SK": "ITEM#d5e8f9a0-1234-4567-89ab-cdef01234567#URL#7pQm3nX8kD5wZ2gS9YbN4",
  "GSI1PK": "URL#7pQm3nX8kD5wZ2gS9YbN4",
  // ... new urlId, createdAt, etc.
  "isActive": true
}
```

## Denormalization Strategy

**itemName** is denormalized into NFCUrl records for fast display on NFC page without additional query.

**Update Strategy**:
- When item name changes in InventoryItem entity, update all related NFCUrl records
- Use DynamoDB batch write (max 25 items) or iterate for larger sets
- Trade-off: Slight write amplification for much faster read performance
- Acceptable because item name changes are rare

**Consistency**:
- Eventual consistency acceptable (name displayed may lag a few seconds)
- Background Lambda can reconcile any drift (scheduled weekly)

## Query Patterns & Performance

### Pattern 1: Validate URL and Get Item Info (NFC page load)

**Access Pattern**: User taps NFC tag → browser opens → page needs item info

**Query**:
```typescript
const params = {
  TableName: 'InventoryManagement',
  IndexName: 'GSI1',
  KeyConditionExpression: 'GSI1PK = :urlId',
  ExpressionAttributeValues: {
    ':urlId': `URL#${urlId}`
  }
};
const result = await docClient.query(params);
```

**Performance**: Single query, O(1) lookup via GSI1, <10ms typical

**Returns**: itemId, familyId, itemName, isActive

---

### Pattern 2: List URLs for Item (admin UI)

**Access Pattern**: Admin views inventory item → sees all NFC URLs for that item

**Query**:
```typescript
const params = {
  TableName: 'InventoryManagement',
  KeyConditionExpression: 'PK = :pk AND begins_with(SK, :skPrefix)',
  ExpressionAttributeValues: {
    ':pk': `FAMILY#${familyId}`,
    ':skPrefix': `ITEM#${itemId}#URL#`
  }
};
const result = await docClient.query(params);
```

**Performance**: Single query, returns 1-10 URLs typically, <20ms

---

### Pattern 3: List All URLs for Family (admin dashboard)

**Access Pattern**: Admin wants to see all NFC URLs across all items

**Query**:
```typescript
const params = {
  TableName: 'InventoryManagement',
  IndexName: 'GSI2',
  KeyConditionExpression: 'GSI2PK = :familyUrls',
  ExpressionAttributeValues: {
    ':familyUrls': `FAMILY#${familyId}#URLS`
  },
  ScanIndexForward: false // Most recent first
};
const result = await docClient.query(params);
```

**Performance**: Single query, returns all URLs (10-100 typical), <50ms

---

## Validation Rules

### urlId
- **Format**: Base62 encoded string (alphanumeric: a-z, A-Z, 0-9)
- **Length**: Exactly 22 characters
- **Uniqueness**: Must be globally unique (UUID collision is negligible)
- **Generation**: `crypto.randomUUID()` + base62 encoding

### itemId & familyId
- **Format**: UUID v4
- **Validation**: Must reference existing records
- **Foreign Key Check**: Query InventoryItem before creating NFCUrl

### isActive
- **Type**: Boolean
- **Default**: `true` on creation
- **Transition**: `true` → `false` (rotation), never back to `true`

### Timestamps
- **Format**: ISO 8601 with timezone (UTC)
- **createdAt**: Set once on creation, immutable
- **lastAccessedAt**: Updated on every NFC page load
- **rotatedAt**: Set when isActive becomes false

### accessCount
- **Type**: Number (integer)
- **Default**: 0
- **Update**: Atomic increment via UpdateExpression
- **Purpose**: Analytics, detect suspicious activity

## State Transitions

```
┌─────────┐
│ Created │ (isActive = true)
└────┬────┘
     │
     │ User taps NFC tag (multiple times)
     ├─> lastAccessedAt updated
     ├─> accessCount incremented
     │
     │ Admin requests rotation
     ▼
┌──────────┐
│ Rotated  │ (isActive = false, rotatedAt set)
└──────────┘
     │
     │ (Terminal state, never reactivated)
     │ New URL created for same item
     ▼
   (end)
```

## Migration (None Required)

This feature adds a new entity type. No migration of existing data needed.

**First Deployment**:
- Table already exists (from feature 001)
- GSI1 and GSI2 already exist
- New entity type can be written immediately
- No schema changes to existing entities

## Capacity Planning

**Assumptions**:
- 100 families using NFC feature
- Average 20 items with NFC tags per family
- Average 2 URLs per item (different locations)
- 10 taps per day per URL

**Calculations**:
- Total URLs: 100 × 20 × 2 = 4,000 NFCUrl records
- Daily reads: 4,000 × 10 = 40,000 reads/day = ~0.5 reads/sec
- Daily writes: Minimal (URL creation rare, access count updates batched)

**DynamoDB Capacity**:
- On-demand pricing sufficient (low volume)
- Provisioned capacity alternative: 1 RCU, 1 WCU per table
- GSI1 capacity: Same as table (most reads go through GSI1)

**Cost Estimate**:
- On-demand: ~$0.01/day = ~$0.30/month (negligible)

## Security Considerations

### URL ID Entropy
- 122 bits of entropy from UUID v4
- Collision probability: 1 in 5.3×10^36
- Brute force infeasible: 2^122 combinations
- Time to enumerate: Millions of years at 1 billion guesses/second

### Family Isolation
- All queries include familyId filter
- GSI1 returns single URL, but includes familyId for validation
- Lambda authorizer enforces family boundary for admin operations

### Data Exposure
- urlId is sensitive (acts as bearer token)
- Never log full URL in CloudWatch (log hash only)
- Admin UI must warn about URL sharing implications

## Index Coverage

All access patterns are covered by existing table and GSIs:

| Access Pattern | Index Used | Key Condition | Filter | Performance |
|----------------|------------|---------------|--------|-------------|
| Get URL by urlId | GSI1 | GSI1PK = URL#{urlId} | None | O(1), <10ms |
| List URLs for item | Main Table | PK = FAMILY, SK begins_with ITEM#URL | None | O(n), <20ms |
| List URLs for family | GSI2 | GSI2PK = FAMILY#URLS | None | O(n), <50ms |

No table scans required. ✅

## Testing Strategy

### Unit Tests
- `urlIdGenerator.test.ts`: Verify uniqueness, format, entropy
- `nfcUrl.model.test.ts`: Validate attribute constraints

### Integration Tests
- Create NFCUrl → verify GSI1 lookup works
- Create multiple URLs for same item → query returns all
- Rotate URL → isActive becomes false, new URL created
- Access count increment → verify atomic update

### Load Tests
- 1000 concurrent URL validations (NFC page loads)
- Verify query latency < 50ms p95
- No DynamoDB throttling errors

## Backup & Recovery

**Backup**:
- DynamoDB Point-in-Time Recovery (PITR) enabled
- Continuous backups for 35 days
- Can restore to any point in last 35 days

**Recovery Scenarios**:
- Accidental URL deletion: Restore from PITR
- URL rotation mistake: Create new URL (old one stays inactive)
- Item deletion: NFCUrl records remain (soft delete pattern)

## Future Enhancements (Out of Scope)

- QR code alternative: Add `qrCodeUrl` field (same urlId)
- URL expiration: Add `expiresAt` timestamp (time-limited sharing)
- Usage analytics: Aggregate accessCount for insights
- Geofencing: Add location validation (privacy concerns)
