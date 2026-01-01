# Implementation Plan: URL Path Cleanup

**Branch**: `013-url-path-cleanup` | **Date**: 2026-01-01 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/013-url-path-cleanup/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Simplify application URL structure by removing redundant "/dashboard" prefix from all section URLs (inventory, shopping lists, members, suggestions, reference data) while preserving `/dashboard` as the home landing page. Implementation requires restructuring Next.js App Router directory layout, implementing redirects via middleware for backward compatibility, and updating all internal navigation links and components. The change improves URL memorability, shareability, and user experience without affecting backend APIs or data structures.

## Technical Context

**Language/Version**: TypeScript 5 (strict mode), Node.js 24.x LTS  
**Primary Dependencies**: Next.js 16 App Router, React 18  
**Storage**: N/A (frontend-only routing changes)  
**Testing**: Jest, React Testing Library  
**Target Platform**: Web (Next.js SSG/SSR)  
**Project Type**: Web application (frontend-only)  
**Performance Goals**: <100ms redirects, no increase in page load times  
**Constraints**: Zero broken links, 100% backward compatibility with old URLs  
**Scale/Scope**: ~10 route pages, ~15 navigation components, ~50 internal links

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### ✅ Principle I: TypeScript Type Safety
- **Status**: PASS
- **Validation**: All route changes use TypeScript. Navigation components already typed.
- **Action Required**: None

### ✅ Principle II: Serverless Architecture
- **Status**: PASS
- **Validation**: Frontend-only changes. No backend Lambda modifications required.
- **Action Required**: None

### ✅ Principle III: Testing Excellence
- **Status**: PASS
- **Validation**: Navigation tests will validate URL structure, redirects, and route loading.
- **Action Required**: Add integration tests for:
  - Route page loading at new URLs
  - Middleware redirects from old to new URLs
  - Query parameter preservation during redirects
  - Navigation component link updates

### ✅ Principle IV: AWS Best Practices
- **Status**: PASS
- **Validation**: No AWS service changes. Frontend deployment via S3+CloudFront unchanged.
- **Action Required**: None

### ✅ Principle V: Security First
- **Status**: PASS
- **Validation**: URL changes don't affect authentication/authorization. Protected routes remain protected.
- **Action Required**: Verify authentication middleware still applies to new URL paths

### ✅ Principle VI: Performance Optimization
- **Status**: PASS
- **Validation**: Middleware redirects add minimal overhead (<10ms). No bundle size impact.
- **Action Required**: Measure redirect performance in tests (<100ms requirement)

### ✅ Principle VII: Code Organization
- **Status**: PASS
- **Validation**: Follows Next.js App Router conventions. Moving files from `app/dashboard/*` to `app/*`.
- **Action Required**: None

### ✅ Principle VIII: Component Library
- **Status**: PASS
- **Validation**: Navigation components use common library. No new components needed.
- **Action Required**: Update navigation links in existing common components

### Overall Constitution Compliance: ✅ PASS

All principles satisfied. No violations require justification. Feature is frontend-only routing restructure aligned with Next.js App Router best practices.

---

## Post-Design Constitution Re-Evaluation

*Re-checked after Phase 1 design completion (research.md, data-model.md, quickstart.md)*

### ✅ All Principles: PASS

**Design Validation**:
- Research document confirms Next.js middleware pattern for redirects (aligns with Principle II: Serverless)
- Testing strategy includes integration tests with 80% coverage goal (aligns with Principle III: Testing Excellence)
- TypeScript used throughout middleware and navigation updates (aligns with Principle I: Type Safety)
- No new security concerns introduced; authentication middleware unaffected (aligns with Principle V: Security First)
- Performance validated: <100ms redirects, no bundle size increase (aligns with Principle VI: Performance)
- File structure follows Next.js App Router conventions (aligns with Principle VII: Code Organization)
- Navigation updates use existing common components (aligns with Principle VIII: Component Library)

**No new violations identified.** Design is ready for implementation.

---

## Project Structure

### Documentation (this feature)

```text
specs/013-url-path-cleanup/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command) - N/A for this feature
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command) - N/A for this feature
├── checklists/
│   └── requirements.md  # Requirements validation checklist (complete)
└── spec.md              # Feature specification (complete)
```

### Source Code (frontend repository)

```text
inventory-management-frontend/
├── app/
│   ├── dashboard/                    # KEEP - Home dashboard page
│   │   └── page.tsx
│   ├── inventory/                    # MOVED from app/dashboard/inventory/
│   │   ├── page.tsx
│   │   └── [itemId]/page.tsx
│   ├── shopping-list/                # MOVED from app/dashboard/shopping-list/
│   │   └── page.tsx
│   ├── members/                      # MOVED from app/dashboard/members/
│   │   └── page.tsx
│   ├── suggestions/                  # MOVED from app/dashboard/suggestions/
│   │   ├── page.tsx
│   │   └── suggest/page.tsx
│   ├── notifications/                # MOVED from app/dashboard/notifications/
│   │   └── page.tsx
│   ├── settings/                     # MOVED from app/dashboard/settings/
│   │   ├── page.tsx
│   │   └── reference-data/page.tsx
│   └── middleware.ts                 # ADD - Redirect old URLs to new URLs
├── components/
│   ├── common/
│   │   ├── Navigation/               # UPDATE - Navigation links to new URLs
│   │   ├── MobileNav/                # UPDATE - Mobile navigation links
│   │   ├── Sidebar/                  # UPDATE - Sidebar navigation links
│   │   └── Breadcrumbs/              # UPDATE - Breadcrumb generation logic
│   ├── inventory/
│   │   └── InventoryList.tsx         # UPDATE - Suggestion link URLs
│   └── shopping-list/
│       ├── AddItemForm.tsx           # UPDATE - Settings link URLs
│       └── EditShoppingListItemForm.tsx  # UPDATE - Settings link URLs
└── tests/
    └── integration/
        └── routing.test.ts           # ADD - Route and redirect tests
```

**Structure Decision**: This is a web application following Next.js 16 App Router conventions. Changes involve moving route pages from nested `app/dashboard/*` directories to top-level `app/*` directories (except `/dashboard` home page which stays), implementing middleware for redirects, and updating navigation component links.

## Complexity Tracking

N/A - No constitutional violations. All principles satisfied.
