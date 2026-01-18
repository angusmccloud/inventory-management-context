# Tasks: Notification Preference Management

**Input**: Design documents from `/specs/001-notification-preferences/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Ensure the repository is ready for feature work and baseline quality gates pass.

- [X] T001 Install workspace dependencies defined in `package.json` to ensure shared frontend/backend packages are available.
- [X] T002 Run baseline quality gates (`npm run lint`, `npx tsc --noEmit`, `npm test`) from `package.json` to confirm a clean starting point.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Shared data structures and compliance utilities required by all user stories.

- [X] T003 Extend `backend/src/models/member.ts` with `notificationPreferences`, `unsubscribeAllEmail`, and timezone fields per data-model assumptions.
- [X] T004 Create `backend/src/models/notifications.ts` defining `NotificationEvent`, `NotificationChannel`, `Frequency`, and `DeliveryDigestRun` types to be reused by jobs and APIs.
- [X] T005 Add default preference helpers in `backend/src/services/notifications/defaults.ts` to seed new notification types/channels for every member.
- [X] T006 Update shared email footer template in `backend/src/lib/email/templates/baseNotificationFooter.ts` to include Unsubscribe and Change Preferences placeholders.
- [X] T007 Create shared notification configuration constants in `backend/src/lib/config/notifications.ts` (delivery frequencies, cron windows, limits) referenced by all handlers.

---

## Phase 3: User Story 1 – Configure Notification Matrix (Priority: P1) 🎯 MVP

**Goal**: Allow members to view and edit notification preferences per type/channel inside Settings.

**Independent Test**: From Settings > Notifications, adjust multiple combinations, save, refresh, and verify persisted state plus validation for No Notifications.

### Tests

- [X] T008 [P] [US1] Add Jest unit tests for the preference service covering default seeding and optimistic locking in `backend/tests/unit/services/notifications/preferencesService.test.ts`.
- [X] T009 [P] [US1] Add React Testing Library coverage for the matrix UI interactions in `frontend/tests/settings/notifications.test.tsx`.

### Implementation

- [X] T010 [US1] Implement `backend/src/services/notifications/preferencesService.ts` to load/update Member preference matrices with audit metadata.
- [X] T011 [US1] Build GET handler in `frontend/app/api/notifications/preferences/route.ts` that authenticates, reads preferences via the service, and returns `{ data }` responses.
- [X] T012 [US1] Build PATCH handler in `frontend/app/api/notifications/preferences/route.ts` handling validation, No Notifications overrides, and audit stamping.
- [X] T013 [US1] Create typed API client helpers in `frontend/lib/api/notifications.ts` to call the GET/PATCH endpoints and unwrap `{ data }`.
- [X] T014 [US1] Implement the Settings > Notifications matrix UI in `frontend/app/settings/notifications/page.tsx` using common components, default states, and audit indicators.
- [X] T015 [US1] Add an unsubscribe-all banner component in `frontend/components/common/NotificationPreferenceBanner.tsx` that reflects the `unsubscribeAllEmail` flag and deep-links to preference changes.

---

## Phase 4: User Story 2 – Immediate Alerts Dispatch (Priority: P2)

**Goal**: Deliver immediate emails every 15 minutes for new unresolved notifications without duplicates.

**Independent Test**: Seed a Low Stock alert, wait for the next 15-minute job, confirm exactly one email sends and no follow-ups after resolution.

### Tests

- [ ] T016 [P] [US2] Add integration tests for the 15-minute dispatcher in `backend/tests/integration/notifications/immediateDispatcher.test.ts` covering new vs. resolved notifications.
- [ ] T017 [P] [US2] Add unit tests for delivery ledger updates/dedupe logic in `backend/tests/unit/services/notifications/deliveryLedger.test.ts`.

### Implementation

- [X] T018 [US2] Implement delivery ledger utilities in `backend/src/services/notifications/deliveryLedger.ts` to mark notification-channel pairs as sent and prevent duplicates.
- [X] T019 [US2] Create `backend/src/handlers/notifications/immediateDispatcher.ts` Lambda handler that queries unresolved events, filters by preferences, and queues SES emails.
- [X] T020 [US2] Update `template.yaml` with the EventBridge schedule, IAM permissions, and warmup registration for the 15-minute immediate dispatcher.
- [X] T021 [US2] Add notification-specific CloudWatch metrics/logging helpers in `backend/src/lib/monitoring/notificationMetrics.ts` and integrate them into the dispatcher for observability.

---

## Phase 5: User Story 3 – Digest Summaries & Compliance (Priority: P3)

**Goal**: Send daily/weekly digest emails with outstanding notifications, support unsubscribe tokens, and expose an admin preview queue.

**Independent Test**: Configure daily and weekly summaries, run jobs, verify digest content and functioning unsubscribe/change links; confirm admin queue preview lists pending deliveries without sending.

### Tests

- [ ] T022 [P] [US3] Add integration tests for daily/weekly digest aggregation in `backend/tests/integration/notifications/digestJobs.test.ts`.
- [ ] T023 [P] [US3] Add contract tests for `/api/notifications/unsubscribe` in `backend/tests/contract/notifications/unsubscribe.test.ts` covering valid, expired, and reused tokens.

### Implementation

- [X] T024 [US3] Implement `/api/notifications/unsubscribe/route.ts` to validate tokens, toggle `unsubscribeAllEmail`, and log audit events.
- [X] T025 [US3] Build `backend/src/handlers/notifications/dailyDigest.ts` and `weeklyDigest.ts` to compile outstanding notifications, group by type, and send templated digests.
- [X] T026 [US3] Update `template.yaml` with cron schedules, IAM, and warmup entries for daily (9:00 local) and weekly (Monday 9:00) digest handlers.
- [X] T027 [US3] Create digest email templates with outstanding item summaries and compliance links in `backend/src/lib/email/templates/notificationDigest.ts`.
- [X] T028 [US3] Implement admin delivery queue preview endpoint backed by `backend/src/services/notifications/queuePreviewService.ts` and `backend/src/handlers/notifications/queuePreview.ts`.
- [X] T029 [US3] Add queue preview logging/reporting to `backend/src/services/notifications/queuePreviewService.ts` so administrators can audit pending deliveries without triggering sends.

---

## Phase 6: Polish & Cross-Cutting Concerns

- [X] T030 Document the complete notification workflow and operational runbook updates in `specs/001-notification-preferences/quickstart.md`.
- [X] T031 Verify CloudWatch alarm definitions and deployment notes for all new jobs, ensuring monitoring matches success criteria. Added comprehensive CloudWatch alarms to `template.yaml` for all notification jobs (immediate dispatcher, daily digest, weekly digest) covering error rates, Lambda failures, and job duration.

---

## Dependencies & Execution Order

1. **Setup (Phase 1)** → ensures the repo is ready (blocks everything else).
2. **Foundational (Phase 2)** → provides shared models, config, and email footer needed by all user stories.
3. **US1 (Phase 3)** → MVP; must complete before digests rely on stored preferences.
4. **US2 (Phase 4)** → depends on US1 data structures to determine immediate subscribers.
5. **US3 (Phase 5)** → depends on both foundational work and preference storage to compile digests/unsubscribe state.
6. **Polish (Phase 6)** → final documentation/monitoring after all stories.

Graph: Phase1 → Phase2 → {US1 → US2 → US3} → Phase6. US2 should not start until US1 preferences and APIs exist; US3 can start after US1 but should coordinate with US2 for shared ledger code.

---

## Parallel Execution Opportunities

- Phase 1 tasks T001–T002 can run concurrently.
- Phase 2 tasks T003–T007 touch different files and may run in parallel after aligning schema decisions.
- In US1, tests (T008, T009) and implementation tasks touching backend vs. frontend files (T010–T015) can proceed simultaneously once interfaces are defined.
- US2 tasks T016–T021 permit parallelism between testing and implementation, and between handler code (T019) and infrastructure updates (T020).
- US3 tasks T022–T029 allow digest handler work (T025–T027) to run alongside unsubscribe endpoint tasks (T024, T023) and admin preview (T028–T029).
- Polish tasks T030–T031 can run in parallel once all functional work is merged.

---

## Implementation Strategy

1. **MVP (US1)**: After Setup + Foundational, ship the preferences UI/API so users can manage notification matrices independently.
2. **Increment 2 (US2)**: Layer immediate dispatcher logic on top of the stored preferences to confirm timely alerts, instrumenting metrics for SLA SC-002.
3. **Increment 3 (US3)**: Deliver digest jobs, unsubscribe endpoint, and admin previews to satisfy compliance and visibility requirements.
4. **Polish**: Update quickstart/docs, verify monitoring, and complete operational readiness.

Each increment remains independently testable; halt after any user story if scope adjustments are needed.
