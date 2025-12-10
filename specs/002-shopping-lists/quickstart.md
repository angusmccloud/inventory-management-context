# Quickstart Guide: Shopping List Management

**Feature**: 002-shopping-lists  
**Date**: 2025-12-10  
**Audience**: Developers implementing the feature  
**Parent Feature**: 001-family-inventory-mvp

## Overview

This guide helps you get started with implementing the Shopping List Management feature. It builds upon the Family Inventory Management System MVP and adds shopping list functionality for families.

## Prerequisites

Before starting, ensure you have completed the setup from the parent feature:

- **Node.js**: 20.x LTS ([download](https://nodejs.org/))
- **AWS Account**: With permissions for Lambda, DynamoDB, Cognito, SAM
- **AWS CLI**: Configured with credentials
- **AWS SAM CLI**: For local development and deployment
- **Git**: Version control
- **Parent Feature**: `001-family-inventory-mvp` must be implemented

Refer to [`001-family-inventory-mvp/quickstart.md`](../001-family-inventory-mvp/quickstart.md) for detailed setup instructions.

## Feature Branch Setup

```bash
# Navigate to backend repository
cd inventory-management-backend

# Create feature branch from main (or from 001-family-inventory-mvp if not merged)
git checkout main
git pull origin main
git checkout -b 002-shopping-lists

# Navigate to frontend repository
cd ../inventory-management-frontend
git checkout main
git pull origin main
git checkout -b 002-shopping-lists

# Navigate to context repository
cd ../inventory-management-context
git checkout 002-shopping-lists
```

## Key Files for This Feature

### Specification Documents

| File | Description |
|------|-------------|
| [`spec.md`](./spec.md) | Feature specification with requirements |
| [`data-model.md`](./data-model.md) | Extended ShoppingListItem entity definition |
| [`contracts/api-spec.yaml`](./contracts/api-spec.yaml) | OpenAPI specification for 5 endpoints |
| [`research.md`](./research.md) | Technical decisions and rationale |
| [`checklists/requirements.md`](./checklists/requirements.md) | Requirements validation checklist |

### Backend Files to Create

```
inventory-management-backend/
├── src/
│   ├── handlers/
│   │   ├── shopping-list/
│   │   │   ├── listShoppingListItems.ts
│   │   │   ├── addToShoppingList.ts
│   │   │   ├── getShoppingListItem.ts
│   │   │   ├── updateShoppingListItem.ts
│   │   │   ├── updateShoppingListItemStatus.ts
│   │   │   └── removeFromShoppingList.ts
│   │   └── __tests__/
│   │       └── shopping-list/
│   │           ├── listShoppingListItems.test.ts
│   │           ├── addToShoppingList.test.ts
│   │           ├── getShoppingListItem.test.ts
│   │           ├── updateShoppingListItem.test.ts
│   │           ├── updateShoppingListItemStatus.test.ts
│   │           └── removeFromShoppingList.test.ts
│   ├── services/
│   │   ├── shoppingListService.ts
│   │   └── __tests__/
│   │       └── shoppingListService.test.ts
│   └── types/
│       └── shoppingList.ts
└── template.yaml  # Add new Lambda functions
```

### Frontend Files to Create

```
inventory-management-frontend/
├── app/
│   └── dashboard/
│       └── shopping-list/
│           ├── page.tsx
│           └── [shoppingItemId]/
│               └── page.tsx
├── components/
│   └── shopping-list/
│       ├── ShoppingList.tsx
│       ├── ShoppingListItem.tsx
│       ├── AddItemForm.tsx
│       ├── StoreFilter.tsx
│       └── __tests__/
│           ├── ShoppingList.test.tsx
│           ├── ShoppingListItem.test.tsx
│           ├── AddItemForm.test.tsx
│           └── StoreFilter.test.tsx
└── lib/
    └── api/
        └── shoppingList.ts
```

## Development Workflow

### 1. Enable DynamoDB TTL (One-Time Setup)

If not already enabled, configure TTL on the DynamoDB table:

```bash
aws dynamodb update-time-to-live \
  --table-name InventoryManagement \
  --time-to-live-specification "Enabled=true, AttributeName=ttl"
```

Or add to `template.yaml`:

```yaml
Resources:
  InventoryTable:
    Type: AWS::DynamoDB::Table
    Properties:
      TimeToLiveSpecification:
        AttributeName: ttl
        Enabled: true
```

### 2. Implement Backend (Test-First)

Follow the test-first development pattern:

```bash
cd inventory-management-backend

# 1. Create test file first
mkdir -p src/handlers/__tests__/shopping-list
touch src/handlers/__tests__/shopping-list/addToShoppingList.test.ts

# 2. Write failing test
# Edit the test file with test cases

# 3. Run test and verify it fails
npm test -- addToShoppingList.test.ts

# 4. Implement handler
mkdir -p src/handlers/shopping-list
touch src/handlers/shopping-list/addToShoppingList.ts

# 5. Run test until it passes
npm test -- addToShoppingList.test.ts --watch
```

### 3. Example Test Implementation

```typescript
// src/handlers/__tests__/shopping-list/addToShoppingList.test.ts
import { mockClient } from 'aws-sdk-client-mock';
import { DynamoDBDocumentClient, PutCommand, QueryCommand } from '@aws-sdk/lib-dynamodb';
import { handler } from '../../shopping-list/addToShoppingList';

const ddbMock = mockClient(DynamoDBDocumentClient);

describe('addToShoppingList', () => {
  beforeEach(() => {
    ddbMock.reset();
  });

  it('should add a free-text item to the shopping list', async () => {
    ddbMock.on(PutCommand).resolves({});

    const event = {
      pathParameters: { familyId: 'family-123' },
      body: JSON.stringify({
        name: 'Birthday cake',
        quantity: 1,
        notes: 'For Sarah',
      }),
      requestContext: {
        authorizer: {
          memberId: 'member-456',
          familyId: 'family-123',
          role: 'admin',
        },
      },
    };

    const result = await handler(event as any);

    expect(result.statusCode).toBe(201);
    const body = JSON.parse(result.body);
    expect(body.name).toBe('Birthday cake');
    expect(body.status).toBe('pending');
    expect(body.version).toBe(1);
  });

  it('should return 409 when duplicate inventory item exists', async () => {
    // Mock finding existing item
    ddbMock.on(QueryCommand).resolves({
      Items: [{
        shoppingItemId: 'existing-123',
        name: 'Paper Towels',
        status: 'pending',
      }],
    });

    const event = {
      pathParameters: { familyId: 'family-123' },
      body: JSON.stringify({
        itemId: 'inventory-item-789',
      }),
      requestContext: {
        authorizer: {
          memberId: 'member-456',
          familyId: 'family-123',
          role: 'admin',
        },
      },
    };

    const result = await handler(event as any);

    expect(result.statusCode).toBe(409);
    const body = JSON.parse(result.body);
    expect(body.error).toBe('Conflict');
    expect(body.existingItem).toBeDefined();
  });

  it('should allow duplicate when force=true', async () => {
    ddbMock.on(QueryCommand).resolves({
      Items: [{ shoppingItemId: 'existing-123' }],
    });
    ddbMock.on(PutCommand).resolves({});

    const event = {
      pathParameters: { familyId: 'family-123' },
      body: JSON.stringify({
        itemId: 'inventory-item-789',
        force: true,
      }),
      requestContext: {
        authorizer: {
          memberId: 'member-456',
          familyId: 'family-123',
          role: 'admin',
        },
      },
    };

    const result = await handler(event as any);

    expect(result.statusCode).toBe(201);
  });
});
```

### 4. Example Handler Implementation

```typescript
// src/handlers/shopping-list/addToShoppingList.ts
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand, QueryCommand, GetCommand } from '@aws-sdk/lib-dynamodb';
import { v4 as uuidv4 } from 'uuid';
import { z } from 'zod';

const client = new DynamoDBClient({ region: process.env.AWS_REGION });
const docClient = DynamoDBDocumentClient.from(client);

const AddToShoppingListSchema = z.object({
  itemId: z.string().uuid().nullable().optional(),
  name: z.string().min(1).max(100).optional(),
  storeId: z.string().uuid().nullable().optional(),
  quantity: z.number().int().positive().nullable().optional(),
  notes: z.string().max(500).nullable().optional(),
  force: z.boolean().optional().default(false),
}).refine(
  (data) => data.itemId || data.name,
  { message: 'Either itemId or name must be provided' }
);

export async function handler(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
  const familyId = event.pathParameters?.familyId;
  const memberId = event.requestContext.authorizer?.memberId;
  const role = event.requestContext.authorizer?.role;

  // Authorization check
  if (role !== 'admin') {
    return {
      statusCode: 403,
      body: JSON.stringify({ error: 'Forbidden', message: 'Admin role required' }),
    };
  }

  // Parse and validate input
  const body = JSON.parse(event.body || '{}');
  const validation = AddToShoppingListSchema.safeParse(body);
  
  if (!validation.success) {
    return {
      statusCode: 400,
      body: JSON.stringify({
        error: 'BadRequest',
        message: 'Validation failed',
        details: validation.error.errors,
      }),
    };
  }

  const { itemId, name, storeId, quantity, notes, force } = validation.data;

  // Check for duplicates if itemId provided
  if (itemId && !force) {
    const existing = await checkForDuplicate(familyId!, itemId);
    if (existing) {
      return {
        statusCode: 409,
        body: JSON.stringify({
          error: 'Conflict',
          message: 'This item is already on your shopping list',
          existingItem: existing,
        }),
      };
    }
  }

  // Get inventory item details if itemId provided
  let itemName = name;
  let itemStoreId = storeId;
  
  if (itemId) {
    const inventoryItem = await getInventoryItem(familyId!, itemId);
    if (!inventoryItem) {
      return {
        statusCode: 404,
        body: JSON.stringify({ error: 'NotFound', message: 'Inventory item not found' }),
      };
    }
    itemName = name || inventoryItem.name;
    itemStoreId = storeId ?? inventoryItem.preferredStoreId;
  }

  // Create shopping list item
  const shoppingItemId = uuidv4();
  const now = new Date().toISOString();
  
  const item = {
    PK: `FAMILY#${familyId}`,
    SK: `SHOPPING#${shoppingItemId}`,
    GSI2PK: `FAMILY#${familyId}#SHOPPING`,
    GSI2SK: `STORE#${itemStoreId || 'UNASSIGNED'}#STATUS#pending`,
    shoppingItemId,
    familyId,
    itemId: itemId || null,
    name: itemName,
    storeId: itemStoreId || null,
    status: 'pending',
    quantity: quantity || null,
    notes: notes || null,
    version: 1,
    ttl: null,
    addedBy: memberId,
    entityType: 'ShoppingListItem',
    createdAt: now,
    updatedAt: now,
  };

  await docClient.send(new PutCommand({
    TableName: process.env.DYNAMODB_TABLE_NAME,
    Item: item,
  }));

  return {
    statusCode: 201,
    body: JSON.stringify({
      shoppingItemId,
      familyId,
      itemId: item.itemId,
      name: item.name,
      storeId: item.storeId,
      status: item.status,
      quantity: item.quantity,
      notes: item.notes,
      version: item.version,
      addedBy: item.addedBy,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
    }),
  };
}

