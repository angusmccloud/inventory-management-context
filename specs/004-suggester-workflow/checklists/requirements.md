# Requirements Checklist: Suggester Workflow

**Feature**: 004-suggester-workflow  
**Created**: December 9, 2025  
**Purpose**: Validate that all requirements from the specification are testable and complete

## Instructions

This checklist validates **requirements**, not implementation. Each item should be verifiable through testing or inspection of the specification.

- ✅ = Requirement is clear, testable, and complete
- ❌ = Requirement needs clarification or is incomplete
- ⚠️ = Requirement has dependencies or risks that need attention

---

## Suggester Inventory Viewing

- [ ] **FR-001**: Suggester members can view all active inventory items for their family
  - Verify: Suggester can see inventory list
  - Verify: Only active items are shown (archived items hidden)
  - Verify: Only items from suggester's family are visible

- [ ] **FR-002**: Item details displayed to suggesters include name, quantity, location, and low-stock status
  - Verify: All specified attributes are visible
  - Verify: Display is read-only (no edit controls)

- [ ] **FR-003**: Suggesters cannot modify inventory item quantities or attributes
  - Verify: No edit/update controls available to suggesters
  - Verify: API rejects modification attempts from suggester role

- [ ] **FR-004**: Suggesters cannot create, edit, or delete inventory items directly
  - Verify: No create/edit/delete controls available to suggesters
  - Verify: API rejects these operations from suggester role

---

## Suggestion Creation

- [ ] **FR-005**: Suggesters can create "add_to_shopping" suggestions for existing inventory items
  - Verify: UI provides mechanism to suggest adding item to shopping list
  - Verify: Suggestion is created with correct type
  - Verify: Suggestion references the correct inventory item

- [ ] **FR-006**: Suggesters can create "create_item" suggestions for new inventory items
  - Verify: UI provides mechanism to suggest new item
  - Verify: Suggestion is created with correct type
  - Verify: No inventory item reference is included

- [ ] **FR-007**: "create_item" suggestions require item name, quantity, and threshold
  - Verify: Form validates required fields
  - Verify: Suggestion cannot be submitted without these fields
  - Verify: Values are stored correctly in suggestion

- [ ] **FR-008**: Suggesters can add optional notes to any suggestion
  - Verify: Notes field is available for both suggestion types
  - Verify: Notes are stored and displayed correctly
  - Verify: Suggestions can be created without notes

- [ ] **FR-009**: Only members with 'suggester' role can create suggestions
  - Verify: API validates member role before creating suggestion
  - Verify: Admin members cannot create suggestions (or receive appropriate error)

- [ ] **FR-010**: Suggestion status is set to 'pending' upon creation
  - Verify: New suggestions have status = 'pending'
  - Verify: reviewedBy and reviewedAt are null

- [ ] **FR-011**: Suggester's memberId and creation timestamp are recorded
  - Verify: suggestedBy field contains correct memberId
  - Verify: createdAt timestamp is accurate

---

## Suggestion Viewing

- [ ] **FR-012**: All family members can view suggestions for their family
  - Verify: Both admins and suggesters can view suggestions
  - Verify: Only suggestions from member's family are visible

- [ ] **FR-013**: Suggestion display includes type, status, suggester name, and creation date
  - Verify: All specified fields are visible
  - Verify: Suggester name is displayed (not just ID)

- [ ] **FR-014**: "add_to_shopping" suggestions display item details (name, current quantity)
  - Verify: Referenced item name is shown
  - Verify: Current quantity is displayed
  - Verify: Display handles case where item was deleted

- [ ] **FR-015**: "create_item" suggestions display proposed item details
  - Verify: Proposed name is shown
  - Verify: Proposed quantity is shown
  - Verify: Proposed threshold is shown

- [ ] **FR-016**: Suggestions can be filtered by status (pending, approved, rejected)
  - Verify: Filter controls are available
  - Verify: Filtering works correctly for each status
  - Verify: Default view shows appropriate suggestions

- [ ] **FR-017**: Suggester notes are displayed if provided
  - Verify: Notes are visible when present
  - Verify: Display handles suggestions without notes gracefully

---

## Suggestion Approval

- [ ] **FR-018**: Admin members can approve pending suggestions
  - Verify: Approve action is available to admins
  - Verify: Only pending suggestions can be approved
  - Verify: Approval updates suggestion status

