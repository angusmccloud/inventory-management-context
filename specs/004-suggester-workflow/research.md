# Research: Suggester Workflow

**Feature**: 004-suggester-workflow  
**Date**: 2025-12-10  
**Status**: Research Complete

## Overview

This document captures research decisions for the Suggester Workflow feature. Each section addresses a clarification item identified in the plan.md Phase 0 Research Items.

---

## 1. Optimistic Locking for Concurrent Approvals

### Question
How should concurrent approval/rejection of the same suggestion be handled?

### Decision
**Option C: Combination of status-based and version-based conditional writes**

### Rationale
- **Status-based check** provides semantic correctness: only pending suggestions can be approved/rejected
- **Version attribute** provides additional protection against race conditions and enables conflict detection
- Aligns with the pattern established in 003-member-management for Member entity
- Provides clear error messages for different failure scenarios

### Implementation

```typescript
// Approve suggestion with optimistic locking
await dynamodb.send(new UpdateCommand({
  TableName: 'InventoryManagement',
  Key: { 
    PK: `FAMILY#${familyId}`, 
    SK: `SUGGESTION#${suggestionId}` 
  },
  UpdateExpression: `
    SET #status = :approved, 
        #reviewedBy = :reviewerId, 
        #reviewedAt = :now,
        #version = #version + :one,
        #updatedAt = :now
  `,
  ConditionExpression: '#status = :pending AND #version = :expectedVersion',
  ExpressionAttributeNames: {
    '#status': 'status',
    '#reviewedBy': 'reviewedBy',
    '#reviewedAt': 'reviewedAt',
    '#version': 'version',
    '#updatedAt': 'updatedAt'
  },
  ExpressionAttributeValues: {
    ':approved': 'approved',
    ':pending': 'pending',
    ':reviewerId': memberId,
    ':now': new Date().toISOString(),
    ':one': 1,
    ':expectedVersion': currentVersion
  }
}));
```

### Conflict Handling

| Condition | Error Response | User Action |
|-----------|---------------|-------------|
| Status not 'pending' | 409 Conflict: "Suggestion already reviewed" | Refresh and view current state |
| Version mismatch | 409 Conflict: "Suggestion modified by another user" | Refresh and retry |

### Alternatives Considered

- **Option A (Version only)**: Rejected because it doesn't prevent approving already-approved suggestions
- **Option B (Status only)**: Rejected because it doesn't detect concurrent modifications during the same status

---

## 2. Orphaned Suggestion Handling

### Question
How should "add_to_shopping" suggestions be handled when the referenced inventory item is deleted?

### Decision
**Option A: Store item name snapshot in suggestion, allow approval to fail gracefully**

### Rationale
- Preserves audit trail by keeping the original item name in the suggestion
- Allows admins to see what was suggested even if the item no longer exists
- Graceful failure on approval provides clear feedback without data loss
- Aligns with FR-029: "System MUST handle the case where a referenced inventory item is deleted"

### Implementation

**On Suggestion Creation:**
```typescript
// Store item name snapshot when creating add_to_shopping suggestion
const suggestion = {
  suggestionId: uuid(),
  familyId,
  suggestedBy: memberId,
  type: 'add_to_shopping',
  status: 'pending',
  itemId: inventoryItem.itemId,
  itemNameSnapshot: inventoryItem.name,  // NEW: Snapshot for orphan handling
  notes,
  version: 1,
  entityType: 'Suggestion',
  createdAt: now,
  updatedAt: now
};
```

**On Approval:**
```typescript
// Check if referenced item still exists
const item = await getInventoryItem(familyId, suggestion.itemId);

