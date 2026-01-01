# Implementation Plan: Theme Toggle (Light/Dark Mode)

**Branch**: `012-theme-toggle` | **Date**: January 1, 2026 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/012-theme-toggle/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Implement a three-state theme toggle system (Light/Dark/Auto) that automatically detects and applies the user's operating system theme preference by default. When users manually select a theme, that preference persists across sessions and devices for logged-in users, or in localStorage for anonymous users. The implementation must prevent "flash of wrong theme" during page load and ensure accessibility compliance.

## Technical Context

**Language/Version**: TypeScript 5.x (strict mode), Node.js 24.x LTS  
**Primary Dependencies**: Next.js 16 (App Router), React 18, Tailwind CSS with CSS variables, AWS SDK v3 (for backend preference storage)  
**Storage**: DynamoDB single-table (for logged-in user preferences), localStorage (for anonymous users)  
**Testing**: Jest, React Testing Library  
**Target Platform**: Web browsers (modern browsers with prefers-color-scheme support, graceful degradation for older browsers)
**Project Type**: Web (frontend + backend)  
**Performance Goals**: <100ms for system theme detection, <200ms for manual theme transition, zero flash of wrong theme on page load  
**Constraints**: Must work with SSR/SSG in Next.js, must not cause re-renders on route changes, preference storage <1KB per user, must support keyboard/screen reader accessibility  
**Scale/Scope**: Frontend-focused feature with minimal backend (single API endpoint for preference storage), affects entire UI system

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### ✅ TypeScript Type Safety (NON-NEGOTIABLE)
- All theme types must be explicitly defined
- No implicit `any` in theme provider or preference management
- Theme state type: `'light' | 'dark' | 'auto'`
- Preference storage type: explicit interface

### ✅ Testing Excellence (NON-NEGOTIABLE)
- Test system preference detection
- Test manual theme toggle with all three states
- Test persistence (localStorage and API)
- Test flash prevention on page load
- Test accessibility (keyboard, screen reader)
- 80% coverage for theme provider and preference logic

### ✅ Serverless Architecture
- Backend: Single Lambda function for GET/PUT user preference
- Frontend: Client-side theme detection and application
- No server-side theme processing (except preference storage)

### ✅ AWS Best Practices
- DynamoDB: Store preference in existing Users table or UserPreferences entity
- AWS SDK v3 with modular imports
- Least-privilege IAM for preference read/write

### ✅ Security First
- No sensitive data in theme preference
- Input validation: theme value must be 'light' | 'dark' | 'auto'
- Authentication required for server-side preference storage
- CORS properly configured for API endpoint

### ✅ Performance Optimization
- Theme applied before content renders (prevent flash)
- localStorage check is synchronous
- Minimal re-renders on theme change
- CSS variables for instant theme switching

### ✅ Code Organization
- Theme provider in `components/common/ThemeProvider.tsx` (existing)
- Theme toggle component in `components/common/ThemeToggle.tsx` (new)
- API client in `lib/api-client.ts` (extend existing)
- Types in `types/theme.ts` (new)

### ✅ Component Library (NON-NEGOTIABLE)
- Theme toggle must use common components (Button, Icon)
- Must integrate with existing ThemeProvider
- Must follow common component patterns and accessibility standards

**No violations identified. Proceed with Phase 0.**

## Project Structure

### Documentation (this feature)

```text
specs/012-theme-toggle/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output (API contract)
│   └── theme-preference-api.yaml
└── tasks.md             # Phase 2 output (NOT created by /speckit.plan)
```

### Source Code

```text
# Frontend
inventory-management-frontend/
├── components/
│   └── common/
│       ├── ThemeProvider.tsx     # EXISTING - extend with persistence
│       └── ThemeToggle.tsx       # NEW - three-state toggle component
├── lib/
│   ├── api-client.ts             # EXISTING - add theme preference methods
│   └── theme-storage.ts          # NEW - localStorage management
├── types/
│   └── theme.ts                  # NEW - theme type definitions
└── hooks/
    └── useTheme.ts               # NEW - theme state management hook

# Backend
inventory-management-backend/
├── src/
│   ├── handlers/
│   │   └── userPreference.ts    # NEW - GET/PUT theme preference
│   ├── models/
│   │   └── UserPreference.ts    # NEW - DynamoDB entity
│   └── types/
│       └── preference.ts        # NEW - backend types
└── template.yaml                # UPDATE - add API endpoint
```

**Structure Decision**: Web application with frontend (Next.js) and minimal backend (single Lambda). Theme provider already exists and needs enhancement for persistence. New toggle component required. Backend adds single endpoint for logged-in user preference storage.
