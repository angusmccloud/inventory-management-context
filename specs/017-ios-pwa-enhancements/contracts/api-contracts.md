# API Contracts: 017-ios-pwa-enhancements

**Date**: 2026-02-21

## No New API Contracts

This feature introduces **no new API endpoints** and **no changes to existing API contracts**.

All user stories are implemented entirely client-side:

| Feature | Implementation | Backend Impact |
|---------|---------------|---------------|
| Sticky header | CSS `position: sticky` | None |
| Back button | `router.back()` / `router.push()` | None |
| Pull-to-refresh | Calls existing fetch functions | None — existing endpoints reused |
| Safe area handling | CSS `env(safe-area-inset-*)` | None |
| Theme color meta | Next.js viewport metadata | None |

## Existing APIs Used (No Changes)

Pull-to-refresh will invoke the following existing API functions without modification:

| Page | Existing Function Called on Refresh |
|------|-------------------------------------|
| Inventory | `listInventoryItems(familyId)` |
| Shopping List | `listShoppingListItems(familyId)` |
| Dashboard | Page-specific data fetch |
| Members | `listFamilyMembers(familyId)` |
| Notifications | `listNotifications(familyId)` |

These functions already exist in `lib/api/` and are reused as-is.
