# Data Model – Notification Preference Management

## 1. NotificationEvent
- **Purpose**: Represents a business alert (Low Stock, Suggestion, future types) shown in the notification tab and emailed according to preferences.
- **Key Attributes**:
  - `notificationId` (string ULID) – unique identifier.
  - `familyId` (string) – partition key for DynamoDB queries.
  - `type` (enum: `LOW_STOCK`, `SUGGESTION`, future additions) – drives preference lookup.
  - `status` (enum: `ACTIVE`, `RESOLVED`) – determines eligibility for emails/digests.
  - `createdAt` / `updatedAt` (ISO8601) – auditing + digest sorting.
  - `resolvedAt` (ISO8601|null) – set when no longer outstanding.
  - `sourceContext` (object) – references inventory item/suggestion metadata surfaced in emails.
  - `deliveryLedger` (map) – keys formatted `{channel}:{frequency}` storing `{ lastSentAt, digestRunId }`.
- **Relationships & Access Patterns**:
  - PK=`FAMILY#{familyId}`, SK=`NOTIFICATION#{notificationId}` (single-table pattern).
  - GSI for unresolved notifications by type to feed jobs.
- **Validation Rules**:
  - `type` required; unknown types rejected unless provisioned via migration.
  - `status=RESOLVED` requires `resolvedAt` timestamp.
  - `deliveryLedger` entries must include timestamps when flagged as sent.
- **State Transitions**:
  - `ACTIVE` → `RESOLVED` triggered when alert handled; once resolved, jobs skip emailing.

## 2. NotificationPreferenceMatrix (stored on Member entity)
- **Purpose**: Stores per-user frequency/channel selections plus global unsubscribe flags.
- **Key Attributes**:
  - `PK=FAMILY#{familyId}`, `SK=MEMBER#{memberId}` (existing Member record).
  - `notificationPreferences` (map) – key `{notificationType}:{channel}` values `frequency` (enum `NONE`, `IMMEDIATE`, `DAILY`, `WEEKLY`).
  - `defaultFrequency` (enum) – fallback applied to new notification types/channels.
  - `unsubscribeAllEmail` (boolean) – quick opt-out triggered by email link.
  - `lastUpdatedAt` (ISO8601) / `lastUpdatedBy` (memberId) – audit trail.
  - `timezone` (IANA string) – determines digest run hour; defaults to org timezone.
- **Relationships & Access Patterns**:
  - Loaded whenever Settings > Notifications renders or jobs compile per-user deliveries.
  - Updated via PATCH endpoint with optimistic locking (version field on Member).
- **Validation Rules**:
  - `frequency` cannot be `IMMEDIATE` when matching delivery method disabled globally.
  - `unsubscribeAllEmail=true` forces every `{channel=email}` entry to `NONE`.
  - Map must include entries for all supported notification types/channels; missing entries default from `defaultFrequency` at runtime.

## 3. DeliveryDigestRun
- **Purpose**: Records each job execution for auditing and troubleshooting.
- **Key Attributes**:
  - `runId` (string ULID) – unique per job invocation.
  - `jobType` (enum: `IMMEDIATE`, `DAILY`, `WEEKLY`).
  - `scheduledFor` (ISO8601) – Cron timestamp job intended to cover.
  - `startedAt` / `completedAt` (ISO8601) – execution timing.
  - `targetUserCount` (number) / `emailSentCount` (number) / `skippedCount` (number).
  - `errors` (array of `{ memberId, reason }`).
- **Relationships & Access Patterns**:
  - PK=`DIGEST#${jobType}`, SK=`${scheduledFor}#${runId}` for chronological querying.
  - Linked from NotificationEvent deliveryLedger via `digestRunId`.
- **Validation Rules**:
  - For IMMEDIATE jobs, `scheduledFor` increments by 15 min; for DAILY/WEEKLY, matches configured Cron.
  - `errors` array optional but capped (e.g., <=25 entries) to keep item size manageable.

## Supporting Concepts
- **EmailUnsubscribeToken** (ephemeral): Signed JWT or opaque token containing `memberId`, `familyId`, `action`, `expiresAt`. Stored short-term in cache/storage to validate one-click unsubscribes.
- **NotificationChannel enum**: `EMAIL`, `IN_APP`, future `SMS`, `PUSH`. Preferences apply per channel even if not yet enabled.
- **Frequency enum**: `NONE`, `IMMEDIATE`, `DAILY`, `WEEKLY` (extensible for monthly, etc.).

## Validation & Integrity Rules
1. Every NotificationEvent MUST have exactly one `deliveryLedger` entry per channel/frequency combination after the associated email is sent to avoid duplicates.
2. Member preference updates MUST enforce referential integrity: unknown notification types or channels are rejected unless flagged as experimental.
3. Digest jobs MUST only consider NotificationEvents where `status=ACTIVE` AND `deliveryLedger[channel].lastSentAt < digest window`.
4. Unsubscribe actions MUST atomically set `unsubscribeAllEmail=true`, update `notificationPreferences[*.email]` to `NONE`, and log to DeliveryDigestRun or audit log.
