# Data Model: Common Component Library

**Feature**: 008-common-components  
**Date**: December 26, 2025  
**Purpose**: Define TypeScript type structures for all common components

## Overview

This feature involves **component type definitions** rather than traditional data entities. Each component has a TypeScript props interface that defines its contract.

## Component Type Definitions

### 1. Text Component

Typography component with semantic variants for consistent text rendering across the application.

```typescript
/**
 * Semantic text variants mapping to typography scale
 */
export type TextVariant = 
  | 'h1'         // Page title (2xl-3xl)
  | 'h2'         // Section heading (xl-2xl)
  | 'h3'         // Subsection heading (lg-xl)
  | 'h4'         // Card/group title (base-lg)
  | 'h5'         // Small heading (sm-base)
  | 'h6'         // Tiny heading (xs-sm)
  | 'body'       // Default body text (base)
  | 'bodySmall'  // Smaller body text (sm)
  | 'caption'    // Fine print, metadata (xs)
  | 'label';     // Form labels (sm, semibold)

/**
 * Text color variants (theme-aware)
 */
export type TextColor =
  | 'primary'    // text-text-primary (main content)
  | 'secondary'  // text-text-secondary (supporting text)
  | 'tertiary'   // text-text-tertiary (subtle text)
  | 'inverse'    // text-text-inverse (light text on dark)
  | 'success'    // text-success (positive messaging)
  | 'warning'    // text-warning (caution messaging)
  | 'error'      // text-error (error messaging)
  | 'info';      // text-info (informational)

/**
 * Text component props (polymorphic - can render as any HTML element)
 */
export interface TextProps<T extends React.ElementType = 'p'> {
  /**
   * HTML element or React component to render as
   * @default 'p'
   */
  as?: T;
  
  /**
   * Semantic variant (determines font size, weight, line height)
   * @default 'body'
   */
  variant?: TextVariant;
  
  /**
   * Text color (theme-aware)
   * @default 'primary'
   */
  color?: TextColor;
  
  /**
   * Text content
   */
  children: React.ReactNode;
  
  /**
   * Additional CSS classes
   */
  className?: string;
  
  /**
   * Font weight override (use sparingly)
   */
  weight?: 'normal' | 'medium' | 'semibold' | 'bold';
}

// Type with proper element props forwarding
export type PolymorphicTextProps<T extends React.ElementType = 'p'> = 
  TextProps<T> & Omit<React.ComponentPropsWithoutRef<T>, keyof TextProps<T>>;
```

**Validation Rules**:
- `variant` and `as` should be semantically aligned (e.g., variant='h1' with as='h1')
- `weight` override should only be used when variant's default weight doesn't match design needs

---

### 2. Button Component

Primary action button with variants for different contexts and states.

```typescript
/**
 * Button visual style variants
 */
export type ButtonVariant = 
  | 'primary'    // Main call-to-action (filled, high contrast)
  | 'secondary'  // Alternative actions (outlined or subtle fill)
  | 'danger';    // Destructive actions (red/warning color)

/**
 * Button size variants
 */
export type ButtonSize = 
  | 'sm'         // Small: px-3 py-1.5 text-sm
  | 'md'         // Medium: px-4 py-2 text-base (default)
  | 'lg';        // Large: px-6 py-3 text-lg

/**
 * Button component props
 */
export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /**
   * Button visual variant
   * @default 'primary'
   */
  variant?: ButtonVariant;
  
  /**
   * Button size
   * @default 'md'
   */
  size?: ButtonSize;
  
  /**
   * Button content
   */
  children: React.ReactNode;
  
  /**
   * Loading state (shows spinner, disables interaction)
   * @default false
   */
  loading?: boolean;
  
  /**
   * Full width button (w-full)
   * @default false
   */
  fullWidth?: boolean;
  
  /**
   * Additional CSS classes
   */
  className?: string;
  
  /**
   * Icon to display before children (left side)
   */
  leftIcon?: React.ReactNode;
  
  /**
   * Icon to display after children (right side)
   */
  rightIcon?: React.ReactNode;
}
```

