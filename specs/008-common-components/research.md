# Research: Common Component Library

**Feature**: 008-common-components  
**Date**: December 26, 2025  
**Purpose**: Resolve technical unknowns and establish best practices for component library implementation

## Research Areas

### 1. Component Architecture Patterns

**Decision**: Use **compound component pattern with composition** for complex components, atomic components for simple ones

**Rationale**:
- Atomic components (Button, Badge, LoadingSpinner) are simple, self-contained units with clear single purpose
- Compound components (Card with Card.Header/Card.Body/Card.Footer) provide flexibility for complex layouts
- Composition pattern allows building complex UIs from simple primitives without prop drilling
- Matches existing Next.js/React best practices and React 19 patterns

**Alternatives Considered**:
- **Render props pattern**: Rejected - more complex API, harder to type with TypeScript, less intuitive for developers
- **Higher-order components (HOCs)**: Rejected - deprecated pattern, causes wrapper hell, poor TypeScript support
- **Headless UI components**: Rejected for this phase - adds complexity and third-party dependency, over-engineering for current needs

**Implementation Approach**:
- Simple components: single file with props interface (Button, Badge, Text)
- Complex components: use React.forwardRef for ref forwarding, compound components for multi-part UIs
- All components export TypeScript types alongside implementation

---

### 2. Theme Integration Strategy

**Decision**: Use **Tailwind CSS with existing theme system** via CSS custom properties

**Rationale**:
- Theme system (`lib/theme.ts`) already exists and defines color tokens via CSS custom properties
- Tailwind config already extends these tokens (bg-primary, text-primary-contrast, etc.)
- Components can use Tailwind classes that automatically respect theme switching
- Zero runtime cost - all theme values resolved at build time via Tailwind
- Dark mode support via `prefers-color-scheme` already implemented

**Alternatives Considered**:
- **CSS-in-JS (styled-components, emotion)**: Rejected - adds runtime overhead, larger bundle size, conflicts with Tailwind
- **Plain CSS modules**: Rejected - loses Tailwind utility benefits, harder to maintain consistency
- **Inline styles**: Rejected - can't access Tailwind theme, no pseudo-class support, poor performance

**Implementation Approach**:
```typescript
// Component uses Tailwind classes that reference theme tokens
<button className="bg-primary text-primary-contrast hover:bg-primary-hover">
  Click me
</button>

// Theme system automatically provides light/dark values
// No component-specific theme logic needed
```

---

### 3. TypeScript Type Patterns

**Decision**: Use **explicit prop interfaces with strict typing** and discriminated unions for variants

**Rationale**:
- TypeScript 5 strict mode requires explicit types (no implicit any)
- Discriminated unions provide type-safe variant handling (e.g., variant: 'primary' | 'secondary' | 'danger')
- Generic types enable polymorphic components (e.g., Text component that can render as different HTML elements)
- Branded types can enforce validation at compile time (e.g., email strings)

**Alternatives Considered**:
- **PropTypes**: Rejected - runtime validation only, no compile-time safety, deprecated in modern React
- **Zod schemas**: Rejected for props - over-engineering, runtime overhead, props are internal contracts not user input
- **Loose typing with optional chaining**: Rejected - violates constitution's strict typing requirement

**Implementation Approach**:
```typescript
// Discriminated union for variants
interface ButtonBaseProps {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  loading?: boolean;
  className?: string;
}

interface PrimaryButton extends ButtonBaseProps {
  variant: 'primary';
}

interface SecondaryButton extends ButtonBaseProps {
  variant: 'secondary';
}

interface DangerButton extends ButtonBaseProps {
  variant: 'danger';
}

export type ButtonProps = PrimaryButton | SecondaryButton | DangerButton;

// Polymorphic component with "as" prop
interface TextProps<T extends React.ElementType = 'p'> {
  as?: T;
  variant?: 'h1' | 'h2' | 'body' | 'caption';
  children: React.ReactNode;
  className?: string;
}

export function Text<T extends React.ElementType = 'p'>({
  as,
  variant = 'body',
  children,
  className,
  ...props
}: TextProps<T> & Omit<React.ComponentPropsWithoutRef<T>, keyof TextProps<T>>) {
  const Component = as || 'p';
  return <Component className={cn(variantStyles[variant], className)} {...props}>{children}</Component>;
}
```

