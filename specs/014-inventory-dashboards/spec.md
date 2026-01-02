# Feature Specification: Inventory Management Dashboards

**Feature Branch**: `014-inventory-dashboards`  
**Created**: January 2, 2026  
**Status**: Draft  
**Input**: Multi-item inventory dashboards accessible via link without authentication

## Purpose and Problem Statement

While NFC pages (from feature 006) solve the problem of tracking single-item usage with minimal friction, there are scenarios where users need to manage multiple related items simultaneously. Examples include:

- **Storage Location Management**: Tracking all items in a pantry, fridge, or garage
- **Category Groups**: Managing all baking supplies or cleaning products together
- **Ad-hoc Collections**: Creating custom dashboards for specific events (e.g., party supplies, camping gear)

Current limitations:
- NFC pages only handle one item at a time
- Users must tap multiple NFC tags or navigate through the app to update multiple items
- No visual overview of related items in one place

This feature introduces **Inventory Dashboards** - shareable web pages that display multiple inventory items in a compact card/row layout. Each item can be manually adjusted using increment/decrement controls, similar to NFC pages but supporting multiple items on one page. Like NFC pages, dashboards are accessible via simple URLs without authentication, making them perfect for shared household use.

Key benefits:
- **Batch visibility**: See all related items at once
- **Quick adjustments**: Update multiple items in one session
- **Flexible grouping**: Base dashboards on storage locations OR specific item selections
- **Live data**: Location-based dashboards automatically reflect current inventory
- **Security**: Admin-controlled creation, URL rotation capability

## User Scenarios & Testing

### User Story 1 - Access Dashboard via Link (Priority: P1)

A household member receives a dashboard link and can open it on any device to view and adjust multiple inventory items without authentication.

**Why this priority**: This is the core functionality - making multi-item inventory accessible via simple links. Without this, the feature provides no value.

**Independent Test**: Generate a dashboard URL, open it in a browser (without being logged in), and verify all configured items are displayed with functional controls.

**Acceptance Scenarios**:

1. **Given** a valid dashboard URL, **When** a user opens it in any browser, **Then** the page loads without requiring login or authentication
2. **Given** the dashboard page loads, **When** the user views the page, **Then** they see all configured items displayed as compact cards/rows
3. **Given** items are displayed, **When** the user views each item, **Then** each shows: item name, current quantity, unit, and +/- controls
4. **Given** the user is viewing on mobile, **When** the page renders, **Then** the layout is mobile-responsive and touch-friendly
5. **Given** multiple items are shown, **When** the user scrolls, **Then** all items are accessible without horizontal scrolling
6. **Given** an item quantity is 0, **When** displayed, **Then** it shows a visual indicator (e.g., low stock warning color)

---

### User Story 2 - Manual Quantity Adjustments (Priority: P1)

A user can manually increase or decrease the quantity of any item on the dashboard, with immediate feedback and debounced updates (similar to NFC pages).

**Why this priority**: Core interaction pattern - users must be able to adjust quantities efficiently. This is the primary use case.

**Independent Test**: Open a dashboard, click +/- buttons on multiple items, and verify quantities update correctly with appropriate debouncing and feedback.

**Acceptance Scenarios**:

1. **Given** a dashboard is displayed, **When** the user clicks the + button on an item, **Then** the quantity increases by 1 and displays immediately
2. **Given** a dashboard is displayed, **When** the user clicks the - button on an item, **Then** the quantity decreases by 1 (minimum 0) and displays immediately
3. **Given** the user makes multiple rapid adjustments, **When** changes are processed, **Then** updates are debounced (500ms) to prevent excessive API calls
4. **Given** an adjustment is pending, **When** waiting for debounce, **Then** a visual indicator shows the change is being saved (e.g., spinner, "Saving..." text)
5. **Given** an adjustment succeeds, **When** the update completes, **Then** a success indicator briefly appears (e.g., checkmark, "+1" or "-1" badge)
6. **Given** an item reaches 0 quantity, **When** the user tries to decrease further, **Then** the quantity remains 0 and feedback indicates no change
7. **Given** an adjustment fails, **When** the API returns an error, **Then** the displayed quantity reverts to the last known value and an error message appears

---

### User Story 3 - Create Dashboard from Storage Locations (Priority: P2)

