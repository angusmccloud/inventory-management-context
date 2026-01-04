# Feature Specification: Notification Preference Management

**Feature Branch**: `001-notification-preferences`  
**Created**: 2026-01-04  
**Status**: Draft  
**Input**: User description: "Enabling email notifications for users. There are two types of notifications users can currently subscribe to (Low Stock, Suggestions) with planned expansion. Delivery methods are email plus the in-app notification tab, with future channels (text, push). Users need combination-level preferences for No Notifications, Send Immediately (every 15 minutes), Daily Summary, or Weekly Summary. Immediate notifications require a 15-minute job that only picks unresolved, never-emailed notifications. Daily and weekly summaries must show all outstanding notifications. Users should manage preferences in Settings > Notifications, and every email must include Unsubscribe from all emails plus Change my preferences links."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Configure Notification Matrix (Priority: P1)

As a household member, I can manage notification preferences for each notification type and delivery method within the Notifications sub-tab in Settings so I only receive the frequency and channel combinations I want.

**Why this priority**: Without user control, notifications risk spamming or missing critical events, so preference management underpins all other notification workflows.

**Independent Test**: Navigate to Settings > Notifications, adjust several combinations (e.g., Low Stock via email set to Daily, Suggestions via future push set to Weekly, SMS disabled), save, reload, and verify persisted selections and validation around "No Notifications".

**Acceptance Scenarios**:

1. **Given** a signed-in user, **When** they set Low Stock email delivery to Daily Summary and Suggestions email delivery to No Notifications, **Then** the changes save, display immediately, and the system acknowledges that Suggestions emails are suppressed.
2. **Given** a user with multiple channels, **When** they set Immediate for SMS but Weekly for email on the same notification type, **Then** the matrix accepts the combination and reflects it upon revisit.

---

### User Story 2 - Immediate Alerts Dispatch (Priority: P2)

As a user who selects Send Immediately for a notification type and channel, I receive an email within the 15-minute polling cycle whenever a new unresolved notification appears so I can respond quickly.

**Why this priority**: Timely email alerts prevent stockouts and allow quick action on suggestions, directly affecting business impact.

**Independent Test**: Seed a new Low Stock notification, mark user preference as Immediate email, wait for the next job run, confirm an email is delivered once and marked as sent, and verify no duplicate emails send after the notification is resolved.

**Acceptance Scenarios**:

1. **Given** an unresolved Low Stock alert created at 10:00 and the user opted into Immediate email, **When** the 10:15 job executes, **Then** the user receives one email containing that alert and the notification is flagged as emailed.
2. **Given** the same alert is resolved before 10:30, **When** the 10:30 job runs, **Then** no additional immediate email is sent because the notification is no longer outstanding.

---

### User Story 3 - Digest Summaries & Compliance (Priority: P3)

As a user who chooses Daily or Weekly summaries, I get a consolidated email of outstanding notifications plus unsubscribe/change-preference options so I remain informed without overload and can opt out at any time.

**Why this priority**: Digest emails provide a low-noise catch-up mechanism for many users and the unsubscribe footer ensures compliance with anti-spam regulations.

**Independent Test**: Configure Daily summary for Low Stock, Weekly summary for Suggestions, leave both unresolved, run the respective jobs, verify emails include all outstanding items, absence of resolved items, and working unsubscribe/change preference links that alter settings instantly.

**Acceptance Scenarios**:

1. **Given** three unresolved Low Stock records and Daily Summary preference, **When** the daily job runs at the configured time, **Then** the user receives one email listing each record with timestamps and links to resolve.
2. **Given** the user clicks "Unsubscribe from all emails" in any digest, **When** they confirm, **Then** every email delivery method toggles to No Notifications while in-app notifications remain visible until the user resolves them.

---

### Edge Cases

- How does the system respond when a user selects No Notifications for all channels but still has outstanding alerts (UI messaging, digest suppression)?
- What happens if the user unsubscribes via an email link but later reopens Settings before authentication (handling of expired/untrusted tokens)?
- How are duplicate notifications prevented when the same alert qualifies for both Immediate and Daily settings simultaneously?
- How does the job behave when a notification is created and resolved within the same 15-minute window?
- What does the summary email show when there are zero outstanding notifications yet the user expects a digest that day/week?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The Notifications sub-tab in Settings MUST display every active notification type by delivery method, allowing users to set No Notifications, Send Immediately, Daily Summary, or Weekly Summary per combination.
- **FR-002**: Selecting No Notifications for a delivery method MUST override and disable Immediate/Daily/Weekly options for that combination while leaving other channels unaffected.
- **FR-003**: Preference storage MUST allow future notification types and delivery channels without schema changes, and defaults MUST set new combinations to Daily Summary email unless the user previously opted out of all emails.
- **FR-004**: Users MUST be able to adjust preferences at any time, see the latest saved state on refresh, and audit the date/time of the last change for each combination.
- **FR-005**: A background job MUST run every 15 minutes to send Immediate emails containing only unresolved notifications that have never been emailed through that channel, flagging each notification-channel pair as sent.
- **FR-006**: The system MUST prevent duplicate Immediate emails by tracking per-notification delivery and MUST skip any notification once marked resolved.
- **FR-007**: Daily and Weekly summary jobs MUST compile all outstanding notifications per user, sorted by urgency, and send them at consistent local times (Daily at 9:00 AM local, Weekly on Mondays at 9:00 AM local) with clear grouping by notification type.
- **FR-008**: Summary emails MUST omit resolved notifications, indicate if there are zero outstanding items, and highlight the oldest outstanding age to prompt action.
- **FR-009**: Every outgoing email MUST include both an Unsubscribe from all emails action (one-click disablement of every email delivery) and a Change my preferences link that routes to the Settings > Notifications view after authentication.
- **FR-010**: The unsubscribe workflow MUST respect requests within one minute, log the action, and keep in-app notification tabs available unless the user explicitly disables notifications globally inside Settings.
- **FR-011**: Administrators MUST be able to preview the pending queue (immediate and digests) for troubleshooting without triggering actual sends, ensuring compliance with audit requests.

### Key Entities *(include if feature involves data)*

- **Notification Event**: Represents an alert such as Low Stock or Suggestion; includes type, created timestamp, status (active/resolved), related inventory context, and per-channel delivery history.
- **Notification Preference Matrix**: Per-user record storing desired frequency per notification type and delivery method, including audit metadata (last updated by, timestamp) and unsubscribe flags.
- **Delivery Digest Run**: Captures each execution of the Immediate/Daily/Weekly jobs, containing run time, targeted users, notification counts sent, and any failures for monitoring/compliance.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 95% of preference changes appear correctly on the Settings page within 5 seconds of saving, verified across the current two notification types and any newly added delivery channels.
- **SC-002**: 99% of Immediate emails reach subscribed users within the first 15-minute polling cycle after a new unresolved notification is created.
- **SC-003**: 100% of Daily and Weekly digests include every outstanding notification (none missing, none resolved) for their scope, with at most 1% of digests reporting “no items” incorrectly.
- **SC-004**: 100% of outgoing emails contain functioning Unsubscribe and Change my preferences links, and unsubscribe actions take effect within 60 seconds of the click.

## Assumptions

- Users default to Daily Summary email for each new notification type unless they previously opted out globally; defaults can be revised later without migrating historical data.
- Local time is derived from the user’s profile timezone (or organization default) for scheduling; if unavailable, jobs use the organization’s timezone.
- In-app notification behavior remains unchanged; this feature governs email-delivery preferences only while ensuring future channels can reuse the same preference matrix.
