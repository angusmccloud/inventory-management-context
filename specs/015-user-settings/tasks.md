---

description: "Task list for 015-user-settings feature"

---

# Tasks: User Settings Controls

**Input**: Design documents from `/specs/015-user-settings/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Ensure local environment, credentials, and tooling match quickstart guidance before coding.

- [X] T001 Update feature-specific environment variables in `inventory-management-frontend/.env.local` for Cognito + SES settings referenced in quickstart.md
- [X] T002 Align SAM configuration in `inventory-management-backend/samconfig.toml` with required IAM permissions for new user-settings handlers
- [X] T003 [P] Document local DynamoDB + SES emulator steps for this feature in `specs/015-user-settings/quickstart.md`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core data structures, services, and UI scaffolding required by every user story. No user story work can begin until this phase is complete.

- [X] T004 Extend Member entity and shared types with `deletionRequestedAt`/`isActive` in `inventory-management-backend/src/types/entities.ts`
- [X] T005 Create CredentialVerificationTicket data mapper with TTL helpers in `inventory-management-backend/src/models/credentialVerificationTicket.ts`
- [X] T006 Enhance audit logging utilities to cover PROFILE/EMAIL/PASSWORD/DELETION events in `inventory-management-backend/src/services/auditLogService.ts`
- [X] T007 [P] Add NotificationReceipt publishing helper for SES receipts in `inventory-management-backend/src/services/notificationService.ts`
- [X] T008 [P] Scaffold the User Settings tab layout with shared components in `inventory-management-frontend/app/settings/user-settings/layout.tsx`
- [X] T009 [P] Add API client helpers for `/user-settings/*` endpoints in `inventory-management-frontend/lib/api/user-settings.ts`
- [X] T010 Wire SAM template resources + IAM for all new handlers inside `inventory-management-backend/template.yaml`

**Checkpoint**: Foundation ready—user stories can now start in parallel.

---

## Phase 3: User Story 1 – Secure Credential Updates (Priority: P1) 🎯 MVP

**Goal**: Allow members to rotate email and password securely with re-authentication, verification tickets, audit logs, and notifications.

**Independent Test**: From the User Settings tab, successfully change the password and email using valid credentials; confirm rejection on incorrect password; verify email link completion updates login info while old email receives a notice.

### Implementation (Tests are implied per quickstart expectations)

- [X] T011 [P] [US1] Add Jest unit tests for password change handler branches in `inventory-management-backend/tests/unit/user-settings/change-password.test.ts`
- [X] T012 [US1] Add integration test covering request + confirm email change flow using SAM local in `inventory-management-backend/tests/integration/user-settings/email-change.test.ts`
- [X] T013 [P] [US1] Implement `/user-settings/password-change` Lambda with Cognito re-auth + session revocation in `inventory-management-backend/src/handlers/user-settings/change-password.ts`
- [X] T014 [P] [US1] Implement `/user-settings/email-change` request handler creating verification tickets + SES alerts in `inventory-management-backend/src/handlers/user-settings/request-email-change.ts`
- [X] T015 [US1] Implement `/user-settings/email-change/confirm` handler that swaps emails and finalizes tickets in `inventory-management-backend/src/handlers/user-settings/confirm-email-change.ts`
- [X] T016 [P] [US1] Create React Testing Library specs for validation, rate limiting states, and success banners in `inventory-management-frontend/tests/settings/user-settings-credentials.test.tsx`
- [X] T017 [P] [US1] Build React forms (email + password) using shared Form/Dialog components in `inventory-management-frontend/app/settings/user-settings/credential-forms.tsx`
- [X] T018 [US1] Connect forms to API client with optimistic UI + error messaging in `inventory-management-frontend/app/settings/user-settings/page.tsx`
- [X] T019 [US1] Add resend/expiry handling UI leveraging verification ticket metadata in `inventory-management-frontend/app/settings/user-settings/verification-status.tsx`

**Checkpoint**: Secure credential updates fully functional and testable independently.

---

## Phase 4: User Story 2 – GDPR-Compliant Account Deletion (Priority: P1)

**Goal**: Provide irreversible account deletion with password confirmation, dialog acknowledgement, audit logging, data cascade when the member is the last in the family, and receipts.

**Independent Test**: Trigger deletion for a sole-member family and verify all family data disappears; repeat for multi-member family and ensure only the requester is removed while ownership reassigns.

- [X] T020 [US2] Write SAM integration test ensuring cascading delete + TTL cleanup using DynamoDB local in `inventory-management-backend/tests/integration/user-settings/account-deletion.test.ts`
- [X] T021 [P] [US2] Add RTL tests verifying dialog focus management, error messaging, and success email banner in `inventory-management-frontend/tests/settings/user-settings-delete-dialog.test.tsx`
- [X] T022 [P] [US2] Implement `/user-settings/deletion` request handler that issues verification tickets + marks `deletionRequestedAt` in `inventory-management-backend/src/handlers/user-settings/request-account-delete.ts`
- [X] T023 [US2] Implement `/user-settings/deletion/confirm` transactional handler removing member and optionally family in `inventory-management-backend/src/handlers/user-settings/confirm-account-delete.ts`
- [X] T024 [US2] Extend audit + notification flows to emit deletion receipts + admin alerts in `inventory-management-backend/src/services/auditLogService.ts` and `inventory-management-backend/src/services/notificationService.ts`
- [X] T025 [P] [US2] Build the irreversible deletion dialog with password + “DELETE” acknowledgement using shared Dialog/Button components in `inventory-management-frontend/app/settings/user-settings/delete-account-dialog.tsx`
- [X] T026 [US2] Integrate dialog with API client, handle pending/blocked states, and redirect/log out on success in `inventory-management-frontend/app/settings/user-settings/page.tsx`
- [X] T027 [US2] Implement analytics/telemetry events for deletion outcomes in `inventory-management-frontend/lib/telemetry.ts`

**Checkpoint**: Deletion flow compliant with GDPR and independently testable.

---

## Phase 5: User Story 3 – Manage Profile Details (Priority: P2)

**Goal**: Let members view their profile summary and edit display name with validation and audit logging.

**Independent Test**: Load the User Settings tab, see the profile summary (name/email/password age), edit the display name with validation, and confirm the change appears across the app without touching email/password flows.

- [X] T028 [US3] Write backend unit tests covering validation + audit logging for profile handler in `inventory-management-backend/tests/unit/user-settings/profile.test.ts`
- [X] T029 [P] [US3] Add RTL tests covering form validation + real-time summary refresh in `inventory-management-frontend/tests/settings/user-settings-name-form.test.tsx`
- [X] T030 [P] [US3] Implement `/user-settings/me` profile summary handler returning Member data + pending states in `inventory-management-backend/src/handlers/user-settings/get-profile.ts`
- [X] T031 [US3] Implement `/user-settings/profile` PATCH handler updating `displayName` + audit log in `inventory-management-backend/src/handlers/user-settings/update-profile.ts`
- [X] T032 [P] [US3] Build ProfileSummary component showing display name, email, password age, pending status tags in `inventory-management-frontend/app/settings/user-settings/profile-summary.tsx`
- [X] T033 [US3] Build display name edit form with optimistic UI + inline errors in `inventory-management-frontend/app/settings/user-settings/name-form.tsx`
- [X] T034 [US3] Expose profile hooks/context for other settings tabs via `inventory-management-frontend/app/settings/user-settings/useUserSettings.ts`

**Checkpoint**: Profile details manageable independently of other flows.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final refinements across all stories.

- [ ] T035 [P] Run accessibility + axe checks for the User Settings tab and document fixes in `inventory-management-frontend/app/settings/user-settings/ACCESSIBILITY.md`
- [X] T036 Add operational runbook entries for credential and deletion flows in `docs/runbooks/user-settings.md`
- [ ] T037 [P] Execute full quickstart validation (tsc, lint, build, tests, sam build) and record results in `specs/015-user-settings/quickstart.md`
- [X] T038 Harden rate limiting + alerting configuration for sensitive endpoints in `inventory-management-backend/src/lib/rate-limiter.ts`

---

## Dependencies & Execution Order

1. **Phase 1 → Phase 2**: Environment setup must precede foundational work to avoid misconfigured credentials.
2. **Phase 2 → User Stories**: Data models, services, and SAM wiring are prerequisites for all story phases.
3. **User Story Order**: US1 (credential updates) delivers MVP; US2 depends on verification tickets/audit utilities from US1 but can start once foundational tasks finish; US3 can run in parallel after Phase 2 but should avoid blocking US1.
4. **Polish Phase**: Runs after desired user stories complete; focuses on cross-cutting improvements and validation.

---

## Parallel Execution Opportunities

- T003, T007, T008, T009 can proceed concurrently once plan.md is understood (different files and domains).
- Within US1, backend handlers (T011–T015) and frontend forms (T016–T019) can progress in parallel; mark blockers between backend tests and handlers as needed.
- US2 backend (T020–T023) and frontend (T024–T027) can run concurrently after foundational work.
- US3 components (T028–T034) can be split between backend and frontend engineers simultaneously.
- Polish tasks T035 and T037 can run in parallel with documentation (T036) since they touch different files.

---

## Implementation Strategy

1. **MVP (US1)**: Deliver secure credential updates first so members can self-serve high-risk changes; deploy once US1 passes independent tests.
2. **Compliance Layer (US2)**: Next, ship GDPR deletion to close legal requirements while reusing verification ticket infrastructure.
3. **Quality-of-life (US3)**: Add profile display/edit improvements after security/compliance, ensuring each story remains independently testable.
4. **Polish**: Finish with accessibility, runbooks, and rate-limiting hardening before final review.
