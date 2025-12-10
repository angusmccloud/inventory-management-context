# Implementation Plan: Family Member Management

**Branch**: `003-member-management` | **Date**: 2025-12-10 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/003-member-management/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Enable family admins to invite, manage, and remove family members with role-based permissions (admin/suggester). This feature builds upon the authentication and family isolation mechanisms from 001-family-inventory-mvp, adding invitation workflows via email, role management, and member lifecycle handling. Technical approach uses AWS Cognito for user creation, DynamoDB for member/invitation records, and AWS SES for email delivery.

## Technical Context

**Language/Version**: TypeScript 5 with strict mode enabled
**Primary Dependencies**: Next.js 16 (App Router), AWS SDK v3, Zod (validation), AWS Cognito SDK, AWS SES SDK
**Storage**: Amazon DynamoDB (single-table design, reusing `InventoryManagement` table from 001-family-inventory-mvp)
**Testing**: Jest and React Testing Library (80% coverage required for critical paths)
**Target Platform**: AWS Lambda (serverless), Web browser (frontend)
**Project Type**: Web application (frontend + backend)
**Performance Goals**: Invitation delivery within 5 minutes (SC-002), access revocation within 1 minute (SC-005)
**Constraints**: Stateless Lambda functions, idempotent operations, least-privilege IAM
**Scale/Scope**: 2-6 members per family (typical), small-scale multi-user access

### Key Entities

**Member** (from parent feature 001-family-inventory-mvp):
- PK: `FAMILY#{familyId}`, SK: `MEMBER#{memberId}`
- GSI1PK: `MEMBER#{memberId}`, GSI1SK: `FAMILY#{familyId}`
- Attributes: memberId, familyId, email, name, role (admin/suggester), status (active/removed), entityType, createdAt, updatedAt

**Invitation** (NEW - NEEDS CLARIFICATION for data model):
- Tracks pending member invitations
- Required attributes: invitationId, familyId, email, role, token, status, expiresAt, invitedBy, createdAt
- NEEDS CLARIFICATION: PK/SK structure, token storage mechanism, TTL vs application-level expiration

### Integration Points

1. **AWS Cognito**: User pool management, programmatic user creation on invitation acceptance
2. **AWS SES**: Email delivery for invitation links
3. **DynamoDB**: Member and Invitation records in `InventoryManagement` table
4. **Lambda Authorizer**: Role-based access control validation (admin vs suggester permissions)

### Dependencies on Parent Feature (001-family-inventory-mvp)

- Family entity and family isolation mechanisms
- Member entity schema (lines 74-136 of data-model.md)
- Authentication system (AWS Cognito user pool)
- Lambda authorizer for JWT validation
- DynamoDB single-table design with GSI1 for member-to-family lookup
- Email notification service infrastructure

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### NON-NEGOTIABLE Requirements (from constitution v1.1.0)

| Principle | Requirement | Status | Notes |
|-----------|-------------|--------|-------|
| **I. TypeScript Type Safety** | All code in TypeScript 5 strict mode, no implicit `any` | ✅ COMPLIANT | Will use Zod schemas for Member and Invitation entities |
| **II. Serverless Architecture** | All backend logic as AWS Lambda functions | ✅ COMPLIANT | Member management APIs via Lambda |
| **II. Serverless Architecture** | DynamoDB single-table design | ✅ COMPLIANT | Reusing `InventoryManagement` table |
| **II. Serverless Architecture** | Lambda functions stateless and idempotent | ✅ COMPLIANT | Member operations designed for idempotency |
| **III. Testing Excellence** | Test-first development, 80% coverage for critical paths | ✅ COMPLIANT | Will require tests for all member management logic |
| **III. Testing Excellence** | Jest and React Testing Library | ✅ COMPLIANT | Standard testing frameworks |
| **IV. AWS Best Practices** | AWS SDK v3 with modular imports | ✅ COMPLIANT | Tree-shaking for Cognito, SES, DynamoDB clients |
| **IV. AWS Best Practices** | IAM least-privilege principle | ✅ COMPLIANT | Separate roles for member management Lambdas |
| **IV. AWS Best Practices** | Secrets in Secrets Manager or Parameter Store | ✅ COMPLIANT | SES credentials, Cognito secrets |
| **V. Security First** | All user inputs validated and sanitized | ✅ COMPLIANT | Zod validation for all API inputs |
| **V. Security First** | Authentication and authorization for protected resources | ✅ COMPLIANT | Lambda authorizer validates JWT and role |
| **VI. Performance Optimization** | Lambda cold start optimization | ✅ COMPLIANT | Minimal dependencies, modular SDK imports |
| **VII. Code Organization** | Next.js App Router conventions | ✅ COMPLIANT | API routes in `app/api/` directory |

### Gate Evaluation

