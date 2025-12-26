# Implementation Plan: Common Component Library

**Branch**: `008-common-components` | **Date**: December 26, 2025 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/008-common-components/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Extract and standardize 13 core UI components (Text, Button, IconButton, Card, Input, Select, Badge, EmptyState, Alert, LoadingSpinner, TabNavigation, Link, PageHeader) into a centralized common component library at `components/common/`. Replace scattered one-off implementations across inventory, shopping list, member management, and settings features with shared components that consume the existing theme system. This eliminates code duplication (target: 70% reduction), ensures visual consistency (100% similar elements using identical styling), and centralizes typography management. All components will include TypeScript type definitions, JSDoc documentation, and comprehensive variant support (primary/secondary/danger for buttons, validation states for inputs, etc.).

## Technical Context

**Language/Version**: TypeScript 5.x with strict mode enabled  
**Primary Dependencies**: Next.js 16 (App Router), React 19, Tailwind CSS 3.x, existing theme system (`lib/theme.ts`)  
**Storage**: N/A (frontend-only feature, no data persistence)  
**Testing**: Jest 29.x and React Testing Library (existing test infrastructure)  
**Target Platform**: Web browsers (Chrome, Firefox, Safari, Edge - modern versions)  
**Project Type**: Web application (Next.js frontend only - no backend changes)  
**Performance Goals**: 
  - Component bundle size <10KB per component (tree-shaking optimization)
  - Initial render <50ms for simple components
  - Maintain or improve current page load performance
**Constraints**: 
  - MUST maintain identical visual appearance during migration
  - MUST work with existing theme system without breaking changes
  - MUST support dark mode through theme-aware colors
  - MUST meet WCAG 2.1 AA accessibility requirements
**Scale/Scope**: 
  - 13 base components to create
  - ~40 existing component files to analyze for migration opportunities
  - Target: 90%+ of UI patterns using common components after migration

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### I. TypeScript Type Safety ✅ COMPLIANT
- All components WILL have explicit TypeScript type definitions for props
- No implicit `any` types will be introduced
- Generic types will be used where appropriate (e.g., polymorphic components)
- Strict mode compilation required before merge

### II. Serverless Architecture ✅ N/A
- This feature is frontend-only and does not involve serverless architecture
- No Lambda functions, API Gateway, or backend services affected

### III. Testing Excellence ✅ COMPLIANT
- Component library components WILL have unit tests with React Testing Library
- Visual regression tests SHOULD be implemented to verify migration accuracy
- Target 80%+ coverage for common component logic
- Tests WILL verify all component variants and states

### IV. AWS Best Practices ✅ N/A
- This feature does not interact with AWS services
- No SDK usage or AWS resources involved

### V. Security First ✅ COMPLIANT
- Components WILL sanitize inputs to prevent XSS attacks
- No secrets or sensitive data will be hardcoded
- Accessibility features (ARIA labels, keyboard navigation) WILL be built into components
- Components WILL follow OWASP guidelines for client-side security

### VI. Performance Optimization ✅ COMPLIANT
- Components WILL use React best practices (memo, useCallback where appropriate)
- Tree-shaking optimization through modular exports
- Bundle size monitoring for each component
- Lazy loading patterns WILL be documented for large component sets

### VII. Code Organization ✅ COMPLIANT
- Components WILL be organized in `frontend/components/common/`
- Each component WILL be colocated with its types, tests, and documentation
- Clear separation between common (reusable) and feature-specific components
- Component index files WILL provide clean exports

### Additional Constitution Requirements

**Build Tool (Vite)** ✅ COMPLIANT
- Components compatible with Vite build pipeline
- No Webpack-specific patterns introduced
- Fast HMR during development maintained

**Accessibility (WCAG 2.1 AA)** ✅ COMPLIANT
- All components WILL meet color contrast requirements
- Focus indicators WILL be visible and clear
- Keyboard navigation WILL be fully supported
- ARIA attributes WILL be properly implemented
- Automated accessibility checks WILL run in CI

