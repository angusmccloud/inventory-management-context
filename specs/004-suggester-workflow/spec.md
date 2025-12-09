# Feature Specification: Suggester Workflow

**Feature Branch**: `004-suggester-workflow`
**Created**: December 9, 2025
**Status**: Specification Complete
**Parent Features**: `001-family-inventory-mvp`, `003-member-management`

## Purpose and Problem Statement

Families want to empower younger members (suggesters) to participate in household inventory management without giving them direct modification privileges. Without a suggester workflow, children either have no voice in what gets purchased or must ask parents verbally, leading to forgotten requests and missed opportunities for teaching responsibility.

This feature enables suggester users to view the family's inventory, submit suggestions for adding items to the shopping list, and request new items to be tracked. Adults review and approve or reject these suggestions, maintaining control while fostering family participation and shared ownership.

The goal is to create a safe, controlled way for suggesters to contribute to inventory management, teaching responsibility while protecting data integrity through an approval workflow.

## User Scenarios & Testing *(mandatory)*

### User Story 5 - Suggesters View Inventory and Submit Suggestions (Priority: P2)

Suggester users (typically kids) can view the family's inventory to see what's available, then submit suggestions for items to add to the shopping list or request new items to track. Adults review and approve or reject these suggestions.

**Why this priority**: Empowers younger family members to participate, fostering responsibility and shared ownership. This is valuable but not essential for core inventory tracking. Builds upon the foundation established in 001-family-inventory-mvp and 003-member-management.

**Independent Test**: Can be tested by logging in as a suggester, submitting suggestions for shopping list additions and new items, then logging in as an adult to approve/reject and verify the results.

**Acceptance Scenarios**:

1. **Given** a suggester is logged in, **When** they view inventory, **Then** they can see all current items and quantities
2. **Given** a suggester views an inventory item, **When** they request it be added to shopping list, **Then** a suggestion is created for adult review
3. **Given** a suggester is on the inventory page, **When** they request a new item be created, **Then** a suggestion is submitted for adult approval
4. **Given** suggestions exist, **When** an adult views them, **Then** they can see all pending suggestions with details
5. **Given** a pending suggestion, **When** an adult approves it, **Then** the suggested action is executed (item added to list or inventory)
6. **Given** a pending suggestion, **When** an adult rejects it, **Then** the suggestion is dismissed without changes

---

### Edge Cases

- **Removed Suggester with Pending Suggestions**: What happens when an adult removes a family member who has pending suggestions?
- **Approved Item Conflicts**: What happens when a suggester's approved "create_item" suggestion conflicts with an existing inventory item name?
- **Referenced Item Deleted**: How are "add_to_shopping" suggestions handled when the referenced inventory item is archived or deleted before approval?
- **Duplicate Suggestions**: What happens when a suggester submits multiple suggestions for the same inventory item?
- **Concurrent Approvals**: What happens when multiple admins try to approve/reject the same suggestion simultaneously?
- **Suggester Role Change**: What happens to pending suggestions when a suggester's role is changed to admin?
- **Suggestion Retention**: How long are approved/rejected suggestions retained in the system?

## Requirements *(mandatory)*

### Functional Requirements

#### Suggester Inventory Viewing (US5)

- **FR-001**: System MUST allow suggester members to view all active inventory items for their family
- **FR-002**: System MUST display item name, quantity, location, and low-stock status to suggesters
- **FR-003**: System MUST prevent suggesters from modifying inventory item quantities or attributes
- **FR-004**: System MUST prevent suggesters from creating, editing, or deleting inventory items directly

#### Suggestion Creation (US5)

- **FR-005**: System MUST allow suggesters to create "add_to_shopping" suggestions for existing inventory items
- **FR-006**: System MUST allow suggesters to create "create_item" suggestions for new inventory items
- **FR-007**: System MUST require suggester to provide item name, quantity, and threshold for "create_item" suggestions
- **FR-008**: System MUST allow suggesters to add optional notes to any suggestion
- **FR-009**: System MUST validate that only members with 'suggester' role can create suggestions
- **FR-010**: System MUST set suggestion status to 'pending' upon creation
- **FR-011**: System MUST record the suggester's memberId and creation timestamp for each suggestion

#### Suggestion Viewing (US5)

- **FR-012**: System MUST allow all family members to view suggestions for their family
- **FR-013**: System MUST display suggestion type, status, suggester name, and creation date
- **FR-014**: System MUST display item details for "add_to_shopping" suggestions (item name, current quantity)
- **FR-015**: System MUST display proposed item details for "create_item" suggestions (name, quantity, threshold)
- **FR-016**: System MUST allow filtering suggestions by status (pending, approved, rejected)
- **FR-017**: System MUST display suggester notes if provided

