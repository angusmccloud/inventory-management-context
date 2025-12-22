# Inventory Management System - Context Repository

📋 **SpecKit Workflow Tools & Project Configuration**

This is the **Context Repository** for the Inventory Management System - a SpecKit-powered repository containing commands, templates, scripts, and the authoritative project constitution for AI-assisted development. **This is NOT the application codebase itself.**

---

## 🚀 Getting Started

> **⚠️ IMPORTANT: New to this project?**
> 
> **Please follow the comprehensive [ONBOARDING.md](ONBOARDING.md) guide first!**
> 
> The onboarding guide provides step-by-step instructions for:
> - Setting up all three repositories in the multi-repo structure
> - Creating the VSCode workspace
> - Installing dependencies
> - Understanding the project architecture
> - Learning the SpecKit workflow

---

## 📦 Multi-Repository Structure

This project uses a **multi-repository architecture** organized through a VSCode workspace:

1. **📋 inventory-management-context** (this repo) - SpecKit workflow tools, templates, and project constitution
2. **🔧 inventory-management-backend** - AWS Lambda functions and serverless backend services
3. **🎨 inventory-management-frontend** - Next.js 16 App Router frontend application

This separation provides clear boundaries between configuration/tooling, backend services, and frontend code while maintaining a unified development experience.

---

## 📂 Repository Contents

### Core Documentation
- **[`.specify/memory/constitution.md`](.specify/memory/constitution.md)** - 🔴 **NON-NEGOTIABLE** project constitution (authoritative source for ALL development decisions)
- **[`AGENTS.md`](AGENTS.md)** - Guidance for AI assistants working with the codebase
- **[`ONBOARDING.md`](ONBOARDING.md)** - Comprehensive onboarding guide for new developers

### SpecKit Commands
AI-assisted development commands available for multiple tools:
- **`.roo/commands/`** - Roo Code SpecKit commands
- **`.cursor/commands/`** - Cursor SpecKit commands
- **`.github/prompts/`** and **`.github/agents/`** - GitHub Copilot commands

### Templates & Scripts
- **`.specify/templates/`** - Templates for specifications, plans, tasks, and checklists
- **`.specify/scripts/bash/`** - Automation and utility scripts

---

## 🔄 SpecKit Workflow

SpecKit provides a structured, AI-assisted development workflow with the following commands:

| Command | Purpose |
|---------|---------|
| `speckit.constitution` | Create/update project constitution |
| `speckit.specify` | Create feature specification |
| `speckit.clarify` | Resolve specification ambiguities |
| `speckit.plan` | Generate implementation plan |
| `speckit.tasks` | Generate task breakdown |
| `speckit.checklist` | Generate quality checklists |
| `speckit.analyze` | Cross-artifact consistency analysis |
| `speckit.implement` | Execute implementation tasks |
| `speckit.taskstoissues` | Convert tasks to GitHub issues |

### Using SpecKit Commands

**In Roo Code:**
- Type `/` to see available commands
- Select the desired SpecKit command

**In Cursor:**
- Use `Cmd+K` (Mac) or `Ctrl+K` (Windows/Linux)
- Type the command name (e.g., `speckit.specify`)

**In GitHub Copilot Chat:**
- Use `@workspace` to reference workspace context
- Reference prompts from `.github/prompts/`

---

## 🤖 Automated PR Review

This repository includes an **automated Pull Request review system** powered by GitHub Copilot that validates all code changes against the project constitution and coding standards.

### Multi-Repository Support

The PR review system works across **all three repositories** in the project:

- **📋 Context Repository** (this repo) - Central hub for rules and review configuration
- **🔧 Backend Repository** - Uses Context rules (only needs ~15 lines of config)
- **🎨 Frontend Repository** - Uses Context rules (only needs ~15 lines of config)

**Key Advantage**: Backend and Frontend repositories don't duplicate any rules or configuration files. They simply call the centralized review workflow from this Context repository.

### Key Features

- ✅ **Automated Reviews**: Every PR is automatically reviewed against constitution rules
- ✅ **Multi-Repo Support**: Works across Context, Backend, and Frontend repositories
- ✅ **Centralized Rules**: All rules maintained in one place (this repository)
- ✅ **Inline Feedback**: Comments posted directly on problematic code lines
- ✅ **Severity-Based Blocking**: Critical violations block merge, warnings are advisory
- ✅ **Dynamic Updates**: Changes to constitution automatically reflected in all repos
- ✅ **Version Tracking**: Each review references the constitution version used
- ✅ **Minimal Setup**: Backend/Frontend repos only need ONE small file (~15 lines)

### How It Works

When you create or update a pull request:
1. GitHub Actions workflow triggers automatically
2. System aggregates latest rules from constitution and agent files
3. Copilot reviews changed files against validation categories
4. Inline comments posted on violations with suggested fixes
5. Summary comment shows overall findings and verdict
6. Status check blocks merge if critical violations found

### Validation Categories

