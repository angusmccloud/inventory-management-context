# API Contracts: Mobile Responsive UI Improvements

**Feature**: 011-mobile-responsive-ui  
**Date**: 2026-01-01  
**Phase**: 1 (Design & Contracts)

## Overview

This feature involves **frontend-only UI/UX changes** with **NO API modifications**. All existing API endpoints remain unchanged.

## API Changes

**None.**

This feature modifies only the presentation layer (CSS layouts, component rendering) and does not:
- Add new API endpoints
- Modify existing endpoint parameters
- Change request/response schemas
- Update validation rules
- Alter authentication/authorization logic

## Affected Frontend Routes

While API endpoints remain unchanged, the following **frontend routes** receive responsive UI updates:

### 1. `/dashboard/inventory` (Priority: P1)
- **UI Changes**: Single-column card layout on mobile, responsive button groups
- **API Dependency**: Uses existing `GET /api/inventory/list` endpoint
- **Request/Response**: Unchanged

### 2. `/dashboard/shopping-list` (Priority: P2)
- **UI Changes**: Responsive filter controls, vertical stacking on mobile
- **API Dependency**: Uses existing `GET /api/shopping-list/list` endpoint
- **Request/Response**: Unchanged

### 3. `/dashboard/suggestions` (Priority: P2)
- **UI Changes**: Toggle buttons → dropdown selector on mobile
- **API Dependency**: Uses existing `GET /api/suggestions/list` endpoint
- **Request/Response**: Unchanged

### 4. `/dashboard/members` (Priority: P3)
- **UI Changes**: Vertical header stacking on mobile
- **API Dependency**: Uses existing `GET /api/members/list` endpoint
- **Request/Response**: Unchanged

### 5. `/dashboard/settings` (Priority: P3)
- **UI Changes**: Icon-only buttons on narrow screens
- **API Dependency**: Uses existing settings endpoints
- **Request/Response**: Unchanged

## Component Props (Internal Contracts)

While external APIs remain unchanged, some **component interfaces** will be extended to support responsive behavior:

### PageHeader Component
```typescript
// Before
interface PageHeaderProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
  secondaryActions?: React.ReactNode[];
}

// After (new prop added)
interface PageHeaderProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
  secondaryActions?: React.ReactNode[];
  mobileVertical?: boolean; // NEW: Stack title/action vertically on mobile
}
```

### TabNavigation Component
```typescript
// Before
interface TabNavigationProps<T> {
  tabs: Array<{ label: string; value: T }>;
  activeTab: T;
  onChange: (value: T) => void;
}

// After (new prop added)
interface TabNavigationProps<T> {
  tabs: Array<{ label: string; value: T }>;
  activeTab: T;
  onChange: (value: T) => void;
  responsiveMode?: 'tabs' | 'dropdown' | 'auto'; // NEW: Render mode
}
```

### Button Component
```typescript
// Before
interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  onClick?: () => void;
  children: React.ReactNode;
}

// After (enhanced with responsive touch targets)
interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'sm' | 'md' | 'lg'; // Now includes touch target sizing
  onClick?: () => void;
  children: React.ReactNode;
  responsiveText?: boolean; // NEW: Hide text on mobile (icon-only)
}
```

## Backward Compatibility

All component prop changes are **backward compatible**:
- New props are optional with sensible defaults
- Existing component usage continues to work without modifications
- Non-responsive pages (if any) are unaffected

## Testing Contracts

No API contract tests required, but component contract tests will verify:

### Component Rendering Contracts
```typescript
// Example: PageHeader responsive behavior
describe('PageHeader responsive contract', () => {
  it('maintains title visibility at all viewport sizes', () => {
    // Test at 320px, 375px, 768px, 1024px
    // Verify title is always visible and readable
  });

  it('stacks title/action vertically when mobileVertical=true on mobile', () => {
    // Test layout direction changes based on viewport
  });
});
```

### Responsive Class Contracts
```typescript
// Example: Button touch target contract
describe('Button touch target contract', () => {
  it('applies minimum 44x44px touch target on mobile', () => {
    // Verify WCAG 2.1 AA compliance
  });
});
```

## Migration Guide

No migration required. All changes are additive and backward compatible.

### For Existing Pages
```tsx
// No changes needed - existing usage continues to work
<PageHeader
  title="Inventory"
  description="Manage items"
  action={<Button>Add Item</Button>}
/>
```

### For New Responsive Pages
```tsx
// Opt into responsive features via new props
<PageHeader
  title="Family Members"
  description="2 members"
  action={<Button>Invite</Button>}
  mobileVertical={true} // NEW: Enable responsive stacking
/>
```

## Summary

- **API Endpoints**: No changes
- **Component Props**: Backward-compatible additions
- **Data Schemas**: No changes
- **Validation Rules**: No changes
- **Breaking Changes**: None

This feature is a pure frontend enhancement with zero backend impact.
