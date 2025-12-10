# API Specification: Suggester Workflow

**Feature**: 004-suggester-workflow  
**Date**: 2025-12-10  
**Version**: 1.0.0

## Overview

This document defines the REST API for the Suggester Workflow feature. The API enables suggesters to view inventory and create suggestions, and admins to review, approve, or reject suggestions.

**Base URL**: `https://api.example.com/v1`

**Authentication**: All endpoints require a valid JWT token from AWS Cognito.

**Authorization**: Role-based access control (admin/suggester) enforced by Lambda authorizer.

---

## Endpoints Summary

| Method | Endpoint | Description | Roles |
|--------|----------|-------------|-------|
| GET | `/families/{familyId}/suggestions` | List suggestions | admin, suggester |
| POST | `/families/{familyId}/suggestions` | Create suggestion | suggester |
| GET | `/families/{familyId}/suggestions/{suggestionId}` | Get suggestion details | admin, suggester |
| POST | `/families/{familyId}/suggestions/{suggestionId}/approve` | Approve suggestion | admin |
| POST | `/families/{familyId}/suggestions/{suggestionId}/reject` | Reject suggestion | admin |
| GET | `/families/{familyId}/inventory` | List inventory items | admin, suggester |

---

## 1. List Suggestions

**GET** `/families/{familyId}/suggestions`

Retrieve a list of suggestions for the family.

### Authorization
Both admin and suggester roles can access.

### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| familyId | UUID | Yes | Unique identifier of the family |

### Query Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| status | string | No | - | Filter by status: pending, approved, rejected |
| limit | integer | No | 25 | Maximum results (1-100) |
| nextToken | string | No | - | Pagination token |

### Response 200 - Success

```json
{
  "suggestions": [
    {
      "suggestionId": "af14e45f-ceea-467a-9b36-34f6c3b3e7d3",
      "familyId": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
      "suggestedBy": "660e8400-e29b-41d4-a716-446655440001",
      "suggestedByName": "Emma Smith",
      "type": "add_to_shopping",
      "status": "pending",
      "itemId": "6ba7b810-9dad-11d1-80b4-00c04fd430c8",
      "itemNameSnapshot": "Paper Towels",
      "proposedItemName": null,
      "proposedQuantity": null,
      "proposedThreshold": null,
      "notes": "We are almost out!",
      "rejectionNotes": null,
      "reviewedBy": null,
      "reviewedAt": null,
      "version": 1,
      "createdAt": "2025-12-10T13:00:00Z",
      "updatedAt": "2025-12-10T13:00:00Z",
      "suggesterStatus": "active",
      "itemStatus": "active"
    }
  ],
  "nextToken": null
}
```

### Error Responses

| Status | Description |
|--------|-------------|
| 400 | Bad Request - Invalid parameters |
| 401 | Unauthorized - Missing or invalid token |
| 403 | Forbidden - Insufficient permissions |
| 500 | Internal Server Error |

---

## 2. Create Suggestion

**POST** `/families/{familyId}/suggestions`

Create a new suggestion for adding an item to the shopping list or creating a new inventory item.

### Authorization
Only suggester role can create suggestions.

### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| familyId | UUID | Yes | Unique identifier of the family |

### Request Body - Add to Shopping

