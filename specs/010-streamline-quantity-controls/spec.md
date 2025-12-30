# Feature Specification: Streamlined Quantity Adjustments

**Feature Branch**: `010-streamline-quantity-controls`  
**Created**: December 29, 2025  
**Status**: Draft  
**Input**: User description: "Cleaner Quantity Adjustments: NFC-friendly page should have a brief (half-second?) debounce on quantity changes, so pressing increase/decrease 3 times makes 1 API call of changing by 3. On the inventory page, remove the Adjust modal and instead use small +/- buttons next to the quantity. Same debounce logic should be used"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Quick NFC Tag Quantity Updates (Priority: P1)

Users scanning NFC tags need to rapidly adjust inventory quantities without multiple API calls slowing down the experience. When a user taps increase or decrease multiple times in quick succession, the system should batch these changes into a single API call.

**Why this priority**: This is the primary use case for warehouse/pantry scenarios where users need fast, efficient quantity adjustments without waiting for network round-trips. Poor performance here defeats the purpose of NFC scanning.

**Independent Test**: User can scan an NFC tag, tap the increase button 5 times rapidly, and verify only one API call is made with a total change of +5. The interface remains responsive throughout.

**Acceptance Scenarios**:

1. **Given** a user has scanned an NFC tag and is on the item detail page, **When** they tap the increase button 3 times within 500ms, **Then** the local quantity updates immediately each time, and exactly one API call is made after 500ms with a net change of +3
2. **Given** a user has made rapid adjustments (e.g., +3), **When** they wait more than 500ms without further input, **Then** the API call completes and the final quantity is persisted
3. **Given** a user taps increase 2 times then decrease 1 time within 500ms, **When** the debounce timer expires, **Then** one API call is made with a net change of +1
4. **Given** a user makes a quantity adjustment, **When** they navigate away from the page before the debounce completes, **Then** the pending change is immediately flushed and saved before navigation

---

### User Story 2 - Inline Inventory Page Adjustments (Priority: P1)

Users managing inventory from the main inventory list need quick access to quantity adjustments without opening a modal dialog. Small +/- buttons directly next to the quantity allow for faster workflows.

**Why this priority**: Removing modal friction significantly improves inventory management efficiency. This affects the most common user interaction in the system.

**Independent Test**: From the inventory list page, user can click +/- buttons next to any item and see immediate visual feedback with batched API updates. No modal dialog appears.

**Acceptance Scenarios**:

1. **Given** a user is viewing the inventory list, **When** they click the + button next to an item 4 times rapidly, **Then** the quantity updates locally each time and one API call is made after 500ms with +4
2. **Given** a user is viewing the inventory list, **When** they click the - button to reduce quantity, **Then** the same debouncing behavior applies as with the + button
3. **Given** the adjust modal previously existed, **When** a user views the inventory page, **Then** there is no "Adjust" button or modal - only inline +/- buttons
4. **Given** a user adjusts quantity on one item, **When** they immediately start adjusting another item, **Then** the first item's change is flushed immediately and the second item starts a new debounce window

---

### User Story 3 - Visual Feedback During Debounce (Priority: P2)

Users need clear visual feedback when quantity changes are pending but not yet saved, so they understand the system state and don't double-save or navigate away prematurely.

**Why this priority**: Good UX prevents confusion and accidental data loss. While not blocking core functionality, it significantly improves user confidence.

**Independent Test**: User can make rapid quantity changes and observe a visual indicator (e.g., subtle spinner, dimmed state) showing the save is pending, which clears when the API call completes.

**Acceptance Scenarios**:

1. **Given** a user makes a quantity adjustment, **When** the debounce timer is active, **Then** a subtle visual indicator shows the change is pending
2. **Given** the API call is in flight, **When** the user observes the interface, **Then** they see an appropriate loading state
3. **Given** the API call completes successfully, **When** the save finishes, **Then** the visual indicator disappears and the quantity reflects the persisted value
4. **Given** the API call fails, **When** the error occurs, **Then** the user sees an error message and the quantity reverts to the last known good value

---

### User Story 4 - Error Recovery and Retry Logic (Priority: P3)

