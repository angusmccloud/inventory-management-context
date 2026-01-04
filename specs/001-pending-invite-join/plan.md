# Implementation Plan: Pending Invitation Onboarding

**Branch**: `001-pending-invite-join` | **Date**: 2026-01-04 | **Spec**: [specs/001-pending-invite-join/spec.md](specs/001-pending-invite-join/spec.md)
**Input**: Feature specification from `/specs/001-pending-invite-join/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Extend onboarding so that users who sign up without following an invite link are intercepted after identity verification, the backend looks up their pending invitations (email and phone), and the UI lets them accept one invite, decline all, or start their own family. The solution adds a dedicated invitation matching Lambda + DynamoDB access layer, serverless endpoints for accept/decline actions with full audit logging, and a Next.js App Router gating step that reuses the shared component library for the multi-invite selector.

## Technical Context

**Language/Version**: TypeScript 5.x (strict) targeting Node.js 20.x Lambda runtimes and Next.js 16 App Router
**Primary Dependencies**: Next.js 16 + React 18, AWS Lambda + API Gateway, AWS SDK v3 DynamoDB Document Client, Cognito user pools, Zod validation, shared UI component library (Dialog, List, Button)
**Storage**: DynamoDB single-table (Family, Member, Invitation, InviteDecisionLog records share table)
**Testing**: Jest (unit + integration), React Testing Library for onboarding UI, AWS SAM integration tests for Lambda handlers
**Target Platform**: Modern web browsers (Next.js SSR/CSR) backed by AWS Lambda + API Gateway (serverless REST endpoints)
**Project Type**: Web application with shared frontend + backend monorepo (Frontend Next.js app + Backend Lambda services)
**Performance Goals**: Pending invite lookup <2s after signup, membership provisioning <500ms server-side, audit logging and UI transitions under 30s end-to-end per success criteria
**Constraints**: Must honor strict typing, reuse component library, maintain warm Lambda contexts, return responses via shared utilities, surface accessible/responsive UI, and ensure identity validation prevents accidental data leaks or family switching without explicit confirmation
**Scale/Scope**: Supports tens of thousands of families with up to ~10 concurrent invitations per identity; limited to onboarding + invitation management flows but touches both frontend and backend services

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### ✅ TypeScript Type Safety (NON-NEGOTIABLE)
- New invitation matching service, React components, and Lambda handlers will define explicit interfaces (InvitationMatch, InviteDecisionPayload, etc.) and forbid implicit `any`.
- Shared types will live in feature-specific files (`types/invitations.ts`) that both frontend and backend import to prevent schema drift.

### ✅ Testing Excellence (NON-NEGOTIABLE)
- Unit tests will cover invite matching (identity normalization, filtering) and audit logging.
- React Testing Library specs will exercise the multi-invite selector, accept/decline flows, and “create my own family” branch.
- Integration tests via SAM CLI will cover `GET /invitations/pending`, `POST /invitations/accept`, and `POST /invitations/decline`, ensuring warmup handling and response utilities are invoked; coverage on critical paths stays ≥80%.

### ✅ Serverless Architecture
- Backend additions are Lambda handlers (`pendingInvite.ts`, `respondToInvite.ts`) routed through API Gateway + SAM template updates; no long-lived servers.
- Handlers remain stateless, idempotent, and registered with the warmup orchestrator.

### ✅ AWS Best Practices
- DynamoDB access uses the Document Client with KeyBuilder helpers and conditional expressions to avoid race conditions when accepting invites.
- All handlers call `handleWarmup`, `successResponse`, and `errorResponse` utilities before returning.
- IAM policies in `template.yaml` remain least-privilege (Invitation + Member entity access only).

### ✅ Security First
- Invitation lookup only occurs after Cognito verification; backend cross-checks identifiers and family membership before returning details.
- Accepting a new invite while already in a family triggers an explicit confirmation path and logs the actor; audit entries include correlation IDs for support.
- Input payloads are validated with Zod and sanitized before DynamoDB writes.

### ✅ Performance Optimization
- Lambda stays lean (modular AWS SDK imports, precomputed queries) and warmup ensures <200 ms cold-start impact.
- Frontend fetches pending invites via `useSuspenseQuery` with skeleton UI to hit the 2 s detection target; selection is local-state-driven to avoid extra round trips.

### ✅ Code Organization
- Next.js App Router onboarding step lives under `Frontend/app/(auth)/register/pending-invite` and composes shared components.
- Backend logic resides in `Backend/src/handlers/invitations/` with supporting services and tests colocated; shared libraries stay in `lib/` and `types/` per constitution.

### ✅ Component Library (NON-NEGOTIABLE)
- Invitation list uses existing `List`, `Card`, `Dialog`, and `Button` primitives from `components/common/`; any new UI (e.g., `InviteDecisionList`) is added to the common library for reuse in dashboard invite management.

**All gates pass—Phase 0 research may proceed.**

## Project Structure

### Documentation (this feature)

```text
specs/001-pending-invite-join/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── pending-invitations.openapi.yml
└── tasks.md
```

### Source Code (repository root)

```text
backend/
├── src/
│   ├── handlers/
│   │   └── invitations/
│   │       ├── pendingInvite.ts          # GET pending invites
│   │       └── respondToInvite.ts        # POST accept/decline
│   ├── services/
│   │   └── inviteMatching/
│   │       ├── identityMatcher.ts        # normalize email/phone
│   │       └── decisionLogger.ts         # audit + host updates
│   ├── models/
│   │   └── invitation.ts                 # entity + KeyBuilder helpers
│   └── lib/
│       └── memberContext.ts              # membership checks
├── tests/
│   ├── integration/
│   │   └── invitations.test.ts
│   └── unit/
│       └── inviteMatching.test.ts
└── template.yaml                         # add routes + IAM

frontend/
├── app/
│   ├── (auth)/register/page.tsx          # existing signup flow
│   └── (auth)/register/pending-invite/   # new gating route
│       └── page.tsx
├── components/common/
│   ├── InvitationDecisionList.tsx        # new composition of primitives
│   └── InvitationDecisionModal.tsx
├── lib/api/
│   └── invitations.ts                    # fetch/accept/decline clients
├── hooks/
│   └── usePendingInvites.ts              # data + decision state
└── tests/
    ├── integration/onboarding.test.tsx
    └── unit/components/invitationDecisionList.test.tsx
```

**Structure Decision**: Full-stack web application with separate frontend (`frontend/`) and backend (`backend/`) workstreams but a shared spec directory. Documentation stays in `specs/001-pending-invite-join`, backend logic lives under `backend/src/handlers/invitations/`, and the Next.js App Router onboarding flow sits in `frontend/app/(auth)/register/pending-invite`. Tests remain colocated with their respective stacks to satisfy Testing Excellence.

## Complexity Tracking

No constitution exceptions identified; table intentionally left empty.
