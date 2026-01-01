# Quick Start: Theme Toggle Implementation

**Feature**: 012-theme-toggle  
**Audience**: Developers implementing the theme toggle feature  
**Estimated Time**: 2-3 hours for core implementation

## Overview

This guide walks you through implementing the theme toggle feature, allowing users to switch between light, dark, and auto (system preference) themes.

## Prerequisites

- ✅ Node.js 24.x installed
- ✅ Access to frontend repository (`inventory-management-frontend`)
- ✅ Access to backend repository (`inventory-management-backend`)
- ✅ AWS credentials configured (for backend deployment)
- ✅ Familiarity with Next.js App Router, React Context, TypeScript

## Implementation Phases

### Phase 1: Frontend - Type Definitions (5 min)

Create type definitions for theme system.

**File**: `inventory-management-frontend/types/theme.ts`

```typescript
/** User's theme preference */
export type ThemeMode = 'light' | 'dark' | 'auto';

/** Actually applied theme (resolved from mode + system preference) */
export type AppliedTheme = 'light' | 'dark';

/** Theme context value */
export interface ThemeContextValue {
  mode: ThemeMode;
  applied: AppliedTheme;
  setMode: (mode: ThemeMode) => void;
}
```

---

### Phase 2: Frontend - localStorage Utilities (10 min)

Create localStorage management for theme persistence.

**File**: `inventory-management-frontend/lib/theme-storage.ts`

```typescript
import type { ThemeMode } from '@/types/theme';

const THEME_KEY = 'theme';

export const ThemeStorage = {
  get(): ThemeMode | null {
    if (typeof window === 'undefined') return null;
    const value = localStorage.getItem(THEME_KEY);
    return isValidTheme(value) ? value : null;
  },

  set(theme: ThemeMode): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(THEME_KEY, theme);
  },
};

function isValidTheme(value: unknown): value is ThemeMode {
  return typeof value === 'string' && 
         ['light', 'dark', 'auto'].includes(value);
}
```

---

### Phase 3: Frontend - Enhanced ThemeProvider (30 min)

Update existing ThemeProvider to support persistence and three states.

**File**: `inventory-management-frontend/components/common/ThemeProvider.tsx`

```typescript
'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import type { ThemeMode, AppliedTheme, ThemeContextValue } from '@/types/theme';
import { ThemeStorage } from '@/lib/theme-storage';

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export default function ThemeProvider({ children }: { children: ReactNode }) {
  const [mode, setModeState] = useState<ThemeMode>('auto');
  const [applied, setApplied] = useState<AppliedTheme>('light');

  // Initialize from localStorage
  useEffect(() => {
    const stored = ThemeStorage.get();
    if (stored) {
      setModeState(stored);
    }
  }, []);

  // Apply theme based on mode
  useEffect(() => {
    if (mode === 'light') {
      document.documentElement.classList.remove('dark');
      setApplied('light');
    } else if (mode === 'dark') {
      document.documentElement.classList.add('dark');
      setApplied('dark');
    } else {
      // Auto mode: follow system preference
      const darkModeQuery = window.matchMedia('(prefers-color-scheme: dark)');
      
      const updateTheme = (e: MediaQueryList | MediaQueryListEvent) => {
        if (e.matches) {
          document.documentElement.classList.add('dark');
          setApplied('dark');
        } else {
          document.documentElement.classList.remove('dark');
          setApplied('light');
        }
      };

      // Apply initial
      updateTheme(darkModeQuery);

      // Listen for changes
      darkModeQuery.addEventListener('change', updateTheme);
      return () => darkModeQuery.removeEventListener('change', updateTheme);
    }
  }, [mode]);

  const setMode = (newMode: ThemeMode) => {
    setModeState(newMode);
    ThemeStorage.set(newMode);
    
    // TODO: If user logged in, sync with backend
    // syncWithBackend(newMode);
  };

  return (
    <ThemeContext.Provider value={{ mode, applied, setMode }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
}
```

---

### Phase 4: Frontend - Flash Prevention Script (15 min)

Add inline script to layout to prevent flash of wrong theme.

**File**: `inventory-management-frontend/app/layout.tsx`

Update the existing layout:

```tsx
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  const theme = localStorage.getItem('theme') || 'auto';
                  if (theme === 'dark' || 
                      (theme === 'auto' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                    document.documentElement.classList.add('dark');
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body className="min-h-screen antialiased bg-background text-text-default">
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
```

---

### Phase 5: Frontend - Theme Toggle Component (45 min)

Create the three-state toggle component.

**File**: `inventory-management-frontend/components/common/ThemeToggle.tsx`

