# Feature Specification: Live Domain Integration for Inventory HQ

**Feature Branch**: `007-domain-integration`  
**Created**: December 9, 2025  
**Status**: Draft  
**Input**: User description: "Add a new Spec for integrating a live domain: inventoryhq.io. It should be full-stack: - UI setup for domain, AWS/Amplify using it - UI renamed to Inventory HQ (no folder structure changes, just page titles) - All emails (Cognito, Invitations, etc) sent with this domain - Domain is purchased on namecheap, can/will be routed to AWS (but should include that in later plans)"

## Purpose and Problem Statement

The application currently operates under generic branding and uses placeholder domains for email communications. To establish a professional, branded presence, the system needs to integrate a custom domain (inventoryhq.io) across all user-facing touchpoints. This includes updating the application name to "Inventory HQ", configuring the domain for web hosting, and ensuring all email communications (authentication, invitations, notifications) are sent from the custom domain.

The goal is to provide a cohesive branded experience that builds trust and recognition, while maintaining all existing functionality and ensuring reliable email delivery.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Application Displays Custom Domain and Branding (Priority: P1)

Users access the application via the custom domain (inventoryhq.io) and see "Inventory HQ" as the application name throughout the user interface, including page titles, navigation headers, and email communications.

**Why this priority**: This is the foundational branding change that establishes the professional identity. Without consistent branding, users may not recognize the application or trust email communications.

**Independent Test**: Can be fully tested by accessing the application via the custom domain and verifying that all page titles display "Inventory HQ", navigation shows the branded name, and the domain appears correctly in the browser address bar.

**Acceptance Scenarios**:

1. **Given** a user accesses the application via inventoryhq.io, **When** they view any page, **Then** the browser tab title displays "Inventory HQ" or a page-specific title with "Inventory HQ"
2. **Given** a user is logged into the application, **When** they view the navigation header, **Then** it displays "Inventory HQ" as the application name
3. **Given** a user views the landing page, **When** they see the hero section, **Then** it displays "Inventory HQ" as the primary heading
4. **Given** a user receives any email from the system, **When** they view the email sender address, **Then** it shows an address from the inventoryhq.io domain (e.g., noreply@inventoryhq.io)
5. **Given** a user receives any email from the system, **When** they view the email content, **Then** it references "Inventory HQ" as the application name

---

### User Story 2 - Email Communications Use Custom Domain (Priority: P1)

All system-generated emails (authentication emails from Cognito, invitation emails, low-stock notifications) are sent from email addresses using the inventoryhq.io domain, ensuring consistent branding and improved deliverability.

**Why this priority**: Email deliverability and trust depend on using a verified custom domain. Generic or placeholder domains can trigger spam filters and reduce user confidence in email communications.

**Independent Test**: Can be tested by triggering each email type (password reset, invitation, notification) and verifying that the sender address uses inventoryhq.io and emails are successfully delivered.

**Acceptance Scenarios**:

1. **Given** a user requests a password reset, **When** Cognito sends the password reset email, **Then** the email is sent from an address using inventoryhq.io domain
2. **Given** an admin invites a new family member, **When** the invitation email is sent, **Then** the sender address uses inventoryhq.io domain and the email content references "Inventory HQ"
3. **Given** an inventory item falls below threshold, **When** a low-stock notification email is sent, **Then** the sender address uses inventoryhq.io domain
4. **Given** any system email is sent, **When** the recipient views email headers, **Then** SPF, DKIM, and DMARC records validate correctly for inventoryhq.io
5. **Given** a user receives an email with a link, **When** they click the link, **Then** it directs to the inventoryhq.io domain

---

### User Story 3 - Application Hosting Uses Custom Domain (Priority: P2)

The application is accessible via the custom domain (inventoryhq.io) through AWS/Amplify hosting, with proper SSL certificate configuration and domain routing.

**Why this priority**: While branding and email are critical for user trust, the hosting configuration ensures users can actually access the application via the custom domain. This can be implemented after initial branding changes are complete.

**Independent Test**: Can be tested by accessing inventoryhq.io in a browser and verifying the application loads correctly with a valid SSL certificate, and all API calls work correctly with the custom domain.

