# Ask Mode Rules

This file provides guidance for Ask mode when answering questions about this project.

## Authoritative Source

The constitution at `.specify/memory/constitution.md` is the **NON-NEGOTIABLE** authority for all development decisions. Always reference it when answering questions about:
- Coding standards
- Architecture decisions
- Technology choices
- Development workflow

## SpecKit Workflow Documentation

Commands are documented in `.roo/commands/`:
- `speckit.constitution.md` - Constitution creation/updates
- `speckit.specify.md` - Feature specification
- `speckit.clarify.md` - Ambiguity resolution
- `speckit.plan.md` - Implementation planning
- `speckit.tasks.md` - Task breakdown
- `speckit.checklist.md` - Quality checklists
- `speckit.analyze.md` - Consistency analysis
- `speckit.implement.md` - Implementation execution
- `speckit.taskstoissues.md` - Issue conversion

## Template Locations

All templates are in `.specify/templates/`:
- `spec-template.md` - Feature specification template
- `plan-template.md` - Implementation plan template
- `tasks-template.md` - Task breakdown template
- `checklist-template.md` - Quality checklist template
- `agent-file-template.md` - Agent context file template

## Script Locations

Bash scripts are in `.specify/scripts/bash/`:
- `check-prerequisites.sh` - Verify environment setup
- `common.sh` - Shared utility functions
- `create-new-feature.sh` - Initialize new feature branch
- `setup-plan.sh` - Set up implementation plan
- `update-agent-context.sh` - Update agent context files

## Key Gotchas to Remember

1. This is a **context repository**, NOT the application codebase
2. Feature branches follow pattern: `###-feature-name`
3. Set `SPECIFY_FEATURE` env var when not using git
4. Checklists validate **requirements**, NOT implementation