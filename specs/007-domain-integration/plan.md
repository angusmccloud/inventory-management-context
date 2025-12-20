# Implementation Plan: Live Domain Integration for Inventory HQ

**Branch**: `007-domain-integration` | **Date**: December 9, 2025 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/007-domain-integration/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Integrate the custom domain inventoryhg.io across all user-facing touchpoints, including updating the application name to "Inventory HQ" throughout the UI, configuring AWS SES and Cognito to send emails from the custom domain, and setting up domain hosting via AWS/Amplify. This feature establishes professional branding and improves email deliverability by using a verified custom domain for all communications.

**Key Changes from Spec 003**: Email domain configuration tasks (SES domain verification, sender email configuration) that were planned for spec 003-member-management are now included in this spec 007, as they are essential for the domain integration feature.

## Technical Context

**Language/Version**: TypeScript 5 with strict mode enabled  
**Primary Dependencies**: 
- Frontend: Next.js 16 (App Router), React 19
- Backend: AWS SDK v3 (SES, Cognito, Certificate Manager), AWS SAM
- Infrastructure: AWS Amplify (or S3 + CloudFront), AWS Certificate Manager, AWS Route 53 (for DNS)
- Email: AWS SES (Simple Email Service), AWS Cognito (for authentication emails)

**Storage**: No new storage requirements (uses existing DynamoDB for application data)  
**Testing**: Jest and React Testing Library (80% coverage required for critical paths)  
**Target Platform**: Web browsers (Chrome, Firefox, Safari, Edge) with serverless backend on AWS Lambda  
**Project Type**: Web application (frontend + backend serverless APIs)  
**Performance Goals**: 
- Application loads via custom domain within 3 seconds for 95th percentile (SC-007)
- Email deliverability rate remains above 95% after domain migration (SC-003)
- SSL certificate provisioning completes within 5 minutes

**Constraints**: 
- Must maintain backward compatibility during domain transition
- No changes to folder structure or routing paths (FR-004)
- All existing functionality must be preserved (FR-006)
- DNS propagation may take 24-48 hours globally
- Must support both www and non-www variants (FR-018)

**Scale/Scope**: 
- Single domain: inventoryhg.io
- All email types: Cognito authentication emails, invitation emails, low-stock notifications
- All UI pages: Update branding across entire application
- DNS records: SPF, DKIM, DMARC for email authentication

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### I. TypeScript Type Safety (NON-NEGOTIABLE)
- ✅ All code will be TypeScript 5 with strict mode
- ✅ No implicit `any` types allowed
- ✅ Explicit typing for all function parameters and return types
- ✅ Shared types in dedicated type definition files

**Status**: PASS - No new TypeScript code required, only configuration and branding updates

### II. Serverless Architecture
- ✅ Backend logic remains as AWS Lambda functions (no changes)
- ✅ Next.js App Router route handlers for API endpoints (no changes)
- ✅ DynamoDB single-table design pattern (no changes)
- ✅ Infrastructure defined in AWS SAM templates
- ✅ AWS Amplify or S3 + CloudFront for frontend hosting

**Status**: PASS - Serverless architecture maintained, only infrastructure configuration changes

### III. Testing Excellence (NON-NEGOTIABLE)
- ✅ Test-first development for email configuration changes
- ✅ Unit tests for email service configuration utilities
- ✅ Integration tests for domain routing and SSL certificate validation
- ✅ 80% code coverage for critical paths (email configuration, domain routing)
- ✅ Jest and React Testing Library
- ✅ Mock AWS services (SES, Cognito, Certificate Manager) in unit tests

**Status**: PASS - Testing approach maintained for new configuration code

### IV. AWS Best Practices
- ✅ AWS SDK v3 with modular imports
- ✅ CloudWatch for structured logging and monitoring
- ✅ Secrets in AWS Secrets Manager/Parameter Store (email configuration)
- ✅ IAM least-privilege principle for SES and Cognito access
- ✅ Resource tagging for cost tracking
- ✅ AWS Certificate Manager for SSL certificate management