---

### 4. Accessibility (WCAG 2.1 AA) Standards

**Decision**: **Built-in accessibility** in all components with ARIA attributes, keyboard navigation, and focus management

**Rationale**:
- WCAG 2.1 AA is constitutional requirement, not optional
- Building accessibility into components ensures consistency across app
- Focus indicators must be visible (constitution requirement)
- Keyboard navigation required for all interactive elements
- Screen reader support via proper ARIA labels and live regions

**Alternatives Considered**:
- **Manual accessibility per feature**: Rejected - inconsistent, easy to forget, violates DRY principle
- **Third-party accessibility library**: Rejected - adds dependency, may not match design system
- **Accessibility as separate HOC**: Rejected - splits concerns, harder to maintain

**Implementation Approach**:
- **Button/IconButton**: 
  - Proper `aria-label` when no visible text
  - `aria-disabled` and `disabled` attribute
  - `aria-busy` and `aria-live="polite"` for loading states
  - Focus visible via Tailwind `focus:ring` classes
  - Keyboard: Enter and Space activate

- **Input/Select**:
  - Associated `<label>` via `htmlFor` or wrapping
  - `aria-invalid` and `aria-describedby` for validation errors
  - `aria-required` for required fields
  - Error messages linked via `id` reference

- **TabNavigation**:
  - `role="tablist"` on container
  - `role="tab"` on tab buttons with `aria-selected`
  - `role="tabpanel"` on content areas
  - Keyboard: Arrow keys navigate tabs, Home/End for first/last

- **Alert**:
  - `role="alert"` for error/warning (interrupts screen readers)
  - `role="status"` for info/success (polite)
  - `aria-live="assertive"` or `"polite"` based on severity

- **Color Contrast**:
  - All theme colors meet 4.5:1 ratio (AA standard)
  - Verified via automated tools (axe-core in Jest)
  - No white-on-white or low-contrast combinations

---

### 5. Component Testing Strategy

**Decision**: **Jest + React Testing Library** with focus on user interactions and accessibility

**Rationale**:
- Constitutional requirement: Jest and React Testing Library mandatory
- Testing Library philosophy: test components as users interact with them
- Accessibility testing via jest-axe catches WCAG violations automatically
- 80% coverage target for critical paths (component logic, variants, edge cases)

**Alternatives Considered**:
- **Enzyme**: Rejected - deprecated, doesn't work with React 18+
- **Visual regression testing only**: Rejected as primary strategy - doesn't test functionality, slow feedback
- **E2E tests for components**: Rejected - too slow for component library, better for integration

**Implementation Approach**:
```typescript
// Example test structure for Button component
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe, toHaveNoViolations } from 'jest-axe';
import { Button } from './Button';

expect.extend(toHaveNoViolations);

describe('Button', () => {
  describe('Variants', () => {
    it('renders primary variant with correct styles', () => {
      render(<Button variant="primary">Click me</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('bg-primary');
    });

    it('renders danger variant with correct styles', () => {
      render(<Button variant="danger">Delete</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('bg-danger');
    });
  });

  describe('Interactions', () => {
    it('calls onClick when clicked', async () => {
      const handleClick = jest.fn();
      render(<Button variant="primary" onClick={handleClick}>Click</Button>);
      
      await userEvent.click(screen.getByRole('button'));
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('does not call onClick when disabled', async () => {
      const handleClick = jest.fn();
      render(<Button variant="primary" disabled onClick={handleClick}>Click</Button>);
      
      await userEvent.click(screen.getByRole('button'));
      expect(handleClick).not.toHaveBeenCalled();
    });
  });

  describe('Accessibility', () => {
    it('has no accessibility violations', async () => {
      const { container } = render(<Button variant="primary">Accessible</Button>);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('supports keyboard activation', async () => {
      const handleClick = jest.fn();
      render(<Button variant="primary" onClick={handleClick}>Click</Button>);
      
      screen.getByRole('button').focus();
      await userEvent.keyboard('{Enter}');
      expect(handleClick).toHaveBeenCalled();
    });
  });
});
```