**GATE STATUS: ✅ PASS** - No constitution violations identified. All requirements align with constitution principles.

### Deployment Requirements (from constitution)

- Frontend: AWS S3 + CloudFront (NOT Vercel/Netlify)
- Backend: AWS SAM (`sam deploy`)
- Infrastructure: All resources in `template.yaml`

## Project Structure

### Documentation (this feature)

```text
specs/003-member-management/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
│   └── api-spec.yaml    # OpenAPI specification for member management APIs
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
# Web application structure (frontend + backend)
src/
├── app/
│   └── api/
│       └── members/           # Member management API routes
│           ├── route.ts       # GET (list), POST (invite)
│           ├── [memberId]/
│           │   └── route.ts   # GET, PATCH (role), DELETE (remove)
│           └── invitations/
│               ├── route.ts   # GET pending invitations
│               └── [token]/
│                   └── accept/
│                       └── route.ts  # POST accept invitation
├── components/
│   └── members/               # Member management UI components
│       ├── MemberList.tsx
│       ├── InviteMemberForm.tsx
│       ├── MemberRoleSelect.tsx
│       └── RemoveMemberDialog.tsx
├── lib/
│   ├── cognito/               # Cognito integration utilities
│   │   └── userManagement.ts
│   ├── ses/                   # SES email utilities
│   │   └── invitationEmail.ts
│   └── dynamodb/
│       └── memberRepository.ts
├── services/
│   └── memberService.ts       # Member management business logic
└── types/
    └── member.ts              # Member and Invitation type definitions

tests/
├── unit/
│   ├── services/
│   │   └── memberService.test.ts
│   └── lib/
│       └── memberRepository.test.ts
├── integration/
│   └── api/
│       └── members.test.ts
└── contract/
    └── memberApi.contract.test.ts
```

**Structure Decision**: Web application structure selected. This feature adds member management APIs and UI components to the existing Next.js App Router application from 001-family-inventory-mvp.

## Phase 0 Research Items (NEEDS CLARIFICATION)

The following items require clarification before proceeding to Phase 1 design:

### 1. Invitation Entity Data Model
- **Question**: What is the PK/SK structure for Invitation records in DynamoDB?
- **Options**:
  - Option A: PK=`FAMILY#{familyId}`, SK=`INVITATION#{invitationId}`
  - Option B: PK=`INVITATION#{token}`, SK=`INVITATION#{token}` (for token lookup)
- **Impact**: Affects access patterns for listing pending invitations and accepting by token

### 2. Invitation Token Generation and Storage
- **Question**: How should secure invitation tokens be generated and stored?
- **Options**:
  - Option A: UUID v4 stored in DynamoDB with TTL
  - Option B: JWT with expiration claim (stateless)
  - Option C: Cryptographically signed token with embedded data
- **Impact**: Affects security, scalability, and token validation approach

### 3. Invitation Expiration Mechanism
- **Question**: Should invitation expiration use DynamoDB TTL or application-level checks?
- **Options**:
  - Option A: DynamoDB TTL (automatic deletion after expiration)
  - Option B: Application-level check (keeps expired records for audit)
- **Impact**: Affects audit trail and cleanup strategy

### 4. Cognito User Creation Flow
- **Question**: How should new users be created in Cognito when accepting invitations?
- **Options**:
  - Option A: Admin creates user with temporary password, user sets password on first login
  - Option B: User self-registers with email verification, then linked to invitation
- **Impact**: Affects user experience and security flow

### 5. Email Service Configuration
- **Question**: What AWS SES configuration is needed for invitation emails?
- **Needs**:
  - SES domain verification status
  - Email template design
  - Sender email address
- **Impact**: Affects email deliverability and branding

### 6. Self-Removal Policy
- **Question**: Can an admin remove themselves from the family?
- **Options**:
  - Option A: Yes, if other admins exist
  - Option B: No, admins cannot remove themselves
- **Impact**: Affects validation logic and UI

### 7. Concurrent Member Removal
- **Question**: How should optimistic locking be implemented for member operations?
- **Options**:
  - Option A: Version attribute with conditional writes
  - Option B: Last-write-wins with UI feedback
- **Impact**: Affects data consistency and conflict resolution

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| None | N/A | N/A |

**Note**: No constitution violations identified. All requirements align with established patterns.

## Post-Design Constitution Check

*GATE: Re-evaluated after Phase 1 design completion.*

### Verification Against Constitution v1.1.0