- [ ] **FR-019**: Only members with 'admin' role can approve suggestions
  - Verify: API validates member role before approving
  - Verify: Suggester members cannot approve suggestions

- [ ] **FR-020**: Approving "add_to_shopping" creates a ShoppingListItem for the referenced item
  - Verify: ShoppingListItem is created with correct itemId
  - Verify: Item appears on shopping list
  - Verify: ShoppingListItem has correct attributes

- [ ] **FR-021**: Approving "create_item" creates a new InventoryItem with proposed attributes
  - Verify: InventoryItem is created with proposed name, quantity, threshold
  - Verify: Item appears in inventory list
  - Verify: Item has correct familyId and createdBy

- [ ] **FR-022**: Approval updates suggestion status and records reviewer details
  - Verify: Status changes to 'approved'
  - Verify: reviewedBy contains admin's memberId
  - Verify: reviewedAt contains accurate timestamp

- [ ] **FR-023**: Suggested action executes atomically with approval
  - Verify: Both suggestion update and action (create item/shopping item) succeed or both fail
  - Verify: No partial state (approved suggestion without created item)

---

## Suggestion Rejection

- [ ] **FR-024**: Admin members can reject pending suggestions
  - Verify: Reject action is available to admins
  - Verify: Only pending suggestions can be rejected
  - Verify: Rejection updates suggestion status

- [ ] **FR-025**: Only members with 'admin' role can reject suggestions
  - Verify: API validates member role before rejecting
  - Verify: Suggester members cannot reject suggestions

- [ ] **FR-026**: Rejection updates suggestion status and records reviewer details
  - Verify: Status changes to 'rejected'
  - Verify: reviewedBy contains admin's memberId
  - Verify: reviewedAt contains accurate timestamp

- [ ] **FR-027**: No action is executed when a suggestion is rejected
  - Verify: No ShoppingListItem is created for rejected "add_to_shopping"
  - Verify: No InventoryItem is created for rejected "create_item"
  - Verify: Inventory and shopping list remain unchanged

- [ ] **FR-028**: Admins can provide optional rejection reason/notes
  - Verify: Rejection notes field is available
  - Verify: Notes are stored and displayed
  - Verify: Rejection works without notes

---

## Data Integrity

- [ ] **FR-029**: System handles referenced inventory item deletion before "add_to_shopping" review
  - Verify: Suggestion remains viewable with item name
  - Verify: Admin can still approve/reject
  - Verify: Appropriate error handling if approval attempted for deleted item

- [ ] **FR-030**: System prevents duplicate inventory item names when approving "create_item"
  - Verify: Validation checks for existing item with same name
  - Verify: Appropriate error message shown to admin
  - Verify: Suggestion remains pending if name conflict exists

- [ ] **FR-031**: Suggestion records are maintained when suggester member is removed
  - Verify: Suggestions remain visible after suggester removal
  - Verify: Suggester name is still displayed
  - Verify: Suggestions can still be approved/rejected

- [ ] **FR-032**: Approved or rejected suggestions cannot be modified
  - Verify: No edit controls for non-pending suggestions
  - Verify: API rejects modification attempts
  - Verify: Status cannot be changed back to pending

- [ ] **FR-033**: Suggestion data persists across user sessions
  - Verify: Suggestions remain after logout/login
  - Verify: All suggestion attributes are preserved
  - Verify: Suggestion history is maintained

---

## Edge Cases Coverage

- [ ] **Edge Case**: Removed suggester with pending suggestions
  - Verify: Pending suggestions remain reviewable
  - Verify: Suggester name is displayed correctly
  - Verify: Approval/rejection works normally

- [ ] **Edge Case**: Approved "create_item" conflicts with existing item name
  - Verify: Validation prevents duplicate names
  - Verify: Clear error message to admin
  - Verify: Suggestion can be rejected or admin can modify

- [ ] **Edge Case**: Referenced item deleted before "add_to_shopping" approval
  - Verify: Suggestion shows item name even if deleted
  - Verify: Approval handles gracefully (error or converts to free-text shopping item)
  - Verify: Rejection works normally

- [ ] **Edge Case**: Duplicate suggestions for same item
  - Verify: System allows duplicate suggestions
  - Verify: Each suggestion is independent
  - Verify: Admin can approve/reject each separately

- [ ] **Edge Case**: Concurrent approvals by multiple admins
  - Verify: Only one admin can approve a suggestion
  - Verify: Second admin receives appropriate error
  - Verify: No duplicate items created

