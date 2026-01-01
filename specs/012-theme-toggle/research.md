# Research: Theme Toggle (Light/Dark Mode)

**Feature**: 012-theme-toggle  
**Date**: January 1, 2026  
**Status**: Complete

## Research Tasks

This document resolves all technical unknowns from the Technical Context section of the implementation plan.

---

## 1. Next.js Theme Implementation with SSR/SSG

**Question**: How to prevent "flash of wrong theme" with Next.js App Router and SSR?

### Decision: Inline Script + Cookie/localStorage Strategy

**Rationale**:
- Next.js App Router renders on server, which doesn't know user's theme preference
- Must inject theme before hydration to prevent flash
- Use inline `<script>` in layout before content renders
- Check localStorage/cookie synchronously before first paint

**Implementation Pattern**:
```tsx
// app/layout.tsx
export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{
          __html: `
            (function() {
              const theme = localStorage.getItem('theme') || 'auto';
              if (theme === 'dark' || 
                  (theme === 'auto' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                document.documentElement.classList.add('dark');
              }
            })();
          `
        }} />
      </head>
      <body className="dark:bg-background">
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
```

**Alternatives Considered**:
- Server-side theme detection via cookies - Rejected because requires server component awareness and complicates caching
- Client-only theme application - Rejected because causes visible flash
- Third-party libraries (next-themes) - Rejected to maintain control and minimize dependencies

---

## 2. Three-State Toggle UI Pattern

**Question**: How to design accessible three-state toggle (Light/Dark/Auto)?

### Decision: Segmented Button Control with Icons

**Rationale**:
- Segmented buttons clearly show three discrete states
- Icons provide visual clarity (sun ☀️ / moon 🌙 / auto ⚙️)
- Single tab stop for keyboard navigation
- Arrow keys to switch between states
- Clear active state indication

**Implementation Pattern**:
```tsx
<div role="radiogroup" aria-label="Theme selection">
  <button 
    role="radio" 
    aria-checked={theme === 'light'}
    aria-label="Light theme"
  >
    ☀️ Light
  </button>
  <button 
    role="radio" 
    aria-checked={theme === 'dark'}
    aria-label="Dark theme"
  >
    🌙 Dark
  </button>
  <button 
    role="radio" 
    aria-checked={theme === 'auto'}
    aria-label="Auto theme (follow system)"
  >
    ⚙️ Auto
  </button>
</div>
```

**Accessibility Requirements**:
- ARIA role="radiogroup" for mutually exclusive options
- ARIA role="radio" with aria-checked for each button
- Keyboard navigation: Tab (focus group), Arrow keys (select option), Enter/Space (activate)
- Screen reader announces current selection and available options

**Alternatives Considered**:
- Dropdown menu - Rejected because requires extra click and hides options
- Single toggle button that cycles - Rejected because unclear which state is next
- Checkbox for dark mode only - Rejected because doesn't support "Auto" state

---

## 3. Theme Persistence Strategy

**Question**: How to persist theme preference for both logged-in and anonymous users?

### Decision: Dual Storage Strategy

**Rationale**:
- Anonymous users: localStorage only (immediate, no backend needed)
- Logged-in users: localStorage + DynamoDB (sync across devices)
- localStorage provides instant application, DynamoDB provides cross-device sync
- On login, sync localStorage with backend preference
- On logout, keep localStorage (don't clear user's preference)

**Implementation Pattern**:

```typescript
// lib/theme-storage.ts
export const ThemeStorage = {
  // Always write to localStorage
  setLocal: (theme: ThemeMode) => {
    localStorage.setItem('theme', theme);
  },
  
  // Always read from localStorage first
  getLocal: (): ThemeMode | null => {
    return localStorage.getItem('theme') as ThemeMode | null;
  },
  
  // Sync with backend for logged-in users
  syncWithBackend: async (userId: string, theme: ThemeMode) => {
    await api.put(`/users/${userId}/preferences/theme`, { theme });
  },
  
  // Load from backend on login
  loadFromBackend: async (userId: string): Promise<ThemeMode | null> => {
    const response = await api.get(`/users/${userId}/preferences/theme`);
    return response.data.theme;
  }
};

// Usage flow:
// 1. On app load: Read localStorage → Apply theme
// 2. On theme change: Write to localStorage → If logged in, sync to backend
// 3. On login: Load from backend → If exists, update localStorage
// 4. On logout: Keep localStorage (preserve user choice)
```

**DynamoDB Schema**:
- Store in existing Users table or new UserPreferences table
- Attribute: `themePreference: 'light' | 'dark' | 'auto'`
- Indexed by userId (or email)
- Size: <100 bytes

**Alternatives Considered**:
- Backend-only storage - Rejected because causes delay on theme application
- localStorage-only storage - Rejected because doesn't sync across devices for logged-in users
- Cookie-based storage - Rejected because adds overhead to every request and complicates SSR

---

## 4. System Preference Detection Best Practices

**Question**: How to reliably detect and listen to system theme changes?

### Decision: `prefers-color-scheme` Media Query with Event Listener

**Rationale**:
- Standard CSS media query supported in all modern browsers
- JavaScript API allows both detection and listening
- Cleanup required to prevent memory leaks
- Only listen when theme is set to "auto"

**Implementation Pattern**:

```typescript
// hooks/useTheme.ts
useEffect(() => {
  if (theme !== 'auto') return; // Only listen in auto mode
  
  const darkModeQuery = window.matchMedia('(prefers-color-scheme: dark)');
  
  const handleChange = (e: MediaQueryListEvent) => {
    const newTheme = e.matches ? 'dark' : 'light';
    applyTheme(newTheme);
  };
  
  // Apply initial theme
  applyTheme(darkModeQuery.matches ? 'dark' : 'light');
  
  // Listen for changes (note: addEventListener not supported in older browsers)
  darkModeQuery.addEventListener('change', handleChange);
  
  return () => {
    darkModeQuery.removeEventListener('change', handleChange);
  };
}, [theme]);
```

**Browser Support**:
- Chrome 76+, Firefox 67+, Safari 12.1+, Edge 79+
- Fallback for unsupported browsers: Default to light mode
- Detection: `if (window.matchMedia) { ... } else { /* fallback */ }`

**Alternatives Considered**:
- Polling system theme - Rejected because inefficient and causes unnecessary checks
- Server-side detection - Rejected because not possible (server doesn't know user's OS)
- Third-party libraries - Rejected to minimize dependencies

---

## 5. React State Management for Theme

**Question**: How to manage theme state across entire application efficiently?

### Decision: React Context + Custom Hook

**Rationale**:
- Context provides global state without prop drilling
- Custom hook encapsulates theme logic and provides clean API
- Minimal re-renders (only when theme actually changes)
- No external state management library needed

**Implementation Pattern**:

```typescript
// components/common/ThemeProvider.tsx
type ThemeMode = 'light' | 'dark' | 'auto';
type AppliedTheme = 'light' | 'dark';

interface ThemeContextValue {
  mode: ThemeMode;          // User's selected mode
  applied: AppliedTheme;    // Actually applied theme
  setMode: (mode: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [mode, setModeState] = useState<ThemeMode>('auto');
  const [applied, setApplied] = useState<AppliedTheme>('light');
  
  // ... implementation
  
  return (
    <ThemeContext.Provider value={{ mode, applied, setMode }}>
      {children}
    </ThemeContext.Provider>
  );
}

// hooks/useTheme.ts
export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
}
```

**State Structure**:
- `mode`: User's preference ('light' | 'dark' | 'auto')
- `applied`: Actually applied theme ('light' | 'dark')
- Example: mode='auto' + OS=dark → applied='dark'

**Alternatives Considered**:
- Redux/Zustand - Rejected because overkill for single feature
- Direct DOM manipulation - Rejected because bypasses React and harder to test
- localStorage-only (no React state) - Rejected because components need reactive updates

---

## 6. CSS Variable Strategy for Theme Switching

**Question**: How to implement performant theme switching with existing Tailwind setup?

### Decision: Maintain Existing CSS Variables with Dark Class

**Rationale**:
- Application already uses CSS variables defined in globals.css
- Existing `.dark` class strategy works well
- No changes needed to existing components
- Theme switch is instant (just toggle class)
- Tailwind dark: variant automatically uses .dark class

**Current Implementation** (already in place):
```css
/* globals.css */
:root {
  --color-background: 255 255 255;
  --color-text-default: 1 31 9;
  /* ... other light theme variables */
}

.dark {
  --color-background: 1 31 9;
  --color-text-default: 142 179 152;
  /* ... other dark theme variables */
}
```

**No Changes Required**: Existing theme system is optimal for this feature.

**Alternatives Considered**:
- data-theme attribute - Rejected because .dark class already established
- Complete Tailwind config rewrite - Rejected because current approach works well
- CSS-in-JS - Rejected because adds runtime overhead and complexity

---

## 7. Testing Strategy for Theme Feature

**Question**: How to comprehensively test theme toggle with SSR, persistence, and accessibility?

### Decision: Multi-Layer Testing Approach

**Test Layers**:

1. **Unit Tests** (Jest + React Testing Library):
   - ThemeProvider context value changes
   - useTheme hook behavior
   - localStorage read/write operations
   - System preference detection mocking

2. **Component Tests**:
   - ThemeToggle renders three buttons
   - Clicking buttons changes theme
   - Active state visual indication
   - Keyboard navigation (Tab, Arrow keys, Enter)
   - Screen reader announcements (aria-label)

3. **Integration Tests**:
   - Theme persists across component unmount/remount
   - Theme syncs between localStorage and backend
   - Theme applies before first paint (no flash)
   - Auto mode switches with system preference changes

4. **Accessibility Tests**:
   - axe-core automated checks
   - Keyboard-only navigation test
   - Screen reader compatibility test (manual)

**Key Test Scenarios**:
```typescript
describe('ThemeProvider', () => {
  it('applies system preference when mode is auto', () => {
    // Mock matchMedia to return dark
    // Render provider
    // Assert dark class applied
  });
  
  it('persists theme to localStorage on change', () => {
    // Render provider
    // Change theme
    // Assert localStorage.setItem called
  });
  
  it('syncs with backend for logged-in users', async () => {
    // Mock user logged in
    // Change theme
    // Assert API called
  });
  
  it('prevents flash on page load', () => {
    // Mock localStorage with dark theme
    // Render provider
    // Assert dark class applied immediately
  });
});
```

**Alternatives Considered**:
- E2E tests only - Rejected because slow and doesn't cover all edge cases
- Manual testing only - Rejected because not reproducible and time-consuming
- No accessibility tests - Rejected because violates WCAG 2.1 AA requirement

---

## 8. Backend API Design for Theme Preference

**Question**: How to design minimal, efficient API for theme preference storage?

### Decision: RESTful Endpoint with User Context

**API Contract**:

```yaml
# GET /users/{userId}/preferences/theme
# Response: { data: { theme: 'light' | 'dark' | 'auto' } }

# PUT /users/{userId}/preferences/theme
# Body: { theme: 'light' | 'dark' | 'auto' }
# Response: { data: { theme: 'light' | 'dark' | 'auto' } }
```

**Implementation Details**:
- Extract userId from JWT (custom:userId claim)
- Store in DynamoDB Users table: `themePreference` attribute
- No separate table needed (lightweight preference)
- Validate input: theme must be 'light' | 'dark' | 'auto'
- Return 400 for invalid input
- Return 404 if user not found

**Lambda Handler**:
```typescript
// src/handlers/userPreference.ts
export async function getThemePreference(event: APIGatewayEvent) {
  const userId = extractUserIdFromJWT(event);
  const user = await getUserFromDynamoDB(userId);
  return {
    statusCode: 200,
    body: JSON.stringify({ 
      data: { theme: user.themePreference || 'auto' } 
    })
  };
}

export async function putThemePreference(event: APIGatewayEvent) {
  const userId = extractUserIdFromJWT(event);
  const { theme } = JSON.parse(event.body);
  
  // Validate
  if (!['light', 'dark', 'auto'].includes(theme)) {
    return { statusCode: 400, body: 'Invalid theme value' };
  }
  
  // Update DynamoDB
  await updateUserThemePreference(userId, theme);
  
  return {
    statusCode: 200,
    body: JSON.stringify({ data: { theme } })
  };
}
```

**Alternatives Considered**:
- Separate UserPreferences table - Rejected because single attribute doesn't justify separate table
- GraphQL - Rejected because REST is simpler for single-purpose endpoint
- Batch preferences API - Rejected because out of scope (only theme for now)

---

## Summary of Decisions

| Area | Decision | Key Reason |
|------|----------|------------|
| SSR Flash Prevention | Inline script + localStorage | Synchronous check before first paint |
| Toggle UI | Segmented button (3 states) | Clear, accessible, follows radio group pattern |
| Persistence | localStorage + DynamoDB | Instant local, sync across devices for logged-in users |
| System Detection | prefers-color-scheme media query | Standard, well-supported, event-driven |
| State Management | React Context + custom hook | Simple, no external dependencies |
| CSS Strategy | Existing .dark class + CSS variables | Already implemented, performant |
| Testing | Multi-layer (unit + integration + a11y) | Comprehensive coverage |
| Backend API | RESTful, single endpoint | Minimal, fits existing architecture |

**All technical unknowns resolved. Ready for Phase 1: Design.**
