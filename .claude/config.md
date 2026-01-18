# Claude Configuration - ATL Inventory Management System

## Constitution
Follow all guidelines defined in `inventory-management-context/.specify/memory/constitution.md`

## Quick Reference
- Framework: Next.js 16 with App Router
- Language: TypeScript 5 (strict mode)
- Database: DynamoDB (single-table design pattern)
- Deployment: AWS SAM (serverless)
- Runtime: Node.js 20.x LTS

## When coding:
1. Check constitution for architecture decisions
2. Use TypeScript with no implicit any
3. Follow Next.js 16 best practices
4. Implement proper error handling
5. Use AWS SDK v3 modular imports

## Before generating code, always:
- Review the constitution at `.specify/memory/constitution.md`
- Ensure TypeScript strict mode compliance
- Follow DynamoDB best practices
- Structure for serverless deployment

## Agent Context Synchronization

When adding shared context that should apply to all AI agents:

1. **Edit the shared source**: `.specify/memory/agent-shared-context.md`
2. **Run the sync script**: `.specify/scripts/bash/sync-agent-contexts.sh`

This ensures Cursor, Roo Code, GitHub Copilot, and Claude all receive the same guidelines.

**Quick Reference**: See `.specify/AGENT-SYNC-QUICK-REFERENCE.md`
**Full Documentation**: See `.specify/docs/agent-context-sync.md`

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
