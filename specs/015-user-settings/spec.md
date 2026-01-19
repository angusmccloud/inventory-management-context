# Feature Specification: User Settings Controls

**Feature Branch**: `015-user-settings`  
**Created**: January 18, 2026  
**Status**: Draft  
**Input**: User description: "User Management - On the settings page, add a new \"User Settings\" tab - On that tab: Edit Name, Change Email, Change Password - Changing Email and Password should use best practices (for example, but not specifically this: use COgnito to verify they are who they say they are (and require old password to set new password) - GDPR Compliance: Also need a way to \"permenantly delete my account\". This should require password verification and a dialog (our dialog, not browser-dialog) confirming that it can't be undone - If they're the only member of a family, it should delete family information too"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Secure Credential Updates (Priority: P1)

As a signed-in household member, I can change my email address or password within the User Settings tab after reconfirming my current password so that only I can update sensitive login information.

**Why this priority**: Compromised credentials are the highest risk vector. Giving members a safe, self-service flow reduces support load and aligns with security expectations.

**Independent Test**: Attempt to change email and password using a fully mocked account, verifying that the system blocks the change without the existing password and requires new credential confirmation before persisting updates.

**Acceptance Scenarios**:

1. **Given** I am viewing the new User Settings tab, **When** I submit my current password and a new password that meets policy, **Then** the system confirms the change and requires me to sign in with the new password on next session.
2. **Given** I enter an incorrect current password, **When** I attempt to change my password, **Then** the request is rejected without revealing whether the password or other data was invalid.
3. **Given** I request an email change, **When** I confirm via the verification link sent to the new email, **Then** the login email updates and the prior email receives a notification about the change.
4. **Given** I abandon the verification step, **When** I return later, **Then** the pending email change expires automatically so no partial state remains.

---

### User Story 2 - GDPR-Compliant Account Deletion (Priority: P1)

As a household member, I can permanently delete my account and data from within the User Settings tab after re-entering my password and acknowledging an in-app confirmation dialog so the system complies with right-to-erasure requirements.

**Why this priority**: GDPR compliance is mandatory; members must trust they can delete their data without filing support tickets.

**Independent Test**: Trigger the delete flow with a test user, provide password confirmation, accept the irreversible action dialog, and verify the member record disappears while audit logs capture the event.

**Acceptance Scenarios**:

1. **Given** I am the only member of a family, **When** I confirm deletion, **Then** my account and the associated family data are removed in the same operation.
2. **Given** my family still has other members, **When** I delete my account, **Then** only my personal data and ownership references are deleted while shared family data remains intact.
3. **Given** I enter the wrong password during deletion, **When** I press confirm, **Then** the system blocks the action and keeps my account active.
4. **Given** I confirm deletion, **When** the process completes, **Then** I receive an email receipt stating the deletion occurred and how long backups will retain encrypted copies.

---

### User Story 3 - Manage Profile Details (Priority: P2)

As a household member, I can review and edit my display name from the User Settings tab so the rest of the family sees my preferred name in invitations, reminders, and ownership labels.

**Why this priority**: Name accuracy improves household clarity but is less urgent than security or compliance tasks.

**Independent Test**: Edit a member name, confirm validation messaging on invalid input, and refresh other app views to ensure the updated name propagates everywhere.

**Acceptance Scenarios**:

1. **Given** I change my first and/or last name, **When** I save, **Then** confirmation messaging appears and subsequent page loads show the new name.
2. **Given** I submit an empty or overlong name, **When** the form validates, **Then** the fields highlight errors without clearing previous values.
3. **Given** another device is using my account simultaneously, **When** I update my name, **Then** the other device reflects the change after a refresh without conflicting edits.

---

### Edge Cases

