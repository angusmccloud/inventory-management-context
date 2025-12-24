# Feature Specification: Reference Data Management

**Feature Branch**: `005-reference-data`
**Created**: December 9, 2025
**Status**: Specification Complete
**Parent Feature**: `001-family-inventory-mvp`

## Purpose and Problem Statement

Families need consistent, reusable reference data for storage locations and stores to maintain data quality and streamline inventory management. Without centralized management of these reference entities, families must rely on free-text entry, leading to duplicates, inconsistencies, and poor data quality (e.g., "Pantry" vs "pantry" vs "Kitchen Pantry").

This feature enables adults to create and manage standardized storage locations (pantry, garage, fridge) and store/vendor lists that serve as the foundation for inventory item configuration. By providing a dedicated management interface, families can ensure consistent data entry and improve the overall user experience when working with inventory items and shopping lists.

The goal is to improve data consistency, reduce entry errors, and provide a better user experience through centralized reference data management.

## User Scenarios & Testing *(mandatory)*

### User Story 6 - Adults Manage Reference Data (Priority: P3)

Adults manage reference data for the family, including storage locations (pantry, garage, fridge) and store/vendor lists, which are used when configuring inventory items.

**Why this priority**: This improves data consistency and user experience, but families can function with free-text entry initially. It's a quality-of-life improvement that becomes more valuable as the family's inventory grows.

**Independent Test**: Can be tested by creating storage locations and stores, then verifying they appear as options when adding/editing inventory items.

**Acceptance Scenarios**:

1. **Given** an adult is managing settings, **When** they add a storage location, **Then** it's available when creating/editing inventory items
2. **Given** an adult is managing settings, **When** they add a store/vendor, **Then** it's available for selecting preferred and alternate stores
3. **Given** reference data exists, **When** an adult edits or removes it, **Then** changes are reflected in the selection options
4. **Given** an adult attempts to create a storage location, **When** they enter a name that already exists, **Then** the system prevents the duplicate and shows an error message
5. **Given** a storage location is referenced by inventory items, **When** an adult attempts to delete it, **Then** the system prevents deletion and shows which items reference it
6. **Given** an adult edits a storage location name, **When** the location is referenced by inventory items, **Then** the updated name appears in all referencing items

---

### Edge Cases

- **Deletion with References**: What happens when a location or store is deleted but inventory items still reference it?
- **Name Changes with References**: How should the system handle editing a location/store name that's referenced by many items?
- **Case Sensitivity**: Should "Pantry" and "pantry" be considered duplicates?
- **Whitespace Handling**: How should leading/trailing whitespace in names be handled?
- **Concurrent Edits**: What happens when multiple family members edit the same reference data simultaneously?
- **Empty Lists**: How should the UI handle families with no storage locations or stores defined?

## Requirements *(mandatory)*

### Functional Requirements

#### Storage Location Management (US6)

- **FR-040**: System MUST allow adults to create storage locations
- **FR-041**: System MUST allow adults to add an optional description to storage locations
- **FR-042**: System MUST allow adults to edit storage location names and descriptions
- **FR-043**: System MUST allow adults to delete storage locations that are not referenced by any inventory items
- **FR-044**: System MUST prevent deletion of storage locations that are referenced by active inventory items
- **FR-045**: System MUST display which inventory items reference a storage location when deletion is prevented
- **FR-047**: System MUST trim leading and trailing whitespace from storage location names
- **FR-048**: System MUST make storage locations available as selection options when creating/editing inventory items
- **FR-049**: System MUST update all referencing inventory items when a storage location name is changed

#### Store/Vendor Management (US6)

- **FR-050**: System MUST allow adults to create stores
- **FR-051**: System MUST allow adults to add an optional address to stores
- **FR-052**: System MUST allow adults to edit store names and addresses
- **FR-053**: System MUST allow adults to delete stores that are not referenced by any inventory items or shopping list items
- **FR-054**: System MUST prevent deletion of stores that are referenced by active inventory items or shopping list items
- **FR-055**: System MUST display which items reference a store when deletion is prevented
- **FR-057**: System MUST trim leading and trailing whitespace from store names
- **FR-058**: System MUST make stores available as selection options when creating/editing inventory items
- **FR-059**: System MUST make stores available as selection options when managing shopping list items
- **FR-060**: System MUST update all referencing items when a store name is changed