**Acceptance Scenarios**:

1. **Given** the domain is configured, **When** a user navigates to inventoryhq.io, **Then** the application loads successfully
2. **Given** the application is accessed via inventoryhq.io, **When** the browser displays the connection, **Then** it shows a valid SSL certificate for inventoryhq.io
3. **Given** a user interacts with the application, **When** API calls are made, **Then** they use the correct domain configuration
4. **Given** the application is accessed via inventoryhq.io, **When** users navigate between pages, **Then** the domain remains consistent (no redirects to other domains)

---

### Edge Cases

- What happens if the domain DNS configuration is incorrect or incomplete?
- How does the system handle email delivery failures when using the custom domain?
- What happens if SSL certificate provisioning fails for the custom domain?
- How does the system handle subdomain routing (e.g., www.inventoryhq.io vs inventoryhq.io)?
- What happens if domain verification fails for email services (SES, Cognito)?
- How does the system handle domain expiration or transfer scenarios?
- What happens if users have bookmarked the old domain or application name?

## Requirements *(mandatory)*

### Functional Requirements

#### Branding and User Interface (US1)

- **FR-001**: System MUST display "Inventory HQ" as the application name in all page titles
- **FR-002**: System MUST display "Inventory HQ" in the main navigation header
- **FR-003**: System MUST display "Inventory HQ" in the landing page hero section
- **FR-004**: System MUST maintain all existing folder structure and routing (no structural changes)
- **FR-005**: System MUST update all user-facing text that references the old application name to "Inventory HQ"
- **FR-006**: System MUST preserve all existing functionality while updating branding

#### Email Configuration (US2)

- **FR-007**: System MUST send all invitation emails from an address using inventoryhq.io domain
- **FR-008**: System MUST send all low-stock notification emails from an address using inventoryhq.io domain
- **FR-009**: System MUST configure Cognito to send authentication emails (password reset, verification) from inventoryhq.io domain
- **FR-010**: System MUST configure email services with SPF records for inventoryhq.io
- **FR-011**: System MUST configure email services with DKIM records for inventoryhq.io
- **FR-012**: System MUST configure email services with DMARC records for inventoryhq.io
- **FR-013**: System MUST include "Inventory HQ" branding in all email templates
- **FR-014**: System MUST ensure all email links point to inventoryhq.io domain

#### Domain Hosting (US3)

- **FR-015**: System MUST make the application accessible via inventoryhq.io domain
- **FR-016**: System MUST configure SSL certificate for inventoryhq.io domain
- **FR-017**: System MUST ensure API endpoints work correctly with the custom domain
- **FR-018**: System MUST handle both www and non-www variants of the domain (redirect appropriately)
- **FR-019**: System MUST maintain backward compatibility during domain transition period

#### Domain Routing (Future Planning)

- **FR-020**: System MUST document the process for routing inventoryhq.io from Namecheap to AWS
- **FR-021**: System MUST identify required DNS records for domain routing
- **FR-022**: System MUST document Amplify hosting configuration requirements

### Key Entities

- **Domain Configuration**: The DNS and hosting setup that routes inventoryhq.io to the application infrastructure. Includes DNS records, SSL certificates, and routing rules.

- **Email Domain**: The email sending configuration that uses inventoryhq.io for all outbound emails. Includes SES domain verification, Cognito email configuration, and email template branding.

- **Application Branding**: The user-facing name "Inventory HQ" that replaces generic application names throughout the interface and communications.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of page titles display "Inventory HQ" or include it in the title
- **SC-002**: 100% of system-generated emails are sent from inventoryhq.io domain addresses
- **SC-003**: Email deliverability rate remains above 95% after domain migration
- **SC-004**: Application is accessible via inventoryhq.io with valid SSL certificate
- **SC-005**: All email authentication records (SPF, DKIM, DMARC) validate successfully for inventoryhq.io
- **SC-006**: Zero broken links or API calls after domain configuration
- **SC-007**: Application loads via custom domain within 3 seconds for 95th percentile of requests
- **SC-008**: Users report consistent "Inventory HQ" branding across all touchpoints (UI and emails)