**Status**: PASS - AWS best practices integrated

### V. Security First
- ✅ No secrets in version control
- ✅ DNS records (SPF, DKIM, DMARC) properly configured for email security
- ✅ SSL certificate properly configured for HTTPS
- ✅ CORS and security headers maintained
- ✅ Domain verification for email services (SES, Cognito)

**Status**: PASS - Security designed into domain and email configuration

### VI. Performance Optimization
- ✅ Next.js caching strategies maintained (SSG, ISR, SSR)
- ✅ SSL certificate caching via AWS Certificate Manager
- ✅ DNS caching at CDN level (CloudFront/Amplify)
- ✅ Email delivery optimization via SES domain reputation

**Status**: PASS - Performance considerations included

### VII. Code Organization
- ✅ Next.js 16 App Router directory structure (no changes)
- ✅ Business logic separated from presentation (no changes)
- ✅ Configuration files in appropriate locations (environment variables, SAM template)
- ✅ Infrastructure code in SAM template

**Status**: PASS - Organization follows Next.js conventions

**OVERALL GATE STATUS: ✅ PASS - All constitutional requirements satisfied**

---

## Project Structure

### Documentation (this feature)

```text
specs/007-domain-integration/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command) - minimal, no new entities
├── quickstart.md         # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
│   └── api-spec.yaml    # OpenAPI specification (if API changes needed)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
# Web application structure (frontend + backend)
# Frontend changes (branding updates)
app/
├── layout.tsx            # Update metadata.title to "Inventory HQ"
├── page.tsx              # Update landing page hero to "Inventory HQ"
└── dashboard/
    └── layout.tsx        # Update navigation header to "Inventory HQ"

# Backend changes (email configuration)
src/
├── services/
│   └── emailService.ts   # Update sender email to use inventoryhg.io domain
├── lib/
│   └── cognito/          # Cognito email configuration utilities (if needed)
└── config/
    └── domain.ts         # Domain configuration constants

# Infrastructure (SAM template)
template.yaml             # Add SES domain verification, Certificate Manager, Amplify config

# Environment configuration
env.json                  # Update FRONTEND_URL, SES_FROM_EMAIL to use inventoryhg.io
```

**Structure Decision**: Web application structure maintained. This feature primarily involves configuration changes (DNS, email services, branding) rather than new code. Frontend changes are limited to branding updates in existing files. Backend changes focus on email service configuration and environment variables.

## Phase 0 Research Items (NEEDS CLARIFICATION)

The following items require clarification before proceeding to Phase 1 design:

### 1. AWS Amplify vs S3 + CloudFront for Frontend Hosting
- **Question**: Which AWS service should be used for frontend hosting with custom domain?
- **Options**:
  - Option A: AWS Amplify (managed service, automatic SSL, easier custom domain setup)
  - Option B: S3 + CloudFront (more control, lower cost, manual SSL certificate setup)
- **Impact**: Affects infrastructure setup complexity and ongoing maintenance
- **Recommendation**: AWS Amplify for simplicity, but document S3 + CloudFront alternative

### 2. Email Sender Address Configuration
- **Question**: What specific email address should be used for sending emails from inventoryhg.io?
- **Options**:
  - Option A: noreply@inventoryhg.io (standard for automated emails)
  - Option B: notifications@inventoryhg.io (more descriptive)
  - Option C: support@inventoryhg.io (allows replies)
- **Impact**: Affects email deliverability and user experience
- **Recommendation**: noreply@inventoryhg.io for automated emails, with option to add support@ later

### 3. Cognito Custom Domain Email Configuration
- **Question**: How should Cognito be configured to send emails from inventoryhg.io domain?
- **Needs**:
  - Cognito custom domain setup process
  - Email template customization for Cognito emails
  - Integration with SES verified domain
