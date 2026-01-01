# inventory-management-context Development Guidelines

Auto-generated from all feature plans. Last updated: 2025-12-08

## Active Technologies
- TypeScript 5.x with strict mode enabled + Next.js 16 (App Router), React 19, Tailwind CSS 3.x, existing theme system (`lib/theme.ts`) (008-common-components)
- N/A (frontend-only feature, no data persistence) (008-common-components)
- TypeScript 5.x with strict mode (frontend & backend) (006-nfc-inventory-tap)
- Amazon DynamoDB (single-table design, extends existing InventoryManagement table) (006-nfc-inventory-tap)
- Amazon DynamoDB (single-table design pattern, extends existing table from 001) (004-suggester-workflow)
- TypeScript 5 (strict mode) + Next.js 16 App Router, Tailwind CSS 3.4, React 18 (009-theme-color-update)
- N/A (frontend-only changes) (009-theme-color-update)
- TypeScript 5 with strict mode + Next.js 16 App Router, React 19, AWS SDK v3 (010-streamline-quantity-controls)
- Amazon DynamoDB (existing inventory items) (010-streamline-quantity-controls)
- TypeScript 5 with strict mode + Next.js 16 (App Router), React 18, Tailwind CSS 3.x (011-mobile-responsive-ui)
- TypeScript 5 (strict mode), Node.js 24.x LTS + Next.js 16 App Router, React 18 (013-url-path-cleanup)
- N/A (frontend-only routing changes) (013-url-path-cleanup)

- TypeScript 5 with strict mode enabled (001-family-inventory-mvp)

## Project Structure

```text
src/
tests/
```

## Commands

npm test && npm run lint

## Code Style

TypeScript 5 with strict mode enabled: Follow standard conventions

## Recent Changes
- 013-url-path-cleanup: Added TypeScript 5 (strict mode), Node.js 24.x LTS + Next.js 16 App Router, React 18
- 011-mobile-responsive-ui: Added TypeScript 5 with strict mode + Next.js 16 (App Router), React 18, Tailwind CSS 3.x
- 010-streamline-quantity-controls: Added TypeScript 5 with strict mode + Next.js 16 App Router, React 19, AWS SDK v3


<!-- MANUAL ADDITIONS START -->

## Build Tool & Deployment

- **Frontend Build Tool**: Vite (NOT Webpack or Next.js built-in bundler)
- **Frontend Deployment**: AWS S3 + CloudFront (NOT Vercel or other platforms)
- **Build Command**: `npm run build` (uses Vite)
- **Output Directory**: `dist/` (configured in `vite.config.ts`)

## Project-Specific Guidelines

- Always use Zod for input validation at API boundaries
- Follow the constitution at `.specify/memory/constitution.md`
- DynamoDB queries MUST use indexes (no table scans allowed)
- All code MUST be TypeScript 5 with strict mode enabled

## Common Patterns

### Frontend Development
- Use Vite for fast HMR during development
- Configure path aliases in `vite.config.ts`
- Environment variables must be prefixed with `NEXT_PUBLIC_` or `VITE_`
- Build output goes to `dist/` directory

### Authentication
- All API endpoints require JWT Bearer token from AWS Cognito
- Family context (`familyId`) is extracted from JWT `custom:familyId` claim
- Role-based access control: `admin` (full access) or `suggester` (read + suggest)
- Lambda authorizer validates JWT and injects context

### DynamoDB Access
- Use single-table design pattern
- All queries filter by `familyId` for family isolation
- Use GSI2 for low-stock queries and shopping list filtering
- Never use table scans (always query with proper indexes)

### Error Handling
- Use structured error responses with Zod validation errors
- Include correlation IDs in all errors for tracing
- Log errors with CloudWatch structured JSON format
- Return appropriate HTTP status codes (400, 401, 403, 404, 500)

### Deployment
- Frontend: Deploy to S3, invalidate CloudFront cache
- Backend: Deploy via AWS SAM (`sam deploy`)
- Always run tests before deployment
- Use environment-specific configurations (dev, staging, prod)
<!-- MANUAL ADDITIONS END -->
