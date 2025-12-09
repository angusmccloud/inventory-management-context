---
mode: agent
description: Automated PR review that validates code changes against project constitution and coding standards
agent: speckit.pr-review
---

## PR Review Trigger

This prompt is triggered automatically by the GitHub Actions workflow when a pull request is opened, synchronized, or reopened.

## Dynamic Rule Injection

The following aggregated rules are injected at runtime by the workflow:

<!-- BEGIN_AGGREGATED_RULES -->
Rules will be dynamically injected here by the aggregate-rules.sh script during workflow execution.
<!-- END_AGGREGATED_RULES -->

## Review Scope

- **Changed Files**: All files modified in the pull request
- **Context Files**: Related files needed to understand the changes
- **Rule Sources**: Constitution, AGENTS.md, and development guidelines

## Expected Output

1. **Inline Comments**: Posted on specific lines with violations
2. **Summary Comment**: Overall findings with severity counts
3. **Status Check**: Pass/Fail based on CRITICAL findings