# Tasks: Pending Invitation Onboarding

**Input**: Design documents from `/specs/001-pending-invite-join/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Tests**: Each user story includes targeted integration/UX tests because supportability and audit guarantees are part of the success criteria.

**Organization**: Tasks are grouped by user story so each slice can be implemented and tested independently.

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Establish scaffolding that both frontend and backend work can share.

- [ ] T001 Create `backend/src/handlers/invitations/` with initial index exports so new Lambda handlers can register cleanly.
- [ ] T002 Create `frontend/app/(auth)/register/pending-invite/` folder with placeholder `page.tsx` wired into the App Router tree.
- [ ] T003 [P] Register feature docs by linking plan/spec in `README.md` and ensuring `specs/001-pending-invite-join/` is referenced for onboarding context consumers.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core plumbing required before any story can function.

- [ ] T004 Define invitation + decision log shared types in `backend/src/models/invitation.ts` and export DTO counterparts to `frontend/types/invitations.ts`.
- [ ] T005 Implement identity normalization helpers in `backend/src/services/inviteMatching/identityMatcher.ts` (email + E.164 phone) reused by all handlers.
- [ ] T006 Update `backend/template.yaml` with `GET /pending-invitations`, `POST /pending-invitations/{inviteId}/accept`, `POST /pending-invitations/{inviteId}/decline`, and `/pending-invitations/decline-all` routes plus IAM statements.
- [ ] T007 Add membership/context guard utilities in `backend/src/lib/memberContext.ts` so handlers can verify existing family ties before auto-joining.
- [ ] T008 Create `frontend/lib/api/invitations.ts` with typed fetchers for pending/accept/decline requests (wrapping `{data: T}` responses).
- [ ] T009 Add `frontend/hooks/usePendingInvites.ts` hook using React Query/Suspense to load invite data and expose accept/decline mutations to UI components.

**Checkpoint**: Identity + contract scaffolding ready; user story phases can run.

---

## Phase 3: User Story 1 – Detect Pending Invite During Sign-Up (Priority: P1) 🎯 MVP

**Goal**: Automatically detect pending invitations after signup and allow acceptance of a single invite, provisioning membership immediately.

**Independent Test**: Seed a pending invite for a known email, create a user without using the link, ensure the pending-invite route blocks navigation until Accept is clicked, and verify DynamoDB shows the invite consumed + membership created.

### Tests

- [ ] T010 [P] [US1] Add SAM integration test `backend/tests/integration/invitations/pendingInvite.test.ts` covering `GET /pending-invitations` happy path + missing invite cases.
- [ ] T011 [P] [US1] Add integration test `backend/tests/integration/invitations/respondAccept.test.ts` validating membership creation + audit log entries when accepting an invite.

### Implementation

- [ ] T012 [US1] Build `backend/src/services/inviteMatching/pendingInviteService.ts` to query DynamoDB via identity matcher and assemble `PendingInvitationList` payloads.
- [ ] T013 [US1] Implement `backend/src/handlers/invitations/pendingInvite.ts` Lambda with warmup guard, Zod validation, and shared success/error responses.
- [ ] T014 [US1] Implement accept branch inside `backend/src/handlers/invitations/respondToInvite.ts` (TransactWrite for Invitation + InviteDecisionLog + FamilyMembership) and expose via router.
- [ ] T015 [US1] Register `pendingInvite` and `respondToInvite` functions in `backend/src/handlers/warmup/orchestrator.ts` FUNCTION_NAMES to honor cold-start requirements.
- [ ] T016 [US1] Build blocking onboarding page at `frontend/app/(auth)/register/pending-invite/page.tsx` that server-fetches pending invites and renders Suspense fallback per research guidance.
- [ ] T017 [US1] Update `frontend/app/(auth)/register/page.tsx` (or associated completion handler) to redirect into the pending invite route whenever backend flags `pendingInvitationDetected`.
- [ ] T018 [US1] Implement initial CTA component `frontend/components/common/InvitationDecisionModal.tsx` that displays single invite details and wires Accept button to API hook (decline/create handled in later stories).

**Checkpoint**: Single-invite detection + acceptance flow works end-to-end with audit coverage.

---

## Phase 4: User Story 2 – Resolve Multiple Invitations (Priority: P2)

**Goal**: Allow invitees with multiple families to compare options, pick one to join, and leave other invites pending until they act.

**Independent Test**: Seed two invites for the same identity, load the pending-invite route, ensure the UI lists both families with metadata, select one invitation, accept it, and confirm other invites remain pending in DynamoDB.

### Tests

- [ ] T019 [P] [US2] Add RTL test `frontend/tests/unit/components/invitationDecisionList.test.tsx` covering multi-card navigation, details toggle, and selection state.
- [ ] T020 [P] [US2] Extend integration test `backend/tests/integration/invitations/multiInviteSelection.test.ts` to prove only the selected invite is consumed and others remain `PENDING`.

### Implementation

- [ ] T021 [US2] Implement `frontend/components/common/InvitationDecisionList.tsx` composed from shared Card/List/Button primitives with accessible controls for each invite and metadata display.
- [ ] T022 [US2] Enhance `frontend/hooks/usePendingInvites.ts` to manage selected invite state, expose helper for “view details,” and refresh data after acceptance.
- [ ] T023 [US2] Update `frontend/lib/api/invitations.ts` accept mutation to send the selected invite id + decision token (ensuring other invites untouched).
- [ ] T024 [US2] Implement `backend/src/services/inviteMatching/decisionLogger.ts` with helpers that write InviteDecisionLog items while ensuring unselected invites remain pending.
- [ ] T025 [US2] Update `frontend/app/(auth)/register/pending-invite/page.tsx` to render the new list component, highlight selected invite, and block Accept until selection confirmed.

**Checkpoint**: Multi-invite chooser delivers correct membership + preserves other invites.

---

## Phase 5: User Story 3 – Decline Invites and Start Own Family (Priority: P3)

**Goal**: Give invitees a clean exit path (decline some/all invites, start their own family) while informing hosts of the decision and preventing re-prompts.

**Independent Test**: Register with at least one invite, choose “Create my own family,” confirm backend logs each invite as declined with reason, user lands in new-family setup, and hosts see decline status within their dashboard list.

### Tests

- [ ] T026 [P] [US3] Add backend integration test `backend/tests/integration/invitations/declineInvite.test.ts` covering single-decline and decline-all behavior including TTL + audit log entries.
- [ ] T027 [P] [US3] Add RTL flow test `frontend/tests/integration/onboardingDecline.test.tsx` verifying the UI records declines, routes to create-family flow, and suppresses future prompts until new invites exist.

### Implementation

- [ ] T028 [US3] Implement decline + decline-all branches in `backend/src/handlers/invitations/respondToInvite.ts`, capturing optional reasons and returning redirect targets.
- [ ] T029 [US3] Extend `backend/src/services/inviteMatching/decisionLogger.ts` to append decline reasons, set TTL for stale invites, and notify host dashboards via existing streams.
- [ ] T030 [US3] Wire “Create my own family” CTA inside `frontend/components/common/InvitationDecisionModal.tsx` (and list view) to call decline-all then navigate to `frontend/app/(dashboard)/family/create/page.tsx`.
- [ ] T031 [US3] Update `frontend/app/(dashboard)/invitations/page.tsx` (host dashboard) to surface new status badges (`Declined via pending flow`, timestamps, actor) per FR-007.
- [ ] T032 [US3] Add analytics/audit logging instrumentation (correlation IDs) in `backend/src/services/inviteMatching/decisionLogger.ts` and ensure CloudWatch logs record decline reasons for compliance.

**Checkpoint**: Users can decline/skip invites cleanly and hosts get visibility.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: System-level hardening and documentation.

- [ ] T033 [P] Update `frontend/components/common/InvitationDecisionModal.tsx` + list styles to meet WCAG focus/contrast rules and mobile breakpoints.
- [ ] T034 Add runbook entry + troubleshooting steps to `specs/001-pending-invite-join/quickstart.md` (manual verification notes, support handoff).
- [ ] T035 [P] Ensure `backend/src/handlers/invitations/respondToInvite.ts` and `pendingInvite.ts` emit structured logs + metrics (p95 lookup duration) to satisfy SC-001/SC-002 monitoring.
- [ ] T036 Execute end-to-end validation per quickstart (tsc, lint, build, tests) and document results in `specs/001-pending-invite-join/research.md` appendix or plan notes.

---

## Dependencies & Execution Order

1. **Phase 1 → Phase 2**: Setup scaffolding before foundational utilities.
2. **Phase 2 → User Stories**: Identity types, API routes, and hooks must exist before implementing any story.
3. **User Story Ordering**: US1 (MVP) must land before US2/US3. US2 depends on the acceptance API from US1. US3 depends on respond handler + decision logger from US1/US2. After US1 completes, US2 and US3 can proceed in parallel aside from shared files flagged with dependencies.
4. **Polish**: Final hardening waits until all targeted stories ship.

## Parallel Execution Opportunities

- Tasks marked `[P]` within a phase can run concurrently (e.g., T002 and T003 during setup, or T010/T011 test work).
- After Phase 2 completes, one engineer can own backend handler work for US1 (T012–T015) while another builds the frontend route (T016–T018).
- US2’s UI (T021–T025) and backend logging enhancements (T024) can overlap once US1 code is merged.
- US3’s decline endpoints (T028–T029) can ship while another teammate updates the host dashboard (T031) thanks to the API contract completed earlier.

## Implementation Strategy (MVP First)

1. **MVP = User Story 1**: Deliver detection + acceptance so invited users stop creating orphaned families.
2. **Increment 2 = User Story 2**: Layer in the multi-invite selector without blocking MVP release; ship after verifying US1 metrics.
3. **Increment 3 = User Story 3**: Add decline/create-family pathways and host visibility to complete the experience.
4. **Polish**: Accessibility, logging, and documentation tasks wrap up the release and prep for `/speckit.checklist` review.