**State Combinations**:
- `disabled + loading`: Shows loading spinner, prevents interaction
- `disabled` (not loading): Grayed out, prevents interaction
- `loading` (not disabled): Shows spinner but not grayed out

**Accessibility Requirements**:
- `aria-busy="true"` when loading
- `aria-disabled="true"` when disabled
- `aria-label` required if children is icon-only (use IconButton instead)

---

### 3. IconButton Component

Button optimized for icon-only display with proper touch targets.

```typescript
/**
 * IconButton component props
 */
export interface IconButtonProps extends Omit<ButtonProps, 'children' | 'leftIcon' | 'rightIcon'> {
  /**
   * Icon to display (React element, usually from Heroicons)
   */
  icon: React.ReactNode;
  
  /**
   * Accessible label for screen readers (REQUIRED)
   */
  'aria-label': string;
  
  /**
   * Visual label tooltip (optional, shown on hover)
   */
  label?: string;
}
```

**Key Differences from Button**:
- Enforces `aria-label` as required prop (accessibility)
- Square aspect ratio with centered icon
- Minimum 44x44px touch target (WCAG requirement)
- No text children (use Button with leftIcon instead)

---

### 4. Card Component

Container component for grouping related content with consistent styling.

```typescript
/**
 * Card elevation/shadow levels
 */
export type CardElevation = 
  | 'flat'       // No shadow (border only)
  | 'low'        // Subtle shadow (default)
  | 'medium'     // Moderate shadow (elevated)
  | 'high';      // Strong shadow (modal, dropdown)

/**
 * Card padding size
 */
export type CardPadding = 
  | 'none'       // p-0 (custom content handles padding)
  | 'sm'         // p-3
  | 'md'         // p-4 (default)
  | 'lg';        // p-6

/**
 * Card component props
 */
export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Card content
   */
  children: React.ReactNode;
  
  /**
   * Shadow/elevation level
   * @default 'low'
   */
  elevation?: CardElevation;
  
  /**
   * Internal padding size
   * @default 'md'
   */
  padding?: CardPadding;
  
  /**
   * Interactive card (adds hover effect, cursor pointer)
   * @default false
   */
  interactive?: boolean;
  
  /**
   * Additional CSS classes
   */
  className?: string;
}
```

**Compound Component Pattern** (future enhancement):
```typescript
// Enables: <Card><Card.Header>...</Card.Header><Card.Body>...</Card.Body></Card>
export interface CardCompound extends React.FC<CardProps> {
  Header: React.FC<CardSectionProps>;
  Body: React.FC<CardSectionProps>;
  Footer: React.FC<CardSectionProps>;
}
```

---

### 5. Input Component

Form input field with support for text, number, textarea types and validation states.

```typescript
/**
 * Input component types
 */
export type InputType = 
  | 'text'
  | 'number'
  | 'email'
  | 'password'
  | 'tel'
  | 'url';

/**
 * Input validation state (visual feedback)
 */
export type InputValidationState = 
  | 'default'    // Normal state
  | 'success'    // Valid input (green border)
  | 'error';     // Invalid input (red border)

/**
 * Input size variants
 */
export type InputSize = 
  | 'sm'         // Small: px-3 py-1.5 text-sm
  | 'md'         // Medium: px-4 py-2 text-base (default)
  | 'lg';        // Large: px-4 py-3 text-lg

/**
 * Base input props (shared between Input and TextArea)
 */
export interface BaseInputProps {
  /**
   * Input label (associated via htmlFor or wrapper)
   */
  label?: string;
  
  /**
   * Help text shown below input
   */
  helpText?: string;
  
  /**
   * Error message (sets validationState to 'error')
   */
  error?: string;
  
  /**
   * Success message (sets validationState to 'success')
   */
  success?: string;
  
  /**
   * Validation state (visual only, doesn't block submission)
   */
  validationState?: InputValidationState;
  
  /**
   * Input size
   * @default 'md'
   */
  size?: InputSize;
  
  /**
   * Required field indicator (shows asterisk)
   * @default false
   */
  required?: boolean;
  
  /**
   * Additional CSS classes for input element
   */
  className?: string;
  
  /**
   * Additional CSS classes for wrapper div
   */
  wrapperClassName?: string;
}

/**
 * Input component props (single-line text input)
 */
export interface InputProps extends BaseInputProps, Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  /**
   * Input type
   * @default 'text'
   */
  type?: InputType;
  
  /**
   * Icon to display inside input (left side)
   */
  leftIcon?: React.ReactNode;
  
  /**
   * Icon to display inside input (right side)
   */
  rightIcon?: React.ReactNode;
}

/**
 * TextArea component props (multi-line text input)
 */
export interface TextAreaProps extends BaseInputProps, React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  /**
   * Number of visible text rows
   * @default 3
   */
  rows?: number;
  
  /**
   * Auto-resize based on content
   * @default false
   */
  autoResize?: boolean;
}
```

