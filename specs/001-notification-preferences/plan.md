# Implementation Plan: Notification Preference Management

**Branch**: `001-notification-preferences` | **Date**: 2026-01-04 | **Spec**: [/specs/001-notification-preferences/spec.md](./spec.md)  
**Input**: Feature specification from `/specs/001-notification-preferences/spec.md`

## Summary

Extend the existing notification system so each user can configure delivery frequency per notification type and channel, support immediate (15-minute) jobs plus daily/weekly digests, and ensure every email contains unsubscribe and preference links while remaining compliant with the constitution’s serverless, test-first, and DynamoDB standards.

## Technical Context

<!--
  ACTION REQUIRED: Replace the content in this section with the technical details
  for the project. The structure here is presented in advisory capacity to guide
  the iteration process.
-->

**Language/Version**: TypeScript 5 (strict) with Node.js 20 Lambda runtimes  
**Primary Dependencies**: Next.js 16 App Router, AWS Lambda handlers, DynamoDB Document Client, SES/email service, background job scheduler (CloudWatch Events + Lambda)  
**Storage**: DynamoDB single-table design (Member + Notification entities)  
**Testing**: Jest + React Testing Library with 80%+ coverage on notification flows  
**Target Platform**: Serverless backend on AWS Lambda/API Gateway plus Next.js web client  
**Project Type**: Web application with shared frontend/backend repo (App Router + SAM)  
**Performance Goals**: Immediate emails delivered within first 15-minute window; digests generated at 9:00 local with <2 minute processing; settings UI saves within 5 seconds  
**Constraints**: Must include unsubscribe/change links per email compliance; job execution must avoid duplicate sends; infrastructure defined via template.yaml  
**Scale/Scope**: Household-sized multi-user context (~thousands of users) with extensible notification matrix for new channels

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

1. **TypeScript Strict (I)** – Plan maintains TypeScript 5 strict usage across Next.js UI, Lambda handlers, and shared libs. ✅  
2. **Serverless Architecture (II)** – Notifications jobs executed via AWS Lambda + EventBridge, infrastructure changes routed through `template.yaml`. ✅  
3. **Testing Excellence (III)** – Jest + React Testing Library coverage for backend scheduling logic and UI preference matrix; new tests will be specified later. ✅  
4. **AWS Best Practices (IV)** – DynamoDB single-table maintained, warmup + response utilities required for any new handlers, SES usage defined in IaC. ✅  
5. **Security First (V)** – Preference endpoints require authenticated Member context; unsubscribe links honor secure tokens. ✅  
6. **Component Library (VIII)** – Settings UI will reuse shared components; no custom ad-hoc components introduced. ✅

Gate Status: **PASS** – No violations identified; proceed to Phase 0.
  
**Post-Design Re-Check**: Research and design outputs (data model, contracts, quickstart) remain aligned with TypeScript strictness, serverless Lambda jobs, DynamoDB single-table usage, Jest/RTL testing, and component library reuse, so gates stay PASS.

## Project Structure

### Documentation (this feature)

```text
specs/[###-feature]/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)
<!--
  ACTION REQUIRED: Replace the placeholder tree below with the concrete layout
  for this feature. Delete unused options and expand the chosen structure with
  real paths (e.g., apps/admin, packages/something). The delivered plan must
  not include Option labels.
-->

```text
backend/
├── src/
│   ├── handlers/notifications/        # Lambda handlers for immediate + digest jobs
│   ├── services/notifications/        # Preference + delivery orchestration logic
│   ├── models/member.ts               # Member entity (preference storage)
│   └── lib/                           # response, warmup, auth utilities
└── tests/
    ├── integration/notifications/     # Job scheduling + Dynamo flows
    └── unit/services/notifications/

frontend/
├── app/settings/notifications/        # App Router route for preferences UI
├── components/common/                 # Shared UI components reused here
├── lib/api/notifications.ts           # Client wrappers hitting new endpoints
└── tests/
    └── settings/notifications.test.tsx
```

**Structure Decision**: This repo follows a combined web architecture (Next.js frontend + AWS SAM backend). Work will live under the existing `frontend/app/settings/notifications` route and backend `backend/src/handlers/notifications/*` plus supporting services/tests described above.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| [e.g., 4th project] | [current need] | [why 3 projects insufficient] |
| [e.g., Repository pattern] | [specific problem] | [why direct DB access insufficient] |
