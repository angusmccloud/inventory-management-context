# Code Mode Rules

This file provides guidance for Code mode when implementing features in this project.

## TypeScript Requirements

- **Strict mode is NON-NEGOTIABLE** - `tsconfig.json` must have `"strict": true`
- No implicit `any` types - all parameters and return types must be explicit
- Type assertions require justifying comments
- Shared types go in dedicated `types/` directory or colocated with modules

## Test-First Development

- Write tests BEFORE implementation code
- Ensure tests fail first, then implement to make them pass
- Minimum 80% coverage for critical business logic paths
- Use Jest and React Testing Library exclusively
- Mock AWS services and external dependencies in unit tests

## AWS SDK Patterns

- Use AWS SDK v3 with **modular imports only** (tree-shaking optimization):
  ```typescript
  // ✅ Correct
  import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
  import { DynamoDBDocumentClient, GetCommand } from "@aws-sdk/lib-dynamodb";
  
  // ❌ Wrong - never import entire SDK
  import AWS from "aws-sdk";
  ```
- Always use DynamoDB Document Client for data operations
- Use async/await exclusively - no raw Promises or callbacks

## File Organization

- Follow Next.js 16 App Router conventions (`app/` directory)
- Colocate related files: components, styles, tests together
- Business logic in `lib/` or `utils/` directories
- AWS SAM template and infrastructure code in project root
- Route handlers for API endpoints in `app/api/` directory

## Environment Variables

- All configuration via environment variables
- Never hardcode secrets, API keys, or connection strings
- Use `.env.local` for local development (never commit)

## Agent Context Synchronization

When adding shared context that should apply to all AI agents:

1. **Edit the shared source**: `.specify/memory/agent-shared-context.md`
2. **Run the sync script**: `.specify/scripts/bash/sync-agent-contexts.sh`

This ensures Cursor, Roo Code, and GitHub Copilot all receive the same guidelines.

**Quick Reference**: See `.specify/AGENT-SYNC-QUICK-REFERENCE.md`
**Full Documentation**: See `.specify/docs/agent-context-sync.md`