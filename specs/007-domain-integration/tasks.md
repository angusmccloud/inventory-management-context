# Tasks: Live Domain Integration for Inventory HQ

**Feature**: 007-domain-integration  
**Date**: December 9, 2025  
**Input**: Design documents from `/specs/007-domain-integration/`  
**Prerequisites**: plan.md ✓, spec.md ✓

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[US1]**: User Story 1 - Application Displays Custom Domain and Branding (Priority: P1)
- **[US2]**: User Story 2 - Email Communications Use Custom Domain (Priority: P1)
- **[US3]**: User Story 3 - Application Hosting Uses Custom Domain (Priority: P2)
- Include exact file paths in descriptions

## Path Conventions

Based on plan.md project structure:
- **Frontend**: `app/` (Next.js App Router)
- **Backend**: `src/services/`, `src/lib/`, `src/config/`
- **Infrastructure**: `template.yaml`, environment configuration files
- **Tests**: `tests/unit/`, `tests/integration/`

---

## Phase 1: Setup (Infrastructure & Configuration)

**Purpose**: AWS infrastructure setup and DNS configuration required before any code implementation

- [X] T001 [P] Verify domain inventoryhq.io is accessible in Namecheap DNS management interface
- [X] T002 [P] Document DNS record requirements for inventoryhq.io (A, CNAME, MX records needed)
- [X] T003 Create domain configuration constants file in `src/config/domain.ts` with inventoryhq.io domain constant
- [X] T004 [P] Update environment configuration file `env.json` to set FRONTEND_URL to https://inventoryhq.io
- [X] T005 [P] Update environment configuration file `env.json` to set SES_FROM_EMAIL to noreply@inventoryhq.io

**Checkpoint**: Domain configuration ready - branding and email implementation can begin

---

## Phase 2: Foundational (Configuration & Utilities)

**Purpose**: Core configuration and utilities that MUST be complete before user story implementation

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

### Domain Configuration

- [X] T006 [P] Create domain configuration module in `src/config/domain.ts` with domain constants and helper functions
- [X] T007 [P] Create domain configuration unit tests in `tests/unit/config/domain.test.ts`

**Checkpoint**: Foundation ready - user story implementation can now begin

---

## Phase 3: User Story 1 - Application Displays Custom Domain and Branding (Priority: P1)

**Goal**: Users access the application via the custom domain (inventoryhq.io) and see "Inventory HQ" as the application name throughout the user interface, including page titles, navigation headers, and email communications.

**Independent Test**: Can be fully tested by accessing the application via the custom domain and verifying that all page titles display "Inventory HQ", navigation shows the branded name, and the domain appears correctly in the browser address bar.

### 3.1 Frontend Branding Updates

- [X] T008 [US1] Update root layout metadata title to "Inventory HQ" in `app/layout.tsx`
- [X] T009 [P] [US1] Update landing page hero heading to "Inventory HQ" in `app/page.tsx`
- [X] T010 [P] [US1] Update dashboard navigation header to display "Inventory HQ" in `app/dashboard/layout.tsx`
- [X] T011 [P] [US1] Search codebase for all instances of "Family Inventory Management" and "Family Inventory" and update to "Inventory HQ"
- [X] T012 [P] [US1] Verify all page-specific titles include "Inventory HQ" (check all page.tsx files in app directory)

### 3.2 Email Template Branding Updates

- [X] T013 [US1] Update invitation email template in Parameter Store at `/inventory-mgmt/{env}/email-templates/invitation` to include "Inventory HQ" branding
- [X] T014 [P] [US1] Update low-stock notification email template to include "Inventory HQ" branding (check Parameter Store or email service code)
- [X] T015 [P] [US1] Verify all email links in templates point to inventoryhq.io domain (update FRONTEND_URL references)

**Checkpoint**: US1 complete - branding is consistent across UI and email templates

---

## Phase 4: User Story 2 - Email Communications Use Custom Domain (Priority: P1)

**Goal**: All system-generated emails (authentication emails from Cognito, invitation emails, low-stock notifications) are sent from email addresses using the inventoryhq.io domain, ensuring consistent branding and improved deliverability.

**Independent Test**: Can be tested by triggering each email type (password reset, invitation, notification) and verifying that the sender address uses inventoryhq.io and emails are successfully delivered.

### 4.1 AWS SES Domain Configuration

- [X] T016 [US2] Verify AWS SES domain verification for inventoryhq.io in AWS Console
- [X] T017 [US2] Configure SPF record for inventoryhq.io in Namecheap DNS (add TXT record with AWS SES SPF value)
- [X] T018 [US2] Configure DKIM records for inventoryhq.io in Namecheap DNS (add CNAME records from AWS SES)
- [X] T019 [US2] Configure DMARC record for inventoryhq.io in Namecheap DNS (add TXT record with DMARC policy)
- [X] T020 [US2] Verify all email authentication records (SPF, DKIM, DMARC) validate correctly using DNS lookup tools

