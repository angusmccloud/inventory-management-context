# Manual Verification Checklist - Theme Colors

**Feature**: 009-theme-color-update  
**Date**: December 28, 2025  
**Phase**: 3 - Visual Verification (T023)

## Overview

This checklist ensures theme colors are correctly applied across all updated pages in both light and dark modes. Complete each check by viewing the page in a browser and toggling between light/dark modes.

---

## Testing Instructions

### How to Test
1. **Start the development server**: `npm run dev`
2. **Toggle dark mode**: Use browser DevTools or OS settings
   - **Chrome/Edge**: DevTools → Rendering → Emulate CSS media feature `prefers-color-scheme`
   - **macOS**: System Preferences → General → Appearance
   - **Windows**: Settings → Personalization → Colors → Choose your color

3. **Check each element** against the theme color specifications:
   - Background: `#8CC59A` (light) / `#0A3315` (dark)
   - Text Default: `#0A3315` (light) / `#8CC59A` (dark)
   - Primary: `#0A3315` (light) / `#8CC59A` (dark)
   - Secondary: `#09242A` (light) / `#D6E6E9` (dark)
   - Tertiary: `#44290D` (light) / `#BBD6F2` (dark)
   - Error: `#44140D` (light) / `#BBD2E7` (dark)

---

## Dashboard Page (`/dashboard`)

### Light Mode

- [ ] **Page Background**: Uses `#8CC59A` (light green)
- [ ] **Navigation Bar**: 
  - [ ] Background uses surface color
  - [ ] Brand "Inventory HQ" uses primary color
  - [ ] Navigation links use text-secondary when inactive
  - [ ] Active link uses primary color with primary border
  - [ ] Hover states show border and text color change
- [ ] **User Info Badge**: 
  - [ ] Role badge has primary/10 background with primary text
  - [ ] User name uses text-default color
- [ ] **Logout Button**: 
  - [ ] Surface background with border
  - [ ] Hover shows surface-elevated background
- [ ] **Notification Badge**: Uses error color for count indicator
- [ ] **Mobile Menu**: 
  - [ ] Toggle button uses text-secondary
  - [ ] Active items show primary color and primary/10 background
  - [ ] Border separators use border token

### Dark Mode

- [ ] **Page Background**: Uses `#0A3315` (dark green)
- [ ] **Navigation Bar**: Surface color (lighter than background)
- [ ] **Brand Text**: Uses `#8CC59A` (light green) for primary color
- [ ] **Text Colors**: All text readable with proper contrast
- [ ] **Borders**: Visible with border token color
- [ ] **Interactive States**: Hover/focus states clearly visible
- [ ] **Badges**: Proper contrast maintained

---

## Login Page (`/login`)

### Light Mode

- [ ] **Page Background**: Uses `#8CC59A` (light green)
- [ ] **Form Container**: Surface color with proper elevation
- [ ] **Headings**: Use text-default color
- [ ] **Input Fields**:
  - [ ] Border uses border token
  - [ ] Focus ring uses primary color
  - [ ] Placeholder text uses text-disabled
  - [ ] Input text uses text-default
  - [ ] Background uses surface token
- [ ] **Buttons**:
  - [ ] Primary button uses primary background
  - [ ] Button text has proper contrast
  - [ ] Hover states work correctly
- [ ] **Links**: 
  - [ ] "Forgot password" uses primary color
  - [ ] Hover shows primary-hover color
- [ ] **Alert Messages**: 
  - [ ] Error alerts use error color (not red-500)
  - [ ] Success alerts use primary color (not green-500)

### Dark Mode

- [ ] **Page Background**: Uses `#0A3315` (dark green)
- [ ] **Form Container**: Distinguishable from background
- [ ] **Input Fields**: Clear borders, readable text, proper focus states
- [ ] **All Text**: Readable contrast ratios
- [ ] **Verification Code Input**: Large text remains readable
- [ ] **Password Reset Flows**: All states properly themed

---

## Invitation Page (`/accept-invitation`)

### Light Mode