if (!item || item.status === 'archived') {
  return {
    statusCode: 422,
    body: JSON.stringify({
      error: 'Unprocessable Entity',
      message: `Cannot approve: Referenced item "${suggestion.itemNameSnapshot}" no longer exists or is archived`,
      suggestion: {
        ...suggestion,
        itemStatus: item ? 'archived' : 'deleted'
      }
    })
  };
}
```

### UI Behavior

- Display warning icon on suggestions where referenced item is deleted/archived
- Show item name from snapshot with "(deleted)" or "(archived)" suffix
- Admin can still reject the suggestion to clear it from pending list

### Alternatives Considered

- **Option B (Auto-reject)**: Rejected because it removes admin control and may surprise users
- **Option C (Keep pending with warning)**: Partially adopted - we keep pending but fail on approval attempt

---

## 3. Duplicate Suggestion Policy

### Question
Should the system prevent duplicate suggestions for the same item?

### Decision
**Option A: Allow duplicates, admin can reject manually**

### Rationale
- Simplest implementation with least complexity
- Aligns with spec assumption: "Duplicate suggestions for the same item are acceptable (admin can reject duplicates)"
- Avoids complex duplicate detection logic across different suggestion types
- Preserves suggester intent - multiple family members may independently want the same item
- Admin has full control to approve one and reject others

### Implementation

No special duplicate detection logic needed. Standard suggestion creation flow applies.

### UI Considerations

- When listing pending suggestions, group by item name to help admins identify duplicates
- Show suggester name and timestamp to help admins decide which to approve
- Consider adding a "Reject as duplicate" quick action in future enhancement

### Alternatives Considered

- **Option B (Prevent pending duplicates)**: Rejected because it adds complexity and may frustrate suggesters
- **Option C (Warning on creation)**: Rejected because it adds UI complexity without clear benefit

---

## 4. Suggestion Retention Policy

### Question
How long should approved/rejected suggestions be retained?

### Decision
**Option A: Indefinite retention for audit purposes**

### Rationale
- Aligns with spec assumption: "Suggestion history is valuable for audit purposes and should be retained"
- Simplifies implementation - no TTL management needed
- Storage costs are minimal for small-scale family use (2-6 members)
- Provides complete audit trail for family accountability
- Future enhancement can add archival/cleanup if needed

### Implementation

No TTL attribute on Suggestion entity. Suggestions remain in DynamoDB indefinitely.

### Storage Considerations

- Estimated suggestion size: ~500 bytes per suggestion
- At 10 suggestions/week per family: ~26 KB/year
- Cost impact: Negligible (~$0.0003/year per family)

### Future Considerations

If storage becomes a concern:
1. Add optional TTL for rejected suggestions (e.g., 1 year)
2. Implement archival to S3 for suggestions older than 2 years
3. Add admin UI to manually purge old suggestions

### Alternatives Considered

- **Option B (TTL-based cleanup)**: Rejected because audit trail is more valuable than minimal storage savings
- **Option C (Configurable retention)**: Rejected as over-engineering for MVP scope

---

## 5. Atomic Approval Execution

### Question
How should the atomic execution of approved suggestions be implemented?

### Decision
**Option A: DynamoDB TransactWriteItems for atomic multi-item updates**

### Rationale
- DynamoDB transactions provide ACID guarantees across multiple items
- Single API call ensures atomicity - either all operations succeed or none do
- Aligns with FR-023: "System MUST execute the suggested action atomically with the approval"
- Well-supported by AWS SDK v3 with clear error handling
- Maximum 100 items per transaction (more than sufficient for our use case)

### Implementation

**For "add_to_shopping" approval:**
```typescript
await dynamodb.send(new TransactWriteCommand({
  TransactItems: [
    // 1. Update suggestion status to approved
    {
      Update: {
        TableName: 'InventoryManagement',
        Key: { PK: `FAMILY#${familyId}`, SK: `SUGGESTION#${suggestionId}` },
        UpdateExpression: 'SET #status = :approved, #reviewedBy = :reviewer, #reviewedAt = :now, #version = #version + :one',
        ConditionExpression: '#status = :pending AND #version = :expectedVersion',
        ExpressionAttributeNames: { '#status': 'status', '#reviewedBy': 'reviewedBy', '#reviewedAt': 'reviewedAt', '#version': 'version' },
        ExpressionAttributeValues: { ':approved': 'approved', ':pending': 'pending', ':reviewer': reviewerId, ':now': now, ':one': 1, ':expectedVersion': version }
      }
    },
    // 2. Create shopping list item
    {
      Put: {
        TableName: 'InventoryManagement',
        Item: {
          PK: `FAMILY#${familyId}`,
          SK: `SHOPPING#${shoppingItemId}`,
          GSI2PK: `FAMILY#${familyId}#SHOPPING`,
          GSI2SK: `STORE#${storeId}#STATUS#pending`,
          shoppingItemId,
          familyId,
          itemId: suggestion.itemId,
          name: inventoryItem.name,
          storeId: inventoryItem.preferredStoreId,
          status: 'pending',
          quantity: null,
          notes: `Added from suggestion by ${suggesterName}`,
          entityType: 'ShoppingListItem',
          createdAt: now,
          updatedAt: now,
          addedBy: reviewerId
        },
        ConditionExpression: 'attribute_not_exists(PK)'
      }
    }
  ]
}));
```

**For "create_item" approval:**
```typescript
await dynamodb.send(new TransactWriteCommand({
  TransactItems: [
    // 1. Update suggestion status to approved
    {
      Update: {
        TableName: 'InventoryManagement',
        Key: { PK: `FAMILY#${familyId}`, SK: `SUGGESTION#${suggestionId}` },
        UpdateExpression: 'SET #status = :approved, #reviewedBy = :reviewer, #reviewedAt = :now, #version = #version + :one',
        ConditionExpression: '#status = :pending AND #version = :expectedVersion',
        ExpressionAttributeNames: { '#status': 'status', '#reviewedBy': 'reviewedBy', '#reviewedAt': 'reviewedAt', '#version': 'version' },
        ExpressionAttributeValues: { ':approved': 'approved', ':pending': 'pending', ':reviewer': reviewerId, ':now': now, ':one': 1, ':expectedVersion': version }
      }
    },
    // 2. Create inventory item
    {
      Put: {
        TableName: 'InventoryManagement',
        Item: {
          PK: `FAMILY#${familyId}`,
          SK: `ITEM#${itemId}`,
          GSI2PK: `FAMILY#${familyId}#ITEMS`,
          GSI2SK: `STATUS#active#QUANTITY#${paddedQuantity}`,
          itemId,
          familyId,
          name: suggestion.proposedItemName,
          quantity: suggestion.proposedQuantity ?? 0,
          threshold: suggestion.proposedThreshold ?? 0,
          locationId: null,
          preferredStoreId: null,
          alternateStoreIds: [],
          status: 'active',
          entityType: 'InventoryItem',
          createdAt: now,
          updatedAt: now,
          createdBy: reviewerId
        },
        ConditionExpression: 'attribute_not_exists(PK)'
      }
    }
  ]
}));
```

### Error Handling

| Error | Cause | Response |
|-------|-------|----------|
| TransactionCanceledException | Condition check failed | 409 Conflict with details |
| ValidationException | Invalid transaction structure | 500 Internal Server Error |
| TransactionConflictException | Concurrent transaction | 409 Conflict, retry |

### Alternatives Considered

- **Option B (Two-phase commit)**: Rejected because DynamoDB transactions are simpler and sufficient
- **Option C (Saga pattern)**: Rejected as over-engineering for two-item transactions

---

## 6. Suggester Role Validation

### Question
Should suggestion creation be validated at API level or service level?

### Decision
**Option C: Both layers for defense in depth**

### Rationale
- Lambda authorizer provides fast-fail for unauthorized requests (reduces Lambda invocations)
- Service layer provides detailed error messages and business logic validation
- Defense in depth is a security best practice
- Aligns with FR-009: "System MUST validate that only members with 'suggester' role can create suggestions"

### Implementation

**Layer 1: Lambda Authorizer**
```typescript
// In Lambda authorizer (from 003-member-management)
const member = await getMemberByUserId(cognitoSub);

