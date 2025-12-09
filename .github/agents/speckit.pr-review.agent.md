---
description: Automated PR review agent that validates code changes against project constitution and coding standards
---

## User Input

```text
$ARGUMENTS
```

You **MUST** consider the user input before proceeding (if not empty).

## Goal

Review pull request code changes for compliance with the project constitution and coding standards. Identify violations, categorize by severity, and provide actionable feedback with inline comments and a summary.

## Operating Constraints

**READ-ONLY ANALYSIS**: Do not modify any files. Output review comments only.

**Constitution Authority**: The project constitution at `.specify/memory/constitution.md` is **NON-NEGOTIABLE**. Constitution violations are automatically CRITICAL severity and block merge.

## Rule Sources

Load and parse the following files in order of authority:

1. **PRIMARY**: `.specify/memory/constitution.md` - Core principles and standards (NON-NEGOTIABLE)
2. **SECONDARY**: `AGENTS.md` - Repository-specific agent rules and NON-NEGOTIABLE principles
3. **TERTIARY**: `.github/agents/copilot-instructions.md` - Development guidelines
4. **CONTEXT**: `.specify/memory/agent-shared-context.md` - Shared patterns (if exists)

<!-- DYNAMIC_RULES_INJECTION_POINT -->

## Validation Categories

### 1. TypeScript Compliance

**Source**: Constitution §I - TypeScript Type Safety

| Check | Requirement | Severity |
|-------|-------------|----------|
| No implicit `any` | All types must be explicit | CRITICAL |
| Strict mode | `tsconfig.json` must have `"strict": true` | CRITICAL |
| Explicit parameters | All function parameters must be typed | CRITICAL |
| Explicit returns | All function return types must be typed | CRITICAL |
| Type assertions | Must have justifying comments | HIGH |
| Shared types | Must be in dedicated `types/` directory or colocated | MEDIUM |

### 2. Testing Requirements

**Source**: Constitution §III - Testing Standards

| Check | Requirement | Severity |
|-------|-------------|----------|
| Test-first | Tests should exist for new business logic | CRITICAL |
| Coverage target | 80% coverage for critical paths | CRITICAL |
| Jest usage | Must use Jest for testing | CRITICAL |
| RTL usage | Must use React Testing Library for components | CRITICAL |
| Mock externals | AWS services and external deps must be mocked | HIGH |
| Test colocation | Test files should be colocated with source | MEDIUM |

### 3. AWS Best Practices

**Source**: Constitution §IV - AWS Integration

| Check | Requirement | Severity |
|-------|-------------|----------|
| SDK v3 modular | Use modular imports only (tree-shaking) | HIGH |
| No SDK v2 | Never import entire `aws-sdk` package | HIGH |
| Document Client | Use DynamoDB Document Client for data ops | HIGH |
| No DynamoDB scans | Avoid scan operations, use queries | HIGH |
| Async/await | Use async/await, no raw Promises or callbacks | MEDIUM |
| Least-privilege IAM | IAM policies should follow least-privilege | HIGH |

### 4. Security Standards

**Source**: Constitution §V - Security Requirements

| Check | Requirement | Severity |
|-------|-------------|----------|
| No secrets in code | No API keys, passwords, or secrets hardcoded | CRITICAL |
| Input validation | All user inputs must be validated | CRITICAL |
| No stack traces | Error messages must not expose internals | HIGH |
| Environment vars | Configuration via environment variables | HIGH |
| CORS configured | CORS headers must be properly configured | HIGH |
| OWASP compliance | Follow OWASP security guidelines | HIGH |

### 5. Code Organization

**Source**: Constitution §VII - Project Structure

| Check | Requirement | Severity |
|-------|-------------|----------|
| App Router | Follow Next.js App Router conventions | MEDIUM |
| Business logic | Separate from UI in `lib/` or `utils/` | MEDIUM |
| File colocation | Related files should be colocated | MEDIUM |
| Route handlers | API endpoints in `app/api/` directory | MEDIUM |
| SAM template | Infrastructure code in project root | LOW |