## Out of Scope

The following capabilities are explicitly excluded from this specification:

### Excluded from This Feature

- Domain purchase process (domain is already purchased on Namecheap)
- Detailed DNS routing implementation from Namecheap to AWS (documented for future plans only)
- Subdomain configuration (e.g., api.inventoryhq.io, admin.inventoryhq.io)
- Email marketing campaigns or bulk email features
- Custom email template redesign (only branding updates to existing templates)
- Multi-domain support or domain aliasing
- Domain transfer between registrars
- Advanced DNS configurations (CDN, load balancing at DNS level)

### Handled by Other Features

- Email template content and design → See existing email service implementations
- Application functionality → See `001-family-inventory-mvp` and related features
- User authentication flows → See existing Cognito implementation
- API functionality → See existing API implementations

## Assumptions

- Domain inventoryhq.io is already purchased and accessible for DNS configuration
- Namecheap DNS management interface is available for configuring DNS records
- AWS SES and Cognito support custom domain configuration for email sending
- Amplify or equivalent AWS hosting service supports custom domain configuration
- SSL certificate can be automatically provisioned via AWS Certificate Manager or similar
- Existing application functionality will remain unchanged except for branding
- Email templates can be updated to include "Inventory HQ" branding without structural changes
- Domain routing from Namecheap to AWS will be implemented in a future phase
- Users will transition to the new domain gradually (backward compatibility needed during transition)
- No changes to folder structure or routing paths are required

## Dependencies

### External Dependencies

- Namecheap domain registrar access for DNS configuration
- AWS SES domain verification and email configuration
- AWS Cognito custom domain email configuration
- AWS Certificate Manager or equivalent for SSL certificate provisioning
- AWS Amplify or equivalent hosting service for custom domain support
- DNS propagation time for domain changes to take effect globally

### Internal Dependencies

- Existing email service implementation (emailService.ts)
- Existing Cognito authentication configuration
- Existing frontend application structure
- Existing API endpoint configurations
- Email template storage and rendering system

### Data Model Dependencies

- No new data model entities required
- Existing email configuration parameters may need updates (sender addresses, domain settings)

## Risk Considerations

- **Email Deliverability Issues**: Incorrect DNS configuration (SPF, DKIM, DMARC) could cause emails to be marked as spam
  - *Mitigation*: Follow AWS SES domain verification best practices, test email delivery thoroughly, monitor bounce rates

- **Domain Propagation Delays**: DNS changes may take 24-48 hours to propagate globally
  - *Mitigation*: Plan for gradual rollout, maintain old domain access during transition, communicate timeline to users

- **SSL Certificate Provisioning Failures**: Certificate provisioning may fail if DNS is not properly configured
  - *Mitigation*: Verify DNS configuration before certificate request, use automated certificate management, have fallback plan

- **Breaking Changes During Migration**: Domain changes could break existing bookmarks, links, or integrations
  - *Mitigation*: Implement redirects from old domain/URLs, maintain backward compatibility, provide clear migration communication

- **Email Service Configuration Errors**: Misconfigured email services could prevent all emails from being sent
  - *Mitigation*: Test email sending in staging environment first, implement monitoring and alerts, have rollback plan

- **Branding Inconsistencies**: Some pages or emails might retain old branding if not systematically updated
  - *Mitigation*: Create comprehensive checklist of all branding touchpoints, perform thorough testing, use search/replace systematically

---

## Related Features

This specification relates to other features in the family inventory management system:

| Feature ID | Name | Relationship | Status |
|------------|------|--------------|--------|
| `001-family-inventory-mvp` | Family Inventory MVP | **Foundation** - Provides application that needs domain integration | Implementation Complete |
| `003-member-management` | Member Management | **Dependency** - Provides invitation email functionality that needs domain configuration | Implementation Complete |
| `002-shopping-lists` | Shopping Lists | **Sibling** - Uses same domain and branding | Implementation Complete |

**Note**: This specification focuses on domain integration and branding updates. The actual DNS routing from Namecheap to AWS will be documented for implementation in a future phase, as the domain routing setup can be complex and may require additional infrastructure planning.