```typescript
'use client';

import { useTheme } from './ThemeProvider';
import { Button } from './Button';
import type { ThemeMode } from '@/types/theme';

export default function ThemeToggle() {
  const { mode, setMode } = useTheme();

  const options: Array<{ value: ThemeMode; label: string; icon: string; ariaLabel: string }> = [
    { value: 'light', label: 'Light', icon: '☀️', ariaLabel: 'Light theme' },
    { value: 'dark', label: 'Dark', icon: '🌙', ariaLabel: 'Dark theme' },
    { value: 'auto', label: 'Auto', icon: '⚙️', ariaLabel: 'Auto theme (follow system)' },
  ];

  return (
    <div role="radiogroup" aria-label="Theme selection" className="flex gap-1 p-1 bg-surface-elevated rounded-lg">
      {options.map((option) => (
        <button
          key={option.value}
          role="radio"
          aria-checked={mode === option.value}
          aria-label={option.ariaLabel}
          onClick={() => setMode(option.value)}
          className={`
            px-3 py-2 rounded-md text-sm font-medium transition-colors
            ${mode === option.value 
              ? 'bg-primary text-primary-contrast' 
              : 'text-text-secondary hover:text-text-default hover:bg-surface-hover'}
          `}
        >
          <span className="mr-1" aria-hidden="true">{option.icon}</span>
          {option.label}
        </button>
      ))}
    </div>
  );
}
```

---

### Phase 6: Frontend - Add Toggle to UI (10 min)

Add the theme toggle to the user menu or settings area.

**Example**: Add to dashboard header or user dropdown menu

```tsx
import ThemeToggle from '@/components/common/ThemeToggle';

export default function UserMenu() {
  return (
    <div className="dropdown">
      {/* ... other menu items ... */}
      <div className="px-4 py-2 border-t border-border">
        <ThemeToggle />
      </div>
    </div>
  );
}
```

---

### Phase 7: Backend - Type Definitions (5 min)

Create backend types for theme preference.

**File**: `inventory-management-backend/src/types/preference.ts`

```typescript
export type ThemePreference = 'light' | 'dark' | 'auto';

export interface UpdateThemeRequest {
  theme: ThemePreference;
}

export interface ThemePreferenceResponse {
  data: {
    theme: ThemePreference;
  };
}
```

---

### Phase 8: Backend - Lambda Handler (30 min)

Create Lambda handler for theme preference API.

**File**: `inventory-management-backend/src/handlers/userPreference.ts`

```typescript
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { DynamoDBDocumentClient, GetCommand, UpdateCommand } from '@aws-sdk/lib-dynamodb';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { z } from 'zod';

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

const ThemeSchema = z.enum(['light', 'dark', 'auto']);

export async function getThemePreference(
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> {
  try {
    const userId = event.requestContext.authorizer?.userId;
    
    if (!userId) {
      return {
        statusCode: 401,
        body: JSON.stringify({ error: 'Unauthorized' }),
      };
    }

    const command = new GetCommand({
      TableName: process.env.TABLE_NAME,
      Key: {
        PK: `USER#${userId}`,
        SK: `USER#${userId}`,
      },
      ProjectionExpression: 'themePreference',
    });

    const result = await docClient.send(command);
    const theme = result.Item?.themePreference || 'auto';

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ data: { theme } }),
    };
  } catch (error) {
    console.error('Error getting theme preference:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Internal server error' }),
    };
  }
}

export async function putThemePreference(
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> {
  try {
    const userId = event.requestContext.authorizer?.userId;
    
    if (!userId) {
      return {
        statusCode: 401,
        body: JSON.stringify({ error: 'Unauthorized' }),
      };
    }

    const body = JSON.parse(event.body || '{}');
    const result = ThemeSchema.safeParse(body.theme);

    if (!result.success) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          error: 'ValidationError',
          message: 'Invalid theme value. Must be light, dark, or auto.',
        }),
      };
    }

    const theme = result.data;

    const command = new UpdateCommand({
      TableName: process.env.TABLE_NAME,
      Key: {
        PK: `USER#${userId}`,
        SK: `USER#${userId}`,
      },
      UpdateExpression: 'SET themePreference = :theme, updatedAt = :now',
      ExpressionAttributeValues: {
        ':theme': theme,
        ':now': new Date().toISOString(),
      },
    });

    await docClient.send(command);

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ data: { theme } }),
    };
  } catch (error) {
    console.error('Error updating theme preference:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Internal server error' }),
    };
  }
}
```

---

### Phase 9: Backend - Update SAM Template (15 min)

Add API endpoints to AWS SAM template.

**File**: `inventory-management-backend/template.yaml`

Add under `Resources`:

```yaml
  # Theme Preference Functions
  GetThemePreferenceFunction:
    Type: AWS::Serverless::Function
    Properties:
      CodeUri: ./
      Handler: dist/handlers/userPreference.getThemePreference
      Events:
        GetTheme:
          Type: Api
          Properties:
            RestApiId: !Ref InventoryApi
            Path: /users/{userId}/preferences/theme
            Method: GET
            Auth:
              Authorizer: CognitoAuthorizer

  PutThemePreferenceFunction:
    Type: AWS::Serverless::Function
    Properties:
      CodeUri: ./
      Handler: dist/handlers/userPreference.putThemePreference
      Events:
        PutTheme:
          Type: Api
          Properties:
            RestApiId: !Ref InventoryApi
            Path: /users/{userId}/preferences/theme
            Method: PUT
            Auth:
              Authorizer: CognitoAuthorizer
