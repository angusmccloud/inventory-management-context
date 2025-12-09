# GitHub Copilot PR Review - Detailed Setup Guide

> **Quick Links**: [Main Documentation](COPILOT-PR-REVIEW.md) | [Architecture](../docs/architecture/copilot-code-review-centralized-rules.md)

This guide provides detailed, step-by-step instructions for setting up GitHub Copilot PR Review using the automatic sync approach.

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Part 1: Setup Context Repository](#part-1-setup-context-repository)
3. [Part 2: Enable Copilot in Application Repositories](#part-2-enable-copilot-in-application-repositories)
4. [Part 3: Verify Configuration](#part-3-verify-configuration)
5. [Troubleshooting](#troubleshooting)
6. [Updating the System](#updating-the-system)
7. [Next Steps](#next-steps)

---

## Prerequisites

Before you begin, ensure you have:

### Required Access

- **Repository Admin Access**: You must be a repository administrator or have appropriate permissions to:
  - Modify repository settings
  - Create repository secrets
  - Enable GitHub features

### Required Subscriptions

- **GitHub Copilot Business** or **GitHub Copilot Enterprise** subscription
  - GitHub Copilot Individual does **NOT** include code review capabilities
  - Your organization must have Copilot enabled
  - You must be assigned a Copilot seat

> **Note**: If you're unsure about your Copilot subscription level, contact your GitHub organization administrator.

### Repository Requirements

- Context repository must have GitHub Actions enabled
- Sync workflow file must be present at [`.github/workflows/sync-copilot-instructions.yml`](../.github/workflows/sync-copilot-instructions.yml)
- Generation script must be present at [`.github/scripts/generate-copilot-instructions.sh`](../.github/scripts/generate-copilot-instructions.sh)
- Constitution and rule files must exist (see [File Reference](COPILOT-PR-REVIEW.md#file-reference))

---

## Part 1: Setup Context Repository

This section guides you through setting up the Context repository to sync instructions to application repositories.

### Step 1: Create Personal Access Token (PAT)

1. **Navigate to GitHub Settings**
   - Click your profile picture → **Settings**
   - Scroll down to **Developer settings** → **Personal access tokens** → **Tokens (classic)**

2. **Generate New Token**
   - Click **Generate new token (classic)**
   - Name: `Copilot Instructions Sync`
   - Expiration: Choose appropriate duration (90 days recommended)

3. **Select Scopes**
   - ✅ `repo` - Full control of private repositories
   - (This grants access to push files to target repositories)

4. **Generate and Copy Token**
   - Click **Generate token**
   - **IMPORTANT**: Copy the token immediately - you won't see it again!

**Expected Outcome**: You should have a PAT that starts with `ghp_`

---

### Step 2: Add Secret to Context Repository

1. **Navigate to Context Repository Settings**
   - Go to the `inventory-management-context` repository
   - Click **Settings** tab

2. **Access Secrets**
   - In left sidebar: **Secrets and variables** → **Actions**

3. **Add New Secret**
   - Click **New repository secret**
   - Name: `CROSS_REPO_TOKEN`
   - Value: Paste the PAT you created in Step 1
   - Click **Add secret**

**Expected Outcome**: The secret should appear in the list of repository secrets.

---

### Step 3: Configure Target Repositories

1. **Edit Sync Workflow**
   - Open [`.github/workflows/sync-copilot-instructions.yml`](../.github/workflows/sync-copilot-instructions.yml)

2. **Update TARGET_REPOS**
   - Find the `TARGET_REPOS` environment variable (around line 26)
   - Add or remove repository names as needed:
   
   ```yaml
   env:
     TARGET_REPOS: 'inventory-management-frontend inventory-management-backend'
   ```

3. **Commit Changes**
   ```bash
   git add .github/workflows/sync-copilot-instructions.yml
   git commit -m "chore: configure target repos for sync"
   git push
   ```

**Expected Outcome**: The workflow is configured to sync to your application repositories.

---

### Step 4: Test the Sync Workflow

1. **Navigate to Actions Tab**
   - Go to the Context repository
   - Click **Actions** tab

2. **Run Workflow Manually**
   - Find "Sync Copilot Instructions" workflow
   - Click **Run workflow**
   - Select branch: `main`
   - Target repos: `all` (or specify specific repos)
   - Dry run: `false`
   - Click **Run workflow**

3. **Monitor Execution**
   - Click on the running workflow
   - Watch the steps execute:
     - ✅ Checkout context repository
     - ✅ Generate aggregated Copilot instructions
     - ✅ Sync to application repositories

**Expected Outcome**: The workflow should complete successfully (green checkmark).

---

### Step 5: Verify Files Were Synced

1. **Check Application Repository**
   - Navigate to one of your application repositories (e.g., `inventory-management-frontend`)
   - Look for `.github/copilot-instructions.md`

2. **Verify File Contents**
   - The file should contain aggregated rules
   - Check the header for version and generation timestamp
   - Verify it includes constitution principles

**Expected Outcome**: The `.github/copilot-instructions.md` file exists and contains comprehensive instructions.

---

## Part 2: Enable Copilot in Application Repositories

This section guides you through enabling GitHub Copilot code review in each application repository.

### Step 1: Navigate to Repository Settings

1. **Open Application Repository** (e.g., `inventory-management-frontend`)
2. Click the **Settings** tab
   - If you don't see the Settings tab, you may not have admin access

**Expected Outcome**: You should be on the repository settings page.

---

### Step 2: Access Copilot Settings

1. In the left sidebar, scroll to **Code, planning, and automation** section
2. Click on **Copilot** (or **GitHub Copilot**)

> **Note**: If you don't see a Copilot option, your organization may not have Copilot Business/Enterprise enabled.

**Expected Outcome**: You should see the Copilot configuration page.

---

### Step 3: Enable Code Review Feature

1. Locate the **Code Review** section
2. Find the toggle labeled **"Enable Copilot code review"**
3. Click to **enable** the feature (toggle should turn blue/green)

**Expected Outcome**: The toggle should be in the "enabled" state.

---

### Step 4: Verify Custom Instructions

1. GitHub should automatically detect `.github/copilot-instructions.md`
2. Verify the configuration shows the instructions file is recognized

> **Note**: GitHub automatically detects the `.github/copilot-instructions.md` file. You don't need to manually specify the path.

**Expected Outcome**: The configuration should show that custom instructions are active.

---

### Step 5: Save Configuration

1. Scroll to the bottom of the page
2. Click **Save** or **Update settings** button
3. Wait for confirmation message

**Expected Outcome**: You should see a success message like "Copilot code review has been enabled for this repository."

---

### Step 6: Repeat for Other Repositories

Repeat Steps 1-5 for each application repository:
- `inventory-management-backend`
- Any other repositories in your project

---

## Part 3: Verify Configuration

### Step 1: Create a Test Pull Request

1. **Create a test branch** in an application repository:
   ```bash
   git checkout -b test/copilot-review-setup
   ```

2. **Make a small change** (e.g., add a comment to a TypeScript file):
   ```typescript
   // Test comment for Copilot review
   ```

3. **Commit and push**:
   ```bash
   git add .
   git commit -m "test: verify Copilot PR review setup"
   git push origin test/copilot-review-setup
   ```

4. **Create a pull request** targeting `main` or `develop`

**Expected Outcome**: A new PR should be created.

---

### Step 2: Wait for Copilot Review

1. **Navigate to the PR**
2. **Wait for Copilot** to analyze the code (usually takes 1-2 minutes)
3. **Check for review comments**:
   - Look in the **Files changed** tab for inline comments
   - Check the **Conversation** tab for summary comments

**Expected Outcome**: Copilot should post review comments based on the synced instructions.

---

### Step 3: Verify Instructions Are Being Used

1. **Check review comments** for references to:
   - Constitution principles
   - TypeScript strict mode requirements
   - Testing requirements
   - AWS best practices

2. **Verify severity labels** are used:
   - 🔴 CRITICAL
   - 🟠 HIGH
   - 🟡 MEDIUM
   - 🟢 LOW

**Expected Outcome**: Review comments should reflect the rules from the Context repository.

---

## Troubleshooting

### Issue: CROSS_REPO_TOKEN Secret Not Working

**Symptoms**: Sync workflow fails with authentication errors

**Solutions**:
1. Verify the PAT has not expired
2. Check that the PAT has `repo` scope
3. Ensure the PAT is from an account with write access to target repositories
4. Regenerate the PAT if needed and update the secret

---

### Issue: Sync Workflow Doesn't Trigger

**Symptoms**: Changes to constitution don't trigger the sync workflow

**Solutions**:
1. Verify changes were pushed to `main` branch
2. Check that changed files match the `paths` trigger in the workflow
3. Manually trigger the workflow via workflow dispatch
4. Review Actions tab for any error messages

---

### Issue: Instructions File Not Created

**Symptoms**: `.github/copilot-instructions.md` doesn't exist in application repository

**Solutions**:
1. Check sync workflow logs for errors
2. Verify target repository name is correct in `TARGET_REPOS`
3. Ensure the PAT has write access to the repository
4. Manually trigger the sync workflow

---

### Issue: Copilot Not Reviewing PRs

**Symptoms**: No review comments appear on PRs

**Solutions**:
1. Verify Copilot code review is enabled in repository settings
2. Check that `.github/copilot-instructions.md` exists
3. Ensure you have Copilot Business/Enterprise (not Individual)
4. Try creating a new PR to trigger a fresh review
5. Check repository has Copilot seats available

---

### Issue: Reviews Don't Reflect Updated Rules

**Symptoms**: Copilot reviews use old rules after updating constitution

**Solutions**:
1. Verify the sync workflow ran successfully after the update
2. Check the timestamp in `.github/copilot-instructions.md` in the app repo
3. Manually trigger the sync workflow
4. Create a new PR to get a fresh review

---

## Updating the System

### When to Update

Update the system when:
- Constitution principles change
- New coding standards are added
- Technology stack is updated
- New repositories are added to the project

### How to Update Rules

1. **Edit source files** in Context repository:
   - [`.specify/memory/constitution.md`](../.specify/memory/constitution.md)
   - [`AGENTS.md`](../AGENTS.md)
   - [`.specify/memory/agent-shared-context.md`](../.specify/memory/agent-shared-context.md)

2. **Commit and push** to `main` branch

3. **Sync triggers automatically** - no manual action needed

4. **Verify sync** in Actions tab

### How to Add New Repositories

1. **Edit sync workflow**:
   - Open [`.github/workflows/sync-copilot-instructions.yml`](../.github/workflows/sync-copilot-instructions.yml)
   - Add repository name to `TARGET_REPOS`

2. **Commit and push**

3. **Manually trigger sync** to create initial file

4. **Enable Copilot** in the new repository (see Part 2)

---

## Next Steps

### Immediate Actions

1. **Test the Setup**:
   - Create test PRs with intentional violations
   - Verify Copilot catches the issues
   - Confirm severity labels are correct

2. **Review Configuration**:
   - Check that all target repositories are configured
   - Verify PAT expiration date
   - Ensure all team members have Copilot access

3. **Update Team Documentation**:
   - Inform team about the new review process
   - Share this setup guide
   - Explain how to interpret review feedback

---

### Ongoing Maintenance

1. **Monitor Sync Workflow**:
   - Check Actions tab regularly
   - Review workflow execution times
   - Watch for failures or errors

2. **Update Rules as Needed**:
   - Keep constitution current
   - Increment version numbers when making changes
   - Document changes in revision history

3. **Rotate PAT Regularly**:
   - Set calendar reminder before PAT expires
   - Generate new PAT and update secret
   - Test sync after rotation

---

## Additional Resources

### Documentation

- **Main PR Review Documentation**: [COPILOT-PR-REVIEW.md](COPILOT-PR-REVIEW.md)
- **Architecture Documentation**: [copilot-code-review-centralized-rules.md](architecture/copilot-code-review-centralized-rules.md)
- **Project Constitution**: [.specify/memory/constitution.md](../.specify/memory/constitution.md)

### GitHub Resources

- [GitHub Copilot Documentation](https://docs.github.com/en/copilot)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Personal Access Tokens](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/creating-a-personal-access-token)

### Support

For issues or questions:

1. Check the [Troubleshooting](#troubleshooting) section above
2. Review the [main documentation](COPILOT-PR-REVIEW.md#troubleshooting)
3. Check workflow logs in the Actions tab
4. Verify all configuration files are present and valid

---

*Last Updated: 2025-12-09*  
*For: GitHub Copilot PR Review System*  
*Related: [COPILOT-PR-REVIEW.md](COPILOT-PR-REVIEW.md)*