### 4.2 SES Email Sender Configuration

- [X] T021 [US2] Update email service sender address to use noreply@inventoryhq.io in `src/services/emailService.ts`
- [X] T022 [P] [US2] Update environment variable SES_FROM_EMAIL to noreply@inventoryhq.io in all environment files
- [X] T023 [P] [US2] Update invitation email service to use inventoryhq.io domain sender address in `src/services/emailService.ts`
- [X] T024 [P] [US2] Update low-stock notification email service to use inventoryhq.io domain sender address (check notification service implementation)

### 4.3 Cognito Email Configuration

- [X] T025 [US2] Configure Cognito User Pool to use custom domain for email sending (inventoryhq.io)
- [X] T026 [US2] Verify Cognito email configuration uses SES verified domain inventoryhq.io
- [X] T027 [P] [US2] Update Cognito email templates (if customizable) to include "Inventory HQ" branding
- [ ] T028 [P] [US2] Test Cognito password reset email to verify sender address uses inventoryhq.io domain

### 4.4 Email Link Updates

- [X] T029 [US2] Update all email links in invitation templates to use inventoryhq.io domain
- [X] T030 [P] [US2] Update all email links in notification templates to use inventoryhq.io domain
- [X] T031 [P] [US2] Update FRONTEND_URL references in email service to use inventoryhq.io domain

### 4.5 Email Testing

- [ ] T032 [US2] Test invitation email delivery and verify sender address is noreply@inventoryhq.io
- [ ] T033 [P] [US2] Test low-stock notification email delivery and verify sender address uses inventoryhq.io domain
- [ ] T034 [P] [US2] Test Cognito password reset email and verify sender address uses inventoryhq.io domain
- [ ] T035 [US2] Verify email deliverability rate remains above 95% after domain migration

**Checkpoint**: US2 complete - all emails sent from inventoryhq.io domain with proper authentication records

---

## Phase 5: User Story 3 - Application Hosting Uses Custom Domain (Priority: P2)

**Goal**: The application is accessible via the custom domain (inventoryhq.io) through AWS/Amplify hosting, with proper SSL certificate configuration and domain routing.

**Independent Test**: Can be tested by accessing inventoryhq.io in a browser and verifying the application loads correctly with a valid SSL certificate, and all API calls work correctly with the custom domain.

### 5.1 DNS Configuration for Hosting

- [ ] T036 [US3] Configure A record or CNAME record in Namecheap DNS to point inventoryhq.io to AWS hosting (Amplify or CloudFront)
- [ ] T037 [US3] Configure www.inventoryhq.io CNAME record to redirect to inventoryhq.io (or point to same hosting)
- [ ] T038 [P] [US3] Document DNS record values needed for Namecheap to AWS routing (for future implementation)

### 5.2 SSL Certificate Configuration

**Note**: AWS Amplify automatically provisions and manages SSL certificates. No manual template.yaml configuration needed.

- [ ] T039 [US3] Configure custom domain in Amplify Console for inventoryhq.io
- [ ] T040 [US3] Add DNS validation records from Amplify to Namecheap DNS (MANUAL - only required step)
- [ ] T041 [US3] Verify SSL certificate is issued and active in Amplify Console
- [ ] T042 [P] [US3] Verify www.inventoryhq.io is included in Amplify domain configuration

### 5.3 AWS Amplify Hosting Configuration

**Note**: AWS Amplify automatically handles CloudFront distribution and S3 bucket creation.

- [ ] T043 [US3] Connect frontend repository to AWS Amplify
- [ ] T044 [US3] Configure Amplify build settings for Next.js
- [ ] T045 [US3] Add custom domain inventoryhq.io in Amplify Console
- [ ] T046 [P] [US3] Verify Amplify provides DNS records for domain configuration

### 5.4 API Domain Configuration

**Note**: API Gateway custom domain MUST be configured via template.yaml using AWS::ApiGateway::DomainName resource.

- [X] T047 [US3] Verify API Gateway or Lambda function URLs work correctly with custom domain
- [X] T048 [US3] Update CORS configuration to allow requests from inventoryhq.io domain
- [X] T049 [P] [US3] Update API client configuration in frontend to use inventoryhq.io domain for API calls

### 5.5 Domain Routing Testing

- [ ] T050 [US3] Test application loads successfully via inventoryhq.io in browser
- [ ] T051 [US3] Verify SSL certificate displays correctly (valid certificate for inventoryhq.io)
- [ ] T052 [US3] Test API calls work correctly with custom domain configuration
- [ ] T053 [US3] Verify domain remains consistent during page navigation (no redirects to other domains)
- [ ] T054 [US3] Test www.inventoryhq.io redirects appropriately (to non-www or loads correctly)
- [ ] T055 [US3] Verify application loads within 3 seconds for 95th percentile of requests (SC-007)