A family admin can create a dashboard based on one or more storage locations, showing all items currently stored in those locations with live updates.

**Why this priority**: Storage location dashboards are the most common use case (e.g., "pantry dashboard", "garage dashboard"). This makes the feature practical for real-world use.

**Independent Test**: As an admin, create a dashboard selecting "Pantry" and "Fridge" locations, verify all items in those locations appear on the dashboard, and confirm new items added to those locations automatically appear.

**Acceptance Scenarios**:

1. **Given** an admin user is logged in, **When** they navigate to dashboard creation, **Then** they see an option to create a dashboard based on storage locations
2. **Given** the creation interface, **When** the admin selects one or more storage locations, **Then** they can proceed to create the dashboard
3. **Given** a location-based dashboard is created, **When** the dashboard is accessed, **Then** it displays all active (non-archived) items currently in the selected locations
4. **Given** a location-based dashboard exists, **When** a new item is added to one of the selected locations, **Then** the dashboard automatically includes the new item (live, not snapshot)
5. **Given** a location-based dashboard exists, **When** an item is moved to a different location, **Then** it automatically disappears from the dashboard
6. **Given** a location-based dashboard exists, **When** an item is archived or deleted, **Then** it no longer appears on the dashboard
7. **Given** the admin creates the dashboard, **When** creation succeeds, **Then** a unique shareable URL is generated (format: `/d/{dashboardId}`)

---

### User Story 4 - Create Dashboard from Specific Items (Priority: P2)

A family admin can create a dashboard by selecting specific inventory items, creating a custom collection independent of storage locations.

**Why this priority**: Enables ad-hoc groupings for special purposes (e.g., party supplies from different locations, camping gear). Complements location-based dashboards.

**Independent Test**: As an admin, create a dashboard by manually selecting 3-5 items from different storage locations, verify only those items appear on the dashboard regardless of location changes.

**Acceptance Scenarios**:

1. **Given** an admin user is logged in, **When** they navigate to dashboard creation, **Then** they see an option to create a dashboard based on specific items
2. **Given** the creation interface, **When** the admin searches/browses inventory, **Then** they can select one or more items to include
3. **Given** a item-based dashboard is created, **When** the dashboard is accessed, **Then** it displays only the explicitly selected items
4. **Given** a item-based dashboard exists, **When** a selected item's storage location changes, **Then** it still appears on the dashboard (location-independent)
5. **Given** a item-based dashboard exists, **When** a selected item is archived or deleted, **Then** it no longer appears on the dashboard
6. **Given** a item-based dashboard is created, **When** creation succeeds, **Then** a unique shareable URL is generated

---

### User Story 5 - Manage Dashboard Settings (Priority: P2)

A family admin can view, edit, and manage existing dashboards including changing the title, updating item/location selections, and rotating URLs.

**Why this priority**: Administrative functionality required for maintaining dashboards over time. Lower priority than creation since dashboards can be deleted and recreated.

**Independent Test**: As an admin, edit an existing dashboard to change its title and add/remove items or locations, then verify changes are reflected immediately.

**Acceptance Scenarios**:

1. **Given** an admin user is logged in, **When** they view the dashboard list, **Then** they see all dashboards they've created with titles and access counts
2. **Given** the dashboard list is displayed, **When** the admin selects a dashboard, **Then** they can edit its title/name
3. **Given** a location-based dashboard is selected, **When** the admin edits it, **Then** they can add or remove storage locations from the selection
4. **Given** a item-based dashboard is selected, **When** the admin edits it, **Then** they can add or remove specific items from the selection
5. **Given** a dashboard may be compromised, **When** the admin requests URL rotation, **Then** a new dashboard URL is generated and the old one becomes inactive
6. **Given** a dashboard is no longer needed, **When** the admin deletes it, **Then** the dashboard URL becomes inactive and displays an error page
7. **Given** a dashboard is displayed, **When** the admin views its details, **Then** they see metadata: created date, last accessed date, total access count

---

### User Story 6 - Dashboard URL Management (Priority: P3)

Family admins can copy dashboard URLs, share them via various channels, and monitor usage statistics.

**Why this priority**: Nice-to-have administrative features that improve usability but aren't critical for core functionality.