**Accessibility Requirements**:
- Label associated via `<label htmlFor={id}>` or wrapping label element
- Error messages linked via `aria-describedby={errorId}`
- `aria-invalid="true"` when validationState is 'error'
- `aria-required="true"` when required is true

---

### 6. Select Component

Dropdown selection input with consistent styling and validation states.

```typescript
/**
 * Select option value type
 */
export interface SelectOption<T = string> {
  /**
   * Display label
   */
  label: string;
  
  /**
   * Option value
   */
  value: T;
  
  /**
   * Disable this option
   */
  disabled?: boolean;
}

/**
 * Select component props
 */
export interface SelectProps<T = string> extends BaseInputProps, Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'size'> {
  /**
   * Select options
   */
  options: SelectOption<T>[];
  
  /**
   * Placeholder option (shown when no value selected)
   */
  placeholder?: string;
  
  /**
   * Selected value
   */
  value?: T;
  
  /**
   * Change handler
   */
  onChange?: (value: T) => void;
}
```

---

### 7. Badge Component

Small status or count indicator with contextual colors.

```typescript
/**
 * Badge visual variants
 */
export type BadgeVariant = 
  | 'default'    // Neutral gray
  | 'primary'    // Brand blue
  | 'success'    // Green (positive)
  | 'warning'    // Yellow (caution)
  | 'error'      // Red (negative)
  | 'info';      // Light blue (informational)

/**
 * Badge size variants
 */
export type BadgeSize = 
  | 'sm'         // px-2 py-0.5 text-xs
  | 'md'         // px-2.5 py-0.5 text-sm (default)
  | 'lg';        // px-3 py-1 text-base

/**
 * Badge component props
 */
export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  /**
   * Badge variant (determines color)
   * @default 'default'
   */
  variant?: BadgeVariant;
  
  /**
   * Badge size
   * @default 'md'
   */
  size?: BadgeSize;
  
  /**
   * Badge content (text or number)
   */
  children: React.ReactNode;
  
  /**
   * Dot indicator only (no text, shows colored dot)
   * @default false
   */
  dot?: boolean;
  
  /**
   * Additional CSS classes
   */
  className?: string;
}
```

**Usage Examples**:
- Status badges: `<Badge variant="success">Active</Badge>`
- Count badges: `<Badge variant="error">{unreadCount}</Badge>`
- Dot indicators: `<Badge variant="warning" dot />`

---

### 8. EmptyState Component

Placeholder displayed when no data is available in a list or view.

```typescript
/**
 * EmptyState component props
 */
export interface EmptyStateProps {
  /**
   * Icon to display (React element, usually from Heroicons)
   */
  icon?: React.ReactNode;
  
  /**
   * Primary message title
   */
  title: string;
  
  /**
   * Supporting description text
   */
  description?: string;
  
  /**
   * Primary action button
   */
  action?: {
    label: string;
    onClick: () => void;
    variant?: ButtonVariant;
  };
  
  /**
   * Secondary action button
   */
  secondaryAction?: {
    label: string;
    onClick: () => void;
  };
  
  /**
   * Additional CSS classes
   */
  className?: string;
}
```

