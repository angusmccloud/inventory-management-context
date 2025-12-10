# Implementation Plan: Reference Data Management

**Branch**: `005-reference-data` | **Date**: 2025-12-10 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/005-reference-data/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Enable adults to create and manage standardized storage locations (pantry, garage, fridge) and store/vendor lists that serve as the foundation for inventory item configuration. This feature provides a dedicated management interface for reference data, ensuring consistent data entry and improved user experience when working with inventory items and shopping lists. Technical approach uses DynamoDB single-table design with optimistic locking for concurrent edit handling, and role-based access control to restrict modifications to adults only.

## Technical Context

**Language/Version**: TypeScript 5 with strict mode enabled
**Primary Dependencies**: Next.js 16 (App Router), AWS SDK v3, Zod (validation)
**Storage**: Amazon DynamoDB (single-table design, reusing `InventoryManagement` table from 001-family-inventory-mvp)
**Testing**: Jest and React Testing Library (80% coverage required for critical paths)
**Target Platform**: AWS Lambda (serverless), Web browser (frontend)
**Project Type**: Web Application
**Performance Goals**: Reference data creation in under 15 seconds per entry (SC-001), changes propagate within 1 second (SC-005)
**Constraints**: Stateless Lambda functions, idempotent operations, least-privilege IAM, role-based access control (adults only)
**Scale/Scope**: < 100 storage locations and stores per family (typical)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### NON-NEGOTIABLE Requirements (from constitution v1.1.0)

| Principle | Requirement | Status | Notes |
|-----------|-------------|--------|-------|
| **I. TypeScript Type Safety** | All code in TypeScript 5 strict mode, no implicit `any` | ✅ PASS | Will use Zod schemas for StorageLocation and Store entities |
| **II. Serverless Architecture** | All backend logic as AWS Lambda functions | ✅ PASS | Reference data management APIs via Lambda |
| **II. Serverless Architecture** | DynamoDB single-table design | ✅ PASS | Reusing `InventoryManagement` table |
| **II. Serverless Architecture** | Lambda functions stateless and idempotent | ✅ PASS | Reference data operations designed for idempotency |
| **III. Testing Excellence** | Test-first development, 80% coverage for critical paths | ✅ PASS | Will require tests for all reference data management logic |
| **III. Testing Excellence** | Jest and React Testing Library | ✅ PASS | Standard testing frameworks |
| **IV. AWS Best Practices** | AWS SDK v3 with modular imports | ✅ PASS | Tree-shaking for DynamoDB client |
| **IV. AWS Best Practices** | IAM least-privilege principle | ✅ PASS | Separate roles for reference data management Lambdas |
| **IV. AWS Best Practices** | Avoid DynamoDB scans | ✅ PASS | Query operations for efficient reference data access |
| **V. Security First** | All user inputs validated and sanitized | ✅ PASS | Zod validation for all API inputs |
| **V. Security First** | Authentication and authorization for protected resources | ✅ PASS | Lambda authorizer validates JWT and role (adults only) |
| **VI. Performance Optimization** | Lambda cold start optimization | ✅ PASS | Minimal dependencies, modular SDK imports |
| **VII. Code Organization** | Next.js App Router conventions | ✅ PASS | API routes in `app/api/` directory |

### Gate Evaluation

**GATE STATUS: ✅ PASS** - No constitution violations identified. All requirements align with constitution principles.

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
# [REMOVE IF UNUSED] Option 1: Single project (DEFAULT)
src/
├── models/
├── services/
├── cli/
└── lib/

tests/
├── contract/
├── integration/
└── unit/

# [REMOVE IF UNUSED] Option 2: Web application (when "frontend" + "backend" detected)
backend/
├── src/
│   ├── models/
│   ├── services/
│   └── api/
└── tests/

frontend/
├── src/
│   ├── components/
│   ├── pages/
│   └── services/
└── tests/

# [REMOVE IF UNUSED] Option 3: Mobile + API (when "iOS/Android" detected)
api/
└── [same as backend above]

ios/ or android/
└── [platform-specific structure: feature modules, UI flows, platform tests]
```

**Structure Decision**: [Document the selected structure and reference the real
directories captured above]

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| [e.g., 4th project] | [current need] | [why 3 projects insufficient] |
| [e.g., Repository pattern] | [specific problem] | [why direct DB access insufficient] |