**Checkpoint**: US3 complete - application accessible via inventoryhq.io with valid SSL certificate

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final validation, documentation, and backward compatibility

### 6.1 Backward Compatibility

- [ ] T056 Configure redirects from old domain to inventoryhq.io (if old domain exists)
- [X] T057 [P] Update any hardcoded domain references in codebase to use domain configuration constants
- [ ] T058 [P] Verify backward compatibility during domain transition period (old bookmarks still work via redirects)

### 6.2 Documentation

- [ ] T059 Document Namecheap to AWS DNS routing process in feature documentation
- [ ] T060 [P] Document required DNS records for domain routing (A, CNAME, TXT records)
- [ ] T061 [P] Document Amplify hosting configuration requirements for custom domain

### 6.3 Final Validation

- [ ] T062 Verify 100% of page titles display "Inventory HQ" or include it in the title (SC-001)
- [ ] T063 Verify 100% of system-generated emails are sent from inventoryhq.io domain addresses (SC-002)
- [ ] T064 Verify all email authentication records (SPF, DKIM, DMARC) validate successfully for inventoryhq.io (SC-005)
- [ ] T065 Verify zero broken links or API calls after domain configuration (SC-006)
- [ ] T066 Verify users report consistent "Inventory HQ" branding across all touchpoints (UI and emails) (SC-008)

**Checkpoint**: Feature complete - all success criteria met

---

## Dependencies

### User Story Completion Order

1. **Phase 1 (Setup)** → Must complete before all user stories
2. **Phase 2 (Foundational)** → Must complete before all user stories
3. **Phase 3 (US1 - Branding)** → Can be completed independently, but should be done first for branding consistency
4. **Phase 4 (US2 - Email Domain)** → Depends on Phase 1 (DNS configuration), can run parallel with US1 after Phase 2
5. **Phase 5 (US3 - Hosting)** → Depends on Phase 1 (DNS configuration), should be done after US1 and US2 for complete domain integration
6. **Phase 6 (Polish)** → Depends on all user stories being complete

### Parallel Execution Opportunities

**Within US1 (Branding)**:
- T009, T010, T011, T012 can run in parallel (different files)
- T014, T015 can run in parallel (different templates)

**Within US2 (Email Domain)**:
- T022, T023, T024 can run in parallel (different services)
- T027, T028 can run in parallel (Cognito configuration)
- T030, T031 can run in parallel (different templates)
- T033, T034 can run in parallel (different email types)

**Within US3 (Hosting)**:
- T037, T038 can run in parallel (DNS and documentation)
- T042, T046 can run in parallel (SSL and SAM template)
- T048, T049 can run in parallel (CORS and API client)

**Cross-Phase Parallel**:
- US1 branding tasks (T008-T015) can run parallel with US2 email configuration tasks (T016-T031) after Phase 2 is complete
- US3 hosting tasks can start after DNS configuration (T036) is complete, even while US1/US2 are in progress

## Implementation Strategy

### MVP Scope (Minimum Viable Product)

**Recommended MVP**: Complete User Stories 1 and 2 (P1 priorities)
- US1: Branding updates ensure consistent "Inventory HQ" identity
- US2: Email domain configuration ensures professional email delivery

**US3 (Hosting)** can be implemented in a follow-up phase, allowing the application to function with branding and email while domain hosting is configured.

### Incremental Delivery

1. **Week 1**: Phase 1-2 (Setup + Foundational) + US1 (Branding)
2. **Week 2**: US2 (Email Domain Configuration)
3. **Week 3**: US3 (Hosting) + Phase 6 (Polish)

### Risk Mitigation

- **Email Deliverability**: Test email delivery thoroughly before full rollout (T032-T035)
- **DNS Propagation**: Allow 24-48 hours for DNS changes to propagate globally
- **SSL Certificate**: Request certificate early as validation can take time
- **Backward Compatibility**: Implement redirects before removing old domain access

---

## Summary

**Total Tasks**: 66 tasks
- **Phase 1 (Setup)**: 5 tasks
- **Phase 2 (Foundational)**: 2 tasks
- **Phase 3 (US1 - Branding)**: 8 tasks
- **Phase 4 (US2 - Email Domain)**: 20 tasks
- **Phase 5 (US3 - Hosting)**: 20 tasks
- **Phase 6 (Polish)**: 11 tasks

**Parallel Opportunities**: 15+ tasks can run in parallel across different phases

**MVP Scope**: User Stories 1 and 2 (P1 priorities) - 35 tasks total

**Independent Test Criteria**:
- **US1**: Access application via inventoryhq.io, verify "Inventory HQ" branding in all UI elements
- **US2**: Trigger each email type, verify sender uses inventoryhq.io domain
- **US3**: Access inventoryhq.io, verify SSL certificate and application loads correctly

