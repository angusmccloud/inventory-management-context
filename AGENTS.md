# AGENTS.md

This file provides guidance to agents when working with code in this repository.

## Repository Type

This is a **SpecKit context repository** containing commands, templates, and scripts for AI-assisted development. It is NOT the application codebase itself.

## Authoritative Source

The constitution at `.specify/memory/constitution.md` is the **NON-NEGOTIABLE** authority for all development decisions. Always consult it first.

## NON-NEGOTIABLE Principles

1. **TypeScript 5 with strict mode** - No implicit `any` types allowed
2. **Test-first development** - 80% coverage required for critical paths
3. **Jest and React Testing Library** - Mandatory testing frameworks
4. **Infrastructure as Code** - ALWAYS use template.yaml for AWS configuration (see docs/INFRASTRUCTURE-AS-CODE-BEST-PRACTICES.md)

## Technology Stack (for actual codebase)

- Next.js 16 with App Router
- TypeScript 5 strict mode
- Node.js 20.x LTS
- AWS SAM for deployment
- DynamoDB (single-table design)

## Feature Branch Convention

Feature branches MUST follow pattern: `###-feature-name` (e.g., `001-user-auth`)

## SpecKit Workflow

SpecKit commands are available for multiple AI assistants:
- **Roo Code**: `.roo/commands/`
- **Cursor**: `.cursor/commands/`
- **GitHub Copilot**: `.github/prompts/` and `.github/agents/`

Available commands:
- `speckit.constitution` - Create/update project constitution
- `speckit.specify` - Create feature specification
- `speckit.clarify` - Resolve spec ambiguities
- `speckit.plan` - Generate implementation plan
- `speckit.tasks` - Generate task breakdown
- `speckit.checklist` - Generate quality checklists
- `speckit.analyze` - Cross-artifact consistency analysis
- `speckit.implement` - Execute implementation tasks
- `speckit.taskstoissues` - Convert tasks to issues

## Critical Gotchas

1. Set `SPECIFY_FEATURE` env var when not using git for feature context
2. Checklists validate **requirements**, NOT implementation
3. Task format: `- [ ] [TaskID] [P?] [Story?] Description with file path`
4. Templates are in `.specify/templates/`
5. Scripts are in `.specify/scripts/bash/`
6. **ALWAYS use template.yaml for AWS configurations** - Manual console operations only for SES domain verification and third-party DNS (see docs/INFRASTRUCTURE-AS-CODE-BEST-PRACTICES.md)

## Agent Context Synchronization

When adding shared context that should apply to all AI agents:

1. **Edit the shared source**: `.specify/memory/agent-shared-context.md`
2. **Run the sync script**: `.specify/scripts/bash/sync-agent-contexts.sh`

This ensures Cursor, Roo Code, and GitHub Copilot all receive the same guidelines.

**Quick Reference**: See `.specify/AGENT-SYNC-QUICK-REFERENCE.md`
**Full Documentation**: See `.specify/docs/agent-context-sync.md`