async function checkForDuplicate(familyId: string, itemId: string) {
  const result = await docClient.send(new QueryCommand({
    TableName: process.env.DYNAMODB_TABLE_NAME,
    KeyConditionExpression: 'PK = :pk AND begins_with(SK, :sk)',
    FilterExpression: 'itemId = :itemId AND #status = :pending',
    ExpressionAttributeNames: { '#status': 'status' },
    ExpressionAttributeValues: {
      ':pk': `FAMILY#${familyId}`,
      ':sk': 'SHOPPING#',
      ':itemId': itemId,
      ':pending': 'pending',
    },
  }));
  
  return result.Items?.[0] || null;
}

async function getInventoryItem(familyId: string, itemId: string) {
  const result = await docClient.send(new GetCommand({
    TableName: process.env.DYNAMODB_TABLE_NAME,
    Key: {
      PK: `FAMILY#${familyId}`,
      SK: `ITEM#${itemId}`,
    },
  }));
  
  return result.Item || null;
}
```

### 5. Add Lambda Functions to SAM Template

Add to `template.yaml`:

```yaml
  # Shopping List Functions
  ListShoppingListItemsFunction:
    Type: AWS::Serverless::Function
    Properties:
      Handler: src/handlers/shopping-list/listShoppingListItems.handler
      Runtime: nodejs20.x
      Policies:
        - DynamoDBCrudPolicy:
            TableName: !Ref InventoryTable
      Events:
        Api:
          Type: Api
          Properties:
            Path: /families/{familyId}/shopping-list
            Method: GET

  AddToShoppingListFunction:
    Type: AWS::Serverless::Function
    Properties:
      Handler: src/handlers/shopping-list/addToShoppingList.handler
      Runtime: nodejs20.x
      Policies:
        - DynamoDBCrudPolicy:
            TableName: !Ref InventoryTable
      Events:
        Api:
          Type: Api
          Properties:
            Path: /families/{familyId}/shopping-list
            Method: POST

  GetShoppingListItemFunction:
    Type: AWS::Serverless::Function
    Properties:
      Handler: src/handlers/shopping-list/getShoppingListItem.handler
      Runtime: nodejs20.x
      Policies:
        - DynamoDBReadPolicy:
            TableName: !Ref InventoryTable
      Events:
        Api:
          Type: Api
          Properties:
            Path: /families/{familyId}/shopping-list/{shoppingItemId}
            Method: GET

  UpdateShoppingListItemFunction:
    Type: AWS::Serverless::Function
    Properties:
      Handler: src/handlers/shopping-list/updateShoppingListItem.handler
      Runtime: nodejs20.x
      Policies:
        - DynamoDBCrudPolicy:
            TableName: !Ref InventoryTable
      Events:
        Api:
          Type: Api
          Properties:
            Path: /families/{familyId}/shopping-list/{shoppingItemId}
            Method: PUT

  UpdateShoppingListItemStatusFunction:
    Type: AWS::Serverless::Function
    Properties:
      Handler: src/handlers/shopping-list/updateShoppingListItemStatus.handler
      Runtime: nodejs20.x
      Policies:
        - DynamoDBCrudPolicy:
            TableName: !Ref InventoryTable
      Events:
        Api:
          Type: Api
          Properties:
            Path: /families/{familyId}/shopping-list/{shoppingItemId}/status
            Method: PATCH

  RemoveFromShoppingListFunction:
    Type: AWS::Serverless::Function
    Properties:
      Handler: src/handlers/shopping-list/removeFromShoppingList.handler
      Runtime: nodejs20.x
      Policies:
        - DynamoDBCrudPolicy:
            TableName: !Ref InventoryTable
      Events:
        Api:
          Type: Api
          Properties:
            Path: /families/{familyId}/shopping-list/{shoppingItemId}
            Method: DELETE
