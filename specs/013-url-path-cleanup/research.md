# Research: URL Path Cleanup

**Feature**: URL Path Cleanup (013)  
**Date**: 2026-01-01  
**Purpose**: Resolve technical unknowns and establish implementation patterns for URL restructuring

## Research Questions

### 1. Next.js 16 App Router - Directory Restructuring

**Question**: How should route directories be moved from nested `/dashboard/*` to root level while preserving authentication and layouts?

**Decision**: Move route directories to app root, maintain authentication via middleware

**Rationale**:
- Next.js App Router uses file-system based routing where directory structure defines URL paths
- Moving `app/dashboard/inventory` to `app/inventory` changes URL from `/dashboard/inventory` to `/inventory`
- Authentication can be handled via middleware that applies to all routes via matcher patterns
- Layout inheritance allows shared UI without URL nesting

**Alternatives Considered**:
- **Rewrites in next.config.js**: Rejected - adds complexity, doesn't change actual route structure
- **Parallel routes**: Rejected - overcomplicated for simple URL restructure
- **Custom server**: Rejected - violates Next.js best practices and serverless deployment

**Implementation Pattern**:
```typescript
// middleware.ts - Handles auth AND redirects
export function middleware(request: NextRequest) {
  // 1. Redirect old dashboard URLs
  if (request.nextUrl.pathname.startsWith('/dashboard/') && 
      request.nextUrl.pathname !== '/dashboard') {
    const newPath = request.nextUrl.pathname.replace('/dashboard', '');
    return NextResponse.redirect(new URL(newPath, request.url));
  }
  
  // 2. Authentication check
  // ... existing auth logic
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)']
};
```