```json
{
  "type": "add_to_shopping",
  "itemId": "6ba7b810-9dad-11d1-80b4-00c04fd430c8",
  "notes": "We are almost out!"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| type | string | Yes | Must be "add_to_shopping" |
| itemId | UUID | Yes | ID of inventory item to add |
| notes | string | No | Optional notes (max 500 chars) |

### Request Body - Create Item

```json
{
  "type": "create_item",
  "proposedItemName": "Snack Bars",
  "proposedQuantity": 10,
  "proposedThreshold": 5,
  "notes": "We need after-school snacks"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| type | string | Yes | Must be "create_item" |
| proposedItemName | string | Yes | Name for new item (1-100 chars) |
| proposedQuantity | integer | No | Initial quantity (default 0) |
| proposedThreshold | integer | No | Low-stock threshold (default 0) |
| notes | string | No | Optional notes (max 500 chars) |

### Response 201 - Created

```json
{
  "suggestionId": "af14e45f-ceea-467a-9b36-34f6c3b3e7d3",
  "familyId": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
  "suggestedBy": "660e8400-e29b-41d4-a716-446655440001",
  "suggestedByName": "Emma Smith",
  "type": "add_to_shopping",
  "status": "pending",
  "itemId": "6ba7b810-9dad-11d1-80b4-00c04fd430c8",
  "itemNameSnapshot": "Paper Towels",
  "proposedItemName": null,
  "proposedQuantity": null,
  "proposedThreshold": null,
  "notes": "We are almost out!",
  "rejectionNotes": null,
  "reviewedBy": null,
  "reviewedAt": null,
  "version": 1,
  "createdAt": "2025-12-10T13:00:00Z",
  "updatedAt": "2025-12-10T13:00:00Z"
}
```

### Error Responses

| Status | Description |
|--------|-------------|
| 400 | Bad Request - Invalid request body |
| 401 | Unauthorized - Missing or invalid token |
| 403 | Forbidden - Only suggesters can create |
| 404 | Not Found - Referenced item not found |
| 500 | Internal Server Error |

---

## 3. Get Suggestion Details

**GET** `/families/{familyId}/suggestions/{suggestionId}`

Retrieve details of a specific suggestion.

### Authorization
Both admin and suggester roles can access.

### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| familyId | UUID | Yes | Unique identifier of the family |
| suggestionId | UUID | Yes | Unique identifier of the suggestion |

### Response 200 - Success

```json
{
  "suggestionId": "af14e45f-ceea-467a-9b36-34f6c3b3e7d3",
  "familyId": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
  "suggestedBy": "660e8400-e29b-41d4-a716-446655440001",
  "suggestedByName": "Emma Smith",
  "type": "add_to_shopping",
  "status": "pending",
  "itemId": "6ba7b810-9dad-11d1-80b4-00c04fd430c8",
  "itemNameSnapshot": "Paper Towels",
  "proposedItemName": null,
  "proposedQuantity": null,
  "proposedThreshold": null,
  "notes": "We are almost out!",
  "rejectionNotes": null,
  "reviewedBy": null,
  "reviewedAt": null,
  "version": 1,
  "createdAt": "2025-12-10T13:00:00Z",
  "updatedAt": "2025-12-10T13:00:00Z",
  "suggesterStatus": "active",
  "itemStatus": "active"
}
```

### Error Responses

| Status | Description |
|--------|-------------|
| 401 | Unauthorized - Missing or invalid token |
| 403 | Forbidden - Insufficient permissions |
| 404 | Not Found - Suggestion not found |
| 500 | Internal Server Error |

---

## 4. Approve Suggestion

**POST** `/families/{familyId}/suggestions/{suggestionId}/approve`

Approve a pending suggestion and execute the suggested action.

### Authorization
Only admin role can approve suggestions.

### Actions on Approval

- **add_to_shopping**: Creates a ShoppingListItem for the referenced inventory item
- **create_item**: Creates a new InventoryItem with the proposed attributes

### Atomic Execution
The approval and action are executed atomically using DynamoDB transactions.

### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| familyId | UUID | Yes | Unique identifier of the family |
| suggestionId | UUID | Yes | Unique identifier of the suggestion |

### Request Body

```json
{
  "version": 1
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| version | integer | Yes | Current version for optimistic locking |

### Response 200 - Success

```json
{
  "suggestion": {
    "suggestionId": "af14e45f-ceea-467a-9b36-34f6c3b3e7d3",
    "familyId": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
    "suggestedBy": "660e8400-e29b-41d4-a716-446655440001",
    "suggestedByName": "Emma Smith",
    "type": "add_to_shopping",
    "status": "approved",
    "itemId": "6ba7b810-9dad-11d1-80b4-00c04fd430c8",
    "itemNameSnapshot": "Paper Towels",
    "proposedItemName": null,
    "proposedQuantity": null,
    "proposedThreshold": null,
    "notes": "We are almost out!",
    "rejectionNotes": null,
    "reviewedBy": "550e8400-e29b-41d4-a716-446655440000",
    "reviewedAt": "2025-12-10T14:00:00Z",
    "version": 2,
    "createdAt": "2025-12-10T13:00:00Z",
    "updatedAt": "2025-12-10T14:00:00Z"
  },
  "createdItem": {
    "type": "ShoppingListItem",
    "id": "8f14e45f-ceea-467a-9b36-34f6c3b3e7d1",
    "name": "Paper Towels"
  }
}
```

### Error Responses

| Status | Description |
|--------|-------------|
| 400 | Bad Request - Invalid request body |
| 401 | Unauthorized - Missing or invalid token |
| 403 | Forbidden - Only admins can approve |
| 404 | Not Found - Suggestion not found |
| 409 | Conflict - Already reviewed or version mismatch |
| 422 | Unprocessable - Referenced item deleted or duplicate name |
| 500 | Internal Server Error |

### Response 409 - Conflict

```json
{
  "error": "Conflict",
  "message": "Suggestion already reviewed",
  "currentState": {
    "suggestionId": "af14e45f-ceea-467a-9b36-34f6c3b3e7d3",
    "status": "approved",
    "version": 2
  }
}
```

### Response 422 - Unprocessable Entity

```json
{
  "error": "Unprocessable Entity",
  "message": "Cannot approve: Referenced item 'Paper Towels' no longer exists",
  "suggestion": {
    "suggestionId": "af14e45f-ceea-467a-9b36-34f6c3b3e7d3",
    "itemNameSnapshot": "Paper Towels"
  },
  "itemStatus": "deleted"
}
```

---

## 5. Reject Suggestion

**POST** `/families/{familyId}/suggestions/{suggestionId}/reject`

Reject a pending suggestion without executing any action.

### Authorization
Only admin role can reject suggestions.

### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| familyId | UUID | Yes | Unique identifier of the family |
| suggestionId | UUID | Yes | Unique identifier of the suggestion |

### Request Body

```json
{
  "version": 1,
  "rejectionNotes": "We already have enough of this item"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| version | integer | Yes | Current version for optimistic locking |
| rejectionNotes | string | No | Optional rejection reason (max 500 chars) |

### Response 200 - Success

```json
{
  "suggestionId": "af14e45f-ceea-467a-9b36-34f6c3b3e7d3",
  "familyId": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
  "suggestedBy": "660e8400-e29b-41d4-a716-446655440001",
  "suggestedByName": "Emma Smith",
  "type": "create_item",
  "status": "rejected",
  "itemId": null,
  "itemNameSnapshot": null,
  "proposedItemName": "Candy",
  "proposedQuantity": 20,
  "proposedThreshold": 10,
  "notes": "I want candy!",
  "rejectionNotes": "We already have enough sweets at home",
  "reviewedBy": "550e8400-e29b-41d4-a716-446655440000",
  "reviewedAt": "2025-12-10T14:00:00Z",
  "version": 2,
  "createdAt": "2025-12-10T13:00:00Z",
  "updatedAt": "2025-12-10T14:00:00Z"
}
```

### Error Responses

| Status | Description |
|--------|-------------|
| 400 | Bad Request - Invalid request body |
| 401 | Unauthorized - Missing or invalid token |
| 403 | Forbidden - Only admins can reject |
| 404 | Not Found - Suggestion not found |
| 409 | Conflict - Already reviewed or version mismatch |
| 500 | Internal Server Error |

---

## 6. List Inventory Items

**GET** `/families/{familyId}/inventory`

Retrieve a list of active inventory items for the family. This endpoint provides read-only access to inventory for suggesters to view what items are available before creating suggestions.

### Authorization
Both admin and suggester roles can access.

### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| familyId | UUID | Yes | Unique identifier of the family |

### Query Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| limit | integer | No | 50 | Maximum results (1-100) |
| nextToken | string | No | - | Pagination token |

### Response 200 - Success

```json
{
  "items": [
    {
      "itemId": "6ba7b810-9dad-11d1-80b4-00c04fd430c8",
      "familyId": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
      "name": "Paper Towels",
      "quantity": 3,
      "threshold": 5,
      "locationId": "7c9e6679-7425-40de-944b-e07fc1f90ae7",
      "status": "active",
      "isLowStock": true,
      "createdAt": "2025-12-08T10:00:00Z",
      "updatedAt": "2025-12-10T11:30:00Z"
    }
  ],
  "nextToken": null
}
```

### Error Responses

| Status | Description |
|--------|-------------|
| 401 | Unauthorized - Missing or invalid token |
| 403 | Forbidden - Insufficient permissions |
| 500 | Internal Server Error |

---

## Common Response Schemas

### Error Response

```json
{
  "error": "Error Type",
  "message": "Human-readable error message",
  "details": {
    "field": "fieldName",
    "issue": "description of issue"
  }
}
```

### Suggestion Status Values

| Status | Description |
|--------|-------------|
| pending | Awaiting admin review |
| approved | Approved by admin, action executed |
| rejected | Rejected by admin, no action taken |

### Suggestion Type Values

| Type | Description |
|------|-------------|
| add_to_shopping | Request to add existing item to shopping list |
| create_item | Request to create new inventory item |

---

## OpenAPI Specification

The full OpenAPI 3.0 specification is available at:
`specs/004-suggester-workflow/contracts/api-spec.yaml`

**Note**: The YAML file should be created by switching to Code mode, as Architect mode can only edit markdown files.

---

**API Specification Complete**: 2025-12-10  
**Status**: Ready for implementation