```

## Testing Locally

### Backend

```bash
cd inventory-management-backend

# Run all tests
npm test

# Run shopping list tests only
npm test -- shopping-list

# Run with coverage
npm test -- --coverage

# Start local API
sam build
sam local start-api --port 3001
```

### Test API Endpoints

```bash
# Get auth token (replace with your Cognito credentials)
TOKEN="your-jwt-token"

# List shopping list items
curl -X GET "http://localhost:3001/v1/families/family-123/shopping-list" \
  -H "Authorization: Bearer $TOKEN"

# Add item from inventory
curl -X POST "http://localhost:3001/v1/families/family-123/shopping-list" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"itemId": "inventory-item-456", "quantity": 2}'

# Add free-text item
curl -X POST "http://localhost:3001/v1/families/family-123/shopping-list" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name": "Birthday cake", "quantity": 1}'

# Mark as purchased
curl -X PATCH "http://localhost:3001/v1/families/family-123/shopping-list/item-789/status" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status": "purchased", "version": 1}'

# Delete item
curl -X DELETE "http://localhost:3001/v1/families/family-123/shopping-list/item-789" \
  -H "Authorization: Bearer $TOKEN"
```

### Frontend

```bash
cd inventory-management-frontend

# Run tests
npm test

# Start development server
npm run dev
```

## Key Implementation Notes

### Optimistic Locking

All update operations must include version checking:

```typescript
await docClient.send(new UpdateCommand({
  TableName: TABLE_NAME,
  Key: { PK, SK },
  UpdateExpression: 'SET #status = :status, version = version + :one, updatedAt = :now',
  ConditionExpression: 'version = :expectedVersion',
  ExpressionAttributeNames: { '#status': 'status' },
  ExpressionAttributeValues: {
    ':status': newStatus,
    ':one': 1,
    ':now': new Date().toISOString(),
    ':expectedVersion': requestVersion,
  },
}));
```

Handle `ConditionalCheckFailedException` by returning 409 with current item state.

### TTL Management

When status changes to 'purchased', set TTL:

```typescript
const ttl = Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60); // 7 days from now
```

When status changes to 'pending', clear TTL:

```typescript
const ttl = null;
```

### Store Sentinel Value

For unassigned items, use `STORE#UNASSIGNED` in GSI2SK:

