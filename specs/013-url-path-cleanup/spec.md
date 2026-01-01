# Feature Specification: URL Path Cleanup

**Feature Branch**: `013-url-path-cleanup`  
**Created**: 2026-01-01  
**Status**: Draft  
**Input**: User description: "URL Paths cleanup: Remove "/dashboard" from all URLs. Home Dashboard stays /dashboard. Others remove dashboard (ex: "/dashboard/inventory" becomes "/inventory")"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Simplified Navigation URLs (Priority: P1)

Users access application sections through cleaner, more intuitive URL paths that don't include redundant "/dashboard" prefixes, making URLs easier to remember, share, and bookmark.

**Why this priority**: This is the core change that simplifies the entire navigation structure and improves user experience across the application.

**Independent Test**: Can be fully tested by navigating to any non-home section (e.g., /inventory, /shopping-lists) and verifying the page loads correctly without the /dashboard prefix.

**Acceptance Scenarios**:

1. **Given** a user is on the home dashboard at `/dashboard`, **When** they click on the inventory link, **Then** they are navigated to `/inventory` (not `/dashboard/inventory`)
2. **Given** a user types `/inventory` directly in their browser, **When** they press enter, **Then** the inventory page loads successfully
3. **Given** a user has bookmarked `/dashboard/inventory` from before the change, **When** they visit the bookmark, **Then** they are redirected to `/inventory`
4. **Given** a user is viewing any application section, **When** they share the URL with another family member, **Then** the shared URL uses the simplified path format

---

### User Story 2 - Dashboard Home Remains Accessible (Priority: P1)

Users continue to access the main dashboard landing page at the `/dashboard` URL without disruption, maintaining consistency with existing bookmarks and muscle memory.

**Why this priority**: Critical to maintain the primary landing page URL to avoid breaking existing user workflows and bookmarks.

**Independent Test**: Can be fully tested by navigating to /dashboard and verifying it displays the home dashboard page.

**Acceptance Scenarios**:

1. **Given** a user types `/dashboard` in their browser, **When** they press enter, **Then** the home dashboard page loads
2. **Given** a user has `/dashboard` bookmarked, **When** they click the bookmark, **Then** they land on the home dashboard page
3. **Given** a user clicks the home or dashboard navigation item, **When** the navigation completes, **Then** they are at `/dashboard`

---

### User Story 3 - Seamless URL Migration (Priority: P2)

Users who have bookmarked or shared old dashboard-prefixed URLs experience automatic redirection to the new simplified URLs without encountering errors.

**Why this priority**: Ensures backward compatibility and prevents broken links for existing users.

**Independent Test**: Can be fully tested by accessing old URLs (e.g., /dashboard/inventory) and verifying they redirect to new URLs.

**Acceptance Scenarios**:

1. **Given** a user visits `/dashboard/inventory`, **When** the page loads, **Then** they are redirected to `/inventory`
2. **Given** a user visits `/dashboard/shopping-lists`, **When** the page loads, **Then** they are redirected to `/shopping-lists`
3. **Given** a user visits any old `/dashboard/*` URL (except `/dashboard` itself), **When** the page loads, **Then** they are redirected to the equivalent simplified URL

---

### Edge Cases

- What happens when a user visits `/dashboard/dashboard` (if such nested routing exists)?
- How does the system handle `/dashboard/` (with trailing slash) versus `/dashboard` (without)?
- What happens if a user tries to access an invalid path like `/dashboard/nonexistent`?
- How are query parameters preserved during redirects (e.g., `/dashboard/inventory?filter=low-stock` → `/inventory?filter=low-stock`)?
- What happens to deep-linked URLs shared in emails or external systems?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST maintain `/dashboard` as the home dashboard landing page URL
- **FR-002**: System MUST remove the `/dashboard` prefix from all other application section URLs (inventory, shopping lists, members, suggestions, reference data, etc.)
- **FR-003**: System MUST redirect old `/dashboard/*` URLs (except `/dashboard` itself) to their simplified equivalents (e.g., `/dashboard/inventory` → `/inventory`)
- **FR-004**: Redirects MUST preserve query parameters and hash fragments from the original URL
- **FR-005**: System MUST update all internal navigation links to use the new simplified URL structure
- **FR-006**: System MUST update breadcrumbs, page titles, and navigation indicators to reflect the current simplified URL
- **FR-007**: System MUST handle both trailing slash and non-trailing slash variants of URLs consistently
- **FR-008**: Navigation components (menus, buttons, links) MUST point to the new simplified URLs

### Key Entities

- **Route Definitions**: URL patterns for each application section (inventory, shopping lists, members, suggestions, reference data)
- **Navigation Links**: Internal links in menus, buttons, and components that reference application URLs
- **Redirects**: Mapping from old dashboard-prefixed URLs to new simplified URLs

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: All application sections (except home dashboard) are accessible via simplified URLs without the `/dashboard` prefix
- **SC-002**: Users can navigate to any section through direct URL entry without encountering 404 errors
- **SC-003**: All existing `/dashboard/*` bookmarks and shared links redirect successfully to simplified URLs within 100ms
- **SC-004**: 100% of internal navigation links use the new simplified URL structure
- **SC-005**: URL changes do not increase page load times or navigation delays
- **SC-006**: Zero broken links or 404 errors reported after deployment
