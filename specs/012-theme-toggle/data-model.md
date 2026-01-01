# Data Model: Theme Toggle (Light/Dark Mode)

**Feature**: 012-theme-toggle  
**Date**: January 1, 2026  
**Status**: Complete

## Overview

This feature introduces minimal data storage requirements:
- **Frontend**: localStorage for immediate theme application
- **Backend**: Single attribute in existing Users table for cross-device sync

## Entities

### 1. Theme Preference (Frontend - localStorage)

**Purpose**: Store user's theme preference locally for instant application and persistence across browser sessions.

**Storage**: Browser localStorage

**Schema**:
```typescript
// Key: 'theme'
// Value: 'light' | 'dark' | 'auto'

interface ThemeStorageValue {
  theme: 'light' | 'dark' | 'auto';
}
```

**Operations**:
- `localStorage.getItem('theme')` - Read on app initialization
- `localStorage.setItem('theme', value)` - Write on theme change
- Never cleared (persists even after logout)

**Size**: <20 bytes

---

### 2. User Theme Preference (Backend - DynamoDB)

**Purpose**: Store logged-in user's theme preference for cross-device synchronization.

**Storage**: DynamoDB - Existing `Users` table

**Entity Type**: `USER#<userId>`

**New Attribute**:
```typescript
{
  PK: 'USER#<userId>',           // Existing
  SK: 'USER#<userId>',           // Existing
  email: string,                 // Existing
  role: string,                  // Existing
  familyId: string,              // Existing
  // ... other existing fields ...
  
  themePreference?: 'light' | 'dark' | 'auto',  // NEW - Optional
}
```

**Attribute Details**:
- **Name**: `themePreference`
- **Type**: String
- **Values**: `'light'` | `'dark'` | `'auto'`
- **Required**: No (defaults to 'auto' if not set)
- **Indexed**: No (only accessed by userId)
- **Size**: <10 bytes

**Rationale for Single Attribute**:
- Lightweight preference doesn't justify separate table
- Already have user lookup by userId
- No need for querying by theme preference
- Follows single-table design pattern

---

### 3. Theme State (Frontend - React Context)

**Purpose**: Manage runtime theme state in React application.

**Storage**: React Context (in-memory)

**Interface**:
```typescript
type ThemeMode = 'light' | 'dark' | 'auto';
type AppliedTheme = 'light' | 'dark';

interface ThemeContextValue {
  mode: ThemeMode;              // User's selected mode
  applied: AppliedTheme;        // Currently applied theme
  setMode: (mode: ThemeMode) => void;
}
```

**State Flow**:
```
User Selection (mode)  →  System Detection  →  Applied Theme
     'light'           →        N/A         →     'light'
     'dark'            →        N/A         →     'dark'
     'auto'            →   OS preference   →  'light' or 'dark'
```

**Examples**:
- User selects "Light" → mode='light', applied='light'
- User selects "Dark" → mode='dark', applied='dark'
- User selects "Auto" + OS is light → mode='auto', applied='light'
- User selects "Auto" + OS is dark → mode='auto', applied='dark'

---

## Data Flow

### Initial Load (Page Load)

```
1. Inline script executes (before React)
   ├─ Check localStorage.getItem('theme')
   ├─ If 'dark' or ('auto' + OS dark) → Add 'dark' class
   └─ Prevents flash of wrong theme

2. React renders
   ├─ ThemeProvider initializes
   ├─ Reads localStorage.getItem('theme')
   ├─ Sets context state
   └─ Components render with correct theme

3. If user logged in
   ├─ Fetch theme from backend
   ├─ If backend value differs from localStorage
   │  └─ Update localStorage with backend value
   └─ Apply backend preference
```

### Theme Change by User

```
1. User clicks theme toggle
   ├─ ThemeToggle calls setMode(newTheme)
   └─ ThemeProvider updates context

2. ThemeProvider effect runs
   ├─ Updates DOM (add/remove 'dark' class)
   ├─ Writes to localStorage.setItem('theme', newTheme)
   └─ If user logged in:
      └─ Call API: PUT /users/{userId}/preferences/theme

3. All components re-render with new theme
```

### System Preference Change (Auto Mode Only)

