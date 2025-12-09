# Tasks: Family Inventory Management System MVP

**Feature**: 001-family-inventory-mvp
**Date**: 2025-12-08
**Updated**: 2025-12-09
**Input**: Design documents from `/specs/001-family-inventory-mvp/`

> **📋 Scope Note**: This task list has been reduced to focus on User Stories 1 and 2 only (Family/Inventory Management and Low Stock Notifications). Tasks for User Stories 3-7 (Phases 5-10) have been moved to separate feature specifications. See [spec.md](./spec.md#related-features) for the list of related features.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `- [ ] [ID] [P?] [Story?] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

**Backend Setup:**

- [X] T001 [P] Create backend project structure: `inventory-management-backend/` with src/, tests/, template.yaml
- [X] T002 [P] Initialize backend package.json with TypeScript 5, AWS SDK v3, Jest dependencies
- [X] T003 [P] Configure TypeScript strict mode in inventory-management-backend/tsconfig.json
- [X] T004 [P] Configure Jest for backend in inventory-management-backend/jest.config.js
- [X] T005 [P] Setup ESLint and Prettier in inventory-management-backend/.eslintrc.json

**Frontend Setup:**

- [X] T006 [P] Create frontend project structure: `inventory-management-frontend/` with app/, components/, lib/, public/
- [X] T007 [P] Initialize frontend package.json with Next.js 16, React 18, Vite, TypeScript dependencies
- [X] T008 [P] Configure Vite build tool in inventory-management-frontend/vite.config.ts (N/A - Next.js uses built-in build system)
- [X] T009 [P] Configure TypeScript strict mode in inventory-management-frontend/tsconfig.json
- [X] T010 [P] Configure Jest + React Testing Library in inventory-management-frontend/jest.config.js
- [X] T011 [P] Setup ESLint and Prettier in inventory-management-frontend/.eslintrc.json

**Environment Configuration:**

- [X] T012 [P] Create backend environment template in inventory-management-backend/.env.example
- [X] T013 [P] Create frontend environment template in inventory-management-frontend/.env.example

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

**Backend Foundation:**

- [X] T014 Create AWS SAM template in inventory-management-backend/template.yaml with DynamoDB table definition
- [X] T015 [P] Define shared TypeScript types in inventory-management-backend/src/types/entities.ts
- [X] T016 [P] Define Zod validation schemas in inventory-management-backend/src/types/schemas.ts
- [X] T017 [P] Create DynamoDB client utility in inventory-management-backend/src/lib/dynamodb.ts
- [X] T018 [P] Create UUID generator utility in inventory-management-backend/src/lib/uuid.ts
- [X] T019 [P] Create structured logging utility in inventory-management-backend/src/lib/logger.ts
- [X] T020 [P] Create API response helpers in inventory-management-backend/src/lib/response.ts
- [X] T021 Implement Lambda authorizer for Cognito JWT validation and DynamoDB member lookup in inventory-management-backend/src/handlers/authorizer.ts
- [X] T022 Add Lambda authorizer to SAM template in inventory-management-backend/template.yaml

**Frontend Foundation:**

- [X] T023 [P] Create shared TypeScript types in inventory-management-frontend/types/entities.ts
- [X] T024 [P] Create API client base in inventory-management-frontend/lib/api-client.ts
- [X] T025 [P] Create authentication helpers in inventory-management-frontend/lib/auth.ts
- [X] T026 [P] Create Zod validation utilities in inventory-management-frontend/lib/validation.ts
- [X] T027 Create root layout component in inventory-management-frontend/app/layout.tsx
- [X] T028 Create landing page in inventory-management-frontend/app/page.tsx

**Infrastructure Setup:**

- [ ] T029 Deploy backend infrastructure with `sam deploy --guided` and note outputs
- [ ] T030 Configure Cognito User Pool for authentication (email/password)
- [ ] T031 Verify SES sender email address for notifications
- [X] T032 **[CRITICAL]** Refactor Lambda authorizer to query DynamoDB for member info instead of using Cognito custom attributes in inventory-management-backend/src/handlers/authorizer.ts

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Adult Creates Family and Manages Core Inventory (Priority: P1) 🎯 MVP

**Goal**: Enable adults to set up family accounts, add inventory items with locations/thresholds, and track quantities

**Independent Test**: Create a family account, add 5-10 inventory items with locations and thresholds, adjust quantities, verify all items display correctly with accurate quantities

**Backend Implementation:**

- [X] T033 [P] [US1] Create Family model with DynamoDB operations in inventory-management-backend/src/models/family.ts
- [X] T034 [P] [US1] Create Member model with DynamoDB operations in inventory-management-backend/src/models/member.ts
- [X] T035 [P] [US1] Create InventoryItem model with DynamoDB operations in inventory-management-backend/src/models/inventory.ts
- [X] T036 [P] [US1] Create StorageLocation model with DynamoDB operations in inventory-management-backend/src/models/location.ts
- [X] T037 [P] [US1] Create Store model with DynamoDB operations in inventory-management-backend/src/models/store.ts
- [X] T038 [US1] Create FamilyService business logic in inventory-management-backend/src/services/familyService.ts
- [X] T039 [US1] Create InventoryService business logic in inventory-management-backend/src/services/inventoryService.ts
- [X] T040 [P] [US1] Implement POST /families handler in inventory-management-backend/src/handlers/createFamily.ts
- [X] T041 [P] [US1] Implement GET /families/{familyId} handler in inventory-management-backend/src/handlers/getFamily.ts
- [X] T042 [P] [US1] Implement PUT /families/{familyId} handler in inventory-management-backend/src/handlers/updateFamily.ts
- [X] T043 [P] [US1] Implement POST /families/{familyId}/inventory handler in inventory-management-backend/src/handlers/createInventoryItem.ts
- [X] T044 [P] [US1] Implement GET /families/{familyId}/inventory handler in inventory-management-backend/src/handlers/listInventoryItems.ts
- [X] T045 [P] [US1] Implement GET /families/{familyId}/inventory/{itemId} handler in inventory-management-backend/src/handlers/getInventoryItem.ts
- [X] T046 [P] [US1] Implement PUT /families/{familyId}/inventory/{itemId} handler in inventory-management-backend/src/handlers/updateInventoryItem.ts
- [X] T047 [P] [US1] Implement PATCH /families/{familyId}/inventory/{itemId}/quantity handler in inventory-management-backend/src/handlers/adjustInventoryQuantity.ts
- [X] T048 [P] [US1] Implement POST /families/{familyId}/inventory/{itemId}/archive handler in inventory-management-backend/src/handlers/archiveInventoryItem.ts
- [X] T049 [P] [US1] Implement DELETE /families/{familyId}/inventory/{itemId} handler in inventory-management-backend/src/handlers/deleteInventoryItem.ts
- [X] T050 [US1] Add all US1 API Gateway routes and Lambda functions to inventory-management-backend/template.yaml
- [ ] T051 [US1] Deploy backend updates with `sam build && sam deploy`

**Frontend Implementation:**

- [X] T052 [P] [US1] Create authentication pages in inventory-management-frontend/app/(auth)/login/page.tsx
- [X] T053 [P] [US1] Create family creation form component in inventory-management-frontend/components/family/CreateFamilyForm.tsx
- [X] T054 [P] [US1] Create inventory list component in inventory-management-frontend/components/inventory/InventoryList.tsx
- [X] T055 [P] [US1] Create add inventory item form in inventory-management-frontend/components/inventory/AddItemForm.tsx
- [X] T056 [P] [US1] Create edit inventory item form in inventory-management-frontend/components/inventory/EditItemForm.tsx
- [X] T057 [P] [US1] Create adjust quantity component in inventory-management-frontend/components/inventory/AdjustQuantity.tsx
- [X] T058 [US1] Create dashboard layout in inventory-management-frontend/app/dashboard/layout.tsx
- [X] T059 [US1] Create dashboard home page in inventory-management-frontend/app/dashboard/page.tsx
- [X] T060 [US1] Create inventory page in inventory-management-frontend/app/dashboard/inventory/page.tsx
- [X] T061 [US1] Create family API client methods in inventory-management-frontend/lib/api/families.ts
- [X] T062 [US1] Create inventory API client methods in inventory-management-frontend/lib/api/inventory.ts
- [X] T063 [US1] Build and test frontend locally with `npm run dev`

**Checkpoint**: At this point, User Story 1 should be fully functional - can create families, add/edit/archive inventory items, adjust quantities

---

## Phase 4: User Story 2 - Low Stock Notifications Alert Family (Priority: P1)

**Goal**: Automatically generate notifications when inventory falls below thresholds and send emails to admins

**Independent Test**: Set an item's quantity below its threshold, verify notification appears in UI and email is sent to admin user

**Backend Implementation:**

- [X] T064 [P] [US2] Create Notification model with DynamoDB operations in inventory-management-backend/src/models/notification.ts
- [X] T065 [US2] Create NotificationService business logic in inventory-management-backend/src/services/notificationService.ts
- [X] T066 [US2] Create EmailService for SES integration in inventory-management-backend/src/services/emailService.ts
- [X] T067 [US2] Update InventoryService to trigger notifications on low stock in inventory-management-backend/src/services/inventoryService.ts
- [X] T068 [P] [US2] Implement GET /families/{familyId}/notifications handler in inventory-management-backend/src/handlers/listNotifications.ts
- [X] T069 [P] [US2] Implement POST /families/{familyId}/notifications/{notificationId}/acknowledge handler in inventory-management-backend/src/handlers/acknowledgeNotification.ts
- [X] T070 [P] [US2] Create SES email template for low-stock notifications in inventory-management-backend/src/templates/low-stock-email.html
- [X] T071 [US2] Add notification routes to inventory-management-backend/template.yaml
- [X] T072 [US2] Add SES permissions to Lambda execution role in inventory-management-backend/template.yaml
- [ ] T073 [US2] Deploy backend updates with `sam build && sam deploy`

**Frontend Implementation:**

- [X] T074 [P] [US2] Create notification list component in inventory-management-frontend/components/notifications/NotificationList.tsx
- [X] T075 [P] [US2] Create notification item component in inventory-management-frontend/components/notifications/NotificationItem.tsx
- [X] T076 [US2] Create notifications page in inventory-management-frontend/app/dashboard/notifications/page.tsx
- [X] T077 [US2] Create notification API client methods in inventory-management-frontend/lib/api/notifications.ts
- [X] T078 [US2] Add notification badge to dashboard layout in inventory-management-frontend/app/dashboard/layout.tsx
- [X] T079 [US2] Build and test frontend locally with `npm run dev`

**Checkpoint**: At this point, User Stories 1 AND 2 work independently - low-stock items trigger notifications with emails. **This completes the reduced MVP scope.**

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Story 1 (Phase 3)**: Depends on Foundational phase completion
- **User Story 2 (Phase 4)**: Depends on User Story 1 completion (notifications require inventory items)

### User Story Dependencies

- **User Story 1 (P1)**: Foundation → US1 (Core inventory management - NO dependencies on other stories)
- **User Story 2 (P1)**: Foundation → US1 → US2 (Notifications require inventory items)

### Within Each User Story

- Backend models before services
- Services before handlers
- Handlers before SAM template updates
- SAM template before deployment
- Frontend components can be built in parallel
- Frontend pages assembled after components
- API client methods alongside pages

### Parallel Opportunities

**Phase 1 (Setup)**: All tasks marked [P] can run in parallel (T001-T013 simultaneously)

**Phase 2 (Foundational)**: Backend foundation tasks (T015-T020) and frontend foundation tasks (T023-T028) can run in parallel

**Phase 3 (US1)**:
- Backend models (T033-T037) can run in parallel
- Backend handlers (T040-T050) can run in parallel after services complete
- Frontend components (T053-T058) can run in parallel
- Frontend and backend work can proceed simultaneously

**Phase 4 (US2)**: Same parallel patterns apply

---

## Implementation Strategy

### Reduced MVP Scope (User Stories 1 and 2 Only)

1. ✅ Complete Phase 1: Setup
2. ✅ Complete Phase 2: Foundational (CRITICAL - blocks all stories) - *Pending deployment tasks T029-T031*
3. ✅ Complete Phase 3: User Story 1 (Family and Inventory Management) - *Pending deployment task T051*
4. ✅ Complete Phase 4: User Story 2 (Notifications) - *Pending deployment task T073*
5. **NEXT**: Deploy to production (T029-T031, T051, T073)

**Reduced MVP = US1 + US2** provides core value:
- Create families and manage inventory
- Get low-stock alerts via UI and email

### Future Features (Separate Specifications)

The following user stories have been moved to separate feature specifications:

- **US3 (Shopping Lists)** → `002-shopping-lists`
- **US4 (Member Management)** → `003-member-management`
- **US5 (Suggester Workflow)** → `004-suggester-workflow`
- **US6 (Reference Data)** → `005-reference-data`
- **US7 (API Integration)** → `006-api-integration`

See [spec.md](./spec.md#related-features) for details on related features.

---

## Task Summary

**Total Tasks (This Specification)**: 79
**Task Breakdown by Phase**:
- Phase 1 (Setup): 13 tasks ✅ Complete
- Phase 2 (Foundational): 19 tasks (16 complete, 3 pending deployment)
- Phase 3 (US1 - P1): 31 tasks (30 complete, 1 pending deployment)
- Phase 4 (US2 - P1): 16 tasks (15 complete, 1 pending deployment)

**Completion Status**:
- ✅ 74 tasks complete
- ⏳ 5 tasks pending (all deployment-related: T029, T030, T031, T051, T073)

**Parallel Opportunities**: Tasks marked [P] can run in parallel with others in their phase

**Independent Test Criteria**: Each user story phase includes specific test criteria for validation

**Tasks Moved to Other Specifications**: 93 tasks (T080-T172) have been moved to separate feature specifications for US3-US7

---

## Notes

- [P] tasks work on different files with no dependencies - can run in parallel
- [Story] label maps task to specific user story for traceability and independent testing
- Each user story is independently completable and testable
- Backend tasks must complete deployment before frontend can test against real API
- Frontend can use mocked API during parallel development
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently before proceeding
- All file paths are absolute or relative to repository roots
- Tests are NOT included (not explicitly requested in spec) but can be added if TDD is desired

---

## Related Feature Specifications

Tasks for the following user stories have been moved to separate specifications:

| Original Phase | User Story | New Specification | Original Tasks |
|----------------|------------|-------------------|----------------|
| Phase 5 | US3 - Shopping Lists | `002-shopping-lists` | T080-T094 |
| Phase 6 | US4 - Member Management | `003-member-management` | T095-T107 |
| Phase 7 | US5 - Suggester Workflow | `004-suggester-workflow` | T108-T122 |
| Phase 8 | US6 - Reference Data | `005-reference-data` | T123-T141 |
| Phase 9 | US7 - API Integration | `006-api-integration` | T142-T149 |
| Phase 10 | Polish & Cross-Cutting | Various specs | T150-T172 |