**Independent Test**: As an admin, copy a dashboard URL to clipboard, share it via different methods, and verify access statistics are tracked.

**Acceptance Scenarios**:

1. **Given** a dashboard exists, **When** the admin views it in the admin interface, **Then** they can copy the full URL to clipboard
2. **Given** the dashboard URL is displayed, **When** the admin clicks a share button, **Then** they see options to share via messaging, email, or QR code
3. **Given** a dashboard is accessed multiple times, **When** the admin views its details, **Then** usage statistics are displayed (total accesses, last access time)
4. **Given** multiple dashboards exist, **When** the admin views the dashboard list, **Then** dashboards are sortable by name, creation date, or access count

---

### Edge Cases

- **Empty Dashboard**: What happens when a location-based dashboard has no items in the selected locations?
- **All Items Deleted**: What happens when all items on an item-based dashboard are deleted/archived?
- **Concurrent Adjustments**: What happens when multiple users adjust the same item simultaneously?
- **Inactive Dashboard URL**: What happens when a user accesses a rotated/deleted dashboard URL?
- **Location Changed**: For item-based dashboards, how do we handle items whose locations change?
- **Permission Changes**: What happens when a family admin is demoted to suggester role and can no longer manage dashboards?
- **Large Item Count**: How does the UI handle location-based dashboards with 50+ items?
- **Mobile Scrolling**: How do we ensure efficient scrolling on mobile with many items?

## Requirements

### Functional Requirements

#### Dashboard Creation and Management (US3, US4, US5)

- **FR-001**: System MUST allow family admins to create new inventory dashboards
- **FR-002**: System MUST support two dashboard types: location-based and item-based
- **FR-003**: Dashboard MUST have a unique, cryptographically random, non-guessable dashboard ID
- **FR-004**: Dashboard ID MUST be sufficiently long and random to prevent guessing or enumeration attacks
- **FR-005**: System MUST allow admins to assign a human-readable title/name to each dashboard
- **FR-006**: Location-based dashboards MUST support selection of one or more storage locations
- **FR-007**: Item-based dashboards MUST support selection of one or more specific inventory items
- **FR-008**: System MUST enforce that each dashboard has at least one location OR one item selected
- **FR-009**: System MUST store dashboard configuration (type, title, locations/items, created date, access stats)
- **FR-010**: System MUST allow admins to edit dashboard title and location/item selections after creation
- **FR-011**: System MUST allow admins to rotate dashboard URLs (deactivate old, create new)
- **FR-012**: System MUST allow admins to delete dashboards, making their URLs inactive
- **FR-013**: System MUST track dashboard access statistics (access count, last accessed timestamp)
- **FR-014**: System MUST list all dashboards for a family, visible only to admins
- **FR-015**: System MUST prevent non-admin users from creating or managing dashboards

#### Dashboard Access and Display (US1)

- **FR-016**: System MUST serve a web page at `/d/{dashboardId}` for valid dashboard IDs
- **FR-017**: Dashboard page MUST work without requiring authentication or login
- **FR-018**: Dashboard page MUST display the dashboard title at the top
- **FR-019**: Dashboard page MUST display all applicable items based on dashboard configuration
- **FR-020**: Location-based dashboards MUST show current items in selected locations (live query, not snapshot)
- **FR-021**: Item-based dashboards MUST show only explicitly selected items
- **FR-022**: System MUST exclude archived/deleted items from dashboard display
- **FR-023**: System MUST sort items alphabetically by name by default
- **FR-024**: Each item card/row MUST display: item name, current quantity, unit (if set), and adjustment controls
- **FR-025**: Dashboard page MUST be mobile-responsive and work on phone screens
- **FR-026**: Dashboard page MUST use a compact card/row layout to accommodate multiple items
- **FR-027**: Touch targets for +/- buttons MUST be at least 44x44px (WCAG AA mobile accessibility)
- **FR-028**: Dashboard page load time MUST be under 3 seconds on standard mobile connections
- **FR-029**: System MUST display an error page for invalid or inactive dashboard IDs

#### Quantity Adjustment Logic (US2)

