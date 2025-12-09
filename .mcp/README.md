# Context7 - Project Context Management

## 🎯 Purpose

Ensure all AI tools (Cursor, GitHub Copilot, Claude, Codeium, etc.) **always reference the same canonical documentation**, preventing drift and ensuring consistency across the team.

---

## 📚 How It Works

```
┌─────────────────────────────────────────┐
│  Canonical Sources (Single Source)     │
│  inventory-management-context/          │
│  ├── prompts/constitution.md           │
│  ├── AGENTS.md                          │
│  └── specs/...                          │
└──────────────┬──────────────────────────┘
               │
     ┌─────────┴─────────┐
     │   Context7 MCP    │
     │  (This Directory) │
     └─────────┬─────────┘
               │
    ┌──────────┼──────────┐
    │          │          │
┌───▼───┐  ┌──▼───┐  ┌───▼───┐
│Cursor │  │Copilot│ │Claude │
│Adapter│  │Adapter│ │Adapter│
└───────┘  └───────┘ └───────┘
```

**Key Principle**: Adapters are thin references to canonical sources. Update the source once, all tools get the update.

---

## 🚀 Quick Setup

### For Your AI Tool

Run the setup script for your preferred tool:

```bash
# From the context repository
cd inventory-management-context/.mcp

# Cursor
./setup-tool.sh cursor

# GitHub Copilot
./setup-tool.sh copilot

# Claude / Q
./setup-tool.sh claude

# Codeium
./setup-tool.sh codeium
```

This will:
1. Install the adapter for your tool
2. Configure it to reference canonical sources
3. Enable automatic context loading

---

## 📋 Critical Context (Always Loaded)

These are **ALWAYS** referenced by all tools:

### 1. Constitution
**Location**: `inventory-management-context/prompts/constitution.md`
**Priority**: CRITICAL
- Non-negotiable authority
- Architecture decisions
- Testing requirements
- TypeScript strict mode
- All standards

### 2. Agent Guidance
**Location**: `inventory-management-context/AGENTS.md`
**Priority**: HIGH
- AI-specific patterns
- Critical gotchas
- Feature branch conventions
- SpecKit workflow

### 3. Onboarding
**Location**: `inventory-management-context/ONBOARDING.md`
**Priority**: HIGH
- Setup instructions
- Prerequisites
- Local development workflow

---

## 🎯 Feature-Specific Context

These are loaded automatically based on keywords:

### Database Work
**Triggers**: "dynamodb", "database", "entity", "schema"
**Files**:
- `inventory-management-backend/src/types/entities.ts` (Data model)
- `inventory-management-backend/src/lib/dynamodb.ts` (Client)

### API Handlers
**Triggers**: "handler", "api", "endpoint", "response"
**Files**:
- `inventory-management-backend/src/lib/response.ts` (Patterns)
- `inventory-management-backend/src/lib/logger.ts` (Logging)

### Specifications
**Triggers**: "spec", "requirement", "contract"
**Files**:
- `inventory-management-context/specs/001-family-inventory-mvp/`

---

## 🔧 Context Rules (Enforced)

All implementations must follow these rules:

1. ✅ **Always check constitution** before architectural decisions
2. ✅ **Check AGENTS.md** for feature-specific gotchas
3. ✅ **Use existing patterns** before creating new ones
4. ✅ **Test-first development** for all critical features
5. ✅ **Use KeyBuilder** for DynamoDB keys (never manual construction)

---

## 🛠️ Team Usage

### Everyone Uses Different Tools? No Problem!

**Team Member 1** (Cursor):
```bash
cd inventory-management-context/.mcp && ./setup-tool.sh cursor
```

**Team Member 2** (Copilot):
```bash
cd inventory-management-context/.mcp && ./setup-tool.sh copilot
```

**Team Member 3** (Claude):
```bash
cd inventory-management-context/.mcp && ./setup-tool.sh claude
```

**Result**: Everyone references the **same canonical sources** regardless of tool choice.

---

## 📝 Updating Context

### To Update Documentation:

1. **Edit the canonical source** (e.g., `inventory-management-context/AGENTS.md`)
2. **Commit the change**
3. **That's it!** All tools automatically reference the updated source

**DO NOT** edit adapter files directly - they just point to sources.

---

## 🔍 Verify Setup

Check that your tool is correctly configured:

```bash
# Verify context sources exist
./verify-context.sh

# Check which tool is configured
ls -la ../inventory-management-backend/.cursorrules  # Cursor
ls -la ../inventory-management-backend/.github/copilot-instructions.md  # Copilot
```

---

## 📊 Context Loading Checklist

Before implementing any feature, AI tools should verify:

- [ ] Constitution requirements understood
- [ ] AGENTS.md gotchas reviewed
- [ ] Existing patterns identified
- [ ] Testing strategy confirmed
- [ ] Feature-specific context loaded

---

## 🆘 Troubleshooting

### AI Not Following Constitution
- Verify adapter is installed: Check for `.cursorrules` or equivalent
- Re-run setup: `./setup-tool.sh your-tool`
- Check canonical source exists: `cat ../inventory-management-context/prompts/constitution.md`

### Context Seems Out of Date
- Pull latest: `git pull` in all three repositories
- Context7 adapters reference files directly (no caching)
- AI tool may need restart

### Adding a New Tool
1. Create `adapters/your-tool/` directory
2. Create configuration file that references `context-sources.json`
3. Update `setup-tool.sh` with your tool
4. Test and document

---

## 📁 Directory Structure

```
inventory-management-context/.mcp/
├── README.md                    # This file
├── context-sources.json         # Machine-readable source registry
├── setup-tool.sh                # Setup script
├── verify-context.sh            # Verification script
└── adapters/
    ├── cursor/
    │   └── .cursorrules         # Cursor configuration
    ├── copilot/
    │   └── instructions.md      # Copilot configuration
    ├── claude/
    │   └── context.json         # Claude configuration
    └── codeium/
        └── config.json          # Codeium configuration
```

---

## 🎓 Philosophy

**Single Source of Truth**: Documentation lives in ONE place
**Thin Adapters**: Tools reference the source, never duplicate
**Tool Agnostic**: Works with any AI coding assistant
**Team Friendly**: Everyone can use their preferred tool
**Always Current**: No manual sync needed

---

**Last Updated**: 2025-12-09
**Maintained By**: Project team
**Questions**: See onboarding documentation

