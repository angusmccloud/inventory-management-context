# Data Model: Theme Color System Update

**Feature**: 009-theme-color-update  
**Date**: December 28, 2025  
**Phase**: Phase 1 - Design

## Overview

This feature does not involve data storage or backend models. All changes are frontend-only, modifying CSS and TypeScript configuration files.

## Theme Configuration Model

While not a database entity, the theme configuration follows a structured model:

### Color Token Structure

```typescript
// Conceptual type model (not actual entity)
interface ThemeColorDefinition {
  tokenName: ColorToken;
  lightModeValue: RGBTriplet;
  darkModeValue: RGBTriplet;
  usage: string;
  contrastRequirement: 'AA' | 'AAA';
}

type ColorToken = 
  | 'background'
  | 'text-default'
  | 'primary' | 'primary-contrast' | 'primary-hover'
  | 'secondary' | 'secondary-contrast' | 'secondary-hover'
  | 'tertiary' | 'tertiary-contrast'
  | 'error' | 'error-contrast';

type RGBTriplet = [number, number, number]; // [R, G, B] values 0-255
```

### Color Palette Definition

**Light Mode Tokens**:
```typescript
const lightModeColors: Record<ColorToken, RGBTriplet> = {
  'background': [140, 197, 154],      // #8CC59A
  'text-default': [10, 51, 21],       // #0A3315
  'primary': [10, 51, 21],            // #0A3315
  'primary-contrast': [140, 197, 154], // #8CC59A
  'secondary': [9, 36, 42],           // #09242A
  'secondary-contrast': [121, 180, 190], // #79B4BE
  'tertiary': [68, 41, 13],           // #44290D
  'tertiary-contrast': [210, 183, 157], // #D2B79D
  'error': [68, 20, 13],              // #44140D
  'error-contrast': [212, 166, 161],  // #D4A6A1
};
```

**Dark Mode Tokens**:
```typescript
const darkModeColors: Record<ColorToken, RGBTriplet> = {
  'background': [10, 51, 21],         // #0A3315
  'text-default': [140, 197, 154],    // #8CC59A
  'primary': [140, 197, 154],         // #8CC59A
  'primary-contrast': [10, 51, 21],   // #0A3315
  'secondary': [121, 180, 190],       // #79B4BE
  'secondary-contrast': [9, 36, 42],  // #09242A
  'tertiary': [210, 183, 157],        // #D2B79D
  'tertiary-contrast': [68, 41, 13],  // #44290D
  'error': [212, 166, 161],           // #D4A6A1
  'error-contrast': [68, 20, 13],     // #44140D
};
```

## Relationships

**Theme-to-Component Relationship**:
- Each component references theme tokens via Tailwind classes
- Components do not store color values directly
- One-to-many: One theme definition → Many component usages

**Token-to-Usage Mapping**:
- `background`: Page backgrounds, main app container
- `text-default`: Body text, headings, labels
- `primary`: Primary buttons, active navigation, key CTAs
- `primary-contrast`: Text on primary backgrounds
- `secondary`: Secondary buttons, tabs, filters
- `secondary-contrast`: Text on secondary backgrounds
- `tertiary`: Badges, tags, supplementary UI elements
- `tertiary-contrast`: Text on tertiary backgrounds
- `error`: Error messages, validation failures, destructive actions
- `error-contrast`: Text on error backgrounds

## Validation Rules

**Color Value Validation**:
- RGB values MUST be integers between 0-255
- Hex values MUST be 6 characters (e.g., `#0A3315`, not `#0a3`)
- RGB triplets stored as space-separated values (e.g., `10 51 21`)

**Contrast Validation**:
- All text/background combinations MUST meet WCAG AA (4.5:1 minimum)
- Large text (18pt+) MUST meet WCAG AA for large text (3:1 minimum)
- Interactive elements MUST have visible focus states

**Token Validation**:
- All color tokens MUST be defined in both light and dark modes
- Token names MUST follow kebab-case convention
- Token names MUST be semantic (describe usage, not color)

## State Transitions

**Theme Mode Transition**:
```
System Light Mode → User changes OS preference → System Dark Mode
  ↓                                                ↓
CSS :root colors                              @media (prefers-color-scheme: dark) colors
  ↓                                                ↓
Components re-render                          Components re-render
with light theme                              with dark theme
```

**No manual state management required** - browser handles theme switching natively via media query detection.

## Storage

- **Storage Location**: No database storage. Configuration stored in source code.
- **Configuration Files**:
  - `app/globals.css`: CSS custom property definitions
  - `tailwind.config.js`: Tailwind theme configuration
  - `lib/theme.ts`: TypeScript type definitions and utilities

## Notes

This document primarily serves as a reference for the structured nature of the theme configuration. Unlike typical data models, theme colors are compile-time configuration rather than runtime data entities.