- [ ] **Page Background**: Uses `#8CC59A` (light green)
- [ ] **Form Container**: Surface color
- [ ] **Headings**: Text-default color
- [ ] **Success State**:
  - [ ] Checkmark circle uses primary/10 background
  - [ ] Icon uses primary color
  - [ ] All text uses proper theme tokens
- [ ] **Form Inputs**: Match login page styling (border, focus, placeholder)
- [ ] **Submit Button**: Primary variant with proper colors
- [ ] **Footer Text**: Text-secondary color
- [ ] **Loading Spinner**: Primary color for spinner border

### Dark Mode

- [ ] **Page Background**: Uses `#0A3315` (dark green)
- [ ] **Success State**: Primary color elements visible and readable
- [ ] **All Interactive Elements**: Proper contrast maintained
- [ ] **Loading State**: Spinner visible against dark background

---

## Common Components (Across All Pages)

### Button Component
- [ ] Primary variant: Primary background with primary-contrast text
- [ ] Secondary variant: Secondary colors
- [ ] Danger/Error variant: Error colors
- [ ] Hover states: Proper hover color variations
- [ ] Disabled states: Reduced opacity, no color changes
- [ ] Loading states: Spinner matches button color scheme

### Input Component
- [ ] Border: Uses border token (not gray-300)
- [ ] Focus: Primary ring color (not blue-600)
- [ ] Error state: Error border color
- [ ] Success state: Primary border color
- [ ] Disabled: Proper opacity reduction
- [ ] Placeholder: Text-disabled color

### Alert Component
- [ ] Info: Secondary color background/text
- [ ] Success: Primary color background/text
- [ ] Warning: Tertiary color background/text
- [ ] Error: Error color background/text
- [ ] Text contrast: All variants meet WCAG AA

### Card Component
- [ ] Background: Surface color
- [ ] Border: Border token color
- [ ] Elevated variant: Surface-elevated if applicable

### Badge Component
- [ ] Primary variant: Primary/10 background, primary text
- [ ] Status variants: Appropriate theme colors
- [ ] Text remains readable in both modes

### Dialog/Modal Component
- [ ] Overlay: Surface/75 with backdrop blur
- [ ] Container: Surface-elevated background
- [ ] Close button: Proper theming

### TabNavigation Component
- [ ] Active tab: Primary border and text
- [ ] Inactive tabs: Text-secondary
- [ ] Hover: Border and text color transition
- [ ] Border separators: Border token

### Select Component
- [ ] Matches Input styling exactly
- [ ] Dropdown arrow icon visible in both modes
- [ ] Options readable when opened

---

## Cross-Page Consistency Checks

- [ ] **Color Consistency**: Same semantic element uses same color across all pages
- [ ] **Typography Hierarchy**: Text-default, text-secondary, text-disabled used consistently
- [ ] **Interactive States**: Hover/focus/active states behave identically everywhere
- [ ] **Spacing & Layout**: No visual layout shifts between light/dark modes
- [ ] **No Tailwind Defaults**: No blue-500, gray-900, or other default Tailwind colors visible
- [ ] **No Hardcoded Colors**: Inspect DevTools - all colors should use CSS custom properties

---

## Accessibility Checks (Quick Visual)

- [ ] **Color Contrast**: All text is easily readable in both modes
- [ ] **Focus Indicators**: Focus rings clearly visible on interactive elements
- [ ] **Error States**: Error messages not relying solely on color
- [ ] **Icon+Text**: Icons paired with text labels where needed

---

## Browser Testing

Test in at least 2 browsers:

- [ ] **Chrome/Edge**: All checks pass
- [ ] **Firefox**: All checks pass
- [ ] **Safari** (if available): All checks pass

---

## Sign-Off

Once all checks are complete:

- **Tester**: _________________
- **Date**: _________________
- **Result**: ☐ Pass | ☐ Fail (with issues documented below)

### Issues Found

_Document any theme color inconsistencies or regressions below:_

1. 
2. 
3. 

---

## Next Steps

After completing this checklist:
1. Mark T023 as complete in tasks.md
2. Proceed to T024 (accessibility audit with axe-core)
3. Document any issues in GitHub issues or migration-checklist.md