| Principle | Requirement | Status | Evidence |
|-----------|-------------|--------|----------|
| **I. TypeScript Type Safety** | All code in TypeScript 5 strict mode, no implicit `any` | ✅ PASS | Zod schemas in data-model.md (lines 406-531) with explicit types for all entities |
| **I. TypeScript Type Safety** | All function parameters and return types explicitly typed | ✅ PASS | quickstart.md examples show typed functions (lines 218-264) |
| **II. Serverless Architecture** | All backend logic as AWS Lambda functions | ✅ PASS | SAM template in quickstart.md defines 9 Lambda functions (lines 639-803) |
| **II. Serverless Architecture** | DynamoDB single-table design | ✅ PASS | Invitation entity uses PK=`FAMILY#{familyId}`, SK=`INVITATION#{invitationId}` (data-model.md lines 37-40) |
| **II. Serverless Architecture** | Lambda functions stateless and idempotent | ✅ PASS | Optimistic locking pattern ensures idempotency (research.md lines 335-409) |
| **III. Testing Excellence** | Test-first development, 80% coverage for critical paths | ✅ PASS | Test structure and examples in quickstart.md (lines 429-635) |
| **III. Testing Excellence** | Jest and React Testing Library | ✅ PASS | Mock patterns and test examples use Jest (quickstart.md lines 432-617) |
| **IV. AWS Best Practices** | AWS SDK v3 with modular imports | ✅ PASS | Modular imports shown: `@aws-sdk/client-secrets-manager`, `@aws-sdk/lib-dynamodb`, etc. |
| **IV. AWS Best Practices** | IAM least-privilege principle | ✅ PASS | Each Lambda has specific policies in SAM template (quickstart.md lines 639-803) |
| **IV. AWS Best Practices** | Secrets in Secrets Manager or Parameter Store | ✅ PASS | HMAC secret in Secrets Manager, templates in Parameter Store (research.md lines 98-103, 227-282) |
| **IV. AWS Best Practices** | Avoid DynamoDB scans | ✅ PASS | All access patterns use Query operations (data-model.md lines 350-368) |
| **V. Security First** | All user inputs validated and sanitized | ✅ PASS | Zod validation schemas for all API inputs (data-model.md lines 451-508) |
| **V. Security First** | Authentication and authorization for protected resources | ✅ PASS | JWT auth via Cognito, role-based access control (api-spec.yaml lines 11-28) |
| **V. Security First** | Secrets never committed to version control | ✅ PASS | Environment variables and Secrets Manager used (quickstart.md lines 43-52) |
| **VI. Performance Optimization** | Lambda cold start optimization | ✅ PASS | Secret caching in global scope (quickstart.md lines 224-234), modular SDK imports |
| **VI. Performance Optimization** | DynamoDB queries optimized | ✅ PASS | GSI1 for O(1) token lookup (data-model.md lines 374-401) |
| **VII. Code Organization** | Next.js App Router conventions | ✅ PASS | Project structure follows conventions (quickstart.md lines 83-160) |
| **VII. Code Organization** | Business logic separated from presentation | ✅ PASS | Services layer separate from handlers (quickstart.md lines 109-124) |

### Post-Design Gate Evaluation

**GATE STATUS: ✅ PASS** - All 18 constitution requirements verified against design artifacts.

### Generated Artifacts Summary

| Artifact | Path | Description |
|----------|------|-------------|
| Research | [`specs/003-member-management/research.md`](./research.md) | 7 research decisions with rationale |
| Data Model | [`specs/003-member-management/data-model.md`](./data-model.md) | Invitation entity + Member updates with TypeScript/Zod schemas |
| API Spec | [`specs/003-member-management/contracts/api-spec.yaml`](./contracts/api-spec.yaml) | OpenAPI 3.0 specification with 9 endpoints |
| Quickstart | [`specs/003-member-management/quickstart.md`](./quickstart.md) | Developer implementation guide with 9 sections |

### Recommendations for Implementation Phase

1. **Infrastructure First**: Set up Secrets Manager secret and Parameter Store values before implementing Lambda functions
2. **Token Service Priority**: Implement and thoroughly test token generation/validation before invitation flow
3. **Test Coverage**: Ensure 80%+ coverage on critical paths:
   - Token validation logic
   - Last admin protection
   - Optimistic locking conflict handling
4. **SES Configuration**: Verify domain and request production access early to avoid email delivery delays
5. **Migration Strategy**: Plan for adding `version` attribute to existing Member records (read-time migration recommended)

---

## Phase 1 Status

**✅ PHASE 1 COMPLETE** - Design phase finished on 2025-12-10

### Completed Deliverables

- [x] Phase 0 Research: All 7 clarification items resolved
- [x] Phase 1 Design: data-model.md with Invitation entity and Member updates
- [x] Phase 1 Design: API contracts (api-spec.yaml) with 9 endpoints
- [x] Phase 1 Design: quickstart.md developer guide
- [x] Post-Design Constitution Check: All 18 requirements verified

### Next Steps

1. **Phase 2 Tasks**: Run `/speckit.tasks` to generate detailed task breakdown
2. **Implementation**: Follow quickstart.md implementation order
3. **Quality Gates**: Use checklists/requirements.md for validation
