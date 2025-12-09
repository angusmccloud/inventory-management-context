# Feature Specification: Family Member Management

**Feature Branch**: `003-member-management`
**Created**: December 9, 2025
**Status**: Specification Complete
**Parent Feature**: `001-family-inventory-mvp`

## Purpose and Problem Statement

Families need the ability to add multiple members to their household account with appropriate access levels. Without proper member management, families cannot share inventory visibility, delegate responsibilities, or control who can make changes to their inventory data.

This feature enables adults to invite and manage family members, assign role-based permissions (admin or suggester), and remove members when needed. By supporting multiple users with different permission levels, families can collaborate effectively while maintaining appropriate access control.

The goal is to enable safe, controlled multi-user access to family inventory data with clear role-based permissions that protect data integrity while allowing appropriate participation from all family members.

## User Scenarios & Testing *(mandatory)*

### User Story 4 - Family Member Management (Priority: P2)

Adults add family members to the account, assign roles (adult/admin or suggester/kid), and can remove members when needed, ensuring proper access control.

**Why this priority**: Multi-user access enables shared family participation. While important for the family context, basic inventory management works without it. This builds upon the foundation established in 001-family-inventory-mvp.

**Independent Test**: Can be tested by adding members with different roles, verifying each role has appropriate permissions, and removing a member to confirm access is revoked.

**Acceptance Scenarios**:

1. **Given** a family exists, **When** an adult adds a new member as an adult/admin, **Then** that member has full access to all features
2. **Given** a family exists, **When** an adult adds a new member as a suggester, **Then** that member can view inventory and create suggestions but cannot modify inventory
3. **Given** a family member exists, **When** an admin removes them, **Then** they no longer have access to the family's data
4. **Given** an admin attempts to remove the last admin from a family, **When** the removal is requested, **Then** the system prevents the removal and displays an error message
5. **Given** a member invitation is sent, **When** the invitee accepts the invitation, **Then** they are added to the family with the assigned role
6. **Given** a removed member exists, **When** they attempt to access family data, **Then** the system denies access and displays an appropriate message

---

### Edge Cases

- **Last Admin Protection**: What happens when an admin tries to remove the last admin from a family?
- **Removed Member with Pending Suggestions**: What happens when an admin removes a family member who has pending suggestions?
- **Removed Member with Shopping List Items**: What happens to shopping list items added by a removed member?
- **Invitation Expiration**: How long are member invitations valid before they expire?
- **Duplicate Email Invitations**: What happens when an admin tries to invite someone who is already a member?
- **Role Change for Last Admin**: What happens when trying to change the last admin's role to suggester?
- **Concurrent Member Removal**: What happens when multiple admins try to remove the same member simultaneously?
- **Self-Removal**: Can an admin remove themselves from the family?

## Requirements *(mandatory)*

### Functional Requirements

#### Member Addition (US4)

- **FR-001**: System MUST allow admin members to invite new members to their family via email
- **FR-002**: System MUST allow admins to assign a role (admin or suggester) when inviting a member
- **FR-003**: System MUST send an email invitation to the invitee with a secure invitation link
- **FR-004**: System MUST allow invitees to accept invitations and join the family
- **FR-005**: System MUST create a Cognito user account for new members who accept invitations
- **FR-006**: System MUST create a Member record in DynamoDB when an invitation is accepted
- **FR-007**: System MUST prevent duplicate member invitations for the same email address within a family
- **FR-008**: System MUST expire invitation links after a configurable time period (default: 7 days)

#### Member Role Management (US4)

- **FR-009**: System MUST support two member roles: 'admin' and 'suggester'
- **FR-010**: Admin members MUST have full access to all family features (inventory management, member management, shopping lists)
- **FR-011**: Suggester members MUST have read-only access to inventory and the ability to create suggestions
- **FR-012**: System MUST allow admins to change a member's role
- **FR-013**: System MUST prevent changing the last admin's role to suggester
- **FR-014**: System MUST require at least one admin member per family at all times