**Quality Gates** ✅ COMPLIANT
- TypeScript compilation WILL succeed with no errors
- All tests WILL pass before merge
- Type checking (`npm run type-check`) WILL pass in CI
- Vite production build WILL succeed in CI

### Evaluation: ✅ ALL GATES PASSED

This feature fully complies with the constitution. No violations or exceptions required.

## Project Structure

### Documentation (this feature)

```text
specs/008-common-components/
├── plan.md              # This file (/speckit.plan command output)
├── spec.md              # Feature specification
├── research.md          # Phase 0 output (component patterns, accessibility standards)
├── data-model.md        # Phase 1 output (component type definitions structure)
├── quickstart.md        # Phase 1 output (developer guide for using components)
├── contracts/           # Phase 1 output (TypeScript interfaces for all components)
│   ├── Text.ts          # Typography component types
│   ├── Button.ts        # Button and IconButton types
│   ├── Input.ts         # Input, Select, and form component types
│   ├── Feedback.ts      # Alert, Badge, EmptyState types
│   ├── Navigation.ts    # Link, TabNavigation, PageHeader types
│   └── Layout.ts        # Card, LoadingSpinner types
├── checklists/          # Quality validation checklists
│   └── requirements.md  # Specification validation (completed)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (frontend repository: inventory-management-frontend)

```text
frontend/
├── components/
│   ├── common/                        # Common component library (PRIMARY WORK AREA)
│   │   ├── index.ts                   # Barrel export for all common components
│   │   │
│   │   ├── Text/                      # Typography component
│   │   │   ├── Text.tsx               # Component implementation
│   │   │   ├── Text.types.ts          # TypeScript type definitions
│   │   │   ├── Text.test.tsx          # Unit tests
│   │   │   └── README.md              # Component documentation
│   │   │
│   │   ├── Button/                    # Primary action buttons
│   │   │   ├── Button.tsx
│   │   │   ├── Button.types.ts
│   │   │   ├── Button.test.tsx
│   │   │   └── README.md
│   │   │
│   │   ├── IconButton/                # Icon-only buttons
│   │   │   ├── IconButton.tsx
│   │   │   ├── IconButton.types.ts
│   │   │   ├── IconButton.test.tsx
│   │   │   └── README.md
│   │   │
│   │   ├── Card/                      # Container component
│   │   │   ├── Card.tsx
│   │   │   ├── Card.types.ts
│   │   │   ├── Card.test.tsx
│   │   │   └── README.md
│   │   │
│   │   ├── Input/                     # Text/number/textarea inputs
│   │   │   ├── Input.tsx
│   │   │   ├── Input.types.ts
│   │   │   ├── Input.test.tsx
│   │   │   └── README.md
│   │   │
│   │   ├── Select/                    # Dropdown selection
│   │   │   ├── Select.tsx
│   │   │   ├── Select.types.ts
│   │   │   ├── Select.test.tsx
│   │   │   └── README.md
│   │   │
│   │   ├── Badge/                     # Status indicators
│   │   │   ├── Badge.tsx
│   │   │   ├── Badge.types.ts
│   │   │   ├── Badge.test.tsx
│   │   │   └── README.md
│   │   │
│   │   ├── EmptyState/                # No-data placeholder
│   │   │   ├── EmptyState.tsx
│   │   │   ├── EmptyState.types.ts
│   │   │   ├── EmptyState.test.tsx
│   │   │   └── README.md
│   │   │
│   │   ├── Alert/                     # Notification messages
│   │   │   ├── Alert.tsx
│   │   │   ├── Alert.types.ts
│   │   │   ├── Alert.test.tsx
│   │   │   └── README.md
│   │   │
│   │   ├── LoadingSpinner/            # Loading indicators
│   │   │   ├── LoadingSpinner.tsx
│   │   │   ├── LoadingSpinner.types.ts
│   │   │   ├── LoadingSpinner.test.tsx
│   │   │   └── README.md
│   │   │
│   │   ├── TabNavigation/             # Tab switching UI
│   │   │   ├── TabNavigation.tsx
│   │   │   ├── TabNavigation.types.ts
│   │   │   ├── TabNavigation.test.tsx
│   │   │   └── README.md
│   │   │
│   │   ├── Link/                      # Styled anchor elements
│   │   │   ├── Link.tsx
│   │   │   ├── Link.types.ts
│   │   │   ├── Link.test.tsx
│   │   │   └── README.md
│   │   │
│   │   ├── PageHeader/                # Page title headers
│   │   │   ├── PageHeader.tsx
│   │   │   ├── PageHeader.types.ts
│   │   │   ├── PageHeader.test.tsx
│   │   │   └── README.md
│   │   │
│   │   ├── Dialog.tsx                 # EXISTING - may need updates for consistency
│   │   ├── ThemeProvider.tsx          # EXISTING - theme system integration
│   │   └── ThemePreview.tsx           # EXISTING - theme testing
│   │
│   ├── inventory/                     # MIGRATION TARGET - replace with common components
│   │   ├── InventoryList.tsx
│   │   ├── AddItemForm.tsx            # Uses buttons, inputs, selects
│   │   ├── EditItemForm.tsx           # Uses buttons, inputs, selects
│   │   └── AdjustQuantity.tsx
│   │
│   ├── shopping-list/                 # MIGRATION TARGET
│   │   ├── ShoppingList.tsx
│   │   ├── ShoppingListItem.tsx       # Uses buttons, badges
│   │   ├── AddItemForm.tsx
│   │   └── EditShoppingListItemForm.tsx
│   │
│   ├── members/                       # MIGRATION TARGET
│   │   ├── MemberList.tsx
│   │   ├── MemberCard.tsx             # Uses badges, buttons, cards
│   │   ├── InviteMemberForm.tsx       # Uses inputs, buttons
│   │   ├── InvitationList.tsx
│   │   └── RemoveMemberDialog.tsx
│   │
│   ├── reference-data/                # MIGRATION TARGET
│   │   ├── ReferenceDataEmptyState.tsx  # REPLACE with common EmptyState
│   │   ├── StoreForm.tsx              # Uses inputs, buttons
│   │   ├── StoreList.tsx
│   │   ├── StorageLocationForm.tsx    # Uses inputs, buttons
│   │   └── DeleteConfirmDialog.tsx
│   │
│   └── notifications/                 # MIGRATION TARGET
│       ├── NotificationList.tsx
│       └── NotificationItem.tsx       # May benefit from Alert/Badge components
│
├── lib/
│   └── theme.ts                       # EXISTING - theme configuration (DO NOT MODIFY)
│
├── app/                               # MIGRATION TARGET - page-level components
│   ├── dashboard/
│   │   ├── inventory/page.tsx
│   │   ├── shopping-list/page.tsx
│   │   ├── members/page.tsx
│   │   ├── settings/reference-data/page.tsx
│   │   └── notifications/page.tsx
│   └── (auth)/login/page.tsx
│
└── tests/
    └── components/                    # Tests for common components will go here
        └── common/                    # NEW - mirror component structure
            ├── Text.test.tsx
            ├── Button.test.tsx
            ├── Input.test.tsx
            └── [...other component tests]
