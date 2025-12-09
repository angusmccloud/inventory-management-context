# GitHub Copilot PR Review - Detailed Setup Guide

> **Quick Links**: [Main Documentation](COPILOT-PR-REVIEW.md) | [Architecture](../.specify/memory/pr-review-architecture.md) | [Workflow File](../.github/workflows/pr-review.yml)

This guide provides detailed, step-by-step instructions for setting up GitHub Copilot PR Review in your repository, including enabling the feature and configuring it as a required status check.

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Part 1: Enable GitHub Copilot Code Review](#part-1-enable-github-copilot-code-review)
3. [Part 2: Add Required Status Check](#part-2-add-required-status-check)
4. [Part 3: Verify Configuration](#part-3-verify-configuration)
5. [Troubleshooting](#troubleshooting)
6. [Updating the Workflow](#updating-the-workflow)
7. [Next Steps](#next-steps)

---

## Prerequisites

Before you begin, ensure you have:

### Required Access

- **Repository Admin Access**: You must be a repository administrator or have appropriate permissions to:
  - Modify repository settings
  - Configure branch protection rules
  - Enable GitHub features

### Required Subscriptions

- **GitHub Copilot Business** or **GitHub Copilot Enterprise** subscription
  - GitHub Copilot Individual does **NOT** include code review capabilities
  - Your organization must have Copilot enabled
  - You must be assigned a Copilot seat

> **Note**: If you're unsure about your Copilot subscription level, contact your GitHub organization administrator.

### Repository Requirements

- Repository must have GitHub Actions enabled
- Workflow file must be present at [`.github/workflows/pr-review.yml`](../.github/workflows/pr-review.yml)
- Constitution and rule files must exist (see [File Reference](COPILOT-PR-REVIEW.md#file-reference))

---

## Part 1: Enable GitHub Copilot Code Review

This section guides you through enabling GitHub Copilot's code review feature in your repository settings.

### Step 1: Navigate to Repository Settings

1. **Open your repository** on GitHub.com
2. Click the **Settings** tab in the top navigation bar
   - If you don't see the Settings tab, you may not have admin access to the repository

![Navigate to Settings](screenshots/01-navigate-to-settings.png)

**Expected Outcome**: You should now be on the repository settings page with a sidebar menu on the left.

---

### Step 2: Access Copilot Settings

1. In the left sidebar, scroll down to find the **Code, planning, and automation** section
2. Click on **Copilot** (or **GitHub Copilot** depending on your GitHub version)

![Access Copilot Settings](screenshots/02-copilot-settings-menu.png)

> **Note**: If you don't see a Copilot option in the sidebar, your organization may not have Copilot Business/Enterprise enabled. Contact your organization administrator.

**Expected Outcome**: You should see the Copilot configuration page for your repository.

---

### Step 3: Enable Code Review Feature

1. On the Copilot settings page, locate the **Code Review** section
2. Find the toggle or checkbox labeled **"Enable Copilot code review"**
3. Click to **enable** the feature (toggle should turn blue/green)

![Enable Code Review](screenshots/03-enable-code-review.png)

> **Important**: This feature may be labeled differently depending on your GitHub version:
> - "Enable Copilot code review"
> - "Copilot PR reviews"
> - "Automated code review"

**Expected Outcome**: The toggle should be in the "enabled" state, and you may see additional configuration options appear.

---

### Step 4: Configure Custom Instructions (Optional but Recommended)

Our repository includes a custom configuration file that tells Copilot how to review code according to our project standards.

1. In the Copilot settings, look for **"Custom instructions"** or **"Review configuration"**
2. You should see a reference to [`.github/copilot-review-config.yml`](../.github/copilot-review-config.yml)
3. Verify the configuration file path is correct

![Configure Custom Instructions](screenshots/04-custom-instructions.png)

> **Note**: GitHub automatically detects the `.github/copilot-review-config.yml` file in your repository. You typically don't need to manually specify the path.

**What This Does**: The custom configuration file tells Copilot to:
- Review TypeScript and TSX files
- Validate against our project constitution
- Apply severity-based blocking rules
- Post inline comments and summaries

**Expected Outcome**: The configuration file should be recognized and active.

---

### Step 5: Configure Review Scope (Optional)

1. If available, configure which file types Copilot should review:
   - **Include patterns**: `**/*.ts`, `**/*.tsx` (TypeScript files)
   - **Exclude patterns**: `**/node_modules/**`, `**/dist/**`, `**/*.test.ts`

2. Set review triggers:
   - ✅ Pull request opened
   - ✅ Pull request synchronized (new commits)
   - ✅ Pull request reopened

![Configure Review Scope](screenshots/05-review-scope.png)

> **Note**: These settings may be controlled by the [`.github/copilot-review-config.yml`](../.github/copilot-review-config.yml) file instead of the UI.

**Expected Outcome**: Copilot will only review relevant code files and ignore build artifacts.

---

### Step 6: Save Configuration

1. Scroll to the bottom of the Copilot settings page
2. Click **"Save"** or **"Update settings"** button
3. Wait for the confirmation message

![Save Configuration](screenshots/06-save-configuration.png)

**Expected Outcome**: You should see a success message like "Copilot code review has been enabled for this repository."

---

### Step 7: Verify Copilot is Active

1. Navigate to the **Actions** tab in your repository
2. Look for the **"PR Review"** workflow
3. Check that it's enabled (not disabled)

![Verify Workflow Active](screenshots/07-verify-workflow.png)

**Expected Outcome**: The PR Review workflow should be listed and enabled.

---

## Part 2: Add Required Status Check

This section configures branch protection to require Copilot's review before merging pull requests.

### Step 1: Navigate to Branch Protection Rules

1. From repository **Settings**, click **Branches** in the left sidebar
2. Scroll to the **Branch protection rules** section
3. You'll see a list of existing rules (if any)

![Navigate to Branches](screenshots/08-navigate-to-branches.png)

**Expected Outcome**: You should see the branch protection rules configuration page.

---

### Step 2: Add or Edit Protection Rule

Choose one of the following based on your situation:

#### Option A: Create New Rule

1. Click **"Add branch protection rule"** button
2. In the **Branch name pattern** field, enter:
   - `main` (for main branch only)
   - `develop` (for develop branch only)
   - `main|develop` (for both branches)
   - `**/*` (for all branches - not recommended)

![Add New Rule](screenshots/09-add-new-rule.png)

#### Option B: Edit Existing Rule

1. Find the existing rule for your target branch (e.g., `main`)
2. Click **"Edit"** button next to the rule

![Edit Existing Rule](screenshots/10-edit-existing-rule.png)

**Expected Outcome**: You should now be on the branch protection rule configuration page.

---

### Step 3: Enable Status Check Requirement

1. Scroll down to find **"Require status checks to pass before merging"**
2. Check the box to enable this requirement
3. Additional options will appear

![Enable Status Checks](screenshots/11-enable-status-checks.png)

**Expected Outcome**: The status check configuration section should expand with additional options.

---

### Step 4: Configure Status Check Strictness (Recommended)

1. Check **"Require branches to be up to date before merging"**
   - This ensures the PR is tested against the latest code
   - Prevents merge conflicts and integration issues

![Configure Strictness](screenshots/12-configure-strictness.png)

> **Recommendation**: Enable this option for critical branches like `main` and `develop`.

**Expected Outcome**: PRs will need to be rebased or merged with the latest changes before merging.

---

### Step 5: Search for Copilot PR Review Status Check

1. In the **"Search for status checks in the last week for this repository"** field, type:
   - `Copilot PR Review`
   - `copilot`
   - `PR Review`

2. Wait for the search results to appear

![Search Status Checks](screenshots/13-search-status-checks.png)

> **Important**: The status check will only appear in search results after it has run at least once. If you don't see it:
> - Create a test PR first to trigger the workflow
> - Wait for the workflow to complete
> - Return to this step and search again

**Expected Outcome**: You should see "Copilot PR Review" in the search results.

---

### Step 6: Add the Status Check

1. Click on **"Copilot PR Review"** from the search results
2. It should be added to the list of required status checks
3. Verify it appears in the **"Status checks that are required"** section

![Add Status Check](screenshots/14-add-status-check.png)

**Expected Outcome**: "Copilot PR Review" should now be listed as a required status check.

---

### Step 7: Configure Additional Protection Rules (Recommended)

While configuring branch protection, consider enabling these additional safeguards:

#### Recommended Settings for `main` Branch:

- ✅ **Require a pull request before merging**
  - ✅ Require approvals: 1 (or more for critical projects)
  - ✅ Dismiss stale pull request approvals when new commits are pushed
  
- ✅ **Require status checks to pass before merging**
  - ✅ Require branches to be up to date before merging
  - ✅ Status checks: "Copilot PR Review"
  
- ✅ **Require conversation resolution before merging**
  - Ensures all review comments are addressed
  
- ✅ **Do not allow bypassing the above settings**
  - Applies rules to administrators too

![Additional Protection Rules](screenshots/15-additional-rules.png)

> **Note**: These settings ensure code quality and prevent accidental merges of problematic code.

**Expected Outcome**: Your branch is protected with multiple quality gates.

---

### Step 8: Save Branch Protection Rule

1. Scroll to the bottom of the page
2. Click **"Create"** (for new rules) or **"Save changes"** (for existing rules)
3. Wait for the confirmation message

![Save Protection Rule](screenshots/16-save-protection-rule.png)

**Expected Outcome**: You should see a success message and the rule should appear in the branch protection rules list.

---

## Part 3: Verify Configuration

### Step 1: Create a Test Pull Request

1. Create a new branch:
   ```bash
   git checkout -b test/copilot-review-setup
   ```

2. Make a small change (e.g., add a comment to a TypeScript file):
   ```typescript
   // Test comment for Copilot review
   ```

3. Commit and push:
   ```bash
   git add .
   git commit -m "test: verify Copilot PR review setup"
   git push origin test/copilot-review-setup
   ```

4. Create a pull request targeting `main` or `develop`

**Expected Outcome**: A new PR should be created.

---

### Step 2: Monitor Workflow Execution

1. Navigate to the **Actions** tab
2. Find the **"PR Review"** workflow run
3. Click on it to view details
4. Watch the workflow steps execute:
   - ✅ Checkout code
   - ✅ Aggregate review rules
   - ✅ Post review guidelines (or run Copilot review when available)

![Monitor Workflow](screenshots/17-monitor-workflow.png)

**Expected Outcome**: The workflow should complete successfully (green checkmark).

---

### Step 3: Check PR Status Checks

1. Return to your pull request
2. Scroll to the bottom to the **merge section**
3. Verify you see:
   - **"Copilot PR Review"** status check
   - Status should be either ✅ passing or ❌ failing (depending on code quality)

![Check PR Status](screenshots/18-check-pr-status.png)

**Expected Outcome**: The status check should be present and reporting a status.

---

### Step 4: Verify Merge Blocking (If Applicable)

If the Copilot review found critical issues:

1. The **"Merge pull request"** button should be **disabled** or show a warning
2. You should see a message like:
   - "Required status check 'Copilot PR Review' has not passed"
   - "1 failing check"

![Verify Blocking](screenshots/19-verify-blocking.png)

**Expected Outcome**: PRs with critical violations cannot be merged until fixed.

---

### Step 5: Review Posted Comments

1. Check the **"Files changed"** tab
2. Look for inline comments from Copilot (when action is available)
3. Check the **"Conversation"** tab for the summary comment

![Review Comments](screenshots/20-review-comments.png)

**Current Behavior**: Since the Copilot action is not yet available, you'll see manual review guidelines instead of automated comments.

**Expected Outcome**: You should see review feedback posted to the PR.

---

## Troubleshooting

### Issue: Copilot Settings Not Visible

**Symptoms**: No "Copilot" option in repository settings sidebar

**Possible Causes**:
- Organization doesn't have Copilot Business/Enterprise
- You're not assigned a Copilot seat
- Feature not enabled for your organization

**Solutions**:
1. Verify your organization's Copilot subscription:
   - Go to your organization settings
   - Check **Billing & plans** → **Plans and usage**
   - Confirm Copilot Business/Enterprise is active

2. Check your Copilot seat assignment:
   - Organization settings → **Copilot** → **Access**
   - Verify you're in the list of assigned users

3. Contact your GitHub organization administrator

---

### Issue: Status Check Not Appearing in Search

**Symptoms**: Cannot find "Copilot PR Review" when searching for status checks

**Possible Causes**:
- Workflow hasn't run yet
- Workflow failed to complete
- Status check name mismatch

**Solutions**:
1. **Create a test PR first**:
   ```bash
   git checkout -b test/trigger-workflow
   echo "# Test" >> README.md
   git add README.md
   git commit -m "test: trigger workflow"
   git push origin test/trigger-workflow
   ```

2. **Wait for workflow to complete**:
   - Go to Actions tab
   - Wait for "PR Review" workflow to finish
   - Check for green checkmark

3. **Return to branch protection settings**:
   - Search for status checks again
   - The check should now appear

4. **Verify status check name**:
   - Check [`.github/workflows/pr-review.yml`](../.github/workflows/pr-review.yml) line 5
   - Ensure the name matches what you're searching for

---

### Issue: Workflow Not Triggering

**Symptoms**: PR created but workflow doesn't run

**Possible Causes**:
- GitHub Actions disabled
- Workflow file missing or invalid
- PR targets wrong branch

**Solutions**:
1. **Verify Actions are enabled**:
   - Settings → Actions → General
   - Ensure "Allow all actions and reusable workflows" is selected

2. **Check workflow file exists**:
   ```bash
   ls -la .github/workflows/pr-review.yml
   ```

3. **Verify PR target branch**:
   - Workflow only triggers for PRs targeting `main` or `develop`
   - Check your PR's base branch

4. **Check workflow permissions**:
   - Settings → Actions → General → Workflow permissions
   - Select "Read and write permissions"
   - Check "Allow GitHub Actions to create and approve pull requests"

---

### Issue: Rule Aggregation Fails

**Symptoms**: Workflow fails at "Aggregate review rules" step

**Possible Causes**:
- Missing rule source files
- Script not executable
- File permission issues

**Solutions**:
1. **Verify all rule files exist**:
   ```bash
   ls -la .specify/memory/constitution.md
   ls -la AGENTS.md
   ls -la .github/agents/copilot-instructions.md
   ls -la .specify/memory/agent-shared-context.md
   ```

2. **Make script executable**:
   ```bash
   chmod +x .github/scripts/aggregate-rules.sh
   git add .github/scripts/aggregate-rules.sh
   git commit -m "fix: make aggregation script executable"
   git push
   ```

3. **Check workflow logs**:
   - Actions tab → Failed workflow run
   - Click on "Aggregate review rules" step
   - Review error messages

---

### Issue: No Review Comments Posted

**Symptoms**: Workflow completes but no comments appear on PR

**Current Expected Behavior**: 
- The `github/copilot-code-review-action@v1` is **not yet publicly available**
- The workflow posts **manual review guidelines** as a fallback
- This is normal and expected

**When Action Becomes Available**:
1. You'll see automated inline comments
2. Detailed review summaries
3. Specific code suggestions

**Verify Fallback is Working**:
1. Check the PR conversation tab
2. Look for a comment with review guidelines
3. Verify it references the constitution version

---

### Issue: Merge Not Blocked Despite Failures

**Symptoms**: Can merge PR even though Copilot review failed

**Possible Causes**:
- Status check not properly configured as required
- Branch protection rule not applied to correct branch
- Administrator bypass enabled

**Solutions**:
1. **Verify status check is required**:
   - Settings → Branches → Branch protection rules
   - Edit the rule for your target branch
   - Confirm "Copilot PR Review" is in the required checks list

2. **Check branch pattern**:
   - Ensure the protection rule pattern matches your branch
   - `main` only protects main branch
   - Use `main|develop` for both

3. **Disable administrator bypass**:
   - In branch protection rule settings
   - Uncheck "Allow administrators to bypass these settings"

---

## Updating the Workflow

### Current Status: Fallback Mode

The workflow is currently in **fallback mode** because the official `github/copilot-code-review-action@v1` is not yet publicly available.

**Current Behavior**:
- ✅ Workflow runs on every PR
- ✅ Aggregates project rules
- ✅ Posts manual review guidelines
- ❌ No automated inline comments (yet)
- ❌ No automated code analysis (yet)

---

### When Copilot Action Becomes Available

GitHub is developing a native Copilot code review action. When it's released:

#### Step 1: Enable the Action

1. Open [`.github/workflows/pr-review.yml`](../.github/workflows/pr-review.yml)

2. Find line 35 (approximately):
   ```yaml
   env:
     COPILOT_ACTION_ENABLED: 'false'  # Current setting
   ```

3. Change to:
   ```yaml
   env:
     COPILOT_ACTION_ENABLED: 'true'  # Enable Copilot action
   ```

4. Commit and push:
   ```bash
   git add .github/workflows/pr-review.yml
   git commit -m "feat: enable Copilot code review action"
   git push
   ```

---

#### Step 2: Verify Action Availability

Before enabling, verify the action is available:

1. Check GitHub's official documentation
2. Look for announcements about `github/copilot-code-review-action@v1`
3. Test in a non-production repository first

---

#### Step 3: Test the Updated Workflow

1. Create a test PR
2. Verify the workflow uses the Copilot action (not fallback)
3. Check for automated inline comments
4. Confirm status check still works

---

### Benefits of Native Action

When enabled, you'll get:

- ✅ **Fully automated reviews**: No manual intervention needed
- ✅ **Inline code comments**: Specific suggestions on problematic lines
- ✅ **Faster execution**: Optimized for performance
- ✅ **Better integration**: Native GitHub UI support
- ✅ **Advanced analysis**: More sophisticated code understanding

---

### Migration Checklist

When migrating to the native action:

- [ ] Verify action is publicly available
- [ ] Test in a development repository first
- [ ] Update `COPILOT_ACTION_ENABLED` to `'true'`
- [ ] Create a test PR to verify functionality
- [ ] Monitor first few PRs for issues
- [ ] Update team documentation
- [ ] Announce change to development team

---

## Next Steps

### Immediate Actions

1. **Test the Setup**:
   - Create a test PR with intentional violations
   - Verify the workflow runs and posts feedback
   - Confirm merge blocking works as expected

2. **Review Configuration**:
   - Check [`.github/copilot-review-config.yml`](../.github/copilot-review-config.yml)
   - Verify file patterns match your project structure
   - Adjust severity mappings if needed

3. **Update Team Documentation**:
   - Inform team about the new review process
   - Share this setup guide
   - Explain how to interpret review feedback

---

### Ongoing Maintenance

1. **Monitor Workflow Performance**:
   - Check Actions tab regularly
   - Review workflow execution times
   - Watch for failures or errors

2. **Update Rules as Needed**:
   - Keep [`.specify/memory/constitution.md`](../.specify/memory/constitution.md) current
   - Increment version numbers when making changes
   - Document changes in revision history

3. **Gather Team Feedback**:
   - Ask developers about review quality
   - Identify false positives or missed issues
   - Adjust rules based on feedback

---

### Advanced Configuration

For advanced users, consider:

1. **Custom Severity Thresholds**:
   - Edit [`.github/copilot-review-config.yml`](../.github/copilot-review-config.yml)
   - Define which severities block merge
   - Create file-specific rules

2. **Multiple Branch Patterns**:
   - Create separate protection rules for different branches
   - Apply stricter rules to `main`
   - Relax rules for feature branches

3. **Integration with Other Tools**:
   - Combine with other status checks (tests, linting)
   - Set up CODEOWNERS for additional review
   - Configure auto-merge for approved PRs

---

## Additional Resources

### Documentation

- **Main PR Review Documentation**: [COPILOT-PR-REVIEW.md](COPILOT-PR-REVIEW.md)
- **Architecture Documentation**: [.specify/memory/pr-review-architecture.md](../.specify/memory/pr-review-architecture.md)
- **Project Constitution**: [.specify/memory/constitution.md](../.specify/memory/constitution.md)

### GitHub Resources

- [GitHub Copilot Documentation](https://docs.github.com/en/copilot)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Branch Protection Rules](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches/about-protected-branches)
- [Status Checks](https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/collaborating-on-repositories-with-code-quality-features/about-status-checks)

### Support

For issues or questions:

1. Check the [Troubleshooting](#troubleshooting) section above
2. Review the [main documentation](COPILOT-PR-REVIEW.md#troubleshooting)
3. Check workflow logs in the Actions tab
4. Verify all configuration files are present and valid

---

## Screenshot Placeholders

This guide references the following screenshots that should be added:

1. `screenshots/01-navigate-to-settings.png` - Repository settings tab
2. `screenshots/02-copilot-settings-menu.png` - Copilot in sidebar menu
3. `screenshots/03-enable-code-review.png` - Enable code review toggle
4. `screenshots/04-custom-instructions.png` - Custom instructions configuration
5. `screenshots/05-review-scope.png` - File patterns and triggers
6. `screenshots/06-save-configuration.png` - Save button
7. `screenshots/07-verify-workflow.png` - Actions tab showing workflow
8. `screenshots/08-navigate-to-branches.png` - Branches settings page
9. `screenshots/09-add-new-rule.png` - Add branch protection rule
10. `screenshots/10-edit-existing-rule.png` - Edit existing rule
11. `screenshots/11-enable-status-checks.png` - Enable status checks checkbox
12. `screenshots/12-configure-strictness.png` - Require up-to-date branches
13. `screenshots/13-search-status-checks.png` - Search for status checks
14. `screenshots/14-add-status-check.png` - Add Copilot PR Review check
15. `screenshots/15-additional-rules.png` - Additional protection settings
16. `screenshots/16-save-protection-rule.png` - Save protection rule
17. `screenshots/17-monitor-workflow.png` - Workflow execution in Actions
18. `screenshots/18-check-pr-status.png` - PR status checks section
19. `screenshots/19-verify-blocking.png` - Merge blocked message
20. `screenshots/20-review-comments.png` - Review comments on PR

---

*Last Updated: 2025-12-09*  
*For: GitHub Copilot PR Review System*  
*Related: [COPILOT-PR-REVIEW.md](COPILOT-PR-REVIEW.md)*