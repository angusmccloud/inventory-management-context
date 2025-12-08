# Inventory Management System - Onboarding Guide

Welcome to the Inventory Management System! This guide will help you get started with the project and understand its structure, workflow, and development practices.

## 📋 Project Overview

The Inventory Management System is a modern, serverless application built with Next.js 16, TypeScript 5, and AWS services. The project uses a **multi-repository structure** organized through a VSCode workspace to separate concerns:

- **Context Repository** (📋 inventory-management-context) - SpecKit workflow tools, templates, and project constitution
- **Backend Repository** (🔧 inventory-management-backend) - AWS Lambda functions and serverless backend services
- **Frontend Repository** (🎨 inventory-management-frontend) - Next.js 16 App Router frontend application

This separation allows for clear boundaries between configuration/tooling, backend services, and frontend code while maintaining a unified development experience through the VSCode workspace.

## ✅ Prerequisites

Before you begin, ensure you have the following installed:

### Required Software
- **Node.js 24.x LTS** - [Download here](https://nodejs.org/)
- **Git** - [Download here](https://git-scm.com/)
- **Visual Studio Code** - [Download here](https://code.visualstudio.com/)
- **AWS CLI** (for deployment) - [Installation guide](https://aws.amazon.com/cli/)
- **AWS SAM CLI** (for local testing) - [Installation guide](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/install-sam-cli.html)
- **Colima** (macOS) or **Docker Engine** (Linux) - Docker runtime for SAM local testing
  - **Note**: Docker Desktop is NOT supported in this environment
  - macOS: `brew install colima` ([Colima docs](https://github.com/abiosoft/colima))
  - Linux: Use Docker Engine via package manager

## 🖥️ Platform-Specific Setup

### macOS

1. **Install Homebrew** (if not already installed):
   ```bash
   /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
   ```

2. **Install Node.js 20.x**:
   ```bash
   brew install node@20
   ```

3. **Install AWS CLI**:
   ```bash
   brew install awscli
   ```

4. **Install AWS SAM CLI**:
   ```bash
   brew install aws-sam-cli
   ```

### Windows (WSL2)

1. **Install WSL2** (run in PowerShell as Administrator):
   ```powershell
   wsl --install -d Ubuntu
   ```

2. **Install Node.js via nvm** (recommended for WSL):
   ```bash
   curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
   source ~/.bashrc
   nvm install 20
   nvm use 20
   ```

3. **Install AWS CLI**:
   ```bash
   sudo apt-get update
   sudo apt-get install awscli -y
   ```

4. **Install AWS SAM CLI**:
   ```bash
   # Follow AWS documentation for Linux installation
   # https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/install-sam-cli.html
   ```

### Linux

1. **Install Node.js via nvm**:
   ```bash
   curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
   source ~/.bashrc
   nvm install 20
   nvm use 20
   ```

2. **Install AWS CLI**:
   ```bash
   sudo apt-get update
   sudo apt-get install awscli -y
   # Or use pip: pip install awscli
   ```

3. **Install AWS SAM CLI**:
   ```bash
   # Follow AWS documentation for Linux installation
   ```

### Git Configuration (All Platforms)

Configure Git to handle line endings properly:

```bash
# For Mac/Linux/WSL (recommended)
git config --global core.autocrlf input

# Verify the setting
git config --global core.autocrlf
```

### Making Scripts Executable

After cloning the repository, make all bash scripts executable:

```bash
# From repository root
chmod +x .specify/scripts/bash/*.sh
```

**WSL Users**: If scripts fail with "bad interpreter" errors, convert line endings:
```bash
# Install dos2unix if needed
sudo apt-get install dos2unix

# Convert all scripts
find .specify/scripts/bash -name "*.sh" -exec dos2unix {} \;
```

### Recommended VSCode Extensions
Install these extensions for the best development experience:
- **GitHub Copilot** (`github.copilot`) - AI-powered code completion
- **GitHub Copilot Chat** (`github.copilot-chat`) - AI chat assistant
- **Roo Cline** (`roocode.roo-cline`) - AI-assisted development with SpecKit support

## 🚀 Repository Setup

### Step 1: Create Project Directory

Create a parent directory to hold all three repositories:

```bash
mkdir ATL-Inventory
cd ATL-Inventory
```

### Step 2: Clone All Repositories

Clone each repository into the parent directory:

```bash
# Clone the context repository (SpecKit, templates, constitution)
git clone <context-repo-url> inventory-management-context

# Clone the backend repository
git clone <backend-repo-url> inventory-management-backend

# Clone the frontend repository
git clone <frontend-repo-url> inventory-management-frontend
```

Your directory structure should now look like this:

```
ATL-Inventory/
├── inventory-management-context/
├── inventory-management-backend/
└── inventory-management-frontend/
```

### Step 3: Create the Workspace File

Create a file named `ATL-Inventory.code-workspace` in the `ATL-Inventory` directory with the following content:

```json
{
  "folders": [
    {
      "path": "inventory-management-context",
      "name": "📋 Context (Shared Config)"
    },
    {
      "path": "inventory-management-backend",
      "name": "🔧 Backend"
    },
    {
      "path": "inventory-management-frontend", 
      "name": "🎨 Frontend"
    }
  ],
  "settings": {
    "files.exclude": {
      "**/node_modules": true
    },
    "github.copilot.advanced": {
      "inlineSuggestCount": 3
    }
  },
  "extensions": {
    "recommendations": [
      "github.copilot",
      "github.copilot-chat",
      "roocode.roo-cline"
    ]
  }
}
```

### Step 4: Install Dependencies

Install dependencies for each repository:

```bash
# Install context repository dependencies (if any)
cd inventory-management-context
npm install
cd ..

# Install backend dependencies
cd inventory-management-backend
npm install
cd ..

# Install frontend dependencies
cd inventory-management-frontend
npm install
cd ..
```

## 🖥️ Opening the Workspace

1. Open Visual Studio Code
2. Go to **File → Open Workspace from File...**
3. Navigate to the `ATL-Inventory` directory
4. Select `ATL-Inventory.code-workspace`
5. Click **Open**

VSCode will now show all three repositories in the sidebar with their designated names and emojis:
- 📋 Context (Shared Config)
- 🔧 Backend
- 🎨 Frontend

## 📁 Understanding the Project Structure

### 📋 Context Repository (inventory-management-context)

**Purpose**: This is a **SpecKit context repository** containing commands, templates, and scripts for AI-assisted development. **It is NOT the application codebase itself.**

**Key Contents**:
- [`.specify/memory/constitution.md`](.specify/memory/constitution.md) - **NON-NEGOTIABLE** project constitution (authoritative source for all development decisions)
- [`AGENTS.md`](AGENTS.md) - Guidance for AI assistants working with the codebase
- `.roo/commands/` - SpecKit commands for Roo Code
- `.cursor/commands/` - SpecKit commands for Cursor
- `.github/prompts/` and `.github/agents/` - SpecKit commands for GitHub Copilot
- `.specify/templates/` - Templates for specifications, plans, tasks, and checklists
- `.specify/scripts/bash/` - Automation scripts

### 🔧 Backend Repository (inventory-management-backend)

**Purpose**: Contains all backend services, AWS Lambda functions, and infrastructure definitions.

**Key Technologies**:
- AWS Lambda (serverless functions)
- AWS SAM (infrastructure as code)
- DynamoDB (single-table design)
- AWS SDK v3 (modular imports)

### 🎨 Frontend Repository (inventory-management-frontend)

**Purpose**: Contains the Next.js 16 frontend application with App Router.

**Key Technologies**:
- Next.js 16 with App Router
- TypeScript 5 (strict mode)
- React Testing Library
- Jest for testing

## 📚 Key Files to Know

### The Constitution (MOST IMPORTANT)

**File**: [`.specify/memory/constitution.md`](.specify/memory/constitution.md)

This is the **NON-NEGOTIABLE** authority for all development decisions. **Always consult it first** before making any architectural or implementation decisions.

**Key Principles**:
1. **TypeScript 5 with strict mode** - No implicit `any` types allowed
2. **Test-first development** - 80% coverage required for critical paths
3. **Jest and React Testing Library** - Mandatory testing frameworks
4. **Serverless architecture** - AWS Lambda + Next.js serverless principles
5. **Security first** - OWASP compliance, secrets management, input validation
6. **Performance optimization** - Caching strategies, cold start optimization

### Agent Guidance

**File**: [`AGENTS.md`](AGENTS.md)

Provides guidance to AI assistants (GitHub Copilot, Roo Code, Cursor) when working with the codebase. Includes:
- Repository type identification
- Technology stack overview
- Feature branch conventions
- SpecKit workflow commands
- Critical gotchas and best practices

### SpecKit Templates

Located in `.specify/templates/`:
- `spec-template.md` - Feature specification template
- `plan-template.md` - Implementation plan template
- `tasks-template.md` - Task breakdown template
- `checklist-template.md` - Quality checklist template

## 🔄 Development Workflow

### Feature Branch Naming Convention

All feature branches **MUST** follow this pattern:

```
###-feature-name
```

**Examples**:
- `001-user-auth`
- `002-inventory-dashboard`
- `003-item-search`

### SpecKit Workflow Overview

SpecKit provides AI-assisted development commands available in multiple tools:

1. **`speckit.constitution`** - Create/update project constitution
2. **`speckit.specify`** - Create feature specification
3. **`speckit.clarify`** - Resolve specification ambiguities
4. **`speckit.plan`** - Generate implementation plan
5. **`speckit.tasks`** - Generate task breakdown
6. **`speckit.checklist`** - Generate quality checklists
7. **`speckit.analyze`** - Cross-artifact consistency analysis
8. **`speckit.implement`** - Execute implementation tasks
9. **`speckit.taskstoissues`** - Convert tasks to GitHub issues

### Test-First Development (MANDATORY)

The project follows **test-first development** for all business-critical functionality:

1. **Write tests first** - Define expected behavior through tests
2. **Ensure tests fail** - Verify tests catch the missing functionality
3. **Implement code** - Write minimal code to make tests pass
4. **Refactor** - Improve code while keeping tests green
5. **Verify coverage** - Ensure 80% coverage for critical paths

### Quality Gates

Before any PR can be merged:
- ✅ TypeScript compilation succeeds with no errors
- ✅ All tests pass
- ✅ Code coverage meets requirements (80% for critical paths)
- ✅ Linting passes with no errors
- ✅ Security audit shows no high-severity vulnerabilities
- ✅ At least one code review approval

## 🛠️ Common Development Tasks

### Running the Frontend Locally

```bash
cd inventory-management-frontend
npm run dev
```

### Running the Backend Locally

**Prerequisites**: Start Colima first (if using Colima for Docker):
```bash
colima start
```

Then run the local API:
```bash
cd inventory-management-backend
npm run build        # Compile TypeScript to dist/
npm run sam:build    # Package for SAM
npm run sam:local    # Start local API Gateway at http://localhost:3001
```

Test the health endpoint:
```bash
curl http://localhost:3001/health
```

### Running Backend Tests

```bash
cd inventory-management-backend
npm test
```

### Running Frontend Tests

```bash
cd inventory-management-frontend
npm test
```

### Building for Production

```bash
# Frontend
cd inventory-management-frontend
npm run build

# Backend (SAM build)
cd inventory-management-backend
sam build
```

### Deploying to AWS

```bash
cd inventory-management-backend
sam deploy --guided
```

## 🔄 Agent Context Sync

When adding shared context that should apply to all AI agents:

1. **Edit the shared source**: `.specify/memory/agent-shared-context.md`
2. **Run the sync script**: `.specify/scripts/bash/sync-agent-contexts.sh`

This ensures Cursor, Roo Code, and GitHub Copilot all receive the same guidelines.

**Quick Reference**: See `.specify/AGENT-SYNC-QUICK-REFERENCE.md`
**Full Documentation**: See `.specify/docs/agent-context-sync.md`

## 🆘 Getting Help

### Documentation Resources

1. **Constitution** - [`.specify/memory/constitution.md`](.specify/memory/constitution.md) - Start here for all architectural decisions
2. **AGENTS.md** - [`AGENTS.md`](AGENTS.md) - AI assistant guidance and quick reference
3. **Templates** - `.specify/templates/` - Use these for consistent documentation
4. **SpecKit Commands** - Available in `.roo/commands/`, `.cursor/commands/`, and `.github/prompts/`

### Using SpecKit Commands

**In Roo Code**:
- Type `/` to see available commands
- Select the desired SpecKit command
- Follow the prompts

**In Cursor**:
- Use `Cmd+K` (Mac) or `Ctrl+K` (Windows/Linux)
- Type the command name (e.g., `speckit.specify`)
- Follow the prompts

**In GitHub Copilot Chat**:
- Use `@workspace` to reference workspace context
- Reference prompts from `.github/prompts/`

### Critical Gotchas

1. **Feature Context**: Set `SPECIFY_FEATURE` environment variable when not using git for feature context
2. **Checklist Purpose**: Checklists validate **requirements**, NOT implementation
3. **Task Format**: Use format `- [ ] [TaskID] [P?] [Story?] Description with file path`
4. **No Implicit Any**: TypeScript strict mode is NON-NEGOTIABLE - all types must be explicit
5. **Test First**: Write tests before implementation for all critical functionality
6. **ES Module Imports**: Node.js 24.x requires `.js` extensions in all relative imports:
   ```typescript
   // ❌ Wrong
   import { logger } from './lib/logger';
   
   // ✅ Correct
   import { logger } from './lib/logger.js';
   ```
7. **Colima Docker Socket**: If using Colima, SAM CLI needs `DOCKER_HOST`:
   ```bash
   export DOCKER_HOST=unix://$HOME/.colima/default/docker.sock
   ```
8. **Lambda ES Modules**: The `dist/package.json` file with `"type": "module"` is REQUIRED for Lambda Node.js 24.x runtime

### Common Issues & Solutions

**Problem**: SAM local fails with "Docker not found"
- **Solution**: Set `DOCKER_HOST` environment variable (see gotcha #7)

**Problem**: Lambda fails with "Cannot use import statement"
- **Solution**: Ensure `dist/package.json` contains `"type": "module"` (see gotcha #8)

**Problem**: Import errors with missing modules
- **Solution**: Add `.js` extensions to all relative imports (see gotcha #6)

**Problem**: Docker credential errors (`docker-credential-desktop`)
- **Solution**: Remove `"credsStore"` field from `~/.docker/config.json`

For detailed troubleshooting, see the backend README's Troubleshooting section.

## 🎯 Next Steps

1. ✅ Read the [constitution](.specify/memory/constitution.md) thoroughly
2. ✅ Review [`AGENTS.md`](AGENTS.md) for development guidelines
3. ✅ Explore the SpecKit templates in `.specify/templates/`
4. ✅ Set up your development environment and run the applications locally
5. ✅ Create your first feature branch following the `###-feature-name` convention
6. ✅ Use SpecKit commands to create a specification for your first feature

## 📞 Support

For questions or issues:
- Review the constitution and AGENTS.md first
- Check existing documentation in `.specify/templates/`
- Consult with team members
- Use SpecKit commands for AI-assisted guidance

---

**Welcome aboard!** 🚀 Remember: The [constitution](.specify/memory/constitution.md) is your north star for all development decisions.