# GitHub Copilot Instructions
   
   When working in this workspace, always follow the architecture and 
   coding standards defined in `.github/agents/constitution.md`.
   
   Key points:
   - Use Next.js 16 App Router
   - TypeScript 5 strict mode
   - DynamoDB single-table design
   - AWS SAM for deployment

## Agent Context Synchronization

When adding shared context that should apply to all AI agents:

1. **Edit the shared source**: `.specify/memory/agent-shared-context.md`
2. **Run the sync script**: `.specify/scripts/bash/sync-agent-contexts.sh`

This ensures Cursor, Roo Code, and GitHub Copilot all receive the same guidelines.

**Quick Reference**: See `.specify/AGENT-SYNC-QUICK-REFERENCE.md`
**Full Documentation**: See `.specify/docs/agent-context-sync.md`