#### Member Removal (US4)

- **FR-015**: System MUST allow admin members to remove other members from the family
- **FR-016**: System MUST prevent removal of the last admin member
- **FR-017**: System MUST update the member's status to 'removed' rather than deleting the record
- **FR-018**: System MUST revoke access to family data immediately upon member removal
- **FR-019**: System MUST maintain data integrity for items created by removed members (inventory items, shopping list items, suggestions)
- **FR-020**: System MUST allow admins to view a list of removed members for audit purposes

#### Member Viewing (US4)

- **FR-021**: System MUST allow all family members to view the list of active family members
- **FR-022**: System MUST display member name, email, role, and join date for each member
- **FR-023**: System MUST allow admins to view both active and removed members
- **FR-024**: System MUST display member status (active or removed) in the member list

#### Data Isolation (US4)

- **FR-025**: System MUST isolate family data so members can only access their own family's information
- **FR-026**: System MUST validate member's family membership on every API request
- **FR-027**: System MUST prevent cross-family access attempts
- **FR-028**: System MUST log unauthorized access attempts for security monitoring

### Key Entities

**Member**: A user belonging to a family with a specific role (admin or suggester). Members have authentication credentials via Cognito and permissions based on their role.

**Attributes** (from data-model.md):
- `memberId`: Unique identifier (UUID, matches Cognito user sub)
- `familyId`: Reference to the family (UUID)
- `email`: User email address (unique per family)
- `name`: Display name (1-100 characters)
- `role`: Member role ('admin' or 'suggester')
- `status`: Member status ('active' or 'removed')
- `entityType`: 'Member'
- `createdAt`: Timestamp when member joined
- `updatedAt`: Timestamp of last modification

**Relationships**:
- Belongs to one Family
- Can create multiple InventoryItems (if admin)
- Can create multiple ShoppingListItems (if admin)
- Can create multiple Suggestions (if suggester)
- Can create multiple Notifications (system-generated)

**State Transitions**:
- Invited: Invitation sent, pending acceptance
- Active: `status` = 'active', full access based on role
- Removed: `status` = 'removed', access revoked
- Cannot transition from 'removed' back to 'active' (must be re-invited)

**Role-Based Permissions**:

| Feature | Admin | Suggester |
|---------|-------|-----------|
| View inventory | ✓ | ✓ |
| Create/edit/delete inventory items | ✓ | ✗ |
| Adjust inventory quantities | ✓ | ✗ |
| View notifications | ✓ | ✓ |
| Manage shopping lists | ✓ | ✗ |
| Create suggestions | ✗ | ✓ |
| Approve/reject suggestions | ✓ | ✗ |
| Add/remove members | ✓ | ✗ |
| Change member roles | ✓ | ✗ |
| Manage reference data (locations, stores) | ✓ | ✗ |

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Admins can invite and add new members in under 30 seconds
- **SC-002**: 100% of member invitations are delivered within 5 minutes
- **SC-003**: Role-based permissions are enforced with 100% accuracy (zero unauthorized actions)
- **SC-004**: System prevents removal of last admin with 100% reliability
- **SC-005**: Removed members lose access to family data within 1 minute of removal
- **SC-006**: All family members can view the member list without errors
- **SC-007**: Data created by removed members maintains 100% integrity (no orphaned records)
- **SC-008**: Invitation acceptance rate reaches 80% within 24 hours of invitation

## Out of Scope

The following capabilities are explicitly excluded from this specification:

### Excluded from This Feature

- Member profile management (avatar, bio, preferences)
- Member-to-member messaging or communication
- Activity logs or audit trails for member actions
- Member permissions beyond the two defined roles (admin/suggester)
- Temporary role assignments or time-based permissions
- Member groups or sub-teams within a family
- Invitation customization (custom messages, branding)
- Bulk member import or CSV upload
- Integration with external identity providers (Google, Facebook, etc.)
- Two-factor authentication (2FA) for member accounts
- Password reset functionality (handled by Cognito)
- Member activity analytics or usage reports

### Handled by Other Features

- Family creation and initial admin setup → See `001-family-inventory-mvp`
- Suggester workflow (creating and managing suggestions) → See `004-suggester-workflow` (planned)
- Inventory item management → See `001-family-inventory-mvp`
- Shopping list management → See `002-shopping-lists`
- Reference data management → See `005-reference-data` (planned)

## Assumptions

- Email is the primary method for member invitations
- Invitees have valid email addresses and can receive emails
- Cognito handles user authentication (username/password)
- Member familyId and role are stored in DynamoDB, not as Cognito custom attributes
- Lambda authorizer validates JWT and queries DynamoDB for member's family and role
- Families will have a small number of members (typically 2-6 members)
- Admins are trusted to manage member roles appropriately
- Removed members should not be permanently deleted for audit and data integrity purposes
- Invitation links are single-use and expire after a reasonable time period
- Members can only belong to one family at a time (no multi-family membership)
- The system will send invitation emails reliably (email service dependency)

## Dependencies

### From Parent Feature (001-family-inventory-mvp)

- Family entity and family isolation mechanisms
- Member entity schema and DynamoDB table structure
- Authentication system (AWS Cognito)
- Lambda authorizer for JWT validation and role-based access control
- DynamoDB single-table design and access patterns
- Email notification service for sending invitations

### External Dependencies

- AWS Cognito for user authentication and user pool management
- Email delivery service (AWS SES or similar) for invitation emails
- Web hosting infrastructure (from parent feature)
- DynamoDB for data storage (from parent feature)
- Standard web browser capabilities (from parent feature)

### Data Model Dependencies

This feature relies on the Member entity defined in [`001-family-inventory-mvp/data-model.md`](../001-family-inventory-mvp/data-model.md#2-member) (lines 74-136).

## Risk Considerations

- **Last Admin Removal**: Accidentally removing the last admin could lock out the family
  - *Mitigation*: Implement strict validation to prevent last admin removal; provide clear UI warnings

- **Invitation Email Delivery**: Invitation emails may be caught by spam filters or not delivered
  - *Mitigation*: Use reputable email service (AWS SES); provide alternative invitation methods; allow resending invitations

- **Removed Member Data Integrity**: Removing members could orphan their created data
  - *Mitigation*: Set member status to 'removed' rather than deleting; maintain references to removed members in created items

- **Role Confusion**: Users may not understand the difference between admin and suggester roles
  - *Mitigation*: Clear role descriptions during invitation; help documentation; role-based UI that shows what each role can do

- **Unauthorized Access**: Removed members might attempt to access family data
  - *Mitigation*: Immediate access revocation; Lambda authorizer checks member status on every request; audit logging

- **Concurrent Member Management**: Multiple admins managing members simultaneously could cause conflicts
  - *Mitigation*: Optimistic locking on member records; clear error messages for conflicts; last-write-wins with UI feedback

- **Invitation Link Security**: Invitation links could be intercepted or shared inappropriately
  - *Mitigation*: Time-limited invitation tokens; single-use links; secure token generation; HTTPS only

---

## Related Features

This specification builds upon and relates to other features in the family inventory management system:

| Feature ID | Name | Relationship | Status |
|------------|------|--------------|--------|
| `001-family-inventory-mvp` | Family Inventory MVP | **Parent** - Provides foundation (Family, Member entities, authentication) | Implementation Complete |
| `002-shopping-lists` | Shopping List Management | **Sibling** - Uses member roles for shopping list permissions | Specification Complete |
| `004-suggester-workflow` | Suggester Workflow | **Extension** - Implements suggester role capabilities (suggestions) | Planned |
| `005-reference-data` | Reference Data Management | **Sibling** - Uses member roles for reference data permissions | Planned |

**Note**: This specification focuses on member management (adding, removing, role assignment). The suggester workflow (what suggesters can do with suggestions) will be addressed in feature 004-suggester-workflow.