| Category | Severity | Examples |
|----------|----------|----------|
| TypeScript Compliance | 🔴 CRITICAL | No implicit `any`, strict mode |
| Testing Requirements | 🔴 CRITICAL | Test-first, 80% coverage |
| Security Standards | 🔴 CRITICAL | No secrets, input validation |
| AWS Best Practices | 🟠 HIGH | SDK v3, no DynamoDB scans |
| Code Organization | 🟡 MEDIUM | App Router structure |
| Performance | 🟠 HIGH | Image optimization, caching |

### Learn More

📖 **[Complete PR Review Documentation](docs/COPILOT-PR-REVIEW.md)**

The comprehensive guide covers:
- Prerequisites and setup
- Multi-repository architecture and setup
- Configuration options
- How to update validation rules
- Troubleshooting common issues
- Example review outputs

📖 **[Setup Guide for Backend/Frontend Repos](docs/COPILOT-PR-REVIEW-SETUP.md#part-4-setup-for-backendfrontend-repositories)**

Step-by-step instructions for enabling PR reviews in Backend or Frontend repositories:
- Copy the template workflow (~15 lines)
- Configure organization name and repository type
- Test and verify the setup

---

## 🎯 Key Files

### The Constitution (MOST IMPORTANT)
**File:** [`.specify/memory/constitution.md`](.specify/memory/constitution.md)

The **NON-NEGOTIABLE** authority for all development decisions. **Always consult it first** before making any architectural or implementation decisions.

**Core Principles:**
- TypeScript 5 with strict mode (no implicit `any` types)
- Test-first development (80% coverage for critical paths)
- Jest and React Testing Library (mandatory)
- Serverless architecture (AWS Lambda + Next.js)
- Security first (OWASP compliance, secrets management)

### Agent Guidance
**File:** [`AGENTS.md`](AGENTS.md)

Provides quick reference for AI assistants including:
- Repository type identification
- Technology stack overview
- Feature branch conventions (`###-feature-name`)
- SpecKit workflow commands
- Critical gotchas and best practices

### Infrastructure as Code Best Practices
**File:** [`docs/INFRASTRUCTURE-AS-CODE-BEST-PRACTICES.md`](docs/INFRASTRUCTURE-AS-CODE-BEST-PRACTICES.md)

**⚠️ CRITICAL for AWS backend work** - Comprehensive guide on:
- **Always prefer YAML configuration** in `template.yaml` over manual AWS Console operations
- When manual AWS Console steps are acceptable (SES verification, third-party DNS)
- How to migrate console configurations to template.yaml
- Environment-specific configuration with SAM parameters
- Common mistakes to avoid (manual IAM roles, Lambda env vars, Cognito settings)

### Onboarding Guide
**File:** [`ONBOARDING.md`](ONBOARDING.md)

Comprehensive guide for new developers covering:
- Complete setup instructions
- Project structure explanation
- Development workflow
- Common tasks and commands
- Troubleshooting tips

---

## 🛠️ Technology Stack

The actual application codebase (in the backend and frontend repositories) uses:

- **Frontend:** Next.js 16 with App Router, TypeScript 5 (strict mode), React Testing Library
- **Backend:** AWS Lambda, AWS SAM, DynamoDB (single-table design)
- **Runtime:** Node.js 20.x LTS
- **Testing:** Jest, React Testing Library
- **Deployment:** AWS SAM, serverless architecture

---

## 📋 Development Standards

### Feature Branch Convention
All feature branches **MUST** follow this pattern:
```
###-feature-name
```

**Examples:**
- `001-user-auth`
- `002-inventory-dashboard`
- `003-item-search`

### NON-NEGOTIABLE Principles
1. **TypeScript 5 with strict mode** - No implicit `any` types allowed
2. **Test-first development** - 80% coverage required for critical paths
3. **Jest and React Testing Library** - Mandatory testing frameworks

---

## 🆘 Getting Help

1. **Start with the Constitution:** [`.specify/memory/constitution.md`](.specify/memory/constitution.md)
2. **Review Agent Guidance:** [`AGENTS.md`](AGENTS.md)
3. **Follow the Onboarding Guide:** [`ONBOARDING.md`](ONBOARDING.md)
4. **Use SpecKit Templates:** `.specify/templates/`
5. **Leverage SpecKit Commands:** Available in `.roo/commands/`, `.cursor/commands/`, and `.github/prompts/`

---

## 📞 Support

For questions or issues:
- ✅ Review the [constitution](.specify/memory/constitution.md) first
- ✅ Check [`AGENTS.md`](AGENTS.md) for quick reference
- ✅ Consult the [onboarding guide](ONBOARDING.md)
- ✅ Explore existing documentation in `.specify/templates/`
- ✅ Use SpecKit commands for AI-assisted guidance

---

## 📄 License

[License information to be added]

---

**Remember:** The [constitution](.specify/memory/constitution.md) is your north star for all development decisions. 🧭