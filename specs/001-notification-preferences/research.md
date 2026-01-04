# Phase 0 Research – Notification Preference Management

## Decision 1: Store notification preferences on Member entity with matrix fields
- **Rationale**: Constitution mandates storing user preferences on the Member entity (PK=FAMILY#{familyId}, SK=MEMBER#{memberId}). Extending this record with a structured `notificationPreferences` map keyed by `{notificationType}:{channel}` keeps single-table integrity, leverages optimistic locking already present on Members, and lets new notification types/channels be added without migrations.
- **Alternatives considered**:
  - *Separate NotificationPreference items*: rejected to avoid additional entity types forbidden by constitution and to keep per-user updates atomic.
  - *Global defaults only*: rejected because users need per-type/channel overrides and historical adjustments.

## Decision 2: EventBridge scheduled Lambdas for 15-minute immediate job and digest jobs
- **Rationale**: AWS best practice for recurring background work on serverless stacks is EventBridge (CloudWatch Events) rules that invoke Lambda functions. One rule runs every 15 minutes for “Immediate” deliveries; additional rules handle Daily (cron 9:00 local equivalent via per-user scheduling metadata) and Weekly (cron Mondays 9:00). Lambdas honor warmup utilities per constitution and use DynamoDB queries filtered by unresolved notifications + unsent delivery markers.
- **Alternatives considered**:
  - *Long-running worker queues*: violates serverless principle and adds cost/ops overhead.
  - *Step Functions*: unnecessary orchestration complexity for simple periodic scans.

## Decision 3: Delivery de-duplication using per-notification channel ledger
- **Rationale**: Each Notification Event keeps a map of `deliveryStatus[channel]` containing timestamps for last send + digest inclusion. Immediate job updates this atomically with DynamoDB `ConditionExpression` so duplicates can’t occur even with overlapping runs. Daily/Weekly jobs read the ledger to ensure unresolved items aren’t re-emailed once resolved.
- **Alternatives considered**:
  - *Rely solely on job memory/state*: unreliable in serverless multi-invoke context.
  - *Separate queue for dedupe*: adds infrastructure; ledger already meets needs.

## Decision 4: Email compliance via tokenized unsubscribe + preference links
- **Rationale**: Each email footer includes (a) one-click unsubscribe URL containing a short-lived signed token referencing the Member record and action `unsubscribe_all`, and (b) a Change Preferences deep-link that routes through authenticated Settings flow. Tokens expire quickly and log audit details per security requirements, while the Settings link ensures the UI enforces role/context rules.
- **Alternatives considered**:
  - *Global unsubscribe only*: fails requirement to route to preference UI.
  - *Unauthenticated settings change*: rejected due to security concerns.

## Decision 5: Frontend preference matrix using existing common components
- **Rationale**: Leverage the component library (table or grid components plus toggle/select controls) to render a matrix of notification types vs channels/frequencies. Data fetched via `/api/notifications/preferences` (Next.js route) and saved via PATCH endpoint. This aligns with Constitution Principle VIII and keeps accessibility compliance.
- **Alternatives considered**:
  - *Custom one-off components per row/column*: violates component library rule and increases maintenance.
  - *Separate pages per notification type*: worse UX, harder to see overall state.

## Decision 6: Testing and monitoring strategy
- **Rationale**: Follow Testing Excellence by writing Jest unit tests for preference services, integration tests for job handlers using DynamoDB local mocks, and React Testing Library coverage for the Settings UI interactions. CloudWatch metrics/alarms capture job success counts, failures, and email send volumes. This ensures measurable success criteria (15-minute delivery, digest completeness) are monitored.
- **Alternatives considered**:
  - *Manual QA only*: unacceptable per constitution.
  - *Unit tests without integration coverage*: insufficient for schedule/digest correctness.