#### Data Integrity (US6)

- **FR-061**: System MUST validate storage location names are between 1-50 characters
- **FR-062**: System MUST validate storage location descriptions are 0-200 characters
- **FR-063**: System MUST validate store names are between 1-100 characters
- **FR-064**: System MUST validate store addresses are 0-200 characters
- **FR-065**: System MUST persist all reference data changes across user sessions
- **FR-066**: System MUST maintain referential integrity when reference data is modified

#### User Interface (US6)

- **FR-067**: System MUST provide a dedicated settings/management page for reference data
- **FR-068**: System MUST display all storage locations for the family in a list view
- **FR-069**: System MUST display all stores for the family in a list view
- **FR-070**: System MUST provide clear error messages when validation fails
- **FR-071**: System MUST provide confirmation dialogs before deleting reference data
- **FR-072**: System MUST show real-time validation feedback during data entry

#### Non-Functional & Compliance

- **FR-073**: Reference data management UI MUST meet WCAG 2.1 AA color-contrast standards and maintain visible focus states; white-on-white or other low-contrast combinations are prohibited
- **FR-074**: Automated accessibility checks (e.g., axe) MUST run in CI for all new or changed reference-data pages/components and block merges on failures
- **FR-075**: CI MUST run `npm run type-check` and fail the pipeline on any TypeScript errors for this feature
- **FR-076**: CI MUST run the Vite production build via `npm run build` and block merges on build failures for this feature

### Key Entities

**StorageLocation**: A reference location where items are kept (e.g., pantry, garage, refrigerator). Defined per family.

**Attributes** (from data-model.md):
- `locationId`: Unique identifier (UUID)
- `familyId`: Reference to the family
- `name`: Location name (required, 1-50 characters, unique per family)
- `description`: Optional description (0-200 characters)
- `entityType`: 'StorageLocation'
- `createdAt`: Timestamp when created
- `updatedAt`: Timestamp of last modification

**Validation Rules**:
- Name uniqueness enforced case-insensitively per family
- Leading/trailing whitespace automatically trimmed
- Cannot be deleted if referenced by active inventory items

**Relationships**:
- Belongs to one Family
- Referenced by zero or more InventoryItems

---

**Store**: A reference location where items can be purchased (e.g., grocery store, hardware store). Defined per family.

**Attributes** (from data-model.md):
- `storeId`: Unique identifier (UUID)
- `familyId`: Reference to the family
- `name`: Store name (required, 1-100 characters, unique per family)
- `address`: Optional address (0-200 characters)
- `entityType`: 'Store'
- `createdAt`: Timestamp when created
- `updatedAt`: Timestamp of last modification

**Validation Rules**:
- Name uniqueness enforced case-insensitively per family
- Leading/trailing whitespace automatically trimmed
- Cannot be deleted if referenced by inventory items or shopping list items

**Relationships**:
- Belongs to one Family
- Referenced by zero or more InventoryItems (as preferred or alternate store)
- Referenced by zero or more ShoppingListItems

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Adults can create storage locations and stores in under 15 seconds per entry
- **SC-002**: 95% of inventory items use reference data instead of free-text after 2 weeks of use
- **SC-003**: Zero duplicate storage locations or stores exist per family (enforced by system)
- **SC-004**: 100% of deletion attempts on referenced data are prevented with clear messaging
- **SC-005**: All reference data changes propagate to referencing items within 1 second
- **SC-006**: Families report improved data consistency within 1 week of using reference data management
- **SC-007**: Zero data integrity violations occur when reference data is modified or deleted

## Out of Scope

The following capabilities are explicitly excluded from this specification:

### Excluded from This Feature

- Automatic creation of storage locations or stores based on common patterns
- Import/export of reference data
- Sharing reference data across families
- Hierarchical or nested storage locations (e.g., "Kitchen > Pantry > Top Shelf")
- Store categories or types (e.g., "Grocery", "Hardware")
- Store hours, phone numbers, or other detailed store information
- Geolocation or mapping integration for stores
- Favorite or frequently-used marking for locations/stores
- Bulk editing or deletion of reference data
- Audit history of reference data changes
- Archiving reference data (only active deletion is supported)

### Handled by Other Features

- Family and member management → See `001-family-inventory-mvp`
- Inventory item creation and management → See `001-family-inventory-mvp`
- Shopping list management → See `002-shopping-lists`
- Role-based permissions for adults vs suggesters → See `003-member-management`

## Assumptions

- Only adults can create, edit, or delete reference data; suggesters can view but not modify
- Families will define storage locations and stores based on their specific household needs
- Storage location and store names are sufficient identifiers; additional metadata is optional
- Case-insensitive uniqueness is acceptable (families won't need "Pantry" and "pantry" as separate entities)
- Reference data changes should propagate immediately to all referencing items
- Families prefer to prevent deletion of referenced data rather than cascade deletes or orphan references
- The number of storage locations and stores per family will remain manageable (< 100 each)
- Reference data management is accessed through a settings or configuration page, not inline during inventory management

## Dependencies

### From Parent Feature (001-family-inventory-mvp)

- Family entity and family isolation mechanisms
- Member entity with role-based permissions (adult/admin only for modifications)
- InventoryItem entity that references StorageLocation and Store
- Authentication and authorization system
- DynamoDB single-table design and access patterns

### From Related Features

- ShoppingListItem entity (from 002-shopping-lists) that references Store
- Shopping list management workflows that use store reference data

### External Dependencies

- Web hosting infrastructure (from parent feature)
- Data storage system (DynamoDB from parent feature)
- Standard web browser capabilities (from parent feature)

### Data Model Dependencies

This feature relies on the StorageLocation and Store entities defined in [`001-family-inventory-mvp/data-model.md`](../001-family-inventory-mvp/data-model.md):
- StorageLocation (lines 220-265)
- Store (lines 269-315)

## Risk Considerations

- **User Confusion**: Users may not understand why they can't delete a location/store that's in use
  - *Mitigation*: Clear error messages showing which items reference the data; provide option to view those items

- **Data Migration**: Existing families using free-text may have inconsistent data that needs cleanup
  - *Mitigation*: Provide guidance on consolidating duplicate entries; consider future bulk-edit tools

- **Naming Conflicts**: Users may want similar but distinct names (e.g., "Costco Downtown" vs "Costco Suburbs")
  - *Mitigation*: Allow sufficient name length (100 chars for stores); encourage descriptive names

- **Concurrent Modifications**: Multiple admins editing the same reference data could cause conflicts
  - *Mitigation*: Implement optimistic locking with clear conflict resolution UI

- **Orphaned References**: System bugs could create orphaned references if deletion logic fails
  - *Mitigation*: Implement referential integrity checks; add monitoring for orphaned references

- **Performance**: Checking references before deletion could be slow for families with many items
  - *Mitigation*: Use efficient DynamoDB queries; implement caching for reference counts

---

## Related Features

This specification builds upon and relates to other features in the family inventory management system:

| Feature ID | Name | Relationship | Status |
|------------|------|--------------|--------|
| `001-family-inventory-mvp` | Family Inventory MVP | **Parent** - Provides foundation (Family, Member, StorageLocation, Store entities) | Implementation Complete |
| `002-shopping-lists` | Shopping List Management | **Consumer** - Uses Store reference data for list organization | Specification Complete |
| `003-member-management` | Family Member Management | **Sibling** - Manages member roles that control reference data permissions | Planned |

**Note**: This specification focuses on the management interface for reference data. The entities themselves are already defined in the parent feature's data model and are used by inventory and shopping list features.