// For suggestion creation endpoint
if (request.path.includes('/suggestions') && request.method === 'POST') {
  if (member.role !== 'suggester') {
    return generatePolicy(cognitoSub, 'Deny', request.methodArn);
  }
}
```

**Layer 2: Service Layer**
```typescript
// In suggestionService.ts
export async function createSuggestion(
  familyId: string,
  memberId: string,
  input: CreateSuggestionInput
): Promise<Suggestion> {
  // Validate member role (defense in depth)
  const member = await getMember(familyId, memberId);
  
  if (!member || member.status !== 'active') {
    throw new ForbiddenError('Member not found or inactive');
  }
  
  if (member.role !== 'suggester') {
    throw new ForbiddenError('Only suggesters can create suggestions');
  }
  
  // Proceed with suggestion creation...
}
```

### Authorization Matrix

| Endpoint | Admin | Suggester | Notes |
|----------|-------|-----------|-------|
| GET /suggestions | ✅ | ✅ | All members can view |
| POST /suggestions | ❌ | ✅ | Only suggesters create |
| GET /suggestions/{id} | ✅ | ✅ | All members can view |
| POST /suggestions/{id}/approve | ✅ | ❌ | Only admins approve |
| POST /suggestions/{id}/reject | ✅ | ❌ | Only admins reject |

### Alternatives Considered

- **Option A (Authorizer only)**: Rejected because it lacks detailed error messages
- **Option B (Service only)**: Rejected because it wastes Lambda invocations on unauthorized requests

---

## 7. Removed Suggester Suggestions

### Question
What happens to pending suggestions when a suggester is removed from the family?

### Decision
**Option A: Keep suggestions pending, show suggester name even after removal**

### Rationale
- Preserves audit trail and suggestion history
- Aligns with FR-031: "System MUST maintain suggestion records when the suggester member is removed"
- Allows admins to still review and approve/reject pending suggestions
- Suggester name is stored in suggestion record (via snapshot or join)
- Simplest implementation with no cascading updates needed

### Implementation

**Store suggester name snapshot on creation:**
```typescript
const suggestion = {
  suggestionId: uuid(),
  familyId,
  suggestedBy: memberId,
  suggestedByName: member.name,  // Snapshot for display after removal
  type,
  status: 'pending',
  // ... other fields
};
```

**Display in UI:**
```typescript
// When displaying suggestion
const suggesterDisplay = suggestion.suggestedByName + 
  (member?.status === 'removed' ? ' (removed)' : '');