- **Impact**: Affects authentication email branding and deliverability
- **Research Required**: AWS Cognito custom domain email configuration best practices

### 4. DNS Record Management Strategy
- **Question**: Should DNS records be managed via AWS Route 53 or Namecheap DNS?
- **Options**:
  - Option A: Transfer DNS to Route 53 (easier AWS integration, single management point)
  - Option B: Keep DNS at Namecheap, configure records there (simpler, no transfer needed)
- **Impact**: Affects DNS management complexity and AWS service integration
- **Recommendation**: Keep DNS at Namecheap initially (as per spec), document Route 53 migration for future

### 5. SSL Certificate Management
- **Question**: Should SSL certificate be managed via AWS Certificate Manager or Let's Encrypt?
- **Options**:
  - Option A: AWS Certificate Manager (integrated with Amplify/CloudFront, automatic renewal)
  - Option B: Let's Encrypt (free, manual renewal)
- **Impact**: Affects certificate management and renewal process
- **Recommendation**: AWS Certificate Manager for automatic management

### 6. Email Template Branding Updates
- **Question**: How should "Inventory HQ" branding be added to existing email templates?
- **Needs**:
  - Update invitation email template in Parameter Store
  - Update low-stock notification email template
  - Update Cognito email templates (if customizable)
- **Impact**: Affects email branding consistency
- **Research Required**: Cognito email template customization capabilities

### 7. Domain Routing Documentation Scope
- **Question**: What level of detail is needed for Namecheap to AWS routing documentation?
- **Options**:
  - Option A: High-level overview with DNS record types needed
  - Option B: Step-by-step guide with exact DNS values
  - Option C: Both (overview + detailed guide)
- **Impact**: Affects documentation completeness for future implementation
- **Recommendation**: Option C - provide both overview and detailed guide

### 8. Backward Compatibility Strategy
- **Question**: How should the system handle old domain/bookmarks during transition?
- **Options**:
  - Option A: Redirect old domain to new domain (301 redirects)
  - Option B: Support both domains simultaneously
  - Option C: No backward compatibility (force migration)
- **Impact**: Affects user experience during domain transition
- **Recommendation**: Option A - implement redirects for smooth transition

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| None | N/A | N/A |

**Note**: No constitution violations identified. All requirements align with established patterns.

## Tasks Moved from Spec 003

The following tasks from spec 003-member-management are now part of spec 007-domain-integration:

### From Spec 003 Plan (Research Item #5: Email Service Configuration)
- **Moved**: SES domain verification and sender email configuration
- **Reason**: These tasks are essential for domain integration and email deliverability, which is the core purpose of spec 007
- **Impact on Spec 003**: Spec 003 can proceed with email sending using placeholder domain initially, then migrate to custom domain when spec 007 is complete

### From Spec 003 Tasks (T006: Verify SES domain verification and sender email configuration)
- **Moved**: T006 task from spec 003 to spec 007
- **New Task in Spec 007**: Configure SES domain verification for inventoryhg.io
- **New Task in Spec 007**: Configure sender email address using inventoryhg.io domain
- **New Task in Spec 007**: Set up SPF, DKIM, and DMARC records for inventoryhg.io

**Note**: Spec 003's email service implementation (emailService.ts) remains in spec 003, but the domain configuration tasks are now part of spec 007.

---

## Post-Design Constitution Check

*Re-evaluated after Phase 1 design completion.*

### Verification Against Completed Artifacts

[To be filled after Phase 1 design completion]

---

## Phase 1 Status

**⏳ PHASE 0 IN PROGRESS** - Research phase starting

### Next Steps

1. **Phase 0 Research**: Resolve all 8 clarification items above
2. **Phase 1 Design**: Create data-model.md (minimal, no new entities), quickstart.md, and contracts/ (if API changes needed)
3. **Phase 2 Tasks**: Run `/speckit.tasks` to generate detailed task breakdown
4. **Quality Gates**: Use checklists/requirements.md for validation
