# Quickstart Guide: Reference Data Management

**Feature**: 005-reference-data  
**Date**: 2025-12-10  
**Audience**: Developers implementing the feature  
**Parent Feature**: 001-family-inventory-mvp

## Overview

This guide helps you get started with implementing the Reference Data Management feature. It enables family admins to create and manage standardized storage locations (pantry, garage, fridge) and store/vendor lists that serve as the foundation for inventory item configuration.

The feature extends the existing StorageLocation and Store entities from the parent feature with:
- **Optimistic locking** via `version` field for concurrent edit protection
- **Case-insensitive uniqueness** via `nameLower` field
- **Reference checking** before deletion to maintain data integrity

---

## 1. Prerequisites

Before starting, ensure you have completed the setup from the parent feature:

- **Node.js**: 20.x LTS ([download](https://nodejs.org/))
- **AWS Account**: With permissions for Lambda, DynamoDB, Cognito, SAM
- **AWS CLI**: Configured with credentials
- **AWS SAM CLI**: For local development and deployment
- **Git**: Version control
- **Parent Feature**: `001-family-inventory-mvp` must be implemented

### Required Infrastructure

| Resource | Description |
|----------|-------------|
| DynamoDB Table | `InventoryManagement` table from parent feature |
| Cognito User Pool | Authentication from parent feature |
| API Gateway | REST API from parent feature |

Refer to [`001-family-inventory-mvp/quickstart.md`](../001-family-inventory-mvp/quickstart.md) for detailed setup instructions.

---

## 2. Key Concepts

### Optimistic Locking (Version Field)

All updates require the current `version` number to prevent concurrent edit conflicts:

```typescript
// Update request must include version
const updateRequest = {
  name: "Updated Pantry Name",
  description: "New description",
  version: 1  // Must match current version in database
};

// If version mismatch, returns HTTP 409 Conflict
// Client receives current entity state for retry
```

**Conflict Resolution Flow:**
1. Client sends update with expected version
2. Server checks if version matches
3. If mismatch: return 409 with current entity state
4. Client displays conflict dialog with options:
   - "Refresh and lose my changes"
   - "Overwrite with my changes" (retry with new version)

### Case-Insensitive Uniqueness (nameLower Field)

Names are unique per family, case-insensitively:

```typescript
// Both would be rejected as duplicates:
// - "Kitchen Pantry" (existing)
// - "kitchen pantry" (new - rejected)
// - "KITCHEN PANTRY" (new - rejected)

// Stored in database:
{
  name: "Kitchen Pantry",      // Original casing preserved
  nameLower: "kitchen pantry"  // Lowercase for uniqueness checks
}
```

### Reference Checking Before Deletion

Entities cannot be deleted if referenced by other items:

```typescript
// StorageLocation: Check InventoryItems
// Store: Check InventoryItems AND ShoppingListItems

// If references exist, returns HTTP 409 with reference details:
{
  error: "REFERENCE_EXISTS",
  message: "Cannot delete storage location that is referenced by inventory items",
  references: {
    inventoryItems: 5
  }
}
```

---

## 3. Project Structure

```text
src/
  app/
    api/
      families/
        [familyId]/
          locations/
            route.ts                    # GET (list), POST (create)
            [locationId]/
              route.ts                  # GET, PUT, DELETE
            check-name/
              route.ts                  # POST (name availability)
          stores/
            route.ts                    # GET (list), POST (create)
            [storeId]/
              route.ts                  # GET, PUT, DELETE
            check-name/
              route.ts                  # POST (name availability)
  lib/
    reference-data/
      storage-location.service.ts       # Business logic for locations
      store.service.ts                  # Business logic for stores
      reference-data.repository.ts      # DynamoDB operations
      schemas.ts                        # Zod validation schemas
      errors.ts                         # Custom error classes
  components/
    reference-data/
      StorageLocationList.tsx           # List view for locations
      StorageLocationForm.tsx           # Create/edit form
      StoreList.tsx                     # List view for stores
      StoreForm.tsx                     # Create/edit form
      ReferenceDataEmptyState.tsx       # Empty state component
      DeleteConfirmDialog.tsx           # Deletion confirmation
tests/
  lib/
    reference-data/
      storage-location.service.test.ts
      store.service.test.ts
      reference-data.repository.test.ts
  components/
    reference-data/
      StorageLocationList.test.tsx
      StorageLocationForm.test.tsx
      StoreList.test.tsx
      StoreForm.test.tsx
```

---

## 4. Quick Commands

```bash
# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run tests with coverage
npm test -- --coverage

# Run linting
npm run lint

# Start development server
npm run dev

# Build for production
npm run build

# Deploy with SAM
sam build && sam deploy
```

---

## 5. Implementation Checklist

### Phase 1: Foundation

- [ ] Create Zod schemas for validation (`src/lib/reference-data/schemas.ts`)
- [ ] Create custom error classes (`src/lib/reference-data/errors.ts`)
- [ ] Implement repository layer for DynamoDB operations (`src/lib/reference-data/reference-data.repository.ts`)

### Phase 2: Service Layer

- [ ] Implement StorageLocation service with business logic (`src/lib/reference-data/storage-location.service.ts`)
- [ ] Implement Store service with business logic (`src/lib/reference-data/store.service.ts`)
- [ ] Add reference checking logic for deletion prevention

### Phase 3: API Routes

- [ ] Create StorageLocation API routes (CRUD + check-name)
- [ ] Create Store API routes (CRUD + check-name)
- [ ] Add proper error handling and response formatting

### Phase 4: UI Components

- [ ] Build StorageLocationList component with empty state
- [ ] Build StorageLocationForm component with real-time validation
- [ ] Build StoreList component with empty state
- [ ] Build StoreForm component with real-time validation
- [ ] Add delete confirmation dialogs with reference display

### Phase 5: Testing

- [ ] Write unit tests for repository layer
- [ ] Write unit tests for service layer
- [ ] Write component tests with React Testing Library
- [ ] Achieve 80% coverage for critical paths

---

## 6. Key Files Reference

### Feature Documentation

| File | Description |
|------|-------------|
| [`spec.md`](./spec.md) | Feature specification with requirements |
| [`data-model.md`](./data-model.md) | Extended entity definitions with new fields |
| [`contracts/api-spec.yaml`](./contracts/api-spec.yaml) | OpenAPI specification for 12 endpoints |
| [`research.md`](./research.md) | Technical decisions and rationale |
| [`checklists/requirements.md`](./checklists/requirements.md) | Requirements validation checklist |

### Parent Feature

| File | Description |
|------|-------------|
| [Parent Quickstart](../001-family-inventory-mvp/quickstart.md) | Setup and development workflow |
| [Parent Data Model](../001-family-inventory-mvp/data-model.md) | Base entity definitions |
| [Parent API Spec](../001-family-inventory-mvp/contracts/api-spec.yaml) | Base API contracts |

---

## 7. Common Patterns

### Creating with Uniqueness Check

```typescript
import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';
import { QueryCommand, PutCommand } from '@aws-sdk/lib-dynamodb';

// Zod schema with trim
const CreateStorageLocationSchema = z.object({
  name: z.string().trim().min(1).max(50),
  description: z.string().trim().max(200).optional().nullable()
    .transform(val => val || null)
});

async function createStorageLocation(
  familyId: string,
  input: { name: string; description?: string | null }
): Promise<StorageLocation> {
  // Validate and trim input
  const validated = CreateStorageLocationSchema.parse(input);
  const nameLower = validated.name.toLowerCase();
  
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
    Limit: 1
  }));
  
  if ((existing.Items?.length ?? 0) > 0) {
    throw new DuplicateNameError(
      `A storage location named "${existing.Items![0].name}" already exists`
    );
  }
  
  // Create the new location
  const locationId = uuidv4();
  const now = new Date().toISOString();
  
  const item = {
    PK: `FAMILY#${familyId}`,
    SK: `LOCATION#${locationId}`,
    locationId,
    familyId,
    name: validated.name,
    nameLower,
    description: validated.description,
    version: 1,
    entityType: 'StorageLocation',
    createdAt: now,
    updatedAt: now
  };
  
  await docClient.send(new PutCommand({
    TableName: 'InventoryManagement',
    Item: item,
    ConditionExpression: 'attribute_not_exists(PK)'
  }));
  
  return item;
}
```

### Updating with Optimistic Locking

```typescript
import { UpdateCommand } from '@aws-sdk/lib-dynamodb';

