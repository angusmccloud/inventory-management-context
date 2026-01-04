# Data Model: Pending Invitation Onboarding

**Feature**: 001-pending-invite-join  
**Date**: 2026-01-04  
**Phase**: Phase 1 – Design

## Overview

This feature introduces a post-signup interception flow that surfaces pending invitations and records user decisions. All data remains inside the existing DynamoDB single-table design. The model extends Invitation, Family Membership, and logging entities while adding a transient projection that the frontend consumes when rendering the multi-invite selector.

## Entities

### Invitation (existing, extended)
- **PK**: `FAMILY#<familyId>`
- **SK**: `INVITE#<inviteId>`
- **Fields**: `inviteId`, `familyId`, `inviterMemberId`, `inviterName`, `targetEmail`, `targetPhone`, `roleOffered`, `status` (`PENDING` | `ACCEPTED` | `DECLINED` | `EXPIRED` | `REVOKED`), `expiresAt`, `createdAt`, `updatedAt`, `consumedAt`, `decisionSource` (`link` | `pending-detection`), `metadata` (optional message), and `version` for optimistic locking.
- **New additions**: `lastDecisionId` (points to latest log entry), `detectedByPendingFlow` (boolean), `declineReason` (optional string) to support audit requirements.

### FamilyMembership (existing)
- **PK**: `FAMILY#<familyId>`
- **SK**: `MEMBER#<memberId>`
- **Fields**: `memberId`, `familyId`, `userId`, `role`, `status` (`ACTIVE` | `PENDING_SWITCH` | `SUSPENDED`), `joinedAt`, `leftAt`, `joinSource` (`invite-link` | `pending-detection` | `self-created`), optional `secondaryMembership` flag, `version`.
- **New behavior**: store `previousFamilyId` when a user confirms switching families so support can trace migrations.

### InviteDecisionLog (new logical entity)
- **PK**: `FAMILY#<familyId>`
- **SK**: `INVITE_DECISION#<timestamp>#<inviteId>`
- **Fields**: `decisionId`, `inviteId`, `familyId`, `actorUserId`, `actorMemberId` (if created), `targetEmail`, `targetPhone`, `action` (`ACCEPTED` | `DECLINED` | `SKIPPED` | `EXPIRED`), `source` (`pending-detection` | `host-action`), `message`/`reason`, `createdAt`, `auditCorrelationId`.
- Indexed by `GSI1PK=INVITE#<inviteId>` / `GSI1SK=DECISION#<timestamp>` so hosts can drill into a specific invite history quickly.

### PendingInviteView (transient projection for frontend)
- **Not stored**: derived response object returned by `GET /invitations/pending`.
- **Fields**: `inviteId`, `familyId`, `familyName`, `inviterName`, `roleOffered`, `expiresAt`, `status`, `reason` (if invalid), `requiresSwitchConfirmation` (boolean), `existingMembershipSummary` (if user already linked elsewhere).
- Calculated server-side so the frontend never accesses raw DynamoDB fields or identifiers it should not display.

## Relationships

- **Invitation → FamilyMembership**: 1:1. Accepting an invite creates or updates exactly one membership. Declining leaves membership untouched.
- **Invitation → InviteDecisionLog**: 1:many. Each invite can spawn multiple decision entries (declined, re-sent, accepted) but only one terminal `ACCEPTED` entry.
- **User → Invitations**: 1:many (one user identity may receive multiple invites from different families). Mapped via normalized identifier indexes rather than direct PK references.
- **InviteDecisionLog → Hosts**: many:1. Hosts query their family partition to see when invitees respond; logs are filtered by `familyId` and `inviteId`.

## Validation Rules

- Invitation identifiers must be normalized: emails lowercased + trimmed, phone numbers converted to E.164 before storage and comparison.
- Every accept/decline request carries `inviteId` + a signed nonce returned by the pending-invite endpoint to prevent tampering; backend verifies that nonce matches the invitation `updatedAt` before applying the decision.
- Transaction writes enforce: `status = PENDING` when accepting, and `status IN (PENDING, EXPIRED)` when declining to guard against double processing.
- Membership creation requires either `existingMembershipStatus != ACTIVE` or an explicit `switchConfirmed = true` flag; otherwise the API rejects the request with helpful messaging.
- Decision log entries require `action` enumeration validation, non-empty `actorUserId`, and ISO8601 timestamps for compliance.

## State Transitions

### Invitation Lifecycle
```
PENDING --accept--> ACCEPTED (log decision, create membership, set consumedAt)
PENDING --decline--> DECLINED (log decision, keep membership untouched)
PENDING --expired--> EXPIRED (scheduled job marks expired + log auto decision)
PENDING --host revoke--> REVOKED (host action updates status + log)
DECLINED --host re-open--> PENDING (new inviteId or same id with version++ and log)
```

### Membership Lifecycle During Pending-Invite Flow
```
NO_MEMBERSHIP --accept--> ACTIVE (join family via pending detection)
ACTIVE --accept new invite--> PENDING_SWITCH (await confirmation)
PENDING_SWITCH --confirm--> ACTIVE (new family) + previous membership SUSPENDED
PENDING_SWITCH --cancel--> ACTIVE (original family retained)
```

## Indexing & Access Patterns

- **Pending invite lookup**: `GSI_PENDING` with `PK=IDENTITY#<normalized-email-or-phone>` and `SK` sorted by `expiresAt`. Query returns `status=PENDING` invites for the identity.
- **Host dashboards**: continue to query `PK=FAMILY#<familyId>` for `SK begins_with INVITE#` to list invitations; link to `INVITE_DECISION#` items for detail.
- **Audit exports**: `GSI_DECISIONS` keyed by `action` + date to allow compliance audits on declines or ignored invites.

## Notes

- No new tables are introduced; everything fits inside the existing single-table strategy to comply with the constitution.
- InviteDecisionLog entries can drive analytics later (EventBridge fan-out), but for this feature they live solely in DynamoDB.
- PendingInviteView is recreated on every API call so cached data never leaks revoked invites.