```

---

### Phase 10: Frontend - Backend Sync (20 min)

Add API client methods and sync logic.

**File**: `inventory-management-frontend/lib/api-client.ts`

Add methods:

```typescript
export async function getThemePreference(userId: string): Promise<ThemeMode> {
  const response = await apiClient.get<{ data: { theme: ThemeMode } }>(
    `/users/${userId}/preferences/theme`
  );
  return response.data.theme;
}

export async function updateThemePreference(
  userId: string, 
  theme: ThemeMode
): Promise<void> {
  await apiClient.put(`/users/${userId}/preferences/theme`, { theme });
}
```

Update ThemeProvider to sync:

```typescript
// In ThemeProvider component
const setMode = async (newMode: ThemeMode) => {
  setModeState(newMode);
  ThemeStorage.set(newMode);
  
  // Sync with backend if user logged in
  const userContext = getUserContext();
  if (userContext?.userId) {
    try {
      await updateThemePreference(userContext.userId, newMode);
    } catch (error) {
      console.error('Failed to sync theme with backend:', error);
      // Continue - localStorage is already updated
    }
  }
};

// On app initialization (after login)
useEffect(() => {
  const syncThemeOnLogin = async () => {
    const userContext = getUserContext();
    if (!userContext?.userId) return;

    try {
      const backendTheme = await getThemePreference(userContext.userId);
      const localTheme = ThemeStorage.get();
      
      if (backendTheme && backendTheme !== localTheme) {
        // Backend takes precedence
        setModeState(backendTheme);
        ThemeStorage.set(backendTheme);
      }
    } catch (error) {
      console.error('Failed to load theme from backend:', error);
    }
  };

  syncThemeOnLogin();
}, []); // Run once on mount
```

---

## Testing Checklist

### Manual Testing

- [ ] **System Preference Detection**
  - [ ] Open app with OS in light mode → App displays light theme
  - [ ] Change OS to dark mode → App automatically switches to dark theme (if mode is 'auto')

- [ ] **Manual Toggle**
  - [ ] Click Light button → App switches to light theme instantly
  - [ ] Click Dark button → App switches to dark theme instantly
  - [ ] Click Auto button → App follows OS preference

- [ ] **Persistence (localStorage)**
  - [ ] Set theme to Dark → Close browser → Reopen → Dark theme persists
  - [ ] Set theme to Auto → Close browser → Reopen → Auto mode persists

- [ ] **Persistence (Backend - Logged In)**
  - [ ] Login → Set theme to Dark → Logout → Login on different device → Dark theme applied
  - [ ] Change theme while logged in → Check DynamoDB → `themePreference` updated

- [ ] **No Flash on Page Load**
  - [ ] Set theme to Dark → Hard refresh (Cmd/Ctrl + Shift + R) → No flash of light theme

- [ ] **Accessibility**
  - [ ] Tab to theme toggle → Focus visible
  - [ ] Arrow keys navigate between options
  - [ ] Enter/Space activates selected option
  - [ ] Screen reader announces current selection and options

### Automated Testing

Run test suites:

```bash
# Frontend tests
cd inventory-management-frontend
npm test -- --coverage

# Backend tests
cd inventory-management-backend
npm test -- --coverage
```

---

## Deployment

### Frontend Deployment

```bash
cd inventory-management-frontend
npm run build
# Deploy to S3 + CloudFront (per existing deployment process)
```

### Backend Deployment

```bash
cd inventory-management-backend
sam build
sam deploy --guided
```

---

## Troubleshooting

### Issue: Theme flashes on page load

**Solution**: Ensure inline script in `layout.tsx` runs before any content renders. Check that `suppressHydrationWarning` is set on `<html>` tag.

### Issue: Theme doesn't persist

**Solution**: Check localStorage is enabled in browser. Check that `ThemeStorage.set()` is called when theme changes.

### Issue: Backend sync fails

**Solution**: Verify user is authenticated. Check JWT includes `custom:userId` claim. Verify DynamoDB permissions allow UpdateItem on Users table.

### Issue: Toggle not accessible via keyboard

**Solution**: Ensure `role="radiogroup"` and `role="radio"` are set. Verify arrow key navigation is implemented.

---

## Performance Metrics

Expected performance after implementation:

- **Initial load (theme detection)**: <1ms
- **Theme toggle (visual change)**: <200ms
- **localStorage write**: <1ms
- **Backend API call**: <50ms (async, doesn't block UI)
- **System preference listener**: <1ms (event-driven)

---

## Next Steps

After completing implementation:

1. ✅ Run all tests (manual + automated)
2. ✅ Verify accessibility with screen reader
3. ✅ Deploy to staging environment
4. ✅ QA testing
5. ✅ Deploy to production
6. ✅ Monitor CloudWatch logs for errors
7. ✅ Gather user feedback

---

## Support

- **Documentation**: See [spec.md](spec.md), [data-model.md](data-model.md), [research.md](research.md)
- **API Contract**: See [contracts/theme-preference-api.yaml](contracts/theme-preference-api.yaml)
- **Issues**: Report via GitHub Issues in `inventory-management-context` repository
