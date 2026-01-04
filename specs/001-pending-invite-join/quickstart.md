# Quick Start: Pending Invitation Onboarding

**Feature**: 001-pending-invite-join  
**Audience**: Full-stack engineers extending onboarding  
**Estimated Time**: 2–3 days (including tests)

## Overview

This guide shows how to intercept new signups who did not follow an invite link, surface their pending invitations, let them accept/decline, and log every decision so hosts stay informed.

## Prerequisites

- ✅ Node.js 20.x + pnpm setup for both frontend and backend repos
- ✅ AWS SAM CLI configured for `inventory-management-backend`
- ✅ Local Cognito + DynamoDB configuration or access to staging stack
- ✅ Familiarity with `components/common/` library and `lib/auth/getUserContext`

## Implementation Phases

### Phase 1: Backend – Pending Invite Lookup (0.5 day)
1. Create `backend/src/services/inviteMatching/identityMatcher.ts` with helpers to normalize email + phone using the same KeyBuilder helpers as invitation writer logic.
2. Add `backend/src/handlers/invitations/pendingInvite.ts` Lambda:
   - Warmup guard + `successResponse`/`errorResponse` usage per constitution.
   - Fetch verified email/phone from `getUserContext` and query DynamoDB GSI for pending invites.
   - Return `PendingInvitationList` payload plus signed decision token.
3. Update `template.yaml` to expose `GET /pending-invitations` and restrict IAM access to invitation + membership items only.
4. Write Jest unit tests for the matcher and SAM integration test for the handler (mock DynamoDB with close-to-real payloads).

### Phase 2: Backend – Accept/Decline Actions (0.5 day)
1. Add `respondToInvite.ts` handler with sub-routes for `/accept`, `/decline`, and `/decline-all` (can share code inside a dispatcher).
2. Implement DynamoDB `TransactWriteCommand` that updates the Invitation status and writes an `InviteDecisionLog` entry in a single transaction.
3. When accepting, create or update the `FamilyMembership` record and check whether the user already has membership; if so, require `switchConfirmed` before proceeding.
4. Emit structured audit logs with correlation IDs.
5. Cover race conditions with unit tests (double acceptance, expired invite) and integration test for the transact write path.

### Phase 3: Frontend – Pending Invite Route (0.75 day)
1. Add `frontend/app/(auth)/register/pending-invite/page.tsx` (server component) that fetches `GET /pending-invitations` using the shared API client wrapper.
2. Create `frontend/lib/api/invitations.ts` for typed REST helpers plus React Query hooks (`usePendingInvites`, `useAcceptInvite`, `useDeclineInvite`).
3. Ensure the route blocks navigation until the user picks Accept/Decline/Create-family; redirect to dashboard or `/setup/family` based on response `redirect` URL.
4. Update the signup completion flow to route users here when `pendingInvitationDetected` flag is true after Cognito confirmation.

### Phase 4: Frontend – Multi-Invite UI + Create-Family Path (0.75 day)
1. Build `components/common/InvitationDecisionList.tsx` that composes existing `Card`, `Stack`, `Button`, and `Dialog` primitives to render each invite.
2. Display inviter name, role offered, expiration, and status badges; highlight the selected invite.
3. Provide CTA buttons: Accept, Decline, and “Create my own family” (calls decline-all).
4. When `requiresSwitchConfirmation` is true, show confirm dialog before sending accept mutation.
5. Write RTL tests covering: single invite accept, multi invite selection, decline-all path, switch confirmation prompt.

### Phase 5: Verification & QA (0.5 day)
1. Run `pnpm test`, `pnpm lint`, and `pnpm build` in both repos.
2. Execute SAM integration tests locally; confirm DynamoDB fixture data matches spec.
3. Manually verify flows in the browser:
   - Signup with pending invite → prompt appears
   - Multi invite selection works without reloads
   - “Create my own family” declines invites and loads new-family setup
   - Accepting while already in a family requires confirmation
4. Confirm hosts see updated statuses in the invitation dashboard.

## Deliverables Checklist

- [ ] Lambda handlers + services deployed with warmup + shared response utilities
- [ ] DynamoDB migration (new InviteDecisionLog writes) validated
- [ ] New Next.js route and shared components committed with strict typing
- [ ] Jest + RTL coverage ≥80% on new modules
- [ ] Manual verification notes captured for QA handoff
