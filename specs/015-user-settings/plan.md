# Implementation Plan: User Settings Controls

**Branch**: `015-user-settings` | **Date**: January 18, 2026 | **Spec**: [specs/015-user-settings/spec.md](specs/015-user-settings/spec.md)
**Input**: Feature specification from `/specs/015-user-settings/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Deliver a secure User Settings tab inside the member-facing Settings page so that individuals can (1) edit their display name, (2) rotate primary email and password with re-authentication plus out-of-band confirmation, and (3) invoke GDPR-compliant account deletion that cascades to Family records when they are the last household member. The implementation spans the Next.js 16 frontend (App Router page + UI flows) and AWS Lambda-backed APIs that persist updates in the DynamoDB Member/Family entities while enforcing audit logging, notification fan-out, and session invalidation.

## Technical Context

<!--
  ACTION REQUIRED: Replace the content in this section with the technical details
  for the project. The structure here is presented in advisory capacity to guide
  the iteration process.
-->

**Language/Version**: TypeScript 5.x (strict), React 18, Node.js 20 Lambda runtimes  
**Primary Dependencies**: Next.js 16 App Router, AWS SDK v3 DynamoDB Document Client, shared component library, centralized auth utilities, AWS Cognito user pool for re-auth  
**Storage**: DynamoDB single-table design (FAMILY#/MEMBER# records for profile + ownership data) with encrypted backups governed by GDPR retention rules  
**Testing**: Jest + React Testing Library for UI, backend unit tests with Jest + aws-sdk-client-mock, integration tests via SAM local harness  
**Target Platform**: Web (Next.js App Router) + Serverless APIs behind API Gateway / AWS Lambda  
**Project Type**: Multi-repo web platform (`inventory-management-frontend` + `inventory-management-backend`) coordinated via this context repo  
**Performance Goals**: 95% of credential-change flows < 60s end-to-end, deletion cascade clears data within 15 minutes, dashboard interactions remain sub-3s per request  
**Constraints**: GDPR right-to-erasure, WCAG 2.1 AA, rate limiting for sensitive actions, verification links expire in 24h, inline messaging must avoid credential enumeration, Infrastructure-as-Code only  
**Scale/Scope**: Multi-tenant families (~50k active members) sharing a single DynamoDB table with burst capacity for credential rotations

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

1. **TypeScript Type Safety (Principle I)** – PASS. Both frontend and Lambda handlers continue using strict TypeScript 5 with explicit types; no alternative languages introduced.
2. **Serverless Architecture & AWS Best Practices (Principles II & IV)** – PASS. New APIs will be Lambda handlers wired through SAM template.yaml, include warmup hooks, success/error response utilities, and DynamoDB KeyBuilder usage.
3. **Testing Excellence (Principle III)** – PASS. Plan mandates Jest/RTL unit coverage plus integration tests for sensitive workflows before merging.
4. **Security First (Principle V)** – PASS. All re-auth flows require password verification, out-of-band confirmations, and audit logs; no secrets stored in repo.
5. **Component Library (Principle VIII)** – PASS. UI additions compose existing common Dialog, Form, and Button primitives; no one-off widgets.
6. **Infrastructure as Code (Gotcha #4)** – PASS. All IAM, Lambda, and API Gateway updates remain in `template.yaml`; no console changes besides SES/third-party DNS (not required here).

**Post-Design Re-check**: PASS – Detailed data models and contracts (Phase 1) continue honoring these gates; no new violations introduced.

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

```text
inventory-management-frontend/
├── app/
│   ├── (settings)/
│   │   ├── page.tsx                   # Entry for Settings area
│   │   └── user-settings/             # New tab UI + route handlers
│   ├── api/
│   │   └── user-settings/             # Next.js route handlers for thin proxy (if needed)
│   └── layout.tsx
├── components/common/                 # Shared Dialog, Button, Form primitives (non-negotiable)
├── lib/
│   └── apiClient.ts                   # Wraps fetch/unwrapping {data: T}
└── tests/
    ├── unit/
    └── integration/

inventory-management-backend/
├── src/
│   ├── handlers/
│   │   └── user-settings/
│   │       ├── update-profile.ts      # Name edits
│   │       ├── request-email-change.ts
│   │       ├── confirm-email-change.ts
│   │       ├── change-password.ts
│   │       ├── request-account-delete.ts
│   │       └── confirm-account-delete.ts
│   ├── services/
│   │   ├── member-profile-service.ts
│   │   └── audit-log-service.ts
│   └── lib/
│       └── warmup.ts
├── template.yaml                      # SAM IaC changes for new handlers + permissions
└── tests/
    ├── unit/
    └── integration/
```

**Structure Decision**: Multi-repo architecture (frontend + backend) continues; this feature touches the Settings UI under `app/(settings)/user-settings` plus the backend user-settings handlers referenced above, along with shared libraries for auth, DynamoDB access, and notifications.

## Complexity Tracking

No constitutional violations identified; no additional complexity justifications required.
