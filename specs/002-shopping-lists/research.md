# Research: Shopping List Management

**Feature**: 002-shopping-lists  
**Date**: 2025-12-10  
**Status**: Phase 0 Complete

## Overview

This document captures research decisions made during the planning phase for the Shopping List Management feature. Each decision includes rationale and alternatives considered.

---

## 1. Data Model Reuse from Parent Feature

**Decision**: Reuse the ShoppingListItem entity exactly as defined in `001-family-inventory-mvp/data-model.md` (lines 318-387).

**Rationale**: 
- The parent feature already defines a complete ShoppingListItem entity with all required attributes
- Key structure (PK: `FAMILY#{familyId}`, SK: `SHOPPING#{shoppingItemId}`) supports family isolation
- GSI2 (PK: `FAMILY#{familyId}#SHOPPING`, SK: `STORE#{storeId}#STATUS#{status}`) enables store-based filtering
- All attributes match the spec requirements: `shoppingItemId`, `familyId`, `itemId`, `name`, `storeId`, `status`, `quantity`, `notes`, `addedBy`, `createdAt`, `updatedAt`

**Alternatives Considered**:
- Creating a new entity definition: Rejected because it would duplicate existing work and risk inconsistency
- Extending the entity with additional fields: Not needed; current definition is complete for this feature

---

## 2. DynamoDB Access Patterns

**Decision**: Use the existing access patterns defined in the parent data model with no modifications.

**Rationale**:
- **List all shopping items**: Query on PK = `FAMILY#{familyId}`, SK begins_with `SHOPPING#`
- **List by store**: Query on GSI2 with PK = `FAMILY#{familyId}#SHOPPING`, SK begins_with `STORE#{storeId}`
- **List by status**: Query on GSI2 with PK = `FAMILY#{familyId}#SHOPPING`, SK contains `STATUS#{status}`
- **Unassigned items**: Query on GSI2 with SK begins_with `STORE#NONE` (use `NONE` as sentinel value for null storeId)

**Alternatives Considered**:
- Adding a new GSI for status-only queries: Rejected because GSI2 already supports status filtering via composite sort key
- Using scan operations: Rejected per constitution (avoid table scans)

---

## 3. Concurrent Update Handling Strategy

**Decision**: Implement optimistic locking using DynamoDB conditional writes with a `version` attribute.

**Rationale**:
- Spec requirement SC-007 mandates concurrent update support without data loss
- Optimistic locking is simpler than pessimistic locking for web applications
- DynamoDB conditional expressions provide atomic check-and-update semantics
- Pattern: Include `version` attribute, increment on each update, use `ConditionExpression: version = :expectedVersion`

**Alternatives Considered**:
- Last-write-wins: Rejected because it can cause data loss when multiple family members shop simultaneously
- Pessimistic locking with DynamoDB transactions: Rejected due to added complexity and cost; optimistic locking is sufficient for shopping list use case
- Real-time sync with WebSockets: Out of scope for MVP; can be added later

**Implementation Notes**:
- Add `version: number` attribute to ShoppingListItem (starting at 1)
- On conflict (ConditionCheckFailedException), return 409 Conflict with current item state
- Client should refresh and retry or merge changes

---

## 4. Retention Policy for Purchased Items

**Decision**: Purchased items are retained for 7 days, then automatically deleted via DynamoDB TTL.

**Rationale**:
- Spec requirement SC-006 states checked-off items must remain visible for at least 7 days
- DynamoDB TTL provides automatic cleanup without Lambda invocations
- Reduces storage costs and keeps lists manageable

**Alternatives Considered**:
- Manual cleanup by users: Rejected because it adds friction and lists become cluttered
- Scheduled Lambda for cleanup: Rejected because DynamoDB TTL is simpler and cost-free
- Longer retention (30 days): Rejected because 7 days aligns with typical shopping cycles

**Implementation Notes**:
- Add `ttl` attribute (Unix timestamp) to ShoppingListItem
- Set `ttl = updatedAt + 7 days` when status changes to 'purchased'
- Clear `ttl` (set to null) when status changes back to 'pending'
- Enable TTL on the DynamoDB table for the `ttl` attribute

---

## 5. Store Assignment for Free-Text Items

**Decision**: Free-text items default to `storeId = null`, displayed in an "Unassigned" group in the UI.

**Rationale**:
- Spec FR-027 requires items without stores to appear in a separate "Unassigned" group
- Making store assignment optional reduces friction when quickly adding items
- Users can assign stores later if desired (FR-022)

**Alternatives Considered**:
- Require store selection on add: Rejected because it adds friction for quick item entry
- Default to "last used store": Rejected due to complexity and potential confusion
- Prompt for store after adding: Rejected; optional assignment is simpler

**Implementation Notes**:
- In GSI2SK, use `STORE#UNASSIGNED` as sentinel value when `storeId` is null
- Query for unassigned items: GSI2 with SK begins_with `STORE#UNASSIGNED`
- UI should display "Unassigned" group at the end of store-grouped views

---

## 6. Orphaned Shopping List Items (Inventory Item Deleted)

