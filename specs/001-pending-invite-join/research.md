# Research: Pending Invitation Onboarding

**Feature**: 001-pending-invite-join  
**Date**: 2026-01-04  
**Status**: Complete

## Research Tasks

1. Task: "Research identity-based invitation matching for pending-invite onboarding"
2. Task: "Find best practices for DynamoDB invitation + audit logging patterns"
3. Task: "Research Next.js App Router gating flows for intercepted onboarding"
4. Task: "Research safe handling for users accepting new invites while already in a family"

---

## 1. Identity Matching Without Invite Token

**Decision**: Normalize verified email + phone during signup, hash them with the same KeyBuilder helpers used when invitations are stored, and query the Invitations GSI for `PENDING` records that match any normalized identifier for that Cognito user.

**Rationale**:
- Cognito post-confirmation trigger already exposes verified email/phone; reusing those values keeps us aligned with security-first identity checks.
- Invitations are keyed by normalized identifiers (lowercased email, E.164 phone), so a simple `PK=INVITE#EMAIL#<hash>` query returns all pending invites for that contact without scanning.
- Matching on both email and phone covers families that only know one channel, while still preventing mismatches because we require the identity to be verified in Cognito before running the query.
- Reusing KeyBuilder ensures no string concatenation errors and keeps records consistent for DynamoDB best practices.

**Alternatives Considered**:
- Prompt the user to type an invitation code manually — rejected because it adds friction and duplicates the existing invite-link behavior we already have.
- Match only on email — rejected because SMS invitations would never resolve when the user signs up via phone number first.
- Store invites in a separate table optimized for lookup — rejected to avoid violating the single-table rule and because existing GSIs can serve the query efficiently.

---

## 2. DynamoDB Modeling for Invitation Decisions

**Decision**: Keep Invitation entities as-is but append a transaction that writes an `INVITE_DECISION#<timestamp>` item and updates the parent Invitation status atomically whenever a user accepts, declines, or ignores via timeout.

**Rationale**:
- A transactWrite with two Put/Update items preserves atomicity so we never mark an invite consumed without also writing the audit log entry demanded by success criteria.
- Logging as separate items avoids unbounded arrays on the Invitation record and lets hosts filter decision history through existing GSIs (e.g., PK = `FAMILY#<id>` / SK begins with `INVITE_DECISION#`).
- Decision item schema (inviteId, actorUserId, familyId, action, source, timestamp) gives support the detail they need without altering host dashboards heavily.
- Using TTL on declined invites ensures prompt cleanup without manual scripts.

**Alternatives Considered**:
- Store decision metadata directly on the Invitation item — rejected because DynamoDB limits make repeated decisions noisy and would require list_append operations with race conditions.
- Emit EventBridge events only — rejected because we still need queryable history inside DynamoDB for host UIs; events can be added later for analytics but are not sufficient.

---

## 3. Next.js App Router Gating Pattern

**Decision**: Introduce a dedicated route segment `app/(auth)/register/pending-invite/page.tsx` that is navigated immediately after Cognito confirms the user, and implement it as a server component that fetches the pending invite list via an authenticated fetcher; the UI uses Suspense to render a blocking decision dialog until the user accepts/declines.

**Rationale**:
- Routing through a separate page keeps the core registration form untouched (per request) while isolating the intercept logic for readability.
- Server component fetch ensures we honor the “no data leakage” rule: if no invites are found, we simply redirect to the dashboard; if there are invites, we render the selection UI with data from the server so nothing sensitive is exposed to unauthenticated contexts.
- Suspense + skeleton fallback gives users immediate visual feedback while we wait for the `GET /invitations/pending` Lambda response and helps us meet the 2 s detection goal.
- Wrapping the step in a dedicated route means we can also deep-link from emails (“You have pending invites, finish signup”) without additional query parameters.

**Alternatives Considered**:
- Inline modal inside the existing registration form — rejected because it complicates the existing form state machine and makes it harder to redirect users who complete the flow later.
- Client-only fetch after mounting the route — rejected because it risks leaking invitation metadata before verifying the session cookie and introduces extra spinners before data loads.
- Forcing users back to an invite-link entry page — rejected because the request explicitly wants no change for invite-link flows.

---

## 4. Handling Users Who Already Belong to Another Family

**Decision**: Permit a signed-in user to accept a new invite only after confirming whether they want to switch families or add secondary access; default behavior keeps the existing family, so accepting a new invite triggers a confirmation modal plus backend guard that either suspends the previous membership (if multiple families disallowed) or adds a second `FamilyMembership` record flagged as secondary.

**Rationale**:
- The spec demands we “prevent accidental family switching,” so we must show explicit messaging before overwriting `Member` records; the confirmation modal meets this UX requirement.
- Backend guard prevents race conditions by using conditional expressions: we only insert the new membership if the user either has no active membership or flagged the switch via a signed confirmation token.
- Supporting a `secondaryMembershipAllowed` flag keeps the door open for future multiple-family support without forcing it now; for MVP we set it to `false`, which means acceptance automatically ends the prior membership after user confirmation.
- Hosts see the resulting status updates because the membership update fires the existing notification/event pipeline.

**Alternatives Considered**:
- Automatically replacing the family membership whenever a new invite is accepted — rejected because it violates UX + compliance requirements.
- Disallowing acceptance entirely if the user already belongs to a family — rejected because legitimate scenarios (caregivers switching households) would be blocked and support would remain manual.
- Supporting multi-family membership immediately — rejected for MVP scope; we document the optional flag but keep it disabled.