---

### 6. Component Documentation Standards

**Decision**: **JSDoc + README.md per component** with usage examples and prop tables

**Rationale**:
- JSDoc comments provide IntelliSense in VS Code (immediate developer feedback)
- README.md files provide comprehensive documentation with examples
- Prop tables generated from TypeScript types ensure accuracy
- Examples show real usage patterns, not just API reference

**Alternatives Considered**:
- **Storybook only**: Rejected for initial phase - adds complexity, build overhead, can add later
- **Separate docs site**: Rejected - over-engineering for 13 components
- **Comments only**: Rejected - insufficient for discoverability and onboarding

**Implementation Approach**:
```typescript
/**
 * Button component for primary, secondary, and danger actions.
 * 
 * @example
 * ```tsx
 * <Button variant="primary" onClick={handleSave}>
 *   Save Changes
 * </Button>
 * ```
 * 
 * @example
 * ```tsx
 * <Button variant="danger" loading disabled>
 *   Deleting...
 * </Button>
 * ```
 */
export function Button({ variant, children, loading, disabled, onClick, className }: ButtonProps) {
  // Implementation
}
```

README.md structure:
```markdown
# Button

Primary action button with variants for different contexts.

## Usage

\`\`\`tsx
import { Button } from '@/components/common';

<Button variant="primary" onClick={handleClick}>
  Click me
</Button>
\`\`\`

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| variant | 'primary' \| 'secondary' \| 'danger' | - | Button style variant |
| children | ReactNode | - | Button label content |
| onClick | () => void | - | Click handler |
| disabled | boolean | false | Disables button interaction |
| loading | boolean | false | Shows loading state |

## Variants

[Visual examples and descriptions]

## Accessibility

- Keyboard: Enter and Space activate button
- Screen reader: Announced as "button" with label
- Focus: Visible focus ring
```

---

### 7. Migration Strategy & Validation

**Decision**: **Incremental component-by-component migration** with visual regression verification

**Rationale**:
- Replacing all components at once is high-risk, hard to review
- Component-by-component allows isolated testing and rollback
- Visual regression tests ensure no unintended changes
- Can prioritize high-impact components first (Button, Input most frequently used)

**Alternatives Considered**:
- **Big-bang migration**: Rejected - too risky, hard to debug issues
- **Feature-by-feature migration**: Rejected - creates inconsistency within features
- **No validation**: Rejected - can't guarantee visual parity

**Implementation Approach**:

**Phase 1 - Component Creation** (P1):
1. Create Text, Button, IconButton, Card, Input, Select components
2. Write tests for all variants and states
3. Document usage patterns
4. Verify accessibility compliance

**Phase 2 - Migration Identification**:
```bash
# Search for one-off implementations
grep -r "className.*bg-blue-600" components/{inventory,shopping-list,members,reference-data}/
grep -r "<button" components/{inventory,shopping-list,members,reference-data}/
grep -r "<input" components/{inventory,shopping-list,members,reference-data}/
```

**Phase 3 - Systematic Replacement** (P2):
1. Replace all Button implementations in inventory feature
2. Visual test: compare before/after screenshots
3. Functional test: verify all interactions work
4. Repeat for shopping-list, members, reference-data

**Phase 4 - Validation**:
- Screenshot comparison (manual or via visual regression tools)
- Accessibility audit with axe DevTools
- Code review: verify no duplicate button styles remain
- Performance: check bundle size hasn't increased

**Phase 5 - Cleanup**:
- Remove duplicate component code from feature directories
- Update documentation
- Add linting rules to prevent one-off implementations

---

### 8. Performance Optimization Techniques

**Decision**: **Tree-shaking, React.memo for pure components, lazy loading for heavy components**

**Rationale**:
- Tree-shaking via named exports reduces bundle size (users import only needed components)
- React.memo prevents unnecessary re-renders for pure presentational components
- Code splitting for rarely-used or heavy components (e.g., TabNavigation, DatePicker if added later)
- Bundle size monitoring catches regressions

**Alternatives Considered**:
- **All components lazy loaded**: Rejected - adds latency for common components (Button, Input)
- **No memoization**: Rejected - unnecessary re-renders in lists (e.g., InventoryList with many items)
- **Manual optimization everywhere**: Rejected - premature optimization, measure first