**Decision**: When a linked InventoryItem is deleted, convert the ShoppingListItem to a free-text item by setting `itemId = null` while preserving the `name`.

**Rationale**:
- Spec FR-037 requires handling deleted inventory items by converting to free-text
- Preserving the item name maintains shopping list continuity
- Users can still complete their shopping trip without disruption

**Alternatives Considered**:
- Delete shopping list items when inventory item is deleted: Rejected because it could remove items users still need to buy
- Mark as "orphaned" with special status: Rejected due to added complexity; free-text conversion is simpler

**Implementation Notes**:
- When deleting InventoryItem, query for ShoppingListItems with matching `itemId`
- Update each to set `itemId = null` (transactional write recommended)
- No change to `name`, `storeId`, or other attributes

---

## 7. Duplicate Item Prevention

**Decision**: Prevent duplicate shopping list items for the same inventory item unless explicitly added by user confirmation.

**Rationale**:
- Spec FR-038 requires preventing duplicates unless explicitly added
- Reduces accidental clutter on shopping lists
- Users can override if they genuinely need multiple entries

**Alternatives Considered**:
- Allow unlimited duplicates: Rejected because it leads to list clutter
- Merge duplicates automatically (sum quantities): Rejected because it may not match user intent
- Block duplicates entirely: Rejected because users may have valid reasons for duplicates

**Implementation Notes**:
- Before adding inventory-linked item, query for existing ShoppingListItem with same `itemId` and `status = 'pending'`
- If found, return 409 Conflict with existing item details
- Client can prompt user: "This item is already on your list. Add another?"
- If user confirms, add with a flag or simply proceed with the add

---

## 8. API Endpoint Structure

**Decision**: Use RESTful API endpoints under `/api/families/{familyId}/shopping-list`.

**Rationale**:
- Consistent with parent feature's API structure
- Family-scoped endpoints align with data model's family isolation
- RESTful design is intuitive and well-documented

**Endpoints**:
- `GET /api/families/{familyId}/shopping-list` - List all items (supports `?store={storeId}` filter)
- `POST /api/families/{familyId}/shopping-list` - Add item
- `GET /api/families/{familyId}/shopping-list/{shoppingItemId}` - Get single item
- `PATCH /api/families/{familyId}/shopping-list/{shoppingItemId}` - Update item (including status toggle)
- `DELETE /api/families/{familyId}/shopping-list/{shoppingItemId}` - Remove item

**Alternatives Considered**:
- GraphQL: Rejected for MVP simplicity; REST is sufficient
- Separate endpoints for status toggle: Rejected; PATCH with `status` field is cleaner

---

## 9. Authorization Model

**Decision**: Adults (admin role) can create, update, and delete shopping list items. All family members can view.

**Rationale**:
- Spec states "Adults are responsible for managing the shopping list"
- Suggesters can view but not modify (per spec assumption)
- Aligns with parent feature's role-based access control

**Alternatives Considered**:
- Allow suggesters to add items: Deferred to feature 004-suggester-workflow
- Per-item permissions: Rejected due to complexity; family-level roles are sufficient

**Implementation Notes**:
- Lambda authorizer extracts `memberId` from JWT, queries DynamoDB for role
- Write operations require `role = 'admin'`
- Read operations allow any family member

---

## 10. Real-Time Updates

**Decision**: Defer real-time updates to a future enhancement. Initial implementation uses polling or manual refresh.

**Rationale**:
- Spec mentions "real-time updates" in assumptions but doesn't require it
- WebSocket/SSE adds significant complexity
- Polling with reasonable interval (30 seconds) is acceptable for MVP

**Alternatives Considered**:
- WebSocket with API Gateway: Deferred to future enhancement
- Server-Sent Events: Deferred to future enhancement
- Push notifications: Explicitly out of scope per spec

**Implementation Notes**:
- Client can implement polling with `GET /api/families/{familyId}/shopping-list`
- Consider adding `If-Modified-Since` header support for efficiency
- Document real-time as future enhancement in plan

---

## Summary of Key Decisions

| Topic | Decision | Impact |
|-------|----------|--------|
| Data Model | Reuse parent feature's ShoppingListItem | No new entity definition needed |
| Access Patterns | Use existing GSI2 | No new indexes required |
| Concurrency | Optimistic locking with version attribute | Add `version` field |
| Retention | 7-day TTL for purchased items | Add `ttl` field, enable DynamoDB TTL |
| Store Assignment | Optional, "Unassigned" group for null | Use `STORE#UNASSIGNED` sentinel |
| Orphaned Items | Convert to free-text on inventory delete | Update `itemId` to null |
| Duplicates | Prevent with user override option | Query before insert |
| API | RESTful under `/api/families/{familyId}/shopping-list` | 5 endpoints |
| Authorization | Admin write, all read | Role check in Lambda |
| Real-Time | Deferred, use polling | Future enhancement |

---

## Open Questions (None)

All technical decisions have been resolved based on the spec and constitution requirements.

---

**Research Complete**: 2025-12-10  
**Next Step**: Update plan.md with Technical Context and Constitution Check sections