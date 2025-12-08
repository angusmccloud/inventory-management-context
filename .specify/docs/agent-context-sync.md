# Agent Context Synchronization

This document explains how AI agent context files stay synchronized across different AI assistants.

## Overview

When working with multiple AI assistants (Cursor, Roo Code, GitHub Copilot), you want them all to have the same project context and guidelines. This system ensures all three agent context files stay in sync automatically.

## Architecture

### Single Source of Truth

**File**: `.specify/memory/agent-shared-context.md`

This is the **authoritative source** for manual additions that should be shared across all AI agents. Any content added here will be synchronized to all agent-specific files.

### Agent-Specific Files

Three agent files are kept in sync:

1. **`AGENTS.md`** - Roo Code
2. **`.cursor/rules/specify-rules.mdc`** - Cursor IDE
3. **`.github/agents/copilot-instructions.md`** - GitHub Copilot

Each file has two types of content:

1. **Auto-generated content** - Extracted from `plan.md` files (languages, frameworks, databases)
2. **Manual additions** - Shared project guidelines, patterns, and conventions

## How It Works

### Automatic Sync (When Planning Features)

When you run `/speckit.plan` or manually update agent context:

```bash
# This command updates ALL agent files and syncs them
.specify/scripts/bash/update-agent-context.sh
```

**What happens**:
1. Script reads `plan.md` to extract tech stack info
2. Updates all three agent files with the tech stack
3. **Automatically calls sync script** to apply shared context
4. All three files end up with identical manual additions

### Manual Sync (Anytime)

To manually sync shared context to all agents:

```bash
.specify/scripts/bash/sync-agent-contexts.sh
```

**What happens**:
- Reads `.specify/memory/agent-shared-context.md`
- Injects content into all three agent files
- Preserves auto-generated content

### Extract from Agent (Capture Manual Edits)

If you manually edited one of the agent files and want to propagate those changes:

```bash
.specify/scripts/bash/sync-agent-contexts.sh --extract
```

**What happens**:
1. Scans all agent files for content between `<!-- MANUAL ADDITIONS START/END -->` markers
2. Extracts the first manual additions found
3. Updates `.specify/memory/agent-shared-context.md` with the extracted content
4. Syncs the shared content to ALL agent files

## Workflows

### Workflow 1: Add Shared Guidelines (Recommended)

**Use this when**: You want to add project-specific guidelines that all AI agents should follow

```bash
# 1. Edit the shared source of truth
vim .specify/memory/agent-shared-context.md

# 2. Add your content below the "Add your shared context below this line" comment
# Example:
## Authentication Patterns
- All API endpoints require JWT Bearer token
- Extract familyId from JWT claims
- Enforce role-based access control

# 3. Sync to all agents
.specify/scripts/bash/sync-agent-contexts.sh

# ✅ All three agent files now have your guidelines!
```

### Workflow 2: Extract from Manual Edit

**Use this when**: You accidentally edited an agent file directly and want to preserve the changes

```bash
# 1. You edited AGENTS.md or another agent file directly
# (Content between <!-- MANUAL ADDITIONS START --> and <!-- MANUAL ADDITIONS END -->)

# 2. Extract and sync
.specify/scripts/bash/sync-agent-contexts.sh --extract

# ✅ Your edits are now in the shared source AND all other agent files!
```

### Workflow 3: Feature Planning (Automatic)

**Use this when**: Planning a new feature with SpecKit

```bash
# Run the plan command
/speckit.plan

# ✅ Tech stack is extracted from plan.md
# ✅ All agent files are updated
# ✅ Shared context is automatically synced
# ✅ All three agents have consistent context!
```

## File Structure

### Shared Context File

`.specify/memory/agent-shared-context.md`:
```markdown
# Shared Agent Context

This file is the **single source of truth** for manual additions...

## Manual Additions

<!-- Add your shared context below this line -->

## Project-Specific Guidelines

- Always use Zod for input validation
- Follow the constitution at `.specify/memory/constitution.md`

## Common Patterns

### Authentication
- All API endpoints require JWT Bearer token
...
```

### Agent File Structure

Each agent file (e.g., `AGENTS.md`) has this structure:

```markdown
# inventory-management-context Development Guidelines

Auto-generated from all feature plans. Last updated: 2025-12-08

## Active Technologies

- TypeScript 5 with strict mode enabled (001-family-inventory-mvp)

## Project Structure

\```text
src/
tests/
\```

## Commands

npm test && npm run lint

## Code Style

TypeScript 5 with strict mode enabled: Follow standard conventions

## Recent Changes

- 001-family-inventory-mvp: Added TypeScript 5 with strict mode enabled

<!-- MANUAL ADDITIONS START -->
<!-- Shared context is injected here -->
## Project-Specific Guidelines

- Always use Zod for input validation
- Follow the constitution at `.specify/memory/constitution.md`
<!-- MANUAL ADDITIONS END -->
```

## Best Practices

### ✅ DO

- **Edit `.specify/memory/agent-shared-context.md`** for all manual guidelines
- **Run sync script** after editing shared context
- **Use `--extract`** if you accidentally edited an agent file directly
- **Add project-specific patterns** that all agents should know
- **Document common gotchas** in shared context

### ❌ DON'T

- Don't manually edit the "Active Technologies" or "Recent Changes" sections in agent files (they're auto-generated)
- Don't edit agent files directly for manual additions (use shared context instead)
- Don't forget to run sync after editing shared context
- Don't add agent-specific content to shared context (it's shared for a reason)

## Troubleshooting

### Manual additions disappeared after running update

**Problem**: You edited an agent file's manual section, then ran update, and your edits are gone.

**Solution**: 
```bash
# Check if your content is in shared context
cat .specify/memory/agent-shared-context.md

# If not, you need to extract it first (if you have a backup)
# Restore your agent file from git
git checkout AGENTS.md

# Extract to shared source
.specify/scripts/bash/sync-agent-contexts.sh --extract
```

### Agent files are out of sync

**Problem**: Different agent files have different manual additions.

**Solution**:
```bash
# Extract from the agent file that has the most complete content
# (The script will pick the first one it finds with content)
.specify/scripts/bash/sync-agent-contexts.sh --extract

# Or manually edit shared context and sync
vim .specify/memory/agent-shared-context.md
.specify/scripts/bash/sync-agent-contexts.sh
```

### Shared context not appearing in agent files

**Problem**: You edited shared context but it's not showing up in agent files.

**Solution**:
```bash
# Manually run sync
.specify/scripts/bash/sync-agent-contexts.sh

# Check if the MANUAL ADDITIONS markers exist in agent files
grep -n "MANUAL ADDITIONS" AGENTS.md .cursor/rules/specify-rules.mdc .github/agents/copilot-instructions.md
```

## Scripts Reference

### update-agent-context.sh

**Purpose**: Update agent files with tech stack from plan.md and sync shared context

**Usage**:
```bash
# Update all existing agent files
.specify/scripts/bash/update-agent-context.sh

# Update specific agent
.specify/scripts/bash/update-agent-context.sh cursor-agent
.specify/scripts/bash/update-agent-context.sh claude
.specify/scripts/bash/update-agent-context.sh copilot
```

**When it runs**:
- Automatically during `/speckit.plan`
- Manually when you want to refresh agent context

### sync-agent-contexts.sh

**Purpose**: Sync manual additions across all agent files

**Usage**:
```bash
# Sync from shared source to all agents
.specify/scripts/bash/sync-agent-contexts.sh

# Extract manual additions from agents to shared source, then sync
.specify/scripts/bash/sync-agent-contexts.sh --extract

# Show help
.specify/scripts/bash/sync-agent-contexts.sh --help
```

**When to run**:
- After editing `.specify/memory/agent-shared-context.md`
- When you've manually edited an agent file and want to propagate changes
- When agent files get out of sync

## Technical Details

### Manual Additions Markers

Agent files use HTML comments as markers:

```markdown
<!-- MANUAL ADDITIONS START -->
[Content between these markers is replaced during sync]
<!-- MANUAL ADDITIONS END -->
```

### Sync Process

1. **Read shared source**: Extract content from `agent-shared-context.md`
2. **For each agent file**:
   - Open the file
   - Find `<!-- MANUAL ADDITIONS START -->` marker
   - Replace content until `<!-- MANUAL ADDITIONS END -->` marker
   - Preserve all other content (auto-generated sections)
   - Write file atomically

### Extract Process

1. **Scan agent files**: Look for content between manual addition markers
2. **Pick first match**: Use the first agent file that has manual content
3. **Update shared source**: Replace content in `agent-shared-context.md`
4. **Sync to all**: Call sync process to distribute to all agents

## Integration with SpecKit

The synchronization system is fully integrated with SpecKit:

1. **During planning** (`/speckit.plan`):
   - Tech stack extracted from spec → `plan.md`
   - Agent files updated with tech stack
   - Shared context synced to all agents

2. **Manual context updates**:
   - Edit `.specify/memory/agent-shared-context.md`
   - Run sync script
   - All agents updated

3. **Constitution compliance**:
   - Constitution principles can be added to shared context
   - All agents will enforce the same rules

## Example: Adding Authentication Guidelines

```bash
# 1. Edit shared context
cat >> .specify/memory/agent-shared-context.md << 'EOF'

## Authentication Patterns

All API endpoints MUST follow these authentication patterns:

- **JWT Bearer Tokens**: Use AWS Cognito JWT tokens
- **Family Context**: Extract `familyId` from `custom:familyId` claim
- **Role-Based Access**: Check `custom:role` claim (admin/suggester)
- **Authorization**: Verify familyId in path matches JWT claim

### Example Lambda Authorizer Context

\```typescript
interface AuthorizerContext {
  memberId: string;
  familyId: string;
  role: 'admin' | 'suggester';
}
\```

### Role Permissions

- **admin**: Full CRUD on all resources
- **suggester**: Read-only + create suggestions
EOF

# 2. Sync to all agents
.specify/scripts/bash/sync-agent-contexts.sh

# 3. Verify
echo "=== Cursor ===" && grep -A 5 "Authentication" .cursor/rules/specify-rules.mdc
echo "=== Roo ===" && grep -A 5 "Authentication" AGENTS.md
echo "=== Copilot ===" && grep -A 5 "Authentication" .github/agents/copilot-instructions.md
```

---

**Last Updated**: 2025-12-08  
**Maintained By**: SpecKit automation  
**Questions?**: Check `.specify/scripts/bash/sync-agent-contexts.sh --help`