**Implementation Approach**:
```typescript
// Named exports for tree-shaking
export { Button } from './Button/Button';
export { Input } from './Input/Input';
// Not: export * from './Button/Button';

// React.memo for pure components
export const Button = React.memo(function Button({ variant, children, ...props }: ButtonProps) {
  // Implementation
});

// Lazy loading for heavy/rare components (if needed)
const TabNavigation = React.lazy(() => import('./TabNavigation/TabNavigation'));
```

**Bundle Size Targets**:
- Button: <3KB gzipped
- Input: <4KB gzipped
- Card: <2KB gzipped
- Total common library: <50KB gzipped

---

## Implementation Priorities

Based on research findings, the recommended implementation order is:

**P1 - Foundation** (MVP - delivers immediate value):
1. Text component (typography standardization)
2. Button component (most frequently used)
3. Card component (layout consistency)
4. Input component (form standardization)
5. Replace in inventory feature (prove migration pattern works)

**P2 - Expansion** (complete core set):
6. IconButton, Select, Badge components
7. EmptyState (replaces ReferenceDataEmptyState)
8. Alert, LoadingSpinner components
9. Migrate shopping-list, members, reference-data features

**P3 - Advanced** (refinement):
10. TabNavigation, Link, PageHeader components
11. Typography consolidation (eliminate all font-family declarations)
12. Visual regression testing automation
13. Component showcase (Storybook or custom)

---

## Open Questions Resolved

1. **Should we use a UI library (Material-UI, Chakra, etc.)?**
   - **Answer**: No. Constitution requires AWS-native solutions; adding large third-party UI libraries conflicts with serverless optimization principles. Tailwind + custom components provide better bundle size control and theme integration.

2. **How to handle icons?**
   - **Answer**: Use Heroicons (already used in codebase, see ReferenceDataEmptyState). Small bundle, MIT licensed, integrates with Tailwind. IconButton accepts ReactNode for icon content.

3. **Should we support ref forwarding?**
   - **Answer**: Yes, for all interactive components (Button, Input, Select). Enables focus management and integration with third-party libraries if needed. Use React.forwardRef.

4. **How to prevent developers from creating one-off components?**
   - **Answer**: (Post-migration) Add ESLint rule to warn on className patterns like "bg-blue-600" outside common/ directory. Code review process should flag one-off implementations.

5. **What about animation/transitions?**
   - **Answer**: Use Tailwind transition utilities (`transition-colors`, `duration-200`). Keeps animations lightweight and consistent. For complex animations (if needed), consider Framer Motion later.

---

## Risk Mitigation

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Visual regressions during migration | Medium | High | Visual regression tests, incremental migration, thorough manual QA |
| Performance degradation from component overhead | Low | Medium | Bundle size monitoring, tree-shaking, performance budgets |
| Accessibility violations | Low | High | jest-axe in all tests, ARIA attributes built-in, manual screen reader testing |
| Developer resistance to using common components | Medium | Medium | Excellent documentation, easy API, clear benefits (speed, consistency) |
| Type complexity causing confusion | Low | Low | Comprehensive JSDoc, clear examples, TypeScript IntelliSense |
| Incomplete migration leaving duplicate code | Medium | Medium | Systematic tracking, code review checklist, grep audits |

---

## Success Metrics Validation

Mapping research decisions to success criteria from spec:

- **SC-001** (50% faster development): Achieved via comprehensive component library with clear docs
- **SC-002** (70% code reduction): Validated via pre/post line count comparison across features
- **SC-003** (100% visual consistency): Enforced via common components, verified by visual regression tests
- **SC-004** (Theme propagation): Automatic via Tailwind theme token integration
- **SC-005** (100% TypeScript coverage): Enforced by strict mode compilation gate
- **SC-006** (100% documentation): JSDoc + README.md per component ensures coverage
- **SC-007** (Zero font-family outside theme): Verified via codebase grep, Text component centralizes typography
- **SC-008** (90% adoption): Tracked via component usage analysis across codebase

---

**Phase 0 Complete** - All technical unknowns resolved. Ready for Phase 1 (Design).