- Pending email verification link expires or is forwarded to someone else.
- Password change requested while account already flagged for deletion.
- Member attempts deletion while outstanding invitations or ownership transfers reference them.
- Sole family member deletes account while background jobs still reference the family.
- User begins deletion flow offline, reconnects mid-way, and confirmation dialog must still show accurate risk messaging.
- Attempting to change email to one already used by another family member or pending invitation.
- Admin revokes member access mid-operation (name change or deletion) and the tab must gracefully handle authorization error when saving.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The Settings page MUST include a dedicated “User Settings” tab visible only to authenticated members viewing their own profile.
- **FR-002**: The User Settings tab MUST summarize the member’s current display name, primary email, and the date of their last password update.
- **FR-003**: Editing the display name MUST support first and last name fields with validation for required text, 2–50 character length, and disallowed symbols.
- **FR-004**: Saving a new display name MUST update the Member entity and immediately refresh UI state without requiring a full page reload.
- **FR-005**: The system MUST audit every profile, email, password, or deletion change with timestamp, memberId, initiating device, and action result.
- **FR-006**: Email change requests MUST require the member’s current password and a second confirmation step via unique verification link sent to the new address.
- **FR-007**: Until the new email is verified, the prior email MUST remain active and receive a notification about the pending change with a cancellation link.
- **FR-008**: Verification links MUST expire within 24 hours and be single-use to prevent replay attacks.
- **FR-009**: Password changes MUST require entering the current password plus a new password that satisfies published complexity rules (length, character diversity).
- **FR-010**: Password change submissions MUST lock out (temporarily) after five consecutive failed current-password attempts to slow brute force attacks.
- **FR-011**: After a password change, all active sessions except the current browser MUST be invalidated so stale sessions cannot continue.
- **FR-012**: Each sensitive update (email, password, delete) MUST display inline error messaging that never discloses whether an email or password exists in the system.
- **FR-013**: The delete-account CTA MUST trigger an in-app modal dialog (not a browser confirm) that explains irreversibility, shared data impacts, and verification steps.
- **FR-014**: Confirming deletion MUST require the member to re-enter their password and optionally type “DELETE” to affirm they understand the consequence.
- **FR-015**: When the member is the only family member, the deletion workflow MUST also remove Family records, shared lists, and reference data in the same transaction.
- **FR-016**: When other family members remain, the workflow MUST only remove the requesting member, reassigning any owned lists or alerts to the family admin.
- **FR-017**: All deletions MUST honor GDPR timelines by removing the active data immediately while flagging backups for purge within the documented retention window.
- **FR-018**: The system MUST email a deletion receipt to the user’s address and, if applicable, to the remaining family admin detailing what was deleted.
- **FR-019**: The tab MUST surface contextual messaging when prerequisite conditions block an action (e.g., outstanding ownership preventing deletion) along with resolution steps.
- **FR-020**: The User Settings components MUST comply with accessibility requirements (screen-reader labels, focus management, and keyboard shortcuts for saving/canceling).
- **FR-021**: Requests MUST be rate-limited per member to prevent scripted credential rotations (recommendation: no more than 3 change attempts per minute).
- **FR-022**: If network connectivity is lost mid-operation, the form MUST preserve user inputs and resume once the connection is restored or clearly instruct the user to retry.

### Key Entities *(include if feature involves data)*

- **Member Profile**: Represents an individual user’s identifying data (memberId, familyId, displayName, primaryEmail, passwordUpdatedAt, locale). Updated when users edit their names or credentials.
- **Credential Verification Ticket**: Short-lived artifact containing ticketId, memberId, actionType (`email_change`, `password_change`, `delete_account`), issuedAt, expiresAt, status, newTargetValue (for email) used to confirm re-auth or out-of-band verifications.
- **Family**: Aggregated household data (familyId, name, members, ownership references, shared datasets). Entire record set is deleted when the final member removes their account.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 95% of successful email or password changes complete within 60 seconds from submit to confirmation.
- **SC-002**: 0 security incidents caused by unauthorized credential changes or deletions attributable to this feature (monitored quarterly).
- **SC-003**: 90% of members who attempt the delete flow can finish it without contacting support (tracked via helpdesk tags).
- **SC-004**: Less than 2% of credential-change attempts fail due to unclear errors (measured by telemetry events vs. support tickets).
- **SC-005**: When the last family member deletes their account, all related data is purged within 15 minutes and no orphaned family records remain.

## Assumptions

- Existing authentication services already store and verify member passwords; this feature reuses that authority for re-auth checks.
- Email addresses are unique across members and invitations, so preventing duplicates is feasible.
- Account deletion should remove operational data immediately, while immutable audit logs remain for compliance.
- Family admins are notified separately when ownership needs reassignment; this spec assumes that existing notification mechanisms can deliver those alerts.
- Verification emails and receipts use the standard transactional email channel with deliverability SLAs consistent with other system emails.