async function updateStorageLocation(
  familyId: string,
  locationId: string,
  input: { name: string; description?: string | null; version: number }
): Promise<StorageLocation> {
  const validated = UpdateStorageLocationSchema.parse(input);
  const nameLower = validated.name.toLowerCase();
  const now = new Date().toISOString();
  
  // Check for duplicate name (excluding self)
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
  try {
    const result = await docClient.send(new UpdateCommand({
      TableName: 'InventoryManagement',
      Key: {
        PK: `FAMILY#${familyId}`,
        SK: `LOCATION#${locationId}`
      },
      UpdateExpression: 'SET #name = :name, nameLower = :nameLower, description = :description, #version = #version + :one, updatedAt = :now',
      ConditionExpression: '#version = :expectedVersion',
      ExpressionAttributeNames: {
        '#name': 'name',
        '#version': 'version'
      },
      ExpressionAttributeValues: {
        ':name': validated.name,
        ':nameLower': nameLower,
        ':description': validated.description,
        ':one': 1,
        ':expectedVersion': validated.version,
        ':now': now
      },
      ReturnValues: 'ALL_NEW'
    }));
    
    return result.Attributes as StorageLocation;
  } catch (error) {
    if (error.name === 'ConditionalCheckFailedException') {
      // Fetch current entity for conflict response
      const current = await getStorageLocation(familyId, locationId);
      throw new VersionConflictError(
        'This item was modified by another user',
        current.version,
        current
      );
    }
    throw error;
  }
}
```

### Deleting with Reference Check

```typescript
import { DeleteCommand } from '@aws-sdk/lib-dynamodb';

