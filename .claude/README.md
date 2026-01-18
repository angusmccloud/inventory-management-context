# Claude Configuration for ATL Inventory Management

This directory contains Claude-specific configuration and commands for the ATL Inventory Management system.

## Structure

```
.claude/
├── config.md           # Main configuration file referencing canonical sources
├── commands/           # SpecKit command implementations for Claude
│   ├── speckit.constitution.md
│   ├── speckit.specify.md
│   ├── speckit.clarify.md
│   ├── speckit.plan.md
│   ├── speckit.tasks.md
│   ├── speckit.checklist.md
│   ├── speckit.analyze.md
│   ├── speckit.implement.md
│   └── speckit.taskstoissues.md
└── rules/              # Claude-specific rules (if needed)
```

## Configuration Sources

The Claude configuration follows the Context7 MCP pattern, referencing these canonical sources:

- **Constitution**: `.specify/memory/constitution.md` - Technical standards and architecture decisions
- **Agent Guidance**: `AGENTS.md` - SpecKit workflow and general guidance
- **Shared Context**: `.specify/memory/agent-shared-context.md` - Context shared across all AI agents

## Using SpecKit Commands with Claude

Claude has access to all SpecKit commands through this configuration. These commands guide you through:

1. **speckit.constitution** - Create/update project constitution
2. **speckit.specify** - Create feature specifications
3. **speckit.clarify** - Resolve specification ambiguities
4. **speckit.plan** - Generate implementation plans
5. **speckit.tasks** - Break down plans into tasks
6. **speckit.checklist** - Generate quality checklists
7. **speckit.analyze** - Analyze cross-artifact consistency
8. **speckit.implement** - Execute implementation tasks
9. **speckit.taskstoissues** - Convert tasks to GitHub issues

## Context Synchronization

When updating shared context:

1. Edit `.specify/memory/agent-shared-context.md`
2. Run `.specify/scripts/bash/sync-agent-contexts.sh`
3. Changes automatically sync to:
   - AGENTS.md (Roo Code)
   - .cursor/rules/specify-rules.mdc (Cursor)
   - .github/agents/copilot-instructions.md (Copilot)
   - .claude/config.md (Claude) ✨

## Setup

To set up Claude with this configuration:

```bash
# From the inventory-management-context directory
./.mcp/setup-tool.sh claude
```

This will:
- Confirm Claude configuration exists in `.claude/`
- Optionally install project config to `~/.config/claude/projects/`

## Technology Stack

- Next.js 16 with App Router
- TypeScript 5 (strict mode)
- AWS SAM (serverless deployment)
- DynamoDB (single-table design)
- Node.js 20.x LTS

## Key Principles

1. **TypeScript strict mode** - No implicit `any` types
2. **Test-first development** - 80% coverage for critical paths
3. **Infrastructure as Code** - Always use template.yaml
4. **DynamoDB best practices** - Single-table design, no table scans

See `.specify/memory/constitution.md` for complete technical standards.
