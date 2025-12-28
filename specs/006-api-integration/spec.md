# Feature Specification: NFC Inventory Tap

**Feature Branch**: `006-nfc-inventory-tap`  
**Created**: December 26, 2025  
**Status**: Draft  
**Input**: NFC-based household inventory adjustment via passive tags and web interface

## Purpose and Problem Statement

Households want to track inventory usage with minimal friction. Current methods require users to open an app, navigate to the correct item, and manually adjust the quantity. This creates resistance to consistent tracking, especially for frequently used items.

This feature allows any household member to update inventory by simply tapping an NFC tag attached to an item with their phone. The tap opens a web page at inventoryhq.io that immediately applies a default adjustment (e.g., -1) and displays clear feedback. The page also provides buttons for additional adjustments without requiring authentication or app installation.

The goal is to make inventory tracking as simple as possible for household use, prioritizing usability and convenience over strong security guarantees.

## User Scenarios & Testing

### User Story 1 - Quick Inventory Adjustment via NFC Tap (Priority: P1)

A household member taps an NFC tag attached to an item with their phone, and the browser opens a page that immediately adjusts the inventory and shows clear feedback about what changed.

**Why this priority**: This is the core value proposition - enabling frictionless inventory tracking. Without this working, the feature provides no value.

**Independent Test**: Can be fully tested by programming an NFC tag with a URL, tapping it with any phone, and verifying the page opens, applies an adjustment, and displays the correct feedback.

**Acceptance Scenarios**:

1. **Given** a passive NFC tag programmed with a valid inventory URL, **When** a user taps the tag with their phone, **Then** the browser opens to inventoryhq.io/t/{urlId}
2. **Given** the NFC page loads, **When** the page renders, **Then** it automatically applies a default inventory adjustment (-1) without user action
3. **Given** the adjustment is applied, **When** the page displays feedback, **Then** it shows the item name, the change made (e.g., "Took 1 Paper Towel"), and the new current quantity
4. **Given** the page is displayed, **When** the user views the interface, **Then** they see + and - buttons for making additional adjustments
5. **Given** the item quantity is 0, **When** an adjustment would reduce it below 0, **Then** the quantity remains at 0 and the page displays an appropriate message

---

### User Story 2 - Additional Adjustments from NFC Page (Priority: P2)

After tapping an NFC tag, a user can make additional inventory adjustments from the same page without reloading or tapping again.

**Why this priority**: While the immediate adjustment (P1) is the core feature, allowing multiple adjustments in one session improves the user experience for bulk consumption (e.g., took 3 rolls of paper towels).

**Independent Test**: After opening an NFC page, press the + or - buttons multiple times and verify each button press applies an immediate adjustment and updates the displayed quantity.

**Acceptance Scenarios**:

1. **Given** an NFC page is displayed, **When** the user presses the - button, **Then** the inventory decreases by 1 and the displayed quantity updates immediately
2. **Given** an NFC page is displayed, **When** the user presses the + button, **Then** the inventory increases by 1 and the displayed quantity updates immediately
3. **Given** the user makes multiple adjustments, **When** each button is pressed, **Then** each adjustment is applied atomically without page reload
4. **Given** the quantity is 0, **When** the user presses the - button, **Then** the quantity remains at 0 and feedback indicates no change occurred
5. **Given** the user makes rapid successive button presses, **When** adjustments are processed, **Then** all adjustments are applied correctly without loss or duplication

---

### User Story 3 - NFC URL Management for Items (Priority: P2)

A family admin can generate, view, and rotate NFC URLs for inventory items to enable tag programming and handle compromised URLs.

**Why this priority**: This enables the feature but is administrative. Users need to set up tags once, and rotation is only needed if a URL is compromised. Core value is delivered by P1 and P2.

**Independent Test**: From the inventory management interface, generate a new NFC URL for an item, verify it can be copied, used to program a tag, and optionally rotated if needed.

**Acceptance Scenarios**:

