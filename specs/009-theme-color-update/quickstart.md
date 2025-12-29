# Quickstart: Theme Color System Update

**Feature**: 009-theme-color-update  
**Branch**: `009-theme-color-update`  
**Date**: December 28, 2025

## Overview

Update the application's theme color system to use new branded colors across light and dark modes. This guide helps developers understand, implement, and test the new theme colors.

## Prerequisites

- Frontend repository cloned and dependencies installed (`npm install`)
- Node.js 24.x LTS
- Basic understanding of CSS custom properties and Tailwind CSS
- Familiarity with Next.js App Router structure

## Quick Start (5 minutes)

### 1. View Current Theme

```bash
cd inventory-management-frontend
npm run dev
```

Open http://localhost:3000 and toggle your system dark mode to see current colors.

### 2. Update Theme Colors

Edit `app/globals.css` and update the color values:

```css
/* Light Theme */
:root {
  --color-background: 140 197 154;      /* #8CC59A */
  --color-text-default: 10 51 21;       /* #0A3315 */
  --color-primary: 10 51 21;            /* #0A3315 */
  --color-primary-contrast: 140 197 154; /* #8CC59A */
  /* ... continue with other colors */
}

/* Dark Theme */
@media (prefers-color-scheme: dark) {
  :root {
    --color-background: 10 51 21;         /* #0A3315 */
    --color-text-default: 140 197 154;    /* #8CC59A */
    --color-primary: 140 197 154;         /* #8CC59A */
    --color-primary-contrast: 10 51 21;   /* #0A3315 */
    /* ... continue with other colors */
  }
}
```

### 3. Verify Changes

Reload browser and toggle dark mode. Colors should update immediately.

## Using Theme Colors

### In Components

**✅ Correct - Use theme tokens**:
```tsx
// Primary button
<button className="bg-primary text-primary-contrast hover:bg-primary-hover">
  Save
</button>

// Card with theme colors
<div className="bg-surface border border-border">
  <h3 className="text-text-primary">Title</h3>
  <p className="text-text-secondary">Description</p>
</div>
```

**❌ Wrong - Hardcoded colors**:
```tsx
// Don't use Tailwind defaults
<button className="bg-blue-500 text-white hover:bg-blue-600">
  Save
</button>

// Don't use hex colors
<div style={{ backgroundColor: '#0ea5e9' }}>
  Content
</div>
```

### Available Color Tokens

| Token | Usage |
|-------|-------|
| `bg-background` | Page backgrounds |
| `text-text-default` | Body text, headings |
| `bg-primary` | Primary buttons, CTAs |
| `text-primary-contrast` | Text on primary backgrounds |
| `bg-secondary` | Secondary buttons |
| `text-secondary-contrast` | Text on secondary backgrounds |
| `bg-tertiary` | Badges, tags |
| `text-tertiary-contrast` | Text on tertiary backgrounds |
| `bg-error` | Error states |
| `text-error-contrast` | Text on error backgrounds |
| `border-border` | Default borders |

### With Opacity

```tsx
<div className="bg-primary/10">       {/* 10% opacity */}
<div className="bg-primary/50">       {/* 50% opacity */}
<div className="bg-primary/90">       {/* 90% opacity */}
```

## Finding Hardcoded Colors

### Search for violations

```bash
# Find Tailwind default color classes
grep -r "bg-\(blue\|gray\|red\|green\|amber\|indigo\)-[0-9]" app/ components/ --include="*.tsx" --include="*.ts"

# Find hex color codes
grep -r "#[0-9a-fA-F]\{6\}" app/ components/ --include="*.tsx" --include="*.ts"

# Find RGB color functions
grep -r "rgb([0-9]" app/ components/ --include="*.tsx" --include="*.ts"
```

### Common violations and fixes

| Violation | Fix |
|-----------|-----|
| `bg-blue-500` | `bg-primary` |
| `text-gray-900 dark:text-gray-100` | `text-text-default` |
| `text-gray-500` | `text-text-secondary` |
| `border-gray-200 dark:border-gray-700` | `border-border` |
| `bg-red-500` | `bg-error` |
| `bg-green-500` | `bg-success` (if success color added) |

## Testing

### Run Unit Tests

```bash
npm test
```

### Run Accessibility Tests

```bash
npm test -- --testPathPattern=accessibility
```

### Manual Testing Checklist

- [ ] View application in light mode
- [ ] View application in dark mode
- [ ] Toggle system preference while app is open (colors update immediately)
- [ ] Check all pages: login, dashboard, inventory, members, etc.
- [ ] Verify buttons have visible hover states
- [ ] Verify form inputs have visible focus states
- [ ] Verify error messages use error colors
- [ ] Check color contrast with browser DevTools (Lighthouse audit)

## Accessibility Validation

### Browser DevTools

1. Open Chrome/Edge DevTools (F12)
2. Run Lighthouse audit
3. Check "Accessibility" score
4. Review "Color contrast" issues (should be 0)

### Command Line

```bash
# Install axe-cli
npm install -g @axe-core/cli

# Run accessibility audit
axe http://localhost:3000 --tags wcag2aa
```

### Expected Contrast Ratios

All theme color combinations meet WCAG AA:
- Light mode: Background/Text = 8.2:1 ✅
- Dark mode: Background/Text = 8.2:1 ✅
- Primary/Contrast = 8.2:1 ✅
- Secondary/Contrast = 7.4:1 ✅
- Tertiary/Contrast = 6.1:1 ✅
- Error/Contrast = 6.3:1 ✅

## Common Issues

### Issue: Colors don't update when toggling system theme

**Solution**: Clear browser cache and hard reload (Cmd+Shift+R / Ctrl+Shift+R)

### Issue: Some components still show old colors

**Solution**: Check for inline styles or hardcoded colors in component files. Search for:
- `style={{ color: '...' }}`
- `className="bg-blue-500"` (Tailwind defaults)
- `#0ea5e9` (hex colors)

### Issue: Focus states not visible

**Solution**: Ensure `focus:ring-primary` is applied to interactive elements:
```tsx
<button className="... focus:ring-2 focus:ring-primary focus:ring-offset-2">
```

## Migration Strategy

**Bottom-up approach** (recommended order):

1. **Common components** (`components/common/`)
   - Button, Card, Input, Badge, Alert
   - Highest impact, most reused

2. **Feature components** (`components/inventory/`, `components/members/`, etc.)
   - Inventory lists, member cards, shopping lists
   - Compose updated common components

3. **Pages** (`app/dashboard/`, `app/(auth)/`, etc.)
   - Dashboard pages, login, invitation acceptance
   - Final integration layer

4. **Verify** - Run full test suite and visual regression tests

## Documentation

- [Full Theme Guide](../../../inventory-management-frontend/THEME.md)
- [Quick Reference](../../../inventory-management-frontend/THEME-QUICK-REF.md)
- [Implementation Details](../../../inventory-management-frontend/THEME-IMPLEMENTATION.md)
- [Feature Specification](./spec.md)
- [Research Findings](./research.md)

## Getting Help

- Review [spec.md](./spec.md) for functional requirements
- Check [research.md](./research.md) for design decisions
- Search existing components for usage patterns
- Ask team for code review on theme color usage

## Next Steps

After implementing theme colors:
1. Run full test suite (`npm test`)
2. Run accessibility audit
3. Visual regression testing (manual or automated)
4. Create pull request with screenshots (light + dark mode)
5. Request code review focusing on color usage