#### Suggestion Approval (US5)

- **FR-018**: System MUST allow admin members to approve pending suggestions
- **FR-019**: System MUST validate that only members with 'admin' role can approve suggestions
- **FR-020**: When approving "add_to_shopping" suggestion, system MUST create a ShoppingListItem for the referenced inventory item
- **FR-021**: When approving "create_item" suggestion, system MUST create a new InventoryItem with the proposed attributes
- **FR-022**: System MUST update suggestion status to 'approved' and record reviewer memberId and timestamp
- **FR-023**: System MUST execute the suggested action atomically with the approval

#### Suggestion Rejection (US5)

- **FR-024**: System MUST allow admin members to reject pending suggestions
- **FR-025**: System MUST validate that only members with 'admin' role can reject suggestions
- **FR-026**: System MUST update suggestion status to 'rejected' and record reviewer memberId and timestamp
- **FR-027**: System MUST NOT execute any action when a suggestion is rejected
- **FR-028**: System MUST allow admins to provide optional rejection reason/notes

#### Data Integrity (US5)

- **FR-029**: System MUST handle the case where a referenced inventory item is deleted before "add_to_shopping" suggestion is reviewed
- **FR-030**: System MUST prevent duplicate inventory item names when approving "create_item" suggestions
- **FR-031**: System MUST maintain suggestion records when the suggester member is removed from the family
- **FR-032**: System MUST prevent modification of approved or rejected suggestions
- **FR-033**: System MUST persist suggestion data across user sessions

### Key Entities

**Suggestion**: A request from a suggester to add an item to the shopping list or create a new inventory item. Requires adult approval.

**Attributes** (from data-model.md):
- `suggestionId`: Unique identifier (UUID)
- `familyId`: Reference to the family (UUID)
- `suggestedBy`: Reference to Member who created suggestion (must be suggester role)
- `type`: Suggestion type ('add_to_shopping' | 'create_item')
- `status`: Suggestion status ('pending' | 'approved' | 'rejected')
- `itemId`: Reference to InventoryItem (required for 'add_to_shopping', null for 'create_item')
- `proposedItemName`: Name for new item (required for 'create_item', null for 'add_to_shopping')
- `proposedQuantity`: Quantity for new item (optional for 'create_item', null for 'add_to_shopping')
- `proposedThreshold`: Threshold for new item (optional for 'create_item', null for 'add_to_shopping')
- `notes`: Optional notes from suggester (0-500 characters)
- `reviewedBy`: Reference to Member who reviewed (admin, null when pending)
- `reviewedAt`: Timestamp when reviewed (null when pending)
- `entityType`: 'Suggestion'
- `createdAt`: Timestamp when suggestion was created
- `updatedAt`: Timestamp of last modification

**Relationships**:
- Belongs to one Family
- Created by one Member (suggester role)
- Reviewed by one Member (admin role, when reviewed)
- Optionally references one InventoryItem (for 'add_to_shopping' type)

**State Transitions**:
- Created: `status` = 'pending', `reviewedBy` = null, `reviewedAt` = null
- Approved: `status` = 'approved', `reviewedBy` = admin memberId, `reviewedAt` = timestamp, action executed
- Rejected: `status` = 'rejected', `reviewedBy` = admin memberId, `reviewedAt` = timestamp, no action
- Cannot transition from 'approved' or 'rejected' back to 'pending'

**Validation Rules by Type**:

*For 'add_to_shopping' suggestions:*
- `itemId` MUST reference a valid, active InventoryItem
- `proposedItemName`, `proposedQuantity`, `proposedThreshold` MUST be null

*For 'create_item' suggestions:*
- `proposedItemName` MUST be provided (1-100 characters)
- `proposedQuantity` SHOULD be provided (integer >= 0, defaults to 0 if null)
- `proposedThreshold` SHOULD be provided (integer >= 0, defaults to 0 if null)
- `itemId` MUST be null

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Suggesters can view inventory and submit suggestions in under 30 seconds per suggestion
- **SC-002**: 100% of suggester-created suggestions are validated for proper role permissions
- **SC-003**: Admins can review and approve/reject suggestions in under 15 seconds per suggestion
- **SC-004**: Approved "add_to_shopping" suggestions create shopping list items with 100% success rate
- **SC-005**: Approved "create_item" suggestions create inventory items with 100% success rate
- **SC-006**: System prevents duplicate inventory item names when approving "create_item" suggestions with 100% accuracy
- **SC-007**: Suggestions maintain 100% data integrity when referenced items are deleted or suggesters are removed
- **SC-008**: 80% of families with suggesters report increased child engagement in household management within 2 weeks

## Out of Scope

The following capabilities are explicitly excluded from this specification:

### Excluded from This Feature

- Suggester ability to modify or delete their own pending suggestions
- Suggester ability to view shopping lists or add items directly
- Suggester ability to view or manage notifications
- Batch approval/rejection of multiple suggestions
- Suggestion templates or recurring suggestions
- Suggester ability to comment on or discuss suggestions with admins
- Automatic approval of suggestions based on rules or criteria
- Suggestion priority or urgency levels
- Suggester activity reports or analytics
- Email notifications to suggesters when their suggestions are reviewed
- Suggester ability to suggest quantity adjustments to existing items
- Suggester ability to suggest item archival or deletion

### Handled by Other Features

- Family and member management → See `001-family-inventory-mvp`
- Member role assignment (admin/suggester) → See `003-member-management`
- Inventory item creation and management by admins → See `001-family-inventory-mvp`
- Shopping list management by admins → See `002-shopping-lists`
- Storage location and store reference data → See `005-reference-data` (planned)

## Assumptions

- Suggesters are trusted family members (typically children) who understand the purpose of the suggestion workflow
- Admins will review suggestions in a timely manner (no SLA defined for MVP)
- Suggesters can view all inventory items but understand they cannot modify them directly
- The suggestion workflow is sufficient for suggester participation; direct modification is not needed
- Approved suggestions execute immediately without additional confirmation
- Rejected suggestions do not require detailed explanations (optional notes are sufficient)
- Suggesters do not need to be notified when their suggestions are reviewed (future enhancement)
- Suggestion history is valuable for audit purposes and should be retained
- Duplicate suggestions for the same item are acceptable (admin can reject duplicates)
- Suggesters will primarily use the web interface (mobile optimization is future scope)

## Dependencies

### From Parent Features

**From 001-family-inventory-mvp:**
- Family entity and family isolation mechanisms
- InventoryItem entity with all attributes
- ShoppingListItem entity for approved "add_to_shopping" suggestions
- DynamoDB single-table design and access patterns
- Authentication and authorization system

**From 003-member-management:**
- Member entity with role-based permissions (admin/suggester)
- Role validation and enforcement
- Member status management (active/removed)
- Lambda authorizer for role-based access control

### External Dependencies

- Web hosting infrastructure (from parent features)
- Data storage system (DynamoDB from parent features)
- Standard web browser capabilities (from parent features)
- AWS Cognito for user authentication (from parent features)

### Data Model Dependencies

This feature relies on the Suggestion entity defined in [`001-family-inventory-mvp/data-model.md`](../001-family-inventory-mvp/data-model.md#8-suggestion) (lines 463-539).

## Risk Considerations

- **Suggester Frustration**: Suggesters may become frustrated if suggestions are frequently rejected without explanation
  - *Mitigation*: Provide optional rejection notes field; encourage family communication about suggestion guidelines

- **Orphaned Suggestions**: Referenced inventory items may be deleted before suggestions are reviewed
  - *Mitigation*: Handle gracefully by showing item name in suggestion even if item is deleted; allow admin to still approve/reject

- **Duplicate Item Names**: Approved "create_item" suggestions may conflict with existing item names
  - *Mitigation*: Validate item name uniqueness before creating; show error to admin with option to modify or reject

- **Removed Suggester Data**: Removing a suggester may orphan their pending suggestions
  - *Mitigation*: Maintain suggestion records with suggester name even after removal; allow admins to still review

- **Suggestion Backlog**: Large numbers of pending suggestions may overwhelm admins
  - *Mitigation*: Display pending count prominently; allow filtering and sorting; consider future notification system

- **Role Confusion**: Suggesters may not understand why they can't modify inventory directly
  - *Mitigation*: Clear UI messaging about suggester role; help documentation explaining the approval workflow

- **Concurrent Review Conflicts**: Multiple admins reviewing the same suggestion simultaneously
  - *Mitigation*: Optimistic locking on suggestion status changes; clear error messages for conflicts

---

## Related Features

This specification builds upon and relates to other features in the family inventory management system:

| Feature ID | Name | Relationship | Status |
|------------|------|--------------|--------|
| `001-family-inventory-mvp` | Family Inventory MVP | **Parent** - Provides foundation (Family, InventoryItem, ShoppingListItem entities) | Implementation Complete |
| `003-member-management` | Family Member Management | **Parent** - Provides suggester role and member permissions | Specification Complete |
| `002-shopping-lists` | Shopping List Management | **Sibling** - Receives shopping list items from approved suggestions | Specification Complete |
| `005-reference-data` | Reference Data Management | **Future** - May provide location/store data for "create_item" suggestions | Planned |

**Note**: This specification focuses on the suggester workflow (viewing inventory and creating suggestions) and the admin workflow for reviewing suggestions. The suggester role itself is defined in feature 003-member-management.