```

### Behavior Summary

| Scenario | Suggestion Status | Display | Admin Actions |
|----------|------------------|---------|---------------|
| Suggester active | pending | "John Smith" | Approve/Reject |
| Suggester removed | pending | "John Smith (removed)" | Approve/Reject |
| Suggester removed | approved | "John Smith (removed)" | View only |
| Suggester removed | rejected | "John Smith (removed)" | View only |

### Alternatives Considered

- **Option B (Auto-reject)**: Rejected because it removes admin control and may lose valid suggestions
- **Option C (Orphaned status)**: Rejected as unnecessary complexity - pending status is sufficient

---

## Best Practices Research

### DynamoDB Access Patterns for Suggestion Workflow

Based on the spec requirements, the following access patterns are needed:

| Access Pattern | Query Type | Keys Used | Use Case |
|----------------|-----------|-----------|----------|
| List suggestions by family | Query | PK = `FAMILY#{familyId}`, SK begins_with `SUGGESTION#` | Admin/suggester views all suggestions |
| List pending suggestions | Query | GSI2: PK = `FAMILY#{familyId}#SUGGESTIONS`, SK begins_with `STATUS#pending` | Admin reviews pending |
| Get suggestion by ID | GetItem | PK = `FAMILY#{familyId}`, SK = `SUGGESTION#{suggestionId}` | View suggestion details |
| List suggestions by status | Query | GSI2: PK = `FAMILY#{familyId}#SUGGESTIONS`, SK begins_with `STATUS#{status}` | Filter by status |

### Role-Based Access Control Patterns

The Lambda authorizer pattern from 003-member-management will be extended:

```typescript
// Authorization rules for suggestion endpoints
const suggestionAuthRules = {
  'GET /families/{familyId}/suggestions': ['admin', 'suggester'],
  'POST /families/{familyId}/suggestions': ['suggester'],
  'GET /families/{familyId}/suggestions/{suggestionId}': ['admin', 'suggester'],
  'POST /families/{familyId}/suggestions/{suggestionId}/approve': ['admin'],
  'POST /families/{familyId}/suggestions/{suggestionId}/reject': ['admin'],
};
```

### Optimistic Locking Pattern

Following the pattern established in 003-member-management:

1. **On creation**: `version = 1`
2. **On update**: Include `ConditionExpression: version = :expectedVersion`
3. **On success**: Increment version (`version = version + 1`)
4. **On conflict**: Return HTTP 409 with current suggestion state

---

## Summary of Decisions

| # | Question | Decision | Key Rationale |
|---|----------|----------|---------------|
| 1 | Concurrent approvals | Status + version locking | Defense in depth, clear error handling |
| 2 | Orphaned suggestions | Store name snapshot, fail gracefully | Preserves audit trail, admin control |
| 3 | Duplicate suggestions | Allow duplicates | Simplicity, aligns with spec |
| 4 | Retention policy | Indefinite retention | Audit trail, minimal storage cost |
| 5 | Atomic execution | DynamoDB TransactWriteItems | ACID guarantees, single API call |
| 6 | Role validation | Both authorizer and service | Defense in depth, detailed errors |
| 7 | Removed suggester | Keep pending, show name | Preserves history, admin control |

---

**Research Complete**: 2025-12-10  
**Status**: Ready for Phase 1 Design (data-model.md, api-spec.yaml, quickstart.md)