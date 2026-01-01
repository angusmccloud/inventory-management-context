# Data Model: Mobile Responsive UI Improvements

**Feature**: 011-mobile-responsive-ui  
**Date**: 2026-01-01  
**Phase**: 1 (Design & Contracts)

## Overview

This feature involves **UI/UX layout modifications only** and does not introduce new data entities or modify existing database schemas. All changes are CSS/component-level responsive adaptations using Tailwind utility classes.

## Existing Entities (Unchanged)

The following entities remain unchanged by this feature:

### InventoryItem
- **Purpose**: Represents physical inventory items tracked by families
- **Storage**: DynamoDB single-table design
- **Impact**: None - only display layout changes (single-column on mobile)
- **Fields**: Unchanged (itemId, name, quantity, storageLocationId, etc.)

### ShoppingListItem
- **Purpose**: Items to be purchased, organized by store
- **Storage**: DynamoDB single-table design
- **Impact**: None - only filter control layout changes
- **Fields**: Unchanged (shoppingItemId, name, storeId, isPurchased, etc.)

### Suggestion
- **Purpose**: User suggestions for inventory or shopping list items
- **Storage**: DynamoDB single-table design
- **Impact**: None - only filter control changes (toggle→dropdown)
- **Fields**: Unchanged (suggestionId, type, status, suggestedBy, etc.)

### Member
- **Purpose**: Family member accounts and roles
- **Storage**: DynamoDB single-table design
- **Impact**: None - only page header layout changes
- **Fields**: Unchanged (userId, familyId, role, email, etc.)

### Family
- **Purpose**: Family account and settings
- **Storage**: DynamoDB single-table design
- **Impact**: None - settings page button display changes
- **Fields**: Unchanged (familyId, name, createdAt, etc.)

## Component State (New)

While database entities remain unchanged, some component-level state will be introduced to manage responsive behavior:

### ResponsiveViewport (Browser-only State)
- **Purpose**: Track current viewport breakpoint for responsive rendering
- **Storage**: React component state / CSS media queries
- **Fields**:
  - `isMobile`: boolean (< 768px)
  - `isTablet`: boolean (768px-1023px)
  - `isDesktop`: boolean (≥ 1024px)
- **Usage**: Conditional rendering for TabNavigation (tabs vs dropdown)
- **Note**: Primarily handled via Tailwind responsive utilities, minimal JavaScript state

## Schema Changes

**None.** This feature is frontend-only with no backend API modifications or database schema changes.

## Migration Requirements

**None.** No database migrations required. All changes are component-level CSS and rendering logic.

## Validation Rules (Unchanged)

All existing Zod validation schemas remain unchanged:
- CreateInventoryItemRequest
- UpdateInventoryItemRequest
- CreateShoppingListItemRequest
- CreateSuggestionRequest
- InviteMemberRequest

## Summary

This feature exclusively modifies presentation layer (CSS layout and component rendering). Zero impact on data model, database schemas, API contracts, or validation rules. All changes are isolated to frontend component library.