```typescript
const gsi2sk = storeId 
  ? `STORE#${storeId}#STATUS#${status}`
  : `STORE#UNASSIGNED#STATUS#${status}`;
```

## Deployment

```bash
cd inventory-management-backend

# Build and deploy
sam build
sam deploy --config-env dev

# View logs
sam logs -n AddToShoppingListFunction --stack-name inventory-mgmt-dev --tail
```

## Resources

### Feature Documentation

- [Feature Specification](./spec.md)
- [Data Model](./data-model.md)
- [API Contracts](./contracts/api-spec.yaml)
- [Research Decisions](./research.md)

### Parent Feature

- [Parent Quickstart](../001-family-inventory-mvp/quickstart.md)
- [Parent Data Model](../001-family-inventory-mvp/data-model.md)
- [Parent API Spec](../001-family-inventory-mvp/contracts/api-spec.yaml)

### External Documentation

- [DynamoDB TTL](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/TTL.html)
- [DynamoDB Conditional Writes](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Expressions.ConditionExpressions.html)
- [AWS SAM Documentation](https://docs.aws.amazon.com/serverless-application-model/)

## Next Steps

1. Review the [Feature Specification](./spec.md)
2. Study the [Data Model](./data-model.md)
3. Review the [API Contracts](./contracts/api-spec.yaml)
4. Run `/speckit.tasks` to generate the detailed task breakdown
5. Start implementing with test-first development

---

**Questions?** Refer to the research document for technical decisions or the parent feature's quickstart for foundational setup.

**Ready to code?** Run `/speckit.tasks` to generate the detailed task breakdown for implementation.