```
1. OS theme changes (e.g., sunset triggers dark mode)
   └─ If mode === 'auto':
      ├─ matchMedia event fires
      ├─ ThemeProvider updates 'applied' state
      └─ DOM updated (add/remove 'dark' class)

   If mode !== 'auto':
      └─ Event ignored (user preference overrides)
```

### Login Event

```
1. User logs in
   ├─ Auth completes
   └─ App fetches user profile

2. Theme sync check
   ├─ Call API: GET /users/{userId}/preferences/theme
   ├─ Compare backend theme with localStorage theme
   └─ If different:
      ├─ Backend theme takes precedence
      ├─ Update localStorage
      └─ Apply backend theme

3. If backend has no theme preference
   └─ Keep localStorage theme (user may have set before login)
```

### Logout Event

```
1. User logs out
   ├─ Clear auth tokens
   └─ Do NOT clear localStorage theme

2. Theme persists
   └─ User's preference remains for anonymous browsing
```

---

## Validation Rules

### Frontend Validation

```typescript
function isValidTheme(value: unknown): value is ThemeMode {
  return typeof value === 'string' && 
         ['light', 'dark', 'auto'].includes(value);
}

// On localStorage read
const stored = localStorage.getItem('theme');
const theme = isValidTheme(stored) ? stored : 'auto';

// On user input
function setMode(mode: ThemeMode) {
  if (!isValidTheme(mode)) {
    throw new Error(`Invalid theme mode: ${mode}`);
  }
  // ... proceed
}
```

### Backend Validation

```typescript
import { z } from 'zod';

const ThemeSchema = z.enum(['light', 'dark', 'auto']);

export async function putThemePreference(event: APIGatewayEvent) {
  const body = JSON.parse(event.body || '{}');
  
  // Validate with Zod
  const result = ThemeSchema.safeParse(body.theme);
  
  if (!result.success) {
    return {
      statusCode: 400,
      body: JSON.stringify({
        error: 'Invalid theme value',
        details: result.error.format()
      })
    };
  }
  
  // Proceed with validated theme
  const theme = result.data;
  // ...
}
```

---

## DynamoDB Operations

### Get Theme Preference

```typescript
import { DynamoDBDocumentClient, GetCommand } from '@aws-sdk/lib-dynamodb';

async function getThemePreference(userId: string): Promise<ThemeMode> {
  const command = new GetCommand({
    TableName: process.env.TABLE_NAME,
    Key: {
      PK: `USER#${userId}`,
      SK: `USER#${userId}`
    },
    ProjectionExpression: 'themePreference'
  });
  
  const result = await docClient.send(command);
  
  // Default to 'auto' if not set
  return result.Item?.themePreference || 'auto';
}
```

### Update Theme Preference

```typescript
import { DynamoDBDocumentClient, UpdateCommand } from '@aws-sdk/lib-dynamodb';

async function updateThemePreference(
  userId: string, 
  theme: ThemeMode
): Promise<void> {
  const command = new UpdateCommand({
    TableName: process.env.TABLE_NAME,
    Key: {
      PK: `USER#${userId}`,
      SK: `USER#${userId}`
    },
    UpdateExpression: 'SET themePreference = :theme, updatedAt = :now',
    ExpressionAttributeValues: {
      ':theme': theme,
      ':now': new Date().toISOString()
    }
  });
  
  await docClient.send(command);
}
```

**Note**: No need for conditional updates or transactions - theme preference is simple, non-critical data.

---

## Type Definitions

### Frontend Types

```typescript
// types/theme.ts

/** User's theme preference */
export type ThemeMode = 'light' | 'dark' | 'auto';

/** Actually applied theme (resolved from mode + system preference) */
export type AppliedTheme = 'light' | 'dark';

/** Theme context value */
export interface ThemeContextValue {
  /** User's selected theme mode */
  mode: ThemeMode;
  
  /** Currently applied theme */
  applied: AppliedTheme;
  
  /** Update theme mode */
  setMode: (mode: ThemeMode) => void;
}

/** Theme preference API response */
export interface ThemePreferenceResponse {
  data: {
    theme: ThemeMode;
  };
}

/** Theme preference API request */
export interface ThemePreferenceRequest {
  theme: ThemeMode;
}
```

### Backend Types

```typescript
// src/types/preference.ts