- **FR-030**: Each item MUST have + and - buttons for manual quantity adjustment
- **FR-031**: Clicking + button MUST increase item quantity by 1
- **FR-032**: Clicking - button MUST decrease item quantity by 1 (minimum 0)
- **FR-033**: System MUST debounce quantity updates with 500ms delay to batch rapid changes
- **FR-034**: System MUST show visual feedback during debounce period (e.g., "Saving..." indicator)
- **FR-035**: System MUST show success feedback after adjustment completes (e.g., checkmark, "+1"/"-1" badge)
- **FR-036**: System MUST display error feedback if adjustment fails, reverting to last known quantity
- **FR-037**: System MUST enforce minimum inventory quantity of 0 (cannot go negative)
- **FR-038**: System MUST handle concurrent adjustments atomically to prevent race conditions
- **FR-039**: Adjustments MUST trigger existing low-stock notification logic if thresholds are crossed
- **FR-040**: System MUST support adjustments via dashboard, NFC pages, and authenticated web interface without conflicts
- **FR-041**: Dashboard MUST show real-time quantity updates from other users/sources (refresh on focus or poll)

#### Data Integrity (US3, US4, US5)

- **FR-042**: Location-based dashboards MUST reflect current item assignments (not snapshots)
- **FR-043**: When an item's location changes, location-based dashboards MUST update accordingly
- **FR-044**: When an item is added to a selected location, it MUST appear on relevant location-based dashboards
- **FR-045**: When an item is removed from a selected location, it MUST disappear from relevant location-based dashboards
- **FR-046**: When an item is archived/deleted, it MUST disappear from all dashboards (both types)
- **FR-047**: Item-based dashboards MUST retain selected items regardless of location changes
- **FR-048**: System MUST handle empty dashboards gracefully (show message "No items available")
- **FR-049**: Dashboard edits (title, selections) MUST apply immediately to the live dashboard URL

#### Security and Access Control (US3, US5, US6)