**Layout**:
- Centered vertically and horizontally
- Icon (96x96px circular background)
- Title (text-lg font-semibold)
- Description (text-sm text-secondary)
- Action buttons (primary + optional secondary)

---

### 9. Alert Component

Contextual message display for info, success, warning, or error notifications.

```typescript
/**
 * Alert severity levels
 */
export type AlertSeverity = 
  | 'info'       // Informational (blue)
  | 'success'    // Success message (green)
  | 'warning'    // Warning/caution (yellow)
  | 'error';     // Error message (red)

/**
 * Alert component props
 */
export interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Alert severity (determines color and icon)
   */
  severity: AlertSeverity;
  
  /**
   * Alert title (optional, bold text)
   */
  title?: string;
  
  /**
   * Alert message content
   */
  children: React.ReactNode;
  
  /**
   * Show close/dismiss button
   * @default false
   */
  dismissible?: boolean;
  
  /**
   * Callback when alert is dismissed
   */
  onDismiss?: () => void;
  
  /**
   * Additional CSS classes
   */
  className?: string;
}
```

**Accessibility Requirements**:
- `role="alert"` for error/warning (interrupts screen readers)
- `role="status"` for info/success (polite announcement)
- `aria-live="assertive"` for error/warning
- `aria-live="polite"` for info/success

---

### 10. LoadingSpinner Component

Animated loading indicator with size variants.

```typescript
/**
 * Spinner size variants
 */
export type SpinnerSize = 
  | 'sm'         // 16px (inline with text)
  | 'md'         // 24px (default)
  | 'lg'         // 32px (large buttons, cards)
  | 'xl';        // 48px (page-level loading)

/**
 * LoadingSpinner component props
 */
export interface LoadingSpinnerProps {
  /**
   * Spinner size
   * @default 'md'
   */
  size?: SpinnerSize;
  
  /**
   * Accessible label for screen readers
   * @default 'Loading...'
   */
  label?: string;
  
  /**
   * Center spinner in container
   * @default false
   */
  center?: boolean;
  
  /**
   * Additional CSS classes
   */
  className?: string;
}
```

**Implementation**:
- SVG-based spinner with CSS animation
- Respects theme colors (uses primary color)
- `role="status"` with `aria-label` for accessibility

---

### 11. TabNavigation Component

Tab-based content switching with keyboard navigation support.

```typescript
/**
 * Tab item definition
 */
export interface Tab {
  /**
   * Unique tab identifier
   */
  id: string;
  
  /**
   * Tab label (visible text)
   */
  label: string;
  
  /**
   * Tab icon (optional, shown before label)
   */
  icon?: React.ReactNode;
  
  /**
   * Disable this tab
   * @default false
   */
  disabled?: boolean;
  
  /**
   * Badge count (optional, shown after label)
   */
  badge?: number;
}

/**
 * TabNavigation component props
 */
export interface TabNavigationProps {
  /**
   * Array of tab definitions
   */
  tabs: Tab[];
  
  /**
   * Currently active tab ID
   */
  activeTab: string;
  
  /**
   * Tab change handler
   */
  onChange: (tabId: string) => void;
  
  /**
   * Tab orientation
   * @default 'horizontal'
   */
  orientation?: 'horizontal' | 'vertical';
  
  /**
   * Additional CSS classes
   */
  className?: string;
}
```

**Accessibility Requirements**:
- `role="tablist"` on container
- `role="tab"` on tab buttons
- `aria-selected="true"` on active tab
- `aria-controls` linking tab to tabpanel
- Keyboard navigation: Arrow keys, Home, End

---

### 12. Link Component

Styled anchor element with consistent appearance and external link indicators.

```typescript
/**
 * Link visual variants
 */
export type LinkVariant = 
  | 'default'    // Standard link (underline on hover)
  | 'primary'    // Primary color, bold
  | 'subtle';    // No underline, subtle color

/**
 * Link component props
 */
export interface LinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  /**
   * Link destination
   */
  href: string;
  
  /**
   * Link content
   */
  children: React.ReactNode;
  
  /**
   * Link visual variant
   * @default 'default'
   */
  variant?: LinkVariant;
  
  /**
   * External link (opens in new tab, shows external icon)
   * @default false (determined automatically from href)
   */
  external?: boolean;
  
  /**
   * Show external link icon
   * @default true (when external is true)
   */
  showExternalIcon?: boolean;
  
  /**
   * Additional CSS classes
   */
  className?: string;
}
```