async function deleteStorageLocation(
  familyId: string,
  locationId: string
): Promise<void> {
  // Phase 1: Quick check for any references
  const hasRefs = await hasLocationReferences(familyId, locationId);
  
  if (hasRefs) {
    // Phase 2: Get detailed reference count for error response
    const refCount = await getLocationReferenceCount(familyId, locationId);
    throw new ReferenceExistsError(
      'Cannot delete storage location that is referenced by inventory items',
      { inventoryItems: refCount }
    );
  }
  
  // Delete the location
  await docClient.send(new DeleteCommand({
    TableName: 'InventoryManagement',
    Key: {
      PK: `FAMILY#${familyId}`,
      SK: `LOCATION#${locationId}`
    },
    ConditionExpression: 'attribute_exists(PK)'
  }));
}

async function hasLocationReferences(
  familyId: string,
  locationId: string
): Promise<boolean> {
  const result = await docClient.send(new QueryCommand({
    TableName: 'InventoryManagement',
    KeyConditionExpression: 'PK = :pk AND begins_with(SK, :skPrefix)',
    FilterExpression: 'locationId = :locationId',
    ExpressionAttributeValues: {
      ':pk': `FAMILY#${familyId}`,
      ':skPrefix': 'ITEM#',
      ':locationId': locationId
    },
    Limit: 1,
    ProjectionExpression: 'itemId'
  }));
  
  return (result.Items?.length ?? 0) > 0;
}
```

### Real-Time Name Validation Hook

```typescript
import { useState, useEffect } from 'react';
import { useDebouncedCallback } from 'use-debounce';

interface UseNameValidationResult {
  isChecking: boolean;
  isDuplicate: boolean;
  error: string | null;
}

export function useStorageLocationNameValidation(
  familyId: string,
  name: string,
  excludeLocationId?: string
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
          `/api/families/${familyId}/locations/check-name`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              name: nameToCheck,
              excludeId: excludeLocationId
            })
          }
        );
        
        const data = await response.json();
        setIsDuplicate(!data.available);
        setError(data.available ? null : data.message);
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

---

## 8. Testing Strategy

### Repository Layer Tests