/** Theme preference values */
export type ThemePreference = 'light' | 'dark' | 'auto';

/** User entity with theme preference */
export interface UserEntity {
  PK: string;              // USER#<userId>
  SK: string;              // USER#<userId>
  email: string;
  role: 'admin' | 'suggester';
  familyId: string;
  themePreference?: ThemePreference;
  createdAt: string;
  updatedAt: string;
}

/** Theme preference API request body */
export interface UpdateThemeRequest {
  theme: ThemePreference;
}

/** Theme preference API response */
export interface ThemePreferenceResponse {
  data: {
    theme: ThemePreference;
  };
}
```

---

## Data Size Estimates

| Storage Location | Data Size | Justification |
|------------------|-----------|---------------|
| localStorage | <20 bytes | Single string value: "light", "dark", or "auto" |
| DynamoDB attribute | <10 bytes | Single string attribute in existing item |
| React Context | <100 bytes | In-memory state with 2 strings + 1 function ref |
| **Total per user** | **<50 bytes** | Minimal storage footprint |

**At Scale** (10,000 users):
- DynamoDB: <100 KB additional storage
- Cost impact: Negligible (~$0.000025/month)

---

## Migration Strategy

### DynamoDB

**No migration needed**:
- Adding optional attribute to existing Users table
- Existing users without `themePreference` default to 'auto'
- No schema changes or data backfill required

### Frontend

**No migration needed**:
- localStorage is per-browser, no global migration
- Existing users without localStorage theme will default to 'auto'
- First theme change creates localStorage entry

### Rollback Plan

If feature needs to be disabled:
1. Remove ThemeToggle component from UI
2. ThemeProvider continues to work (defaults to 'auto')
3. localStorage persists but is ignored
4. Backend attribute remains (no harm, unused)
5. Full rollback: Remove `themePreference` attribute (optional)

---

## Security Considerations

### Data Sensitivity

**Theme preference is non-sensitive data**:
- ✅ Public information (no privacy concerns)
- ✅ No PII (personally identifiable information)
- ✅ No business-critical data
- ✅ Read-only impact (doesn't affect functionality)

### Access Control

**Frontend (localStorage)**:
- Accessible by any JavaScript on the domain
- No authentication required (per-browser storage)
- Risk: None (public preference)

**Backend (DynamoDB)**:
- Requires authentication (JWT token)
- Users can only read/write their own preference
- IAM policy enforces least privilege

### Input Validation

**Frontend**:
- Validate theme value is 'light' | 'dark' | 'auto'
- Prevent XSS via type checking (not rendering user input)

**Backend**:
- Zod schema validation
- Reject invalid values with 400 error
- No SQL injection risk (DynamoDB NoSQL)

---

## Performance Considerations

### localStorage Read Performance

- **Operation**: Synchronous read
- **Speed**: <1ms
- **Impact**: Runs in inline script before React
- **Optimization**: Single read on page load

### DynamoDB Read Performance

- **Operation**: GetItem (single-item read)
- **Speed**: ~10-20ms (within AWS region)
- **Impact**: Only on login or explicit refresh
- **Optimization**: Cached in localStorage, rarely hits backend

### DynamoDB Write Performance

- **Operation**: UpdateItem (single attribute update)
- **Speed**: ~10-20ms
- **Impact**: Only when user changes theme
- **Optimization**: Debounced (if user toggles rapidly, only last value saved)

### CSS Class Toggle Performance

- **Operation**: DOM classList.add/remove
- **Speed**: <1ms
- **Impact**: Instant visual update
- **Optimization**: CSS variables already defined, no style recalculation

**Expected Performance**:
- Initial load: <1ms for theme application
- Theme toggle: <200ms total (DOM update + localStorage + API if logged in)
- System preference change: <1ms (already listening)

---

## Summary

**Data Model Decisions**:
1. ✅ Minimal storage footprint (<50 bytes per user)
2. ✅ No new tables (uses existing Users table)
3. ✅ No migration required (optional attribute)
4. ✅ Dual persistence (localStorage + DynamoDB)
5. ✅ Type-safe with Zod validation
6. ✅ Non-sensitive data (no security concerns)
7. ✅ Performant (<200ms for all operations)

**Ready for Phase 1: API Contracts**