**References**:
- [Next.js App Router Documentation](https://nextjs.org/docs/app/building-your-application/routing)
- [Next.js Middleware](https://nextjs.org/docs/app/building-your-application/routing/middleware)

---

### 2. Query Parameter Preservation During Redirects

**Question**: How to preserve query parameters and hash fragments when redirecting from old URLs?

**Decision**: Use Next.js URL API to copy search params and hash to new URL

**Rationale**:
- Next.js provides URL API that preserves all URL components
- Simply replacing pathname maintains search params and hash automatically
- Critical for preserving filter states, pagination, and deep links

**Implementation Pattern**:
```typescript
// Middleware redirect with query preservation
const newUrl = new URL(request.url);
newUrl.pathname = newUrl.pathname.replace('/dashboard', '');
return NextResponse.redirect(newUrl); // Preserves ?search=value#hash
```

**Test Cases**:
- `/dashboard/inventory?filter=low-stock` → `/inventory?filter=low-stock`
- `/dashboard/inventory/123#details` → `/inventory/123#details`
- `/dashboard/members?page=2&sort=name` → `/members?page=2&sort=name`

**References**:
- [WHATWG URL Standard](https://url.spec.whatwg.org/)
- [NextResponse.redirect() API](https://nextjs.org/docs/app/api-reference/functions/next-response)

---

### 3. Navigation Component Link Updates

**Question**: What navigation components need link updates and how to find all hardcoded URLs?

**Decision**: Search for `/dashboard/` string literals, update to relative paths

**Rationale**:
- Grep search reveals all hardcoded dashboard URLs in components
- Common components (Navigation, MobileNav, Sidebar, Breadcrumbs) need updates
- Feature components (InventoryList, shopping-list forms) have some dashboard links
- Using relative paths (e.g., `/inventory` instead of `/dashboard/inventory`) is cleaner

**Components Requiring Updates** (from grep search):
1. `components/common/Navigation` - Main navigation menu links
2. `components/common/MobileNav` - Mobile navigation drawer links
3. `components/common/Sidebar` - Desktop sidebar navigation
4. `components/common/Breadcrumbs` - Breadcrumb path generation
5. `components/inventory/InventoryList.tsx` - Suggestion redirection link
6. `components/shopping-list/AddItemForm.tsx` - Settings link
7. `components/shopping-list/EditShoppingListItemForm.tsx` - Settings link
8. `app/page.tsx` - Login redirect to dashboard
9. `app/(auth)/login/page.tsx` - Post-login redirect
10. `app/accept-invitation/page.tsx` - Post-invitation redirect

**Implementation Pattern**:
```typescript
// Before
<Link href="/dashboard/inventory">Inventory</Link>

// After
<Link href="/inventory">Inventory</Link>

// Home dashboard stays the same
<Link href="/dashboard">Home</Link>
```

**Validation Method**:
```bash
# Find all remaining dashboard links
grep -r "dashboard/" --include="*.tsx" --include="*.ts" app/ components/
```

**References**:
- [Next.js Link Component](https://nextjs.org/docs/app/api-reference/components/link)

---

### 4. Testing Strategy for Route Changes

**Question**: How to test route loading, redirects, and navigation without manual verification?

**Decision**: Integration tests using Next.js testing utilities and React Testing Library

**Rationale**:
- Integration tests validate actual routing behavior
- Can test both page rendering at new URLs and middleware redirects
- Tests serve as regression prevention when making URL changes

**Test Categories**:

1. **Route Page Loading**:
```typescript
// Test each new route loads correctly
test('inventory page loads at /inventory', async () => {
  render(<InventoryPage />);
  expect(await screen.findByText('Inventory')).toBeInTheDocument();
});
```

2. **Middleware Redirects**:
```typescript
// Test old URLs redirect to new URLs
test('redirects /dashboard/inventory to /inventory', async () => {
  const response = await fetch('http://localhost:3000/dashboard/inventory');
  expect(response.redirected).toBe(true);
  expect(response.url).toBe('http://localhost:3000/inventory');
});
```

3. **Query Parameter Preservation**:
```typescript
test('preserves query parameters during redirect', async () => {
  const response = await fetch('http://localhost:3000/dashboard/inventory?filter=low-stock');
  expect(response.url).toContain('filter=low-stock');
});
```

4. **Navigation Link Updates**:
```typescript
test('navigation links point to new URLs', () => {
  render(<Navigation />);
  const inventoryLink = screen.getByText('Inventory');
  expect(inventoryLink).toHaveAttribute('href', '/inventory');
});
```

**Test Performance Target**: <100ms for redirects (FR-003)

**References**:
- [Next.js Testing Documentation](https://nextjs.org/docs/testing)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro)

---

### 5. Trailing Slash Handling

**Question**: Should URLs work with and without trailing slashes? How to handle `/dashboard/` vs `/dashboard`?

**Decision**: Next.js handles trailing slashes automatically via `trailingSlash` config

**Rationale**:
- Next.js has built-in trailing slash normalization
- Default behavior: redirects trailing slashes to non-trailing (e.g., `/inventory/` → `/inventory`)
- Consistent with existing app behavior
- No additional middleware logic needed

**Implementation**:
```typescript
// next.config.js - keep default (no trailing slash)
module.exports = {
  // trailingSlash: false (default - remove trailing slashes)
};
```

**Middleware Consideration**:
- Middleware redirect logic should not add trailing slashes
- Let Next.js handle normalization after redirect

**References**:
- [Next.js trailingSlash configuration](https://nextjs.org/docs/app/api-reference/next-config-js/trailingSlash)

---

## Implementation Decisions Summary

| Decision | Choice | Impact |
|----------|--------|--------|
| **Route Restructure** | Move directories from `app/dashboard/*` to `app/*` | Changes file-system routing, cleaner URLs |
| **Redirect Method** | Middleware with URL pathname replacement | <10ms overhead, preserves query params |
| **Link Updates** | String replacement in components | ~10 components, straightforward refactor |
| **Testing Approach** | Integration tests with RTL | Validates routing, redirects, navigation |
| **Trailing Slash** | Default Next.js behavior (remove trailing slashes) | Consistent with existing app |
| **Authentication** | Middleware matcher applies to all routes | No auth changes needed |

## Best Practices Applied

1. **Next.js App Router Conventions**: Follow file-system routing patterns
2. **Middleware Efficiency**: Single middleware handles auth + redirects
3. **Query Param Preservation**: Use URL API to maintain all URL components
4. **Test Coverage**: Integration tests validate critical paths (80% requirement)
5. **TypeScript Safety**: All URL handling uses typed Next.js APIs

## Risks Identified

1. **Risk**: Missed hardcoded URLs in untested components
   - **Mitigation**: Comprehensive grep search + manual review of components

2. **Risk**: Third-party links to old URLs break
   - **Mitigation**: Middleware redirects provide backward compatibility

3. **Risk**: Search engines index old URLs
   - **Mitigation**: 301 redirects (permanent) signal URL change to search engines

## Open Questions

None - all technical unknowns resolved.
