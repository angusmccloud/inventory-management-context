# Feature Specification: iOS PWA Mobile Experience Enhancements

**Feature Branch**: `017-ios-pwa-enhancements`  
**Created**: 2026-02-21  
**Status**: Draft  
**Input**: User description: "making the frontend more mobile-friendly in PWA mode on ios. For instance: The header should be sticky in that mode, need a pull to refresh, need a back button."

## Overview

When users add the inventory management app to their iOS home screen and launch it as a Progressive Web App (PWA), Safari removes the browser chrome (address bar, navigation buttons, tab bar). This leaves users without standard navigation controls and without the native pull-to-refresh gesture. This feature ensures the app provides a complete, native-feeling experience when running in iOS standalone/PWA mode.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Sticky Header Keeps Navigation Accessible (Priority: P1)

A family member has installed the app to their iOS home screen and launches it as a PWA. As they scroll through a long inventory list, the page header remains fixed at the top of the screen so they always have access to the page title, navigation menu, and key action buttons without scrolling back to the top.

**Why this priority**: In PWA mode, the browser's URL bar and back button are hidden. Without a sticky header, users lose their primary navigation anchor as they scroll, leaving them stranded mid-page with no way to access navigation controls.

**Independent Test**: Can be fully tested by installing the app as a PWA on an iOS device (or using iOS Safari's standalone simulation in developer tools), loading any content-heavy page, scrolling down, and verifying the header remains visible and functional at all scroll positions.

**Acceptance Scenarios**:

1. **Given** the app is running in iOS PWA (standalone) mode, **When** a user scrolls down any page, **Then** the top navigation header remains fixed at the top of the visible screen area and the first item of page content is fully visible below the header (not hidden behind it)
2. **Given** the app is running in iOS PWA mode on a device with a notch or Dynamic Island, **When** the header is displayed, **Then** the header content sits below the iOS status bar, respecting the device safe area inset
3. **Given** the app is running in a standard browser (non-PWA mode), **When** a user scrolls, **Then** the header behavior is unchanged from current behavior — no regression introduced
4. **Given** the app is running in iOS PWA mode and a modal or overlay is open, **When** the modal is displayed, **Then** the sticky header does not interfere with the modal's display or its own scroll behavior

---

### User Story 2 - Back Button Navigation Within PWA (Priority: P1)

A family member navigating in PWA mode taps into a detail view or sub-page and needs to return to the previous screen. Because there is no browser back button available in standalone mode, they use an in-app back button that appears in the header when they are not on a root-level page.

**Why this priority**: Without browser navigation controls, users have no standard way to go back in the navigation stack. This is a critical gap that can leave users stuck on a sub-page with no escape other than force-quitting the app.

**Independent Test**: Can be fully tested independently by installing the app as a PWA, navigating from a root page to any secondary/detail page, and verifying a back button appears in the header that successfully returns the user to the previous view.

**Acceptance Scenarios**:

1. **Given** the app is running in iOS PWA mode and the user is on a root-level page (e.g., Inventory, Shopping List, Dashboard), **When** the page loads, **Then** no back button is shown in the header
2. **Given** the app is running in iOS PWA mode and the user navigates to a sub-page or detail view, **When** the page loads, **Then** a back button (e.g., a chevron/arrow icon with "Back" label) appears in the header
3. **Given** the user taps the in-app back button in PWA mode, **When** the tap is registered, **Then** the user is navigated to the previous page in their history
4. **Given** the user has navigated multiple levels deep in PWA mode, **When** they tap back repeatedly, **Then** each tap returns them one level up the navigation hierarchy until they reach the root page
5. **Given** the app is running in a standard browser (non-PWA mode), **When** the user is on a sub-page, **Then** the in-app back button does not appear (native browser controls are available)

---

### User Story 3 - Pull-to-Refresh Data Fetching (Priority: P2)

A family member opens the inventory list in PWA mode and wants to check if another household member recently made any changes. They pull down from the top of the page content to trigger a data refresh, which reloads the current page's data without performing a full page reload.

**Why this priority**: iOS PWA mode disables the browser's native pull-to-refresh gesture. Users lose the intuitive touch interaction they rely on across native apps to get fresh data. Without it, there is no obvious way to refresh content in standalone mode.

**Independent Test**: Can be fully tested independently by installing the app as a PWA, navigating to any data-driven page (e.g., Inventory or Shopping List), performing a pull-down gesture from the very top of the content area, and verifying a loading indicator appears and then data is refreshed.

**Acceptance Scenarios**:

1. **Given** the app is running in iOS PWA mode and the user is scrolled to the top of a data-driven page, **When** they pull down beyond a minimum drag threshold, **Then** a loading indicator appears and the page's data is refreshed
2. **Given** a pull-to-refresh gesture is in progress, **When** the user releases their finger, **Then** the refresh completes and the loading indicator disappears once the latest data has loaded
3. **Given** the user pulls down but does not exceed the activation threshold, **When** they release, **Then** no refresh is triggered and the content returns to its original position
4. **Given** the app is running in iOS PWA mode and a refresh is already in progress, **When** the user attempts another pull-to-refresh, **Then** a second concurrent refresh is not triggered
5. **Given** a pull-to-refresh is triggered on the Inventory page, **When** the refresh completes, **Then** any new or updated items added by other family members since the last load are now visible
6. **Given** a pull-to-refresh is triggered and the device has no internet connectivity, **When** the refresh attempt fails, **Then** an error message is displayed and the user can retry

---

### User Story 4 - Safe Area and Viewport Handling (Priority: P2)

A family member using an iPhone with a Home Indicator (bottom swipe bar) or a Dynamic Island/notch launches the app as a PWA. All interactive content is safely within the device's visible area, with no buttons or text obscured behind device hardware elements.

**Why this priority**: iOS devices with notches, Dynamic Islands, and Home Indicators have specific safe area insets that apps must respect to avoid content being hidden behind hardware. This is critical for usability on all modern iOS devices.

**Independent Test**: Can be fully tested by launching the PWA on an iPhone with a notch/Dynamic Island and verifying all content — especially top headers and any bottom navigation — is fully visible and tap-accessible without hardware obstruction.

**Acceptance Scenarios**:

1. **Given** the app is running in iOS PWA mode on a device with a notch or Dynamic Island, **When** any page loads, **Then** the header and its content do not overlap with the status bar or camera cutout area
2. **Given** the app is running in iOS PWA mode on a device with a Home Indicator, **When** viewing any page, **Then** bottom navigation or fixed action buttons are not obscured by the Home Indicator area
3. **Given** the user rotates the device to landscape orientation in PWA mode, **When** the orientation changes, **Then** content reflows correctly and safe area insets are respected on both sides of the screen

---

### User Story 5 - PWA Launch Experience and Status Bar Styling (Priority: P3)

A family member launches the app from their iOS home screen. The iOS status bar (time, battery, signal) integrates visually with the app's color scheme, and the app loads with a themed splash experience rather than a blank white screen.

**Why this priority**: While functional, these cosmetic details significantly affect the perceived quality and native feel of the PWA experience. Lower priority since they do not block core functionality.

**Independent Test**: Can be fully tested in isolation by performing a cold launch of the PWA from the iOS home screen and verifying the splash background matches the app theme color and the status bar appearance is appropriate for the current theme.

**Acceptance Scenarios**:

1. **Given** the app is launched cold from the iOS home screen, **When** the splash screen is displayed, **Then** the background color matches the app's primary theme color rather than a plain white screen
2. **Given** the app is cold-launched in iOS PWA mode with the light theme active, **When** any page is displayed, **Then** the iOS status bar icons use dark text for legibility on the light background
3. **Given** the app is cold-launched in iOS PWA mode with the dark theme active, **When** any page is displayed, **Then** the iOS status bar icons use light text for legibility on the dark background
4. **Given** the app is running in iOS PWA mode and the user switches themes mid-session, **When** the theme changes, **Then** the status bar style is NOT required to update immediately — the updated style will be applied on the next cold-launch of the app

---

### Edge Cases

- What happens when the device loses internet connectivity mid-refresh during a pull-to-refresh? The app must display an appropriate error state and allow the user to retry.
- What happens when pull-to-refresh is triggered on a page that has no refreshable data (e.g., a static settings page)? Pull-to-refresh should be disabled or omitted on non-data pages.
- What happens if the user is at the root page in PWA mode and there is no navigation history to go back to? The back button must not appear at the root level.
- What happens when the PWA is cold-launched directly to a non-root URL (e.g., opened via a notification link to an item detail page) with no prior in-session history? The back button must still appear and must navigate the user to the logical parent/root of that page.
- What happens on non-iOS PWA sessions (e.g., Android Chrome, desktop)? PWA-specific enhancements must only activate in iOS standalone mode and must not regress behavior on other platforms.
- What happens when the user opens a page in a standard browser tab (not installed as PWA)? All PWA-specific behaviors — sticky header override, custom back button, pull-to-refresh gesture — must remain inactive in standard browser mode.
- What happens when the app is in iOS PWA mode and the page contains a scrollable modal or bottom sheet? Pull-to-refresh must not activate while the modal content is being scrolled.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The application MUST detect when it is running in iOS PWA standalone mode and conditionally apply PWA-enhanced navigation behaviors
- **FR-002**: The top navigation header MUST remain fixed (sticky) at the top of the viewport when the app is running in iOS PWA standalone mode
- **FR-002a**: The sticky header MUST overlay the page content (not push it down); the scrollable content area MUST receive top padding equal to the rendered height of the header so that no page content is hidden beneath the header at rest
- **FR-003**: When running on devices with a notch, Dynamic Island, or safe area insets, the sticky header MUST be positioned below the iOS status bar using the device's safe area top value
- **FR-004**: An in-app back button MUST appear in the header when the user is on a non-root page in iOS PWA mode, regardless of whether they navigated there within the session or were cold-launched directly to that URL
- **FR-005**: The in-app back button MUST navigate the user to the previous in-session page if one exists, or to the logical parent/root of the current page if no prior history exists in the session
- **FR-006**: The in-app back button MUST NOT appear when the user is on a root-level page (primary navigation destinations) in PWA mode
- **FR-007**: A pull-to-refresh interaction MUST be available on all pages that display server-fetched data when the app is running in iOS PWA mode
- **FR-008**: Pull-to-refresh MUST display a visible loading indicator while the refresh operation is in progress
- **FR-009**: Pull-to-refresh MUST only activate when the user initiates a downward drag from a scroll position of zero and exceeds a minimum drag distance threshold
- **FR-010**: Pull-to-refresh MUST prevent concurrent refresh requests — a second gesture while a refresh is running must be ignored until the current refresh completes
- **FR-011**: Pull-to-refresh MUST NOT activate when a modal, bottom sheet, or overlay with its own scroll context is open above the page content
- **FR-012**: The application MUST configure iOS status bar appearance via web app meta tags at launch time so the status bar style matches whichever theme is active when the app is cold-launched; the status bar style is NOT required to update mid-session if the user changes themes (the new style will take effect on the next cold-launch)
- **FR-013**: The application MUST define a theme color in the web app manifest and meta tags that matches the app's primary header color, preventing a plain white launch screen
- **FR-014**: All fixed-position UI elements (headers, bottom navigation, action bars) MUST account for iOS safe area insets to prevent content from being obscured by device hardware
- **FR-015**: All PWA-specific enhancements MUST be inert (disabled/hidden) when the app is not running in iOS standalone mode

### Key Entities

- **PWA Mode Context**: A runtime detection state indicating whether the app is operating in iOS standalone (home screen) mode vs. standard browser mode — drives conditional activation of all PWA-specific behaviors
- **Navigation History State**: The current router history depth indicating whether the user has navigated beyond a root page — used to drive back button visibility logic

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of navigable non-root pages display a functioning in-app back button when running in iOS PWA mode, and 0% of root pages show the back button
- **SC-002**: Pull-to-refresh is available on all pages with server-fetched data in iOS PWA mode, with a visual loading indicator appearing within 150ms of gesture activation
- **SC-003**: On all tested iOS devices with safe area insets (notch, Dynamic Island, Home Indicator), zero interactive elements are obscured by device hardware in PWA mode
- **SC-004**: The sticky header is present and functional at all scroll depths on all pages in iOS PWA mode, with zero layout regressions observed in standard browser mode
- **SC-005**: The app launch splash screen displays the app's primary theme color (not plain white) on iOS home screen launch
- **SC-006**: All PWA enhancements are exclusively active in iOS standalone mode — zero behavioral or visual regressions are introduced for users accessing the app via any standard browser

## Clarifications

### Session 2026-02-21

- Q: When the PWA is cold-launched directly to a non-root URL (e.g., via notification) with no prior in-session history, what should the back button do? → A: Show the back button; navigating it goes to the logical root/parent of the current page (e.g., `/inventory` for an item detail page)
- Q: How does sticky-header layout work — does the header overlay content (with compensating padding) or push the content area down? → A: Header overlays page content; the scrollable content area receives top padding equal to the header height so no content is hidden behind the header
- Q: Should the iOS status bar style update immediately when the user switches themes mid-session, or is it set once at launch? → A: Set once at launch reflecting whichever theme is active at that moment; the updated style takes effect on the next cold-launch after a theme change

## Assumptions

- The existing theme system (from spec 012) is in place and primary theme color values are accessible for status bar meta tag configuration
- The application router maintains a navigable history stack that can be inspected to determine whether the user is on a root-level page vs. a sub-page
- "Root-level pages" are defined as the primary destinations accessible directly from the main navigation menu (e.g., Dashboard, Inventory, Shopping List, Members, Settings)
- Pull-to-refresh will invoke the same data-fetching logic used by each page's initial load — no new backend API endpoints are required
- iOS PWA standalone mode is detected client-side via `window.navigator.standalone` (the standard detection mechanism for iOS home screen apps)
- Android Chrome and desktop PWA behavior is out of scope — existing behavior on those platforms must not regress but no enhancements are being added for them in this feature

## Dependencies

- Spec 011 (Mobile Responsive UI) — base mobile layout must be in place; this spec builds on that foundation
- Spec 012 (Theme Toggle) — theme color values are needed for status bar meta tag styling and splash screen color