**Behavior**:
- External links automatically get `target="_blank"` and `rel="noopener noreferrer"`
- External icon (Heroicons ArrowTopRightOnSquare) shown by default for external links

---

### 13. PageHeader Component

Page title header with optional breadcrumbs, description, and actions.

```typescript
/**
 * Breadcrumb item
 */
export interface Breadcrumb {
  /**
   * Breadcrumb label
   */
  label: string;
  
  /**
   * Breadcrumb link destination (if clickable)
   */
  href?: string;
}

/**
 * PageHeader component props
 */
export interface PageHeaderProps {
  /**
   * Page title
   */
  title: string;
  
  /**
   * Page description (optional subtitle)
   */
  description?: string;
  
  /**
   * Breadcrumb navigation (optional)
   */
  breadcrumbs?: Breadcrumb[];
  
  /**
   * Primary action button (top-right)
   */
  action?: React.ReactNode;
  
  /**
   * Additional actions (shown after primary action)
   */
  secondaryActions?: React.ReactNode[];
  
  /**
   * Additional CSS classes
   */
  className?: string;
}
```

**Layout**:
```
[Breadcrumbs]
[Title]                    [Primary Action] [Secondary Actions]
[Description]
```

---

## Theme Integration

All components consume theme tokens from `lib/theme.ts` via Tailwind CSS classes:

```typescript
// Example theme token usage in components
const buttonVariantClasses = {
  primary: 'bg-primary text-primary-contrast hover:bg-primary-hover',
  secondary: 'bg-secondary text-secondary-contrast hover:bg-secondary-hover border border-border',
  danger: 'bg-danger text-danger-contrast hover:bg-danger-hover',
};

const textColorClasses = {
  primary: 'text-text-primary',
  secondary: 'text-text-secondary',
  tertiary: 'text-text-tertiary',
  // ... etc
};
```

**No theme-specific logic in components** - theme switching handled by CSS custom properties.

---

## Validation Patterns

### Input Validation State Management

```typescript
// Controlled input with validation
const [value, setValue] = useState('');
const [error, setError] = useState<string>();

const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  const newValue = e.target.value;
  setValue(newValue);
  
  // Validate
  if (!newValue.trim()) {
    setError('Name is required');
  } else {
    setError(undefined);
  }
};

<Input
  label="Item Name"
  value={value}
  onChange={handleChange}
  error={error}
  required
/>
```

---

## Relationships Between Components

```
Text
  └─ Used by: Button, Badge, Alert, EmptyState, PageHeader, Link

Button
  ├─ Contains: Text (children), LoadingSpinner (when loading)
  └─ Used by: EmptyState (action buttons), PageHeader (actions)

IconButton
  └─ Variant of: Button (specialized for icon-only use)

Card
  └─ Contains: Any components (flexible container)

Input / Select
  ├─ Contains: Text (label, helpText, error)
  └─ Used by: Forms across all features

Alert
  ├─ Contains: Text, IconButton (dismiss button)
  └─ Used by: Error boundaries, notification system

EmptyState
  ├─ Contains: Icon, Text (title, description), Button (actions)
  └─ Used by: Lists when no data (inventory, shopping list, members)

LoadingSpinner
  └─ Used by: Button (loading state), page-level loading states

Badge
  └─ Used by: MemberCard (role/status), TabNavigation (counts), NotificationItem

TabNavigation
  ├─ Contains: Button (tab items), Badge (optional counts)
  └─ Used by: Multi-section pages (settings)

Link
  └─ Used by: Navigation, breadcrumbs, external resource links

PageHeader
  ├─ Contains: Text (title, description), Breadcrumb (Links), Button (actions)
  └─ Used by: All main page routes
```

---

**Phase 1 Data Model Complete** - Component type definitions ready for contract generation.