When network issues or API errors occur during debounced saves, users need clear feedback and the ability to retry without losing their intended changes.

**Why this priority**: Edge case handling that improves reliability. Less critical than core functionality but important for production stability.

**Independent Test**: Simulate network failure during a debounced update and verify the user is notified and can retry the operation.

**Acceptance Scenarios**:

1. **Given** a user makes quantity adjustments that trigger a debounced API call, **When** the API call fails due to network error, **Then** the user sees an error notification with a retry option
2. **Given** an API call has failed, **When** the user clicks retry, **Then** the system attempts to save the pending quantity change again
3. **Given** multiple retry attempts fail, **When** the user dismisses the error, **Then** the quantity reverts to the last successfully saved value and the user can try again later
4. **Given** a user is offline, **When** they attempt quantity adjustments, **Then** the +/- buttons are disabled with a clear indicator that internet connectivity is required

---

### Edge Cases

- What happens when a user makes a quantity adjustment that would result in a negative quantity?
- How does the system handle concurrent updates from multiple family members adjusting the same item simultaneously?
- What if the API call is still pending when the user refreshes the page or closes the browser?
- What happens if the user makes 20 rapid adjustments - is there a maximum debounce window or should it extend indefinitely?
- Should the +/- buttons disable during the API call, or allow optimistic updates to continue?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: NFC tag detail page MUST debounce quantity adjustment button clicks for 500ms, accumulating net changes before making a single API call
- **FR-002**: Inventory list page MUST display inline +/- buttons next to each item's quantity display
- **FR-003**: Inventory list page MUST remove the existing "Adjust" button and modal dialog completely
- **FR-004**: Both NFC and inventory page quantity controls MUST use the same debouncing logic (500ms delay, net change calculation)
- **FR-005**: System MUST immediately reflect quantity changes in the UI (optimistic updates) while debounce timer is active
- **FR-006**: System MUST flush pending debounced changes immediately when user navigates away from the page
- **FR-007**: System MUST handle increase and decrease operations within the same debounce window by calculating net change (e.g., +3 then -1 = net +2)
- **FR-008**: When a user starts adjusting a different item, system MUST flush the previous item's pending changes immediately
- **FR-009**: System MUST provide visual feedback indicating when a save is pending and when it completes
- **FR-010**: System MUST prevent quantity from going below zero through UI controls
- **FR-011**: System MUST handle API failures by showing error messages and allowing retry without losing the intended quantity change
- **FR-012**: System MUST revert to last known good quantity if the API call fails and user chooses not to retry
- **FR-013**: System MUST disable +/- buttons when offline and display a clear indicator that internet connectivity is required

### Key Entities

- **Inventory Item**: Existing entity with current quantity that will be updated via the new streamlined controls
- **Quantity Adjustment**: Represents a pending or completed change to an item's quantity, including the net delta and timestamp

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can make 5 rapid quantity adjustments (NFC or inventory page) and confirm only 1 API call is made, completing within 1 second of the last button press
- **SC-002**: Inventory list page workflow improves by eliminating 2 clicks (removing the need to open and close the adjust modal)
- **SC-003**: 95% of quantity adjustment operations complete successfully with visual confirmation to the user
- **SC-004**: Users can adjust quantities on 10 different items in rapid succession without any API calls blocking or queuing excessively
- **SC-005**: System correctly calculates net quantity changes when users make mixed increase/decrease operations (e.g., +5, -2, +1 = net +4)

## Assumptions

- **Default debounce timing**: Using 500ms (half-second) as specified. This balances responsiveness with API efficiency.
- **Optimistic UI updates**: Assuming immediate visual feedback is critical for good UX, so quantity displays update instantly before API confirmation
- **Single-item debounce scope**: Each inventory item has its own debounce timer. Adjusting item A doesn't affect the debounce of item B (except that item A's change flushes immediately when user starts on item B).
- **Network connectivity**: Assuming users are generally online. Offline support is marked for clarification.
- **Existing API endpoints**: Assuming current quantity update API endpoints support receiving delta values or absolute quantity values
- **Button behavior during save**: Assuming buttons remain enabled during API calls for continuous optimistic updates, but this could be adjusted based on UX testing
