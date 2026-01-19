# Research Notes — User Settings Controls

## Decision: Use existing Cognito user pool for re-authentication and verification
- **Rationale**: AGENTS.md lists Cognito user pools as an active technology for recent features, and the current authentication stack already issues JWTs with `familyId`. Reusing Cognito enables password re-verification, email change challenges, and MFA hooks without adding another IdP. It also satisfies the "require old password" constraint called out in the feature request.
- **Alternatives considered**:
  - **Custom KMS-backed password store**: Rejected because it would duplicate Cognito’s hardened storage, require its own rotation/audit controls, and violate the constitution’s security-first mandate.
  - **3rd-party auth API (e.g., Auth0)**: Rejected because it conflicts with the AWS-native architecture and increases cost and operational complexity.

## Decision: Engineer for 50k concurrent member records (multi-tenant families)
- **Rationale**: While MAU wasn’t specified, existing Inventory HQ features like dashboards and NFC flows target household-scale usage, implying tens of thousands of families. Planning DynamoDB capacity, audit logs, and rate limiting for ~50k members ensures headroom without over-optimizing.
- **Alternatives considered**:
  - **Low-scale assumption (<5k members)**: Risks under-provisioning audit log storage and rate limiting, leading to throttling when adoption climbs.
  - **Enterprise-scale (>1M members)**: Would force premature sharding or cross-table strategies; no roadmap evidence justifies that cost today.

## Decision: Next.js App Router form flows must stay fully client-server hybrid
- **Rationale**: App Router encourages server components for data loading, but credential inputs should remain client components with controlled inputs and Suspense-driven submission states. Using Route Handlers (or fetchers) keeps API surface aligned with backend Lambdas and enforces the `{data: T}` response format.
- **Alternatives considered**:
  - **Legacy Pages Router**: Not permissible; constitution mandates App Router going forward.
  - **All-client mutations via direct AWS SDK calls**: Violates security and would expose secrets to the browser.

## Decision: DynamoDB updates require transactional safeguards and audit records
- **Rationale**: Changing email/password/delete must stay atomic with audit logging. Use `TransactWriteCommand` to update MEMBER and FAMILY (when applicable) plus insert an AUDIT record, guaranteeing consistency if the last member deletes the family.
- **Alternatives considered**:
  - **Sequential writes**: Risk partial state when functions fail between writes.
  - **Separate audit store**: Adds latency; DynamoDB single-table already supports typed audit items.

## Decision: Component library usage for dialogs/forms is mandatory
- **Rationale**: Constitution Principle VIII forbids bespoke UI controls. The deletion confirmation modal, text inputs, and buttons must all compose `components/common/Dialog`, `Form`, and `Button` primitives to inherit WCAG compliance and theming. This also accelerates development of spinner/inline alert states.
- **Alternatives considered**:
  - **Feature-specific modal implementation**: Explicitly prohibited and would fragment accessibility rules.
  - **3rd-party modal package**: Adds bundle weight and bypasses internal styling.

## Decision: Centralized auth utilities guard backend handlers
- **Rationale**: Every handler must call `getUserContext` and enforce role checks (even though actions are self-service) to ensure JWT claims match the member being modified. This prevents tampering via forged requests and satisfies the Security First principle.
- **Alternatives considered**:
  - **Trusting client-supplied memberId**: Vulnerable to privilege escalation.
  - **Standalone auth middleware per handler**: Duplicates logic and invites drift; shared utilities already exist.

## Decision: Verification ticket TTL stored on DynamoDB items
- **Rationale**: Email change/deletion confirmations require 24h expiry. Storing `ttl` on the Credential Verification Ticket item lets DynamoDB expire stale requests automatically and avoids extra cleanup cron jobs.
- **Alternatives considered**:
  - **In-memory cache (Redis)**: New infrastructure not justified and complicates IaC.
  - **Manual cleanup Lambda**: Adds maintenance overhead and delays expiry.