1. **Given** a family admin views an inventory item, **When** they request an NFC URL, **Then** the system generates a unique, random, non-guessable URL ID
2. **Given** an NFC URL exists for an item, **When** the admin views the item, **Then** they can see the full URL (inventoryhq.io/t/{urlId})
3. **Given** an NFC URL is displayed, **When** the admin interacts with it, **Then** they can copy it to the clipboard for programming NFC tags
4. **Given** an NFC URL may be compromised, **When** the admin requests rotation, **Then** a new URL is generated and the old one becomes inactive
5. **Given** multiple NFC URLs may exist for an item, **When** any valid URL is used, **Then** it correctly adjusts the same inventory item
6. **Given** an NFC URL is rotated, **When** the old URL is accessed, **Then** the page displays an error message indicating the URL is no longer active

---

### Edge Cases

- **Unknown URL**: What happens when a user taps a tag with an invalid or non-existent urlId?
- **Minimum Quantity**: How does the system prevent inventory quantity from going below zero?
- **Concurrent Adjustments**: What happens when multiple users adjust the same item simultaneously via different NFC tags or the web interface?
- **Inactive URLs**: What happens when a user taps a tag with a rotated/inactive URL?
- **Item Deletion**: What happens to NFC URLs when an inventory item is archived or deleted?
- **Rate Limiting**: Should there be any protection against rapid repeated taps or bot abuse?
- **Tag Reprogramming**: Can a physical NFC tag be reprogrammed with a new URL if needed?

## Requirements

### Functional Requirements

#### NFC URL Generation and Management (US3)

- **FR-001**: System MUST generate a unique, cryptographically random, non-guessable URL ID for each NFC URL
- **FR-002**: URL ID MUST be sufficiently long and random to prevent guessing or enumeration attacks
- **FR-003**: System MUST store a mapping between URL ID and inventory item (itemId and familyId)
- **FR-004**: System MUST allow multiple NFC URLs to map to the same inventory item
- **FR-005**: System MUST allow family admins to view existing NFC URLs for their items
- **FR-006**: System MUST provide a way to copy NFC URLs to clipboard for tag programming
- **FR-007**: System MUST allow family admins to rotate (regenerate) NFC URLs for their items
- **FR-008**: System MUST deactivate old URL IDs when a new URL is generated via rotation
- **FR-009**: System MUST NOT derive URL IDs from itemId or familyId (must be independent random values)

#### NFC Page Experience (US1, US2)

- **FR-010**: System MUST serve a web page at https://inventoryhq.io/t/{urlId} for valid URL IDs
- **FR-011**: Page MUST automatically apply a default inventory adjustment (-1) when loaded
- **FR-012**: Page MUST display the item name associated with the URL ID
- **FR-013**: Page MUST display a clear message describing the change made (e.g., "Took 1 Paper Towel — now down to 3")
- **FR-014**: Page MUST display the current inventory quantity after the adjustment
- **FR-015**: Page MUST provide + and - buttons for making additional adjustments
- **FR-016**: Each button press MUST apply an immediate adjustment (+1 or -1) without page reload
- **FR-017**: Page MUST update the displayed quantity and feedback message after each adjustment
- **FR-018**: Page MUST work without requiring authentication or login
- **FR-019**: Page MUST work without requiring app installation
- **FR-020**: Page MUST work on any phone that can open web pages from NFC tags

#### Inventory Adjustment Logic (US1, US2)

- **FR-021**: System MUST enforce a minimum inventory quantity of 0 (cannot go negative)
- **FR-022**: System MUST handle concurrent adjustments atomically to prevent race conditions
- **FR-023**: When quantity is 0 and a decrease is requested, system MUST keep quantity at 0 and display appropriate feedback
- **FR-024**: Each adjustment MUST be applied immediately and persist to the database
- **FR-025**: Adjustments MUST trigger existing low-stock notification logic if thresholds are crossed
- **FR-026**: System MUST support adjustments via both NFC page and existing authenticated web interface without conflicts

#### Error Handling (US1, US3)