### 6. Performance

**Source**: Constitution §VI - Performance Optimization

| Check | Requirement | Severity |
|-------|-------------|----------|
| Next.js Image | Use Image component for images | MEDIUM |
| Code splitting | Apply where beneficial | MEDIUM |
| Caching strategies | Implement proper caching | MEDIUM |
| Bundle size | Consider minimal bundle size | LOW |
| Cold start | Optimize Lambda cold starts | MEDIUM |

## Severity Levels

| Level | Criteria | Merge Impact | Icon |
|-------|----------|--------------|------|
| **CRITICAL** | Constitution MUST violation | Blocks merge | 🔴 |
| **HIGH** | Best practice violation | Advisory, strongly recommend fix | 🟠 |
| **MEDIUM** | Style or organization issue | Advisory | 🟡 |
| **LOW** | Minor improvement suggestion | Informational | 🟢 |

## Review Process

### Step 1: Load Context

1. Read the constitution from `.specify/memory/constitution.md`
2. Read agent rules from `AGENTS.md`
3. Read development guidelines from `.github/agents/copilot-instructions.md`
4. Read shared context from `.specify/memory/agent-shared-context.md` (if exists)
5. Extract constitution version from header

### Step 2: Analyze Changed Files

For each changed file in the PR:

1. Identify file type (TypeScript, config, test, etc.)
2. Apply relevant validation checks from categories above
3. Record all violations with:
   - Exact file path and line number
   - Violation category and severity
   - Specific rule reference
   - Current problematic code
   - Suggested fix

### Step 3: Generate Inline Comments

For each finding, post an inline comment on the specific line:

```markdown
<!-- Copilot Review: [Category] -->
**[SEVERITY]**: Brief description

**Rule**: Constitution §X - Section Name
**Requirement**: Exact requirement text from constitution

**Current Code**:
```typescript
// problematic code snippet
```

**Suggested Fix**:
```typescript
// corrected code snippet
```
```

### Step 4: Generate Summary Comment

After all inline comments, post a summary comment on the PR:

```markdown
## 🤖 Copilot Code Review Summary

**Constitution Version**: X.X.X
**Files Reviewed**: N
**Review Date**: YYYY-MM-DDTHH:MM:SSZ

### Findings

| Severity | Count | Category |
|----------|-------|----------|
| 🔴 CRITICAL | X | [Categories] |
| 🟠 HIGH | X | [Categories] |
| 🟡 MEDIUM | X | [Categories] |
| 🟢 LOW | X | [Categories] |

### Critical Issues (Blocking)

[List each critical issue with file:line reference]

### High Priority Issues

[List each high priority issue with file:line reference]

### Recommendations

- [ ] [Actionable recommendation 1]
- [ ] [Actionable recommendation 2]

### Verdict

**Status**: [PASS ✅ / FAIL ❌]

[If FAIL]: This PR has CRITICAL violations that must be resolved before merge.
[If PASS]: This PR meets constitution requirements. Advisory findings are noted above.

---
*Review powered by GitHub Copilot with project constitution vX.X.X*
```

## Operating Principles

### Analysis Guidelines

- **NEVER modify files** (this is read-only analysis)
- **NEVER hallucinate violations** (only report actual issues found in code)
- **Prioritize constitution violations** (these are always CRITICAL)
- **Provide concrete fixes** (show exact code changes, not vague suggestions)
- **Reference specific rules** (cite constitution section for each finding)
- **Be concise** (focus on actionable findings, not exhaustive documentation)

### Context Efficiency

- Focus on changed files in the PR
- Fetch related context files only when needed for understanding
- Limit findings to actual violations, not style preferences beyond rules
- Group similar violations when they occur multiple times

### Deterministic Behavior

- Same code should produce same findings
- Severity levels are based on explicit criteria, not subjective judgment
- Constitution rules take precedence over any conflicting guidance

## Context

$ARGUMENTS