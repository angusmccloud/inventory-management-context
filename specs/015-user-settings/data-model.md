# Data Model — User Settings Controls

## Member (existing entity, extended fields)
| Field | Type | Description | Validation / Notes |
|-------|------|-------------|---------------------|
| `PK` | string | `FAMILY#{familyId}` | Immutable partition key enforcing family isolation |
| `SK` | string | `MEMBER#{memberId}` | Immutable sort key |
| `memberId` | string (UUID) | Unique member identifier | Required; matches SK suffix |
| `familyId` | string (UUID) | Household identifier | Required; matches PK suffix |
| `displayName` | string | Preferred first/last name concatenation | Required, 2–50 chars, no control chars |
| `primaryEmail` | string | Login + notification email | Unique across members + invites; must pass RFC5322 + domain allowlist |
| `passwordUpdatedAt` | ISO timestamp | Last password change time | Required for audits + session revocation |
| `createdAt` / `updatedAt` | ISO timestamp | Lifecycle metadata | Updated whenever profile values change |
| `deletionRequestedAt` | ISO timestamp | Nullable timestamp marking final confirmation pending | Null unless user initiated delete flow |
| `isActive` | boolean | Flag toggled false when deletion completes | Conditional writes ensure only active members mutate |

**Relationships & transitions**
- `Member` belongs to exactly one `Family` (via PK).
- When the final member deletes their account, downstream logic deletes the corresponding `Family` item(s).
- Password/email changes update `passwordUpdatedAt` / `primaryEmail` and append an `AuditLogEntry` record.

## CredentialVerificationTicket (new entity)
| Field | Type | Description | Validation / Notes |
|-------|------|-------------|---------------------|
| `PK` | string | `FAMILY#{familyId}` | Allows querying outstanding tickets per family |
| `SK` | string | `CREDENTIAL_TICKET#{ticketId}` | ticketId is ULID/UUID |
| `ticketId` | string | Unique identifier shared with verification link | Included in link `/user-settings/verify?ticketId=` |
| `memberId` | string | Owner of the action | Must match Member item |
| `actionType` | enum (`email_change`, `password_change`, `delete_account`) | Indicates workflow | Required |
| `newEmail` | string? | Populated when `actionType=email_change` | Must be unique + validated |
| `issuedAt` | ISO timestamp | When ticket created | Required |
| `expiresAt` | ISO timestamp | Derived from issuedAt + 24h | Required |
| `ttl` | number | DynamoDB TTL epoch for automatic expiry | equals `expiresAt` |
| `status` | enum (`pending`, `confirmed`, `cancelled`, `expired`) | Workflow state | Conditional updates prevent double confirmation |

**Relationships & transitions**
- Linked to `Member` and optionally `AuditLogEntry` that records creation/confirmation.
- Transitions: `pending → confirmed` (successful verification), `pending → cancelled` (user revoked), automatic `pending → expired` when TTL passes.

## AuditLogEntry (existing pattern)
| Field | Type | Description | Validation / Notes |
|-------|------|-------------|---------------------|
| `PK` | string | `FAMILY#{familyId}` | co-locates with member |
| `SK` | string | `AUDIT#{timestamp}#{id}` | Sorts chronologically |
| `auditId` | string | UUID | Required |
| `memberId` | string | Who performed action | Required |
| `action` | enum (e.g., `PROFILE_UPDATED`, `EMAIL_CHANGE_REQUESTED`, `PASSWORD_CHANGED`, `ACCOUNT_DELETED`) | Required |
| `details` | map | Redacted metadata (browser info, target email domain) | Must not contain secrets; used for troubleshooting |
| `correlationId` | string | Request-wide identifier for tracing | Required |
| `createdAt` | ISO timestamp | | Required |

**Relationships & transitions**
- Created alongside every sensitive mutation (name/email/password/delete) to satisfy audit requirements.

## Family (existing entity, deletion cascade focus)
| Field | Type | Description | Validation / Notes |
|-------|------|-------------|---------------------|
| `PK` | string | `FAMILY#{familyId}` | Shared with Member records |
| `SK` | string | `FAMILY#{familyId}` | Primary family metadata row |
| `familyId` | string | Unique household id | Required |
| `name` | string | Household display name | Required |
| `memberCount` | number | Derived count of current members | Used to detect "only member" case |
| `status` | enum (`active`, `deleting`, `deleted`) | Lifecycle | Drives cascading deletion flows |
| `createdAt` / `updatedAt` | ISO timestamp | | |

**Relationships & transitions**
- `memberCount` decremented when a user deletes their account. If it reaches zero, `status` transitions to `deleting` while all related entities (lists, inventory, invitations) are removed; afterwards the row can be hard-deleted or marked `deleted`.

## NotificationReceipt (email + in-app alerts)
| Field | Type | Description | Validation / Notes |
|-------|------|-------------|---------------------|
| `PK` | string | `FAMILY#{familyId}` | |
| `SK` | string | `NOTIFICATION#{notificationId}` | |
| `notificationId` | string | UUID | |
| `memberId` | string | Recipient | |
| `type` | enum (`EMAIL_CHANGE_NOTICE`, `DELETION_RECEIPT`) | |
| `status` | enum (`queued`, `sent`, `failed`) | |
| `payload` | map | Render context | Must omit secrets |
| `createdAt` / `sentAt` | ISO timestamp | |

**Relationships & transitions**
- Created to satisfy requirement that prior email receives heads-up and deletion receipts are delivered.
- Failed notifications must be retried/shared with support tooling.