```

**Structure Decision**: 

This feature uses the existing web application structure with Next.js 16 App Router. The primary work will occur in the `frontend/components/common/` directory, which already exists but currently has minimal components (Dialog, ThemeProvider, ThemePreview).

**Key Decisions**:
1. **Component Organization**: Each component gets its own directory with implementation, types, tests, and documentation colocated for maintainability
2. **Barrel Exports**: `components/common/index.ts` provides clean imports: `import { Button, Input } from '@/components/common'`
3. **Migration Strategy**: Existing feature directories (inventory, shopping-list, members, reference-data) will be refactored to use common components without changing their structure
4. **Theme Integration**: Components will consume the existing `lib/theme.ts` configuration without modifications to the theme system itself
5. **Testing Location**: Tests will mirror the component structure in `tests/components/common/` following existing patterns

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

**No violations identified** - this section is not applicable. All constitution gates passed without exceptions.

---

## Implementation Phases

### Phase 0: Research & Planning ✅ COMPLETE

**Deliverables**:
- [research.md](./research.md) - Component architecture patterns, accessibility standards, testing strategy
- Architecture decisions documented and rationale provided
- Risk mitigation strategies defined

**Key Decisions Made**:
- Component architecture: Compound components + composition pattern
- Theme integration: Tailwind CSS with existing theme system
- Type patterns: Discriminated unions, polymorphic components
- Accessibility: Built-in WCAG 2.1 AA compliance
- Testing: Jest + React Testing Library + jest-axe
- Documentation: JSDoc + README per component

---

### Phase 1: Design & Contracts ✅ COMPLETE

**Deliverables**:
- [data-model.md](./data-model.md) - Component type definitions and structure
- [contracts/](./contracts/) - TypeScript interface files for all 13 components
  - `Text.ts` - Typography component types
  - `Button.ts` - Button and IconButton types
  - `Input.ts` - Input, TextArea, Select types
  - `Feedback.ts` - Alert, Badge, EmptyState types
  - `Layout.ts` - Card, LoadingSpinner types
  - `Navigation.ts` - Link, TabNavigation, PageHeader types
- [quickstart.md](./quickstart.md) - Developer guide with examples
- Agent context updated with component library information

**Constitution Re-Check**: ✅ ALL GATES STILL PASSED

All design decisions align with constitution principles:
- TypeScript strict mode type definitions created
- Component APIs designed for testability
- Accessibility built into component contracts
- Theme integration maintains performance standards
- Code organization follows Next.js conventions

---

### Phase 2: Task Breakdown (Next Step)

**Command**: Run `/speckit.tasks` to generate implementation tasks

**Expected Outputs**:
- [tasks.md](./tasks.md) - Detailed task breakdown with:
  - Component implementation tasks (one per component)
  - Test creation tasks
  - Documentation tasks
  - Migration tasks (feature-by-feature)
  - Integration tasks

**Priority Order** (from research.md):
1. **P1 - Foundation (MVP)**:
   - Text, Button, Card, Input components
   - Replace in inventory feature (proof of concept)
   
2. **P2 - Expansion**:
   - IconButton, Select, Badge, EmptyState, Alert, LoadingSpinner
   - Migrate shopping-list, members, reference-data features
   
3. **P3 - Advanced**:
   - TabNavigation, Link, PageHeader
   - Typography consolidation
   - Visual regression testing

---

## Next Steps

1. **Run `/speckit.tasks`** to generate implementation task breakdown
2. **Create feature branch** in frontend repository: `008-common-components`
3. **Begin Phase 1 implementation**: Text, Button, Card components
4. **Iterate with test-first approach**: Write tests → Implement → Verify
5. **Deploy incrementally**: Merge components as they're completed and tested

---

## Success Metrics Tracking

| Metric | Target | How to Measure | Status |
|--------|--------|----------------|--------|
| Development Speed | 50% faster | Time to implement forms with common components vs custom | 🔄 TBD |
| Code Duplication | 70% reduction | LOC in feature components before/after migration | 🔄 TBD |
| Visual Consistency | 100% similar elements | Manual review + visual regression tests | 🔄 TBD |
| Theme Propagation | 100% automatic | Theme change test across all pages | 🔄 TBD |
| TypeScript Coverage | 100% (0 implicit any) | `npm run type-check` passes | 🔄 TBD |
| Documentation Coverage | 100% components | JSDoc + README exists for all 13 | 🔄 TBD |
| Font-family Declarations | 0 outside theme | `grep -r "font-family" components/` (excluding common/) | 🔄 TBD |
| Component Adoption | 90%+ UI patterns | Usage analysis across codebase | 🔄 TBD |

---

## Planning Complete

**Phase 0 ✅**: Research completed - all technical unknowns resolved  
**Phase 1 ✅**: Design completed - component contracts and data model defined  
**Phase 2 🔄**: Ready for task generation via `/speckit.tasks`

**Branch**: `008-common-components`  
**Spec**: [spec.md](./spec.md)  
**Plan**: This document  
**Next Command**: `/speckit.tasks`

All deliverables for `/speckit.plan` command have been generated. The feature is ready for implementation task breakdown.