```typescript
// tests/lib/reference-data/reference-data.repository.test.ts
import { mockClient } from 'aws-sdk-client-mock';
import { DynamoDBDocumentClient, PutCommand, QueryCommand } from '@aws-sdk/lib-dynamodb';
import { createStorageLocation } from '@/lib/reference-data/reference-data.repository';

const ddbMock = mockClient(DynamoDBDocumentClient);

describe('reference-data.repository', () => {
  beforeEach(() => {
    ddbMock.reset();
  });

  describe('createStorageLocation', () => {
    it('should create a storage location with nameLower and version', async () => {
      ddbMock.on(QueryCommand).resolves({ Items: [] });
      ddbMock.on(PutCommand).resolves({});

      const result = await createStorageLocation('family-123', {
        name: 'Kitchen Pantry',
        description: 'Main pantry'
      });

      expect(result.name).toBe('Kitchen Pantry');
      expect(result.nameLower).toBe('kitchen pantry');
      expect(result.version).toBe(1);
    });

    it('should throw DuplicateNameError if name exists', async () => {
      ddbMock.on(QueryCommand).resolves({
        Items: [{ name: 'Kitchen Pantry', locationId: 'existing-id' }]
      });

      await expect(
        createStorageLocation('family-123', { name: 'kitchen pantry' })
      ).rejects.toThrow('A storage location named "Kitchen Pantry" already exists');
    });
  });
});
```

### Component Tests

```typescript
// tests/components/reference-data/StorageLocationForm.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { StorageLocationForm } from '@/components/reference-data/StorageLocationForm';

describe('StorageLocationForm', () => {
  it('should show validation error for empty name', async () => {
    render(<StorageLocationForm onSubmit={jest.fn()} />);

    fireEvent.click(screen.getByRole('button', { name: /save/i }));

    await waitFor(() => {
      expect(screen.getByText(/name is required/i)).toBeInTheDocument();
    });
  });

  it('should show duplicate name error from API', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      json: () => Promise.resolve({
        available: false,
        message: 'A storage location named "Pantry" already exists'
      })
    });

    render(<StorageLocationForm onSubmit={jest.fn()} familyId="family-123" />);

    fireEvent.change(screen.getByLabelText(/name/i), {
      target: { value: 'Pantry' }
    });

    await waitFor(() => {
      expect(screen.getByText(/already exists/i)).toBeInTheDocument();
    });
  });

  it('should trim whitespace on blur', async () => {
    const onSubmit = jest.fn();
    render(<StorageLocationForm onSubmit={onSubmit} />);

    const nameInput = screen.getByLabelText(/name/i);
    fireEvent.change(nameInput, { target: { value: '  Pantry  ' } });
    fireEvent.blur(nameInput);

    expect(nameInput).toHaveValue('Pantry');
  });
});
```

---

## 9. API Endpoints Summary

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/families/{familyId}/locations` | List all storage locations |
| POST | `/families/{familyId}/locations` | Create storage location |
| GET | `/families/{familyId}/locations/{locationId}` | Get single location |
| PUT | `/families/{familyId}/locations/{locationId}` | Update location |
| DELETE | `/families/{familyId}/locations/{locationId}` | Delete location |
| POST | `/families/{familyId}/locations/check-name` | Check name availability |
| GET | `/families/{familyId}/stores` | List all stores |
| POST | `/families/{familyId}/stores` | Create store |
| GET | `/families/{familyId}/stores/{storeId}` | Get single store |
| PUT | `/families/{familyId}/stores/{storeId}` | Update store |
| DELETE | `/families/{familyId}/stores/{storeId}` | Delete store |
| POST | `/families/{familyId}/stores/check-name` | Check name availability |

See [`contracts/api-spec.yaml`](./contracts/api-spec.yaml) for complete OpenAPI specification.

---

## Next Steps

1. Review the [Feature Specification](./spec.md)
2. Study the [Data Model](./data-model.md)
3. Review the [API Contracts](./contracts/api-spec.yaml)
4. Run `/speckit.tasks` to generate the detailed task breakdown
5. Start implementing with test-first development

---

**Questions?** Refer to the research document for technical decisions or the parent feature's quickstart for foundational setup.

**Ready to code?** Run `/speckit.tasks` to generate the detailed task breakdown for implementation.