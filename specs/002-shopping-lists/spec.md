# Feature Specification: Shopping List Management

**Feature Branch**: `002-shopping-lists`
**Created**: December 9, 2025
**Status**: Specification Complete
**Parent Feature**: `001-family-inventory-mvp`

## Purpose and Problem Statement

Families need an efficient way to translate inventory awareness into actionable shopping trips. Without organized shopping lists, families either forget needed items, make multiple trips to stores, or waste time wandering aisles trying to remember what they need.

This feature enables adults to create and manage shopping lists that bridge the gap between knowing what's low in stock and actually purchasing replacements. By organizing items by store and maintaining purchase status, families can shop more efficiently and ensure nothing is forgotten.

The goal is to streamline the shopping workflow, reduce forgotten purchases, and make store visits more efficient through organized, store-specific lists.

## User Scenarios & Testing *(mandatory)*

### User Story 3 - Adult Creates and Manages Shopping Lists (Priority: P1)

Adults add items to a family shopping list (either from tracked inventory or as free-text items), organize items by preferred store, view the list filtered by store or as a combined master list, and check off items as purchased.

**Why this priority**: Shopping list management is a core workflow that bridges inventory awareness to action. It enables efficient shopping by organizing needs by store. This is the natural next step after establishing inventory tracking and notifications.

**Independent Test**: Can be tested by adding inventory items and free-text items to the shopping list, viewing by store and combined views, and checking off items to verify they're marked as purchased.

**Acceptance Scenarios**:

1. **Given** an inventory item exists, **When** an adult clicks "Add to Shopping List", **Then** the item appears on the shopping list associated with its preferred store
2. **Given** the shopping list, **When** an adult adds a free-text item not in inventory, **Then** the item appears on the list
3. **Given** items on the shopping list, **When** an adult views by store, **Then** items are grouped by their associated store
4. **Given** items on the shopping list, **When** an adult views the master list, **Then** all items from all stores are displayed
5. **Given** a shopping list item, **When** an adult checks it off as purchased, **Then** the item is marked complete but inventory is not automatically updated
6. **Given** checked-off items, **When** an adult returns to the list, **Then** they can see which items were purchased

---

### Edge Cases

- **Orphaned Shopping List Items**: What happens when an inventory item linked to a shopping list item is archived or deleted?
- **Checked-Off Item Retention**: How long are checked-off shopping list items retained before being cleared?
- **Store Assignment**: How are free-text items assigned to stores when they don't have a preferred store from inventory?
- **Duplicate Items**: How does the system handle adding the same inventory item to the shopping list multiple times?
- **Concurrent Updates**: What happens when multiple family members check off the same item simultaneously?

## Requirements *(mandatory)*

### Functional Requirements

#### Shopping List Creation (US3)

- **FR-019**: System MUST allow adults to add inventory items to the family shopping list
- **FR-020**: System MUST allow adults to add free-text items (not tracked in inventory) to the shopping list
- **FR-021**: System MUST automatically associate shopping list items with the preferred store from the linked inventory item (if applicable)
- **FR-022**: System MUST allow adults to manually assign or change the store for any shopping list item
- **FR-023**: System MUST allow adults to specify an optional quantity for shopping list items
- **FR-024**: System MUST allow adults to add optional notes to shopping list items

#### Shopping List Viewing (US3)

- **FR-025**: System MUST display the shopping list in a combined master view showing all items from all stores
- **FR-026**: System MUST display the shopping list filtered by store, grouping items by their associated store
- **FR-027**: System MUST display items without an assigned store in a separate "Unassigned" group
- **FR-028**: System MUST show the purchase status (pending/purchased) for each shopping list item
- **FR-029**: System MUST allow all family members to view the shopping list

#### Shopping List Management (US3)

- **FR-030**: System MUST allow adults to check off items as purchased
- **FR-031**: System MUST allow adults to uncheck items if marked purchased in error
- **FR-032**: System MUST NOT automatically update inventory quantities when shopping list items are checked off
- **FR-033**: System MUST maintain the state of checked-off items for adult review
- **FR-034**: System MUST allow adults to remove items from the shopping list
- **FR-035**: System MUST allow adults to edit shopping list item details (name, quantity, notes, store)

#### Data Integrity (US3)

- **FR-036**: System MUST handle the case where a linked inventory item is archived by maintaining the shopping list item with the item name
- **FR-037**: System MUST handle the case where a linked inventory item is deleted by converting the shopping list item to a free-text item
- **FR-038**: System MUST prevent duplicate shopping list items for the same inventory item unless explicitly added by the user
- **FR-039**: System MUST persist shopping list data across user sessions

### Key Entities

**ShoppingListItem**: An item that needs to be purchased. Can be linked to an inventory item or be a standalone free-text entry. Includes purchased/checked-off status and associated store.

**Attributes** (from data-model.md):
- `shoppingItemId`: Unique identifier (UUID)
- `familyId`: Reference to the family
- `itemId`: Optional reference to InventoryItem (null for free-text items)
- `name`: Item name (required, 1-100 characters)
- `storeId`: Optional reference to Store
- `status`: Purchase status ('pending' or 'purchased')
- `quantity`: Optional quantity to purchase (integer > 0)
- `notes`: Optional notes (0-500 characters)
- `addedBy`: Reference to the Member who added the item
- `createdAt`: Timestamp when item was added
- `updatedAt`: Timestamp of last modification

**Relationships**:
- Belongs to one Family
- Optionally references one InventoryItem
- Optionally references one Store
- Created by one Member (adult)

**State Transitions**:
- Created: `status` = 'pending'
- Checked off: `status` = 'purchased'
- Can be toggled between 'pending' and 'purchased'
- Removed: Item deleted from shopping list

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Adults can add items to the shopping list in under 10 seconds per item
- **SC-002**: 90% of shopping trips are completed using the organized store-filtered view
- **SC-003**: Families report 30% reduction in forgotten purchases within 2 weeks of using shopping lists
- **SC-004**: Shopping list items maintain 100% data integrity when linked inventory items are archived or deleted
- **SC-005**: All family members can view the shopping list with zero permission errors
- **SC-006**: Checked-off items remain visible for at least 7 days for review purposes
- **SC-007**: System supports concurrent updates from multiple family members without data loss

## Out of Scope

The following capabilities are explicitly excluded from this specification:

### Excluded from This Feature

- Automatic addition of low-stock items to the shopping list (may be added in future enhancement)
- Shopping list sharing with non-family members
- Price tracking or budget management for shopping lists
- Recipe-based shopping list generation
- Barcode scanning for adding items
- Shopping list templates or recurring lists
- Integration with store inventory systems
- Automatic inventory updates when items are checked off (intentionally manual to allow for verification)
- Mobile push notifications for shopping list changes
- Shopping list history or analytics

### Handled by Other Features

- Family and member management → See `001-family-inventory-mvp`
- Inventory item creation and management → See `001-family-inventory-mvp`
- Store/vendor reference data management → See `005-reference-data` (planned)
- Suggester workflow for shopping list suggestions → See `004-suggester-workflow` (planned)

## Assumptions

- Adults are responsible for managing the shopping list; suggesters may view but not modify (suggester modifications handled in feature 004)
- Families will manually update inventory quantities after shopping rather than automatic updates
- Shopping list items remain on the list after being checked off for a reasonable review period (implementation will define retention policy)
- Free-text items can be added without requiring them to exist in inventory first
- Store assignments are optional; items without stores are still valid shopping list items
- Families prefer to see both pending and purchased items together for context during shopping
- Multiple family members may be shopping simultaneously and need to see real-time updates
- The shopping list is a family-shared resource, not individual member lists

## Dependencies

### From Parent Feature (001-family-inventory-mvp)

- Family entity and family isolation mechanisms
- Member entity with role-based permissions (adult/admin)
- InventoryItem entity with preferred store associations
- Store/Vendor reference data
- Authentication and authorization system
- DynamoDB single-table design and access patterns

### External Dependencies

- Web hosting infrastructure (from parent feature)
- Data storage system (DynamoDB from parent feature)
- Standard web browser capabilities (from parent feature)

### Data Model Dependencies

This feature relies on the ShoppingListItem entity defined in [`001-family-inventory-mvp/data-model.md`](../001-family-inventory-mvp/data-model.md#6-shoppinglistitem) (lines 318-387).

## Risk Considerations

- **User Confusion**: Users may expect inventory to auto-update when items are checked off
  - *Mitigation*: Clear UI messaging that checking off items doesn't update inventory; provide easy workflow to update inventory after shopping

- **Orphaned References**: Deleting inventory items could break shopping list references
  - *Mitigation*: Convert linked items to free-text items when inventory items are deleted; maintain item name for continuity

- **Concurrent Modifications**: Multiple family members shopping simultaneously could cause conflicts
  - *Mitigation*: Implement optimistic locking or last-write-wins with clear UI feedback

- **List Clutter**: Checked-off items accumulating over time could make list unwieldy
  - *Mitigation*: Implement retention policy for purchased items (e.g., auto-clear after 7 days) with option to manually clear

- **Store Organization Overhead**: Manually assigning stores to free-text items could be tedious
  - *Mitigation*: Make store assignment optional; provide "Unassigned" group for items without stores

---

## Related Features

This specification builds upon and relates to other features in the family inventory management system:

| Feature ID | Name | Relationship | Status |
|------------|------|--------------|--------|
| `001-family-inventory-mvp` | Family Inventory MVP | **Parent** - Provides foundation (Family, Member, InventoryItem, Store entities) | Implementation Complete |
| `003-member-management` | Family Member Management | **Sibling** - Manages member roles that control shopping list permissions | Planned |
| `004-suggester-workflow` | Suggester Workflow | **Extension** - Adds suggester ability to suggest shopping list additions | Planned |
| `005-reference-data` | Reference Data Management | **Sibling** - Manages Store entities used for list organization | Planned |

**Note**: This specification focuses solely on adult-driven shopping list management. Suggester participation in shopping lists will be addressed in feature 004-suggester-workflow.