# Theme Color Migration Checklist

**Feature**: 009-theme-color-update  
**Created**: December 28, 2025  
**Last Updated**: December 28, 2025

## Overview

This document tracks all components and files that require theme color updates. Files are prioritized by usage frequency and architectural importance.

## Migration Status Legend

- ✅ **Complete** - All hardcoded colors replaced with theme tokens
- 🚧 **In Progress** - Partially updated, work remaining
- ⏳ **Pending** - Not yet started
- ⏭️ **Skipped** - Intentionally skipped (justification required)

---

## Priority 1: Common Components (Foundation)

These components are used throughout the application and must be updated first.

| Component | Status | Hardcoded Colors | Notes |
|-----------|--------|------------------|-------|
| Alert | ✅ | bg-blue/green/yellow/red-* | Updated to use secondary/primary/tertiary/error tokens |
| Badge | ✅ | None found | Already using theme tokens |
| Button | ✅ | None found | Already using theme tokens |
| Card | ✅ | None found | Already using theme tokens |
| Dialog | ✅ | bg-gray-500, dark:bg-gray-900 | Updated to use bg-surface/75 with backdrop-blur |
| Input | ✅ | None found | Already using theme tokens |
| Select | ✅ | bg-white, dark:bg-gray-800, text-gray-*, ring-blue/red/green-* | Updated to use theme tokens |
| TabNavigation | ✅ | border-gray-*, border-blue-*, text-blue/gray-*, bg-blue-50 | Updated to use theme tokens |

---

## Priority 2: Layout Components

Core application structure and navigation.

| Component | Status | Hardcoded Colors | Notes |
|-----------|--------|------------------|-------|
| app/layout.tsx | ⏳ | themeColor: '#3b82f6' | Update metadata |
| app/dashboard/layout.tsx | ⏳ | Unknown | Need to check |
| app/(auth)/login/page.tsx | ⏳ | Unknown | Need to check |
| app/accept-invitation/page.tsx | ⏳ | Unknown | Need to check |

---

## Priority 3: Feature Components - Family

| Component | Status | Hardcoded Colors | Notes |
|-----------|--------|------------------|-------|
| CreateFamilyForm.tsx | ⏳ | bg-red-50, bg-blue-600, hover:bg-blue-500, bg-gray-100, hover:bg-gray-200 | 5 hardcoded color classes |

---

## Priority 4: Feature Components - Dashboard

| Component | Status | Hardcoded Colors | Notes |
|-----------|--------|------------------|-------|
| NFCStatsWidget.tsx | ⏳ | bg-white, dark:bg-gray-800, bg-gray-50, dark:bg-gray-700, bg-blue-600, hover:bg-blue-700 | Multiple instances (9+ color classes) |

---

## Priority 5: Feature Components - Shopping List

| Component | Status | Hardcoded Colors | Notes |
|-----------|--------|------------------|-------|
| ShoppingList.tsx | ⏳ | bg-gray-500, dark:bg-gray-900, bg-white, dark:bg-gray-800 | Modal overlay + container |
| AddItemForm.tsx | ⏳ | text-gray-*, dark:bg-gray-800, ring-gray-*, focus:ring-blue-*, bg-red-50 | Form inputs + error states |
| EditShoppingListItemForm.tsx | ⏳ | text-gray-*, dark:bg-gray-800, ring-gray-*, focus:ring-blue-*, bg-red-50 | Form inputs + error states |
| ShoppingListItem.tsx | ⏳ | bg-white, dark:bg-gray-800, border-gray-*, bg-gray-50 | Card component with states |

---

## Priority 6: Feature Components - Inventory

| Component | Status | Hardcoded Colors | Notes |
|-----------|--------|------------------|-------|
| AddItemForm.tsx | ⏳ | text-gray-*, dark:bg-gray-800, ring-gray-*, focus:ring-blue-*, bg-red-50 | Form inputs + error states |
| AdjustQuantity.tsx | ⏳ | bg-red-50, dark:bg-red-900/20 | Error state display |
| EditItemForm.tsx | ⏳ | text-gray-*, dark:bg-gray-800, ring-gray-*, focus:ring-blue-*, bg-red-50 | Form inputs + error states |
| InventoryList.tsx | ⏳ | bg-white, dark:bg-gray-800, bg-red-100, bg-gray-100, dark:bg-gray-700 | List container + status badges |
| NFCUrlManager.tsx | ⏳ | **MANY** bg-white/gray/blue/yellow/green/red colors (15+ instances) | Complex component, high priority |

---

## Priority 7: Feature Components - Members

| Component | Status | Hardcoded Colors | Notes |
|-----------|--------|------------------|-------|
| RemoveMemberDialog.tsx | ⏳ | bg-red-50, border-red-200 | Warning banner |
| InvitationList.tsx | ⏳ | bg-white, dark:bg-gray-800, border-gray-* | Card component |
| MemberCard.tsx | ⏳ | bg-white, dark:bg-gray-800, border-gray-* | Card component |

---

## Priority 8: Feature Components - Notifications & Reference Data

| Component | Status | Hardcoded Colors | Notes |
|-----------|--------|------------------|-------|
| *(To be discovered)* | ⏳ | Unknown | Need to check these directories |

---

## Migration Patterns

### Common Replacements

#### Text Colors
- `text-gray-900` / `dark:text-gray-100` → `text-text-default`
- `text-gray-700` / `dark:text-gray-300` → `text-text-secondary`
- `text-gray-600` / `dark:text-gray-400` → `text-text-secondary`
- `text-gray-500` / `dark:text-gray-500` → `text-text-disabled`

#### Background Colors
- `bg-white` / `dark:bg-gray-800` → `bg-surface`
- `bg-gray-50` / `dark:bg-gray-700` → `bg-surface-elevated`
- `bg-blue-600` → `bg-primary`
- `bg-red-50` → `bg-error/10`
- `bg-green-50` → `bg-primary/10` (for success states)
- `bg-yellow-50` → `bg-tertiary/10` (for warning states)

#### Border Colors
- `border-gray-300` / `dark:border-gray-600` → `border-border`
- `border-gray-200` / `dark:border-gray-700` → `border-border`
- `border-blue-600` → `border-primary`
- `border-red-500` → `border-error`

#### Ring/Focus Colors
- `ring-blue-600` / `focus:ring-blue-500` → `ring-primary` / `focus:ring-primary`
- `ring-gray-300` / `dark:ring-gray-600` → `ring-border`
- `ring-red-500` → `ring-error`
- `ring-green-500` → `ring-primary` (for success states)

#### Hover States
- `hover:bg-blue-700` → `hover:bg-primary-hover`
- `hover:bg-gray-200` → `hover:bg-surface-elevated`

---

## Testing Checklist

After migrating each component, verify:

- [ ] Component renders correctly in light mode
- [ ] Component renders correctly in dark mode
- [ ] Interactive states (hover, focus, active) use theme colors
- [ ] Error states use error color token
- [ ] Success states use primary color token
- [ ] No hardcoded colors in className strings
- [ ] No hex colors in style props (unless absolutely necessary)
- [ ] Accessibility contrast ratios meet WCAG AA (use axe DevTools)

---

## Notes

### Known Issues
- None yet

### Decisions
1. **Alert semantic colors**: info→secondary (teal), success→primary (green), warning→tertiary (brown), error→error (red)
2. **Overlay backgrounds**: Use `bg-surface/75 backdrop-blur-sm` instead of hardcoded gray with opacity
3. **Form inputs**: Standardize on `ring-border`, `focus:ring-primary` for all inputs

### Questions
- Should we create additional semantic tokens (e.g., `info`, `success`, `warning`) or continue using primary/secondary/tertiary/error?
  - **Decision**: Continue with existing tokens for MVP, consider semantic tokens in future iteration if needed