- [ ] **Edge Case**: Suggester role changed to admin
  - Verify: Existing suggestions remain attributed to member
  - Verify: Member can now approve/reject (but not their own suggestions)
  - Verify: Member can no longer create new suggestions

- [ ] **Edge Case**: Suggestion retention
  - Verify: Approved/rejected suggestions are retained
  - Verify: Suggestion history is accessible
  - Verify: Old suggestions don't clutter pending view

---

## Success Criteria Validation

- [ ] **SC-001**: Suggesters can view inventory and submit suggestions in under 30 seconds
  - Verify: UI is responsive and intuitive
  - Verify: Minimal clicks required for common actions

- [ ] **SC-002**: 100% of suggester-created suggestions validated for proper role permissions
  - Verify: Role validation is enforced on all suggestion creation
  - Verify: No bypass mechanisms exist

- [ ] **SC-003**: Admins can review and approve/reject in under 15 seconds
  - Verify: Review UI is efficient
  - Verify: Minimal clicks required for approval/rejection

- [ ] **SC-004**: Approved "add_to_shopping" creates shopping list items with 100% success
  - Verify: No failures in shopping item creation
  - Verify: Atomic transaction ensures consistency

- [ ] **SC-005**: Approved "create_item" creates inventory items with 100% success
  - Verify: No failures in inventory item creation
  - Verify: Atomic transaction ensures consistency

- [ ] **SC-006**: Duplicate item name prevention works with 100% accuracy
  - Verify: All duplicate attempts are caught
  - Verify: No false positives (valid names rejected)

- [ ] **SC-007**: 100% data integrity when items deleted or suggesters removed
  - Verify: No orphaned or corrupted suggestions
  - Verify: All references handled gracefully

- [ ] **SC-008**: 80% of families report increased child engagement within 2 weeks
  - Verify: User feedback mechanism exists
  - Verify: Engagement metrics can be tracked

---

## Dependencies Validation

- [ ] **Dependency**: Family entity and isolation from 001-family-inventory-mvp
  - Verify: Suggestions are properly scoped to family
  - Verify: Cross-family access is prevented

- [ ] **Dependency**: InventoryItem entity from 001-family-inventory-mvp
  - Verify: "add_to_shopping" suggestions reference valid items
  - Verify: "create_item" suggestions create valid inventory items

- [ ] **Dependency**: ShoppingListItem entity from 001-family-inventory-mvp
  - Verify: Approved "add_to_shopping" creates valid shopping items
  - Verify: Shopping items have correct attributes

- [ ] **Dependency**: Member entity with roles from 003-member-management
  - Verify: Role-based permissions are enforced
  - Verify: Suggester and admin roles work as expected

- [ ] **Dependency**: DynamoDB single-table design
  - Verify: Suggestion entity follows table structure
  - Verify: Access patterns work efficiently

- [ ] **Dependency**: Lambda authorizer for role validation
  - Verify: All API endpoints validate roles
  - Verify: Unauthorized access is prevented

---

## Out of Scope Confirmation

Verify these items are NOT implemented (as they are explicitly out of scope):

- [ ] Suggester ability to modify/delete their own pending suggestions
- [ ] Suggester ability to view or add to shopping lists directly
- [ ] Batch approval/rejection of multiple suggestions
- [ ] Suggestion templates or recurring suggestions
- [ ] Email notifications to suggesters when reviewed
- [ ] Suggester ability to suggest quantity adjustments
- [ ] Suggester ability to suggest item archival/deletion

---

## Specification Completeness

- [ ] All functional requirements (FR-001 through FR-033) are documented
- [ ] All acceptance scenarios from User Story 5 are covered
- [ ] All edge cases are addressed
- [ ] Success criteria are measurable
- [ ] Dependencies are clearly identified
- [ ] Out of scope items are explicitly listed
- [ ] Risk mitigations are documented
- [ ] Data model references are accurate

---

## Notes

**Checklist Purpose**: This checklist validates that the specification is complete and testable. It does NOT validate implementation.

**Review Process**: 
1. Review each requirement against the specification
2. Mark items as complete only when requirement is clear and testable
3. Flag any ambiguities or missing details
4. Ensure all edge cases have defined behavior

**Next Steps**: Once this checklist is complete, the specification is ready for:
- Implementation planning (plan.md)
- Task breakdown (tasks.md)
- Development work