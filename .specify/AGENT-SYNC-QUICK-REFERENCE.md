# Agent Context Sync - Quick Reference

## 📝 Want to add guidelines all AI agents should follow?

```bash
# 1. Edit the shared source
vim .specify/memory/agent-shared-context.md

# 2. Add your content below the comment line

# 3. Sync to all agents
.specify/scripts/bash/sync-agent-contexts.sh
```

✅ **Result**: Cursor, Roo, and Copilot all have your guidelines!

---

## 🔄 Accidentally edited an agent file directly?

```bash
# Extract your changes and sync to all
.specify/scripts/bash/sync-agent-contexts.sh --extract
```

✅ **Result**: Your changes are saved to shared source AND synced to all agents!

---

## 🚀 Planning a new feature?

```bash
# Just run the plan command as normal
/speckit.plan
```

✅ **Result**: Tech stack + shared context automatically synced to all agents!

---

## 📂 Files Involved

| File | Purpose |
|------|---------|
| `.specify/memory/agent-shared-context.md` | **EDIT THIS** - Single source of truth |
| `CLAUDE.md` | Auto-synced (Roo Code) |
| `.cursor/rules/specify-rules.mdc` | Auto-synced (Cursor IDE) |
| `.github/agents/copilot-instructions.md` | Auto-synced (GitHub Copilot) |

---

## 🎯 Golden Rule

**Always edit `.specify/memory/agent-shared-context.md` for manual additions.**

Never edit the agent files directly (unless you use `--extract` after).

---

## 📖 Full Documentation

See `.specify/docs/agent-context-sync.md` for complete details.