- **FR-050**: Dashboard URLs MUST be treated as shared secrets (possession grants access)
- **FR-051**: System MUST use HTTPS for all dashboard page requests
- **FR-052**: System MUST enforce family isolation (dashboard ID maps to specific family's items)
- **FR-053**: Only family admins MUST be able to create, edit, rotate, or delete dashboards
- **FR-054**: System MUST allow URL rotation to handle compromised dashboard URLs
- **FR-055**: When a dashboard URL is rotated, the old URL MUST become inactive
- **FR-056**: System MUST NOT derive dashboard IDs from familyId or item/location IDs (independent random values)
- **FR-057**: System MAY implement basic rate limiting to prevent abuse
- **FR-058**: System MUST NOT require user accounts, sessions, or cookies for dashboard viewing

#### User Interface Standards (US1, US2)

- **FR-059**: Item cards/rows MUST be smaller than NFC page item display to fit multiple items
- **FR-060**: Dashboard page MUST use consistent styling with existing NFC pages and main application
- **FR-061**: System MUST use WCAG 2.1 AA compliant color contrast for all text and controls
- **FR-062**: Low stock items MUST be visually distinguished (e.g., yellow/red indicator)
- **FR-063**: Zero quantity items MUST be visually distinguished (e.g., gray text, warning icon)
- **FR-064**: Quantity changes MUST animate briefly to show +/- amount (similar to NFC pages)
- **FR-065**: Dashboard page MUST support both light and dark themes (match system preference)
- **FR-066**: Error states MUST be user-friendly and avoid exposing system internals
- **FR-067**: Loading states MUST be clear (skeleton screens or spinners)

#### Admin Interface (US3, US4, US5, US6)

- **FR-068**: System MUST provide a dashboard management interface accessible to admins
- **FR-069**: Dashboard management interface MUST list all family dashboards
- **FR-070**: Dashboard list MUST show: title, type (location/item), created date, access count, last accessed
- **FR-071**: Dashboard list MUST support sorting by title, creation date, or access count
- **FR-072**: Dashboard creation flow MUST guide admins through type selection and configuration
- **FR-073**: Dashboard edit interface MUST allow changing title and selections without creating new URL
- **FR-074**: System MUST provide "Copy URL" button with clipboard copy functionality
- **FR-075**: System MUST provide "Rotate URL" button with confirmation dialog
- **FR-076**: System MUST provide "Delete Dashboard" button with confirmation dialog
- **FR-077**: System MAY provide QR code generation for dashboard URLs
- **FR-078**: System MAY provide usage analytics (access trends over time)

#### Non-Functional Requirements

- **FR-079**: CI MUST run TypeScript type checking and fail on errors
- **FR-080**: CI MUST run production build and block merges on build failures
- **FR-081**: Dashboard page MUST work on iOS Safari, Android Chrome, and desktop browsers
- **FR-082**: System MUST maintain 80% test coverage for critical paths
- **FR-083**: API response time for dashboard data fetch MUST be under 1 second
- **FR-084**: API response time for quantity adjustments MUST be under 500ms
- **FR-085**: System MUST log all dashboard accesses and adjustments for troubleshooting

### Key Entities

**Dashboard**: A collection of inventory items displayed on a shareable web page.

**Attributes**:
- `dashboardId`: Unique, random, non-guessable identifier (URL path segment)
- `familyId`: Reference to the family (for isolation)
- `title`: Human-readable dashboard name
- `type`: Dashboard type: `location` or `items`
- `locationIds`: Array of storage location UUIDs (for location-based dashboards)
- `itemIds`: Array of inventory item UUIDs (for item-based dashboards)
- `isActive`: Boolean indicating if the dashboard URL is currently valid
- `createdBy`: Member UUID of the admin who created it
- `createdAt`: Timestamp of dashboard creation
- `lastAccessedAt`: Timestamp of most recent access
- `accessCount`: Total number of times the dashboard has been accessed

**DashboardItem** (view model, not stored):
- Computed from Dashboard configuration and current inventory state
- For location-based: query all items where `locationId IN dashboard.locationIds`
- For item-based: query all items where `itemId IN dashboard.itemIds`
- Both: filter out archived/deleted items

**InventoryItem**: (extends existing entity)
- No schema changes required
- Multiple dashboards can reference the same item

**StorageLocation**: (extends existing entity)
- No schema changes required
- Multiple dashboards can reference the same location

## Success Criteria

### Measurable Outcomes

- **SC-001**: Users can open a dashboard URL and view multiple items without authentication in under 3 seconds
- **SC-002**: 95% of dashboard page loads complete successfully without errors
- **SC-003**: Quantity adjustments on dashboards are atomic and prevent concurrent update conflicts
- **SC-004**: Family admins can create a dashboard (either type) in under 30 seconds
- **SC-005**: Dashboard pages work on any smartphone (iOS and Android) without app installation
- **SC-006**: Location-based dashboards automatically reflect current inventory assignments within 1 second of page load
- **SC-007**: Archived/deleted items do not appear on dashboards
- **SC-008**: Invalid or inactive dashboard URLs display a clear error message within 2 seconds
- **SC-009**: Quantity adjustment feedback (success/error) appears within 1 second of button click
- **SC-010**: Dashboards with 20+ items remain scrollable and performant on mobile devices

## Assumptions

- Users have smartphones or tablets capable of accessing web pages
- Household members understand that anyone with the dashboard URL can adjust inventory (acceptable trade-off for convenience)
- Basic rate limiting is sufficient for household use (not expecting bot attacks)
- Admins will share dashboard URLs responsibly (via secure channels when needed)
- Dashboard URLs have similar security model to NFC URLs (shared secrets, no per-user auth)
- Users will primarily access dashboards on mobile devices (mobile-first design)
- Most dashboards will have 5-20 items (some may have 50+)
- Location-based dashboards are more common than item-based dashboards

## Dependencies

- **Feature 001**: Family and inventory item management (MVP foundation)
- **Feature 005**: Storage location and reference data management
- **Feature 006**: NFC URL infrastructure (similar security model and adjustment patterns)
- Existing DynamoDB data model (extends with Dashboard entity)
- Existing low-stock notification system (triggered by adjustments)
- Existing quantity adjustment service (shared with NFC pages and main app)
- Domain: inventoryhq.io must serve dashboard pages at `/d/{dashboardId}` route

## Out of Scope

- **QR code alternatives**: Dashboard URLs can be shared via QR codes using third-party tools, but not generated by the system
- **Custom item ordering**: Items are sorted alphabetically; custom drag-and-drop ordering not supported in v1
- **Batch adjustments**: No "adjust all items by X" functionality; each item adjusted individually
- **Dashboard templates**: No pre-configured dashboard templates (e.g., "Weekly Inventory Check")
- **Public dashboards**: All dashboards are family-scoped; no cross-family sharing
- **Dashboard categories/tags**: No organizational hierarchy for dashboards
- **Advanced analytics**: No time-series charts or trend analysis for dashboard usage
- **Offline mode**: Dashboard pages require internet connection; no offline caching
- **Print view**: No printer-friendly layout for physical inventory checks
- **Export functionality**: No CSV/PDF export of dashboard data
- **Native mobile app**: All web-based; no iOS/Android native app integration
- **Per-user permissions**: Cannot restrict specific household members from viewing specific dashboards
- **Item images**: Dashboard items display text only; no thumbnail images
- **Barcode scanning**: No barcode input for quantity adjustments
- **Voice commands**: No voice-based quantity adjustments
- **Integration with external inventory systems**: Standalone feature within Inventory HQ

## Technical Notes

### Similarity to NFC Pages (Feature 006)

This feature builds on the successful NFC page pattern:
- **Same security model**: URLs as shared secrets, no authentication required
- **Same adjustment logic**: Debounced updates, atomic operations, low-stock triggers
- **Same user feedback**: Visual indicators for changes, success/error states
- **Same constraints**: Minimum quantity 0, concurrent update handling

Key differences:
- **Multiple items**: Dashboard displays many items vs NFC's single item
- **Manual adjustment**: Users click +/- vs NFC's auto-decrement on load
- **Compact layout**: Smaller cards/rows to fit multiple items on screen
- **Admin management**: Dashboards have CRUD interface; NFC URLs are per-item

### Database Design Considerations

**Dashboard Entity Storage**:
```
PK: FAMILY#{familyId}
SK: DASHBOARD#{dashboardId}
Attributes: title, type, locationIds, itemIds, isActive, createdBy, createdAt, accessCount, lastAccessedAt
```

**Dashboard Lookup by ID**:
- Requires GSI with `dashboardId` as partition key (or encode `familyId` in `dashboardId` to avoid GSI)
- Alternative: Use a separate table for dashboard lookups (trade-off: additional table vs GSI cost)

**Recommended approach**: Encode familyId in dashboardId using format `{familyId}_{randomString}` to enable O(1) lookup without GSI:
```
dashboardId format: "f47ac10b_7pQm3nX8kD5wZ2gS9YbN4"
                     ^familyId   ^22-char random string
```

Benefits:
- No GSI required for dashboard lookups
- Family isolation enforced at URL level
- Backward compatible with existing patterns (similar to NFC URL format)

### Performance Considerations

**Location-based Dashboard Query**:
```
Query all items where:
  PK = FAMILY#{familyId}
  SK begins_with ITEM#
  Filter: locationId IN [loc1, loc2, loc3] AND status = 'active'
```
- May return many items if locations are large
- Consider pagination if item count > 100
- Cache results for 30 seconds to reduce DynamoDB reads

**Item-based Dashboard Query**:
```
BatchGetItem for each itemId in dashboard.itemIds
  PK = FAMILY#{familyId}
  SK = ITEM#{itemId}
  Filter: status = 'active'
```
- More efficient than location-based for small item counts
- Max 100 items per dashboard (DynamoDB BatchGetItem limit)

### UI Layout Considerations

**Compact Item Card Design**:
```
┌─────────────────────────────────────┐
│ Paper Towels                        │
│ 3 rolls                             │
│ [−]  3  [+]                         │
└─────────────────────────────────────┘
```

- Height: ~80px per item (vs NFC's 200px)
- Font size: 14-16px for item name (vs NFC's 24px)
- Button size: 44px × 44px (WCAG AA touch target)
- Spacing: 8px between cards

**Mobile Scrolling**:
- Virtualize list if item count > 50 (use `react-window` or similar)
- Sticky header with dashboard title
- "Back to top" button for long lists

## Related Documentation

- **Feature 006 (NFC Inventory Tap)**: Foundation for URL-based unauthenticated access and adjustment patterns
- **Feature 001 (MVP)**: Core inventory item and family management
- **Feature 005 (Reference Data)**: Storage location management
- **Feature 010 (Streamline Quantity Controls)**: Shared quantity adjustment UI patterns
- **Feature 011 (Mobile Responsive UI)**: Mobile layout and touch target standards