- **FR-027**: System MUST display a simple error page for unknown or invalid URL IDs
- **FR-028**: System MUST display a simple error page for inactive (rotated) URL IDs
- **FR-029**: Error pages MUST be user-friendly and avoid exposing system internals
- **FR-030**: System MUST log all NFC page accesses and adjustments for troubleshooting
- **FR-031**: System MUST handle cases where the associated inventory item no longer exists (archived/deleted)

#### Security and Abuse Prevention (US1, US2, US3)

- **FR-032**: URL IDs MUST be treated as shared secrets (possession of URL grants access)
- **FR-033**: System MUST use HTTPS for all NFC page requests
- **FR-034**: System MAY implement basic rate limiting to prevent bot abuse (but no strict requirement for household use)
- **FR-035**: System MUST allow URL rotation to handle compromised URLs
- **FR-036**: System MUST enforce family isolation (URL ID maps to specific family's item)
- **FR-037**: System MUST NOT require user accounts, sessions, or cookies for NFC page functionality

#### Non-Functional Requirements

- **FR-038**: NFC page load time MUST be under 2 seconds on standard mobile connections
- **FR-039**: NFC page MUST be mobile-responsive and usable on phone screens
- **FR-040**: + and - buttons MUST be large enough for easy tapping (minimum 44x44px touch targets)
- **FR-041**: Feedback messages MUST be clear and use plain language
- **FR-042**: Page MUST work on both iOS and Android phones
- **FR-043**: Any UI components MUST meet WCAG 2.1 AA color-contrast standards
- **FR-044**: CI MUST run TypeScript type checking and fail on errors
- **FR-045**: CI MUST run production build and block merges on build failures

### Key Entities

**NFCUrl**: A unique URL that maps to an inventory item and enables unauthenticated adjustments.

**Attributes**:
- `urlId`: Unique, random, non-guessable identifier (URL path segment)
- `itemId`: Reference to the inventory item
- `familyId`: Reference to the family (for isolation)
- `isActive`: Boolean indicating if the URL is currently valid (false after rotation)
- `createdAt`: Timestamp of URL generation
- `lastAccessedAt`: Timestamp of most recent access

**InventoryItem**: (extends existing entity)
- No schema changes required
- Multiple NFC URLs can reference the same item

## Success Criteria

### Measurable Outcomes

- **SC-001**: Users can tap an NFC tag and see inventory adjustment feedback in under 3 seconds
- **SC-002**: 95% of NFC page loads complete successfully without errors
- **SC-003**: Inventory adjustments via NFC are atomic and prevent concurrent update conflicts
- **SC-004**: NFC page works on any smartphone (iOS and Android) without app installation
- **SC-005**: Family admins can generate and copy an NFC URL in under 10 seconds
- **SC-006**: Users can make additional adjustments from the NFC page without reloading (under 1 second per adjustment)
- **SC-007**: Invalid or inactive URLs display a clear error message within 2 seconds

## Assumptions

- Users have NFC-enabled smartphones (standard on modern iOS and Android devices)
- Users can program passive NFC tags with URLs (via standard NFC writing apps)
- Physical NFC tags are purchased separately (not provided by the system)
- Household members understand that anyone with the URL can adjust inventory (acceptable trade-off for convenience)
- Basic rate limiting is sufficient for household use (not expecting bot attacks)
- Users will attach physical NFC tags to items or storage locations themselves

## Dependencies

- Existing inventory item management system (from MVP)
- Existing DynamoDB data model (extends with NFCUrl entity)
- Existing low-stock notification system (triggered by adjustments)
- Domain: inventoryhq.io must be configured to serve the NFC pages

## Out of Scope

- Native mobile app development (all web-based)
- Active NFC tags or custom hardware
- Per-tag authentication or encryption
- Detailed audit trails of who made adjustments (no user attribution)
- Integration with external inventory management systems
- Automatic tag programming (users program tags manually)
- Support for older phones without NFC capability
- QR code alternative (may be considered in future, but NFC-only for this feature)