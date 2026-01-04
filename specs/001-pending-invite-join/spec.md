# Feature Specification: Pending Invitation Onboarding

**Feature Branch**: `001-pending-invite-join`  
**Created**: 2026-01-04  
**Status**: Draft  
**Input**: User description: "We need to handle situations where users get an invite but don't click the link. If they followed an invite link: No Change If not: When anyone creates an account there needs to be a check for \"do they have an invitation pending\". If there is, they need to be asked if they want to join that family (or which family, if they have multiple invites). Or they can choose to create their own family."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Detect Pending Invite During Sign-Up (Priority: P1)

When I register without using an invite link, the system checks for any invitations tied to my email/phone and prompts me to join the inviting family so invited members end up in the right household without manual fixes.

**Why this priority**: Most support friction today comes from invited users creating orphaned households, so intercepting them at sign-up protects data integrity and reduces cleanup work.

**Independent Test**: Create a pending invitation for a test identity, complete account creation without the invite link, and confirm that the post-registration screen shows the inviting family name with Accept/Decline actions that update membership immediately.

**Acceptance Scenarios**:

1. **Given** a pending invite addressed to `pat@example.com`, **When** Pat signs up using that email without an invite link, **Then** the onboarding flow displays the family name, join details, and an Accept choice before letting Pat proceed.
2. **Given** the same invite, **When** Pat accepts it, **Then** Pat lands in the family dashboard already associated with that household and the invitation is marked consumed.

---

### User Story 2 - Resolve Multiple Invitations (Priority: P2)

As an invited user with multiple active invitations, I can see each inviting family, choose the one I want to join, and understand the implications before entering the product.

**Why this priority**: Families often invite the same caregiver or shopper, so clarity around which household the user is joining avoids mistaken data sharing and repeated support escalations.

**Independent Test**: Seed two pending invites for the same identity, register without an invite link, and verify the UI lists both families with preview details; selecting one should create that membership while leaving the other invite untouched.

**Acceptance Scenarios**:

1. **Given** two pending invitations, **When** the user selects Family A and confirms, **Then** membership is created for Family A only and Family B's invite remains pending until explicitly declined or expired.
2. **Given** the multi-invite list, **When** the user expands an invite card, **Then** they see who invited them, the household role offered, and when the invite expires so they can make an informed choice.

---

### User Story 3 - Decline Invites and Start Own Family (Priority: P3)

As a new user who prefers to create my own household, I can decline or skip available invitations and launch a fresh family without being trapped in the invite acceptance flow.

**Why this priority**: Some invitees are only exploring and should not be forced into an existing family, so they need a clear path to reject invites while ensuring hosts know the invitation was declined.

**Independent Test**: Register with a pending invite, choose “Create my own family,” confirm the invite now shows a declined status, and ensure the new-family setup begins immediately without referencing the old invite.

**Acceptance Scenarios**:

1. **Given** an invite, **When** the user selects “Create my own family,” **Then** the system records the invite as declined (with timestamp/actor) and routes the user to new-family setup without further prompts.
2. **Given** multiple invites, **When** the user dismisses them all, **Then** hosts can see the decline status in their invite list and the user is not re-prompted unless a new invite is issued.

---

### Edge Cases

- What happens when a pending invite expires or is revoked while the user is mid-decision?
- How does the system handle users registering with a different email than the invite target (prompting them to try the invited email or request a re-send)?
- What messaging appears if a host deletes the target family before the invite is accepted?
- How is the experience handled for invited users who already belong to another family (prevent accidental family switching)?
- What happens if the user closes the prompt without choosing and later returns—does the system re-prompt or provide a dismissal acknowledgement?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The registration flow MUST detect whether the user arrived with a valid invite token; if so, keep existing behavior, and if not, query pending invitations matching the verified identity (email/phone).
- **FR-002**: When pending invitations exist, the user MUST see each inviting family with inviter name, role offered, and invite expiration prior to receiving access to any household data.
- **FR-003**: Users MUST be able to accept one invitation, after which the platform automatically provisions the membership, associates the account with that family, and marks the invite consumed.
- **FR-004**: Users with multiple invitations MUST be able to review and select among them without refreshing; unselected invites remain pending for later action until they expire or are declined.
- **FR-005**: The onboarding UI MUST offer a prominent “Create my own family” / “Decline invitations” option that lets the user skip all invites while recording each declined invite with timestamp, reason (if provided), and actor.
- **FR-006**: If detected invites are expired, revoked, or invalid, the system MUST explain why the user cannot join and offer to request a new invite or start their own family.
- **FR-007**: Hosts MUST be able to see the resulting status (accepted, declined, ignored) in their invitation list so they know whether to re-send, revoke, or welcome the new member.
- **FR-008**: The system MUST prevent users who already belong to a family from auto-joining another without explicit confirmation; if they accept a new invite, prompt for confirmation that they intend to switch or add access.
- **FR-009**: All invite decisions MUST be audit logged with user id, invitation id, family id, decision, and timestamp for compliance and support troubleshooting.
- **FR-010**: The flow MUST be accessible and responsive, allowing completion on mobile devices within the same number of steps as desktop.

### Key Entities *(include if feature involves data)*

- **Invitation**: Represents a pending request for a user to join a family; includes target identifier (email/phone), inviter metadata, offered role, status (pending/accepted/declined/expired/revoked), expiration timestamp, and audit trail of reminders or responses.
- **Family Membership**: Links a user account to a family with role, join method (invite link vs pending detection), and current status (active, pending confirmation, revoked). Updated immediately upon invite acceptance.
- **Invite Decision Log**: Immutable record capturing each accept/decline/ignore action for an invitation, referencing the acting user, decision, selected family, and notes so hosts and support have clarity.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 95% of invited users who register without a link are shown the correct invite options within 2 seconds of identity verification.
- **SC-002**: 90% of invited users who accept an invite complete onboarding and land in the correct family dashboard within 30 seconds, without requiring manual support intervention.
- **SC-003**: Support tickets related to “I joined the wrong family / can’t find my invite” decrease by at least 60% within one month of launch.
- **SC-004**: 100% of invite acceptance or decline events are captured in the audit log with user id, family id, and timestamp, enabling compliance reviews without missing entries.

## Assumptions

- Pending invitations are keyed by validated identifiers (email and, where available, phone) collected during account creation; matching follows exact email equality.
- Invitation expiration and revocation rules already exist; this feature surfaces their status but does not change underlying policies.
- Creating a new family while pending invites exist leaves those invites visible to hosts until they expire or the user explicitly declines them, ensuring hosts understand the decision.
- Existing invite-link onboarding remains untouched; users entering via a valid link bypass the new selection UI entirely, as stated in the request.
