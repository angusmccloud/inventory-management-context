# MCP (Model Context Protocol) - Quick Setup Guide

## ✅ Setup Complete for Cursor!

Your Cursor is now configured to always reference the latest project documentation.

---

## 🎯 What is MCP?

MCP (Model Context Protocol) is a setup that ensures **all AI tools reference the same canonical documentation**, preventing drift and ensuring consistency.

### How It Works

```
Constitution.md (ONE SOURCE)
         ↓
        MCP
         ↓
    ┌────┴────┐
 Cursor    Copilot    Claude
  (You)   (Teammate) (Teammate)
```

**Everyone references the same source** regardless of their preferred AI tool.

---

## 📚 What Cursor Now References

When you interact with Cursor, it automatically loads:

### Critical Context (Always):
1. **Constitution** - `inventory-management-context/prompts/constitution.md`
   - Architecture decisions
   - Testing requirements
   - TypeScript standards

2. **Agent Guidance** - `inventory-management-context/AGENTS.md`
   - Patterns and gotchas
   - Feature branch conventions
   - SpecKit workflow

3. **Onboarding** - `inventory-management-context/ONBOARDING.md`
   - Setup instructions
   - Development workflow

### Feature Context (When Relevant):
- **Data Model** - `src/types/entities.ts` (KeyBuilder, QueryPatterns)
- **API Patterns** - `src/lib/response.ts` (Response helpers)
- **Logging** - `src/lib/logger.ts` (Structured logging)
- **DynamoDB Client** - `src/lib/dynamodb.ts`

---

## ✅ Verification

Test that Cursor is loading context:

1. Open Cursor in the `inventory-management-backend` folder
2. Ask Cursor: "What does the constitution say about testing?"
3. It should reference the constitution and mention:
   - Test-first development
   - 80% coverage requirement
   - Jest + aws-sdk-client-mock

---

## 🔄 Updating Documentation

### To Update Project Standards:

1. Edit the canonical source:
   ```bash
   # Example: Update constitution
   code inventory-management-context/prompts/constitution.md
   ```

2. Save and commit:
   ```bash
   git add inventory-management-context/prompts/constitution.md
   git commit -m "docs: update constitution requirements"
   git push
   ```

3. **That's it!** Cursor automatically references the updated file.

**DO NOT** edit `.cursorrules` directly - it just points to the sources.

---

## 👥 Setting Up for Team Members

### If a teammate uses a different tool:

**GitHub Copilot:**
```bash
cd inventory-management-context/.mcp
./setup-tool.sh copilot
```

**Claude / Q:**
```bash
cd inventory-management-context/.mcp
./setup-tool.sh claude
```

**Codeium:**
```bash
cd inventory-management-context/.mcp
./setup-tool.sh codeium
```

**Result**: They'll reference the **same constitution and AGENTS.md** as you, ensuring consistency.

---

## 📋 Mandatory Checks (Enforced by MCP)

Before any implementation, Cursor will check:

1. ✅ What does the constitution require?
2. ✅ What are the AGENTS.md gotchas?
3. ✅ What patterns exist in the codebase?
4. ✅ How should this be tested?

---

## 🚨 Critical Rules (Always Enforced)

### DynamoDB
- ✅ Use `KeyBuilder` from entities.ts
- ❌ Never manually construct PK/SK

### API Responses
- ✅ Use `successResponse()` from response.ts
- ❌ Never manual response construction

### Logging
- ✅ Use `logger.info()` from logger.ts
- ❌ Never use console.log

### Testing
- ✅ Unit tests with mocks (aws-sdk-client-mock)
- ✅ Integration tests with DynamoDB Local
- ✅ 80% coverage on critical paths

---

## 📁 File Structure

```
inventory-management-context/
├── .mcp/                        # MCP configuration
│   ├── README.md                # Detailed documentation
│   ├── context-sources.json    # Machine-readable registry
│   ├── setup-tool.sh            # Install adapter script
│   ├── verify-context.sh        # Verification script
│   └── adapters/
│       ├── cursor/
│       │   └── .cursorrules     # Template for repos
│       ├── copilot/
│       │   └── instructions.md
│       ├── claude/
│       │   └── context.json
│       └── codeium/
│           └── config.json
├── .specify/scripts/bash/
│   ├── start-dev.sh             # Start dev servers
│   └── stop-dev.sh              # Stop dev servers
└── ...
```

---

## 🧪 Testing MCP Setup

Try asking Cursor:

1. **"What does the constitution say about TypeScript?"**
   - Should mention strict mode, no implicit any

2. **"How should I create DynamoDB keys?"**
   - Should recommend KeyBuilder from entities.ts

3. **"What are the testing requirements?"**
   - Should mention 80% coverage, test-first development

---

## 🔧 Troubleshooting

### Context not loading?
```bash
# Verify sources exist
cd inventory-management-context/.mcp
./verify-context.sh

# Reinstall adapter
./setup-tool.sh cursor
```

### Need to update context?
```bash
# Just edit the source file
code inventory-management-context/AGENTS.md

# Cursor picks up changes automatically
```

---

## 📖 More Information

- **Full documentation**: `inventory-management-context/.mcp/README.md`
- **Context sources**: `inventory-management-context/.mcp/context-sources.json`
- **Available adapters**: `ls inventory-management-context/.mcp/adapters/`
- **Dev scripts**: `inventory-management-context/.specify/scripts/bash/`

---

## ✨ Benefits

✅ **Consistent**: Everyone follows same constitution  
✅ **Current**: Always references latest docs  
✅ **Tool-agnostic**: Works with any AI assistant  
✅ **Maintainable**: Update once, applies everywhere  
✅ **Team-friendly**: Each person uses their preferred tool  

---

**You're all set!** Cursor now automatically references your project's constitution, patterns, and standards. 🚀

**Next**: Try implementing a feature and see Cursor reference the constitution and AGENTS.md automatically!

