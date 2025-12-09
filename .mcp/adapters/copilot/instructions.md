# ATL-Inventory Context for GitHub Copilot

## Context7 MCP Integration

This file references canonical context sources for consistency.

---

## 🎯 Context Protocol

@workspace Before suggesting any code, follow this protocol:

### Step 1: Load Critical Context

**Constitution** (MANDATORY):
- Location: `inventory-management-context/prompts/constitution.md`
- Contains: NON-NEGOTIABLE architecture, testing, and standards
- Question: "What does the constitution require?"

**Agent Guidance** (MANDATORY):
- Location: `inventory-management-context/AGENTS.md`
- Contains: Patterns, gotchas, conventions
- Question: "What are the gotchas for this feature?"

### Step 2: Load Feature Context

**Data Model** (for database work):
- Location: `inventory-management-backend/src/types/entities.ts`
- Use: KeyBuilder, QueryPatterns, entity definitions
- Rule: ALWAYS use KeyBuilder (never manual keys)

**API Patterns** (for handlers):
- Location: `inventory-management-backend/src/lib/response.ts`
- Use: Response helpers, error formatting
- Rule: Use standardized responses

**Logging** (for all code):
- Location: `inventory-management-backend/src/lib/logger.ts`
- Use: Structured CloudWatch logging
- Rule: No console.log, use logger

---

## 📚 Canonical Sources Reference

All sources live in `inventory-management-context/`:

```
inventory-management-context/
├── prompts/
│   └── constitution.md          ← CRITICAL: Always reference
├── AGENTS.md                     ← HIGH: Patterns & gotchas  
├── ONBOARDING.md                 ← Setup & workflow
└── specs/
    └── 001-family-inventory-mvp/ ← Feature specs
```

Backend patterns in `inventory-management-backend/src/lib/`:
- `response.ts` - API response patterns
- `logger.ts` - Logging patterns
- `dynamodb.ts` - DB client config
- `types/entities.ts` - Data model

---

## ✅ Mandatory Checks

Before suggesting code:

### 1. Constitution Compliance
- [ ] TypeScript strict mode
- [ ] No implicit `any`
- [ ] Proper error handling
- [ ] Test-first approach
- [ ] 80% coverage plan

### 2. Pattern Following
- [ ] Using KeyBuilder from entities.ts
- [ ] Using response helpers from response.ts
- [ ] Using structured logger
- [ ] Following existing conventions

### 3. Testing Strategy
- [ ] Unit tests with mocks planned
- [ ] Integration tests for DB planned
- [ ] Coverage target identified

---

## 🚨 Critical Rules

### DynamoDB Code
```typescript
// ✅ CORRECT: Use KeyBuilder
import { KeyBuilder } from '../types/entities.js';
const keys = KeyBuilder.family(familyId);

// ❌ WRONG: Manual key construction
const keys = { PK: `FAMILY#${familyId}`, SK: `FAMILY#${familyId}` };
```

### API Responses
```typescript
// ✅ CORRECT: Use response helpers
import { successResponse, errorResponse } from '../lib/response.js';
return successResponse(data);

// ❌ WRONG: Manual response
return { statusCode: 200, body: JSON.stringify(data) };
```

### Logging
```typescript
// ✅ CORRECT: Structured logging
import { logger } from '../lib/logger.js';
logger.info('Operation completed', { itemId, userId });

// ❌ WRONG: Console logging
console.log('Operation completed');
```

### Imports (Node.js 24.x ES Modules)
```typescript
// ✅ CORRECT: .js extension required
import { logger } from '../lib/logger.js';

// ❌ WRONG: Missing extension
import { logger } from '../lib/logger';
```

---

## 🧪 Testing Patterns

### Unit Tests (ALWAYS Mock)
```typescript
import { mockClient } from 'aws-sdk-client-mock';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';

const ddbMock = mockClient(DynamoDBDocumentClient);
beforeEach(() => ddbMock.reset());
```

### Integration Tests (DynamoDB Local)
```typescript
const client = new DynamoDBClient({
  endpoint: 'http://localhost:8000',
  region: 'us-east-1',
});
```

---

## 📋 Implementation Workflow

1. **Understand**: Review constitution requirements
2. **Check**: Look for AGENTS.md gotchas
3. **Pattern**: Identify existing patterns to follow
4. **Data**: Review entities.ts if database involved
5. **Test**: Plan testing strategy (mock vs real DB)
6. **Implement**: Follow patterns, use helpers
7. **Verify**: Check against constitution, AGENTS.md

---

## 🎯 Quick Reference

| Task | Reference | Pattern |
|------|-----------|---------|
| DynamoDB keys | `entities.ts` | `KeyBuilder.family()` |
| Queries | `entities.ts` | `QueryPatterns.listMembers()` |
| API responses | `response.ts` | `successResponse()` |
| Error handling | `response.ts` | `handleError()` |
| Logging | `logger.ts` | `logger.info()` |
| Testing | Constitution | Mock (unit), Real DB (integration) |

---

## 💬 Context Questions

When uncertain, ask these questions:

1. "What does the constitution say about [architecture/testing/standards]?"
2. "Are there AGENTS.md gotchas for [database/API/testing]?"
3. "What pattern exists in [response.ts/entities.ts/logger.ts]?"
4. "How should this be tested according to the constitution?"

---

**Context7 Version**: 1.0.0  
**Canonical Sources**: `inventory-management-context/`  
**Always Up-to-Date**: References live files directly

