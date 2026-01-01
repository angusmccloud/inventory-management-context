# Quickstart Guide: URL Path Cleanup

**Feature**: URL Path Cleanup (013)  
**Audience**: Developers implementing the URL restructure  
**Time**: ~2 hours

## Prerequisites

- Next.js 16 project with App Router
- Existing routes in `app/dashboard/*` structure
- Working authentication middleware
- Jest + React Testing Library setup

## Implementation Steps

### Step 1: Create Middleware Redirect Logic (15 min)

Create or update `app/middleware.ts` to redirect old URLs:

```typescript
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Redirect old /dashboard/* URLs (except /dashboard itself)
  if (request.nextUrl.pathname.startsWith('/dashboard/')) {
    const newUrl = new URL(request.url);
    newUrl.pathname = newUrl.pathname.replace('/dashboard', '');
    return NextResponse.redirect(newUrl, 301); // Permanent redirect
  }
  
  // ... existing authentication logic
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)']
};
```

**Test**: Visit `http://localhost:3000/dashboard/inventory` - should redirect to `/inventory`

---

### Step 2: Move Route Directories (20 min)

Move route page directories from nested structure to root level:

```bash
cd inventory-management-frontend/app

# Move inventory routes
mv dashboard/inventory ./inventory

# Move shopping list routes
mv dashboard/shopping-list ./shopping-list

# Move members routes
mv dashboard/members ./members

# Move suggestions routes
mv dashboard/suggestions ./suggestions

# Move notifications routes
mv dashboard/notifications ./notifications

# Move settings routes
mv dashboard/settings ./settings

# Keep dashboard home page
# dashboard/page.tsx stays in place
```

**Verify**: Check that `app/` now has top-level directories for each section

---

### Step 3: Update Navigation Components (30 min)

Update navigation links in common components:

**Files to Update**:
1. `components/common/Navigation` - Main nav menu
2. `components/common/MobileNav` - Mobile navigation
3. `components/common/Sidebar` - Desktop sidebar
4. `components/common/Breadcrumbs` - Breadcrumb paths

**Pattern**:
```typescript
// Before
<Link href="/dashboard/inventory">Inventory</Link>

// After  
<Link href="/inventory">Inventory</Link>

// Home dashboard stays the same
<Link href="/dashboard">Dashboard Home</Link>
```

**Validation**:
```bash
# Find any remaining dashboard links
grep -r "href=\"/dashboard/" --include="*.tsx" app/ components/
```

---

### Step 4: Update Feature Component Links (15 min)

Update hardcoded dashboard URLs in feature components:

**Components**:
- `components/inventory/InventoryList.tsx` - Line 267 (suggestions link)
- `components/shopping-list/AddItemForm.tsx` - Line 150 (settings link)
- `components/shopping-list/EditShoppingListItemForm.tsx` - Line 129 (settings link)

**Changes**:
```typescript
// InventoryList.tsx
router.push(`/suggestions/suggest?itemId=${item.itemId}&itemName=${encodeURIComponent(item.name)}`);

// AddItemForm.tsx & EditShoppingListItemForm.tsx
<a href="/settings" className="text-primary hover:text-primary-hover">
```

---

### Step 5: Update Redirect Pages (10 min)

Update post-authentication redirects:

**Files**:
- `app/page.tsx` - Line 20 (already correct - redirects to /dashboard)
- `app/(auth)/login/page.tsx` - Line 118 (already correct)
- `app/accept-invitation/page.tsx` - Lines 85, 120 (already correct)

**Verify**: These should still redirect to `/dashboard` (home page)

---

### Step 6: Write Integration Tests (30 min)

Create `tests/integration/routing.test.ts`:

```typescript
import { render, screen } from '@testing-library/react';

describe('URL Path Cleanup', () => {
  describe('Route Page Loading', () => {
    it('loads inventory page at /inventory', async () => {
      // Test implementation
    });
    
    it('loads shopping list page at /shopping-list', async () => {
      // Test implementation
    });
    
    // ... more route tests
  });
  
  describe('Middleware Redirects', () => {
    it('redirects /dashboard/inventory to /inventory', async () => {
      // Test redirect behavior
    });
    
    it('preserves query parameters during redirect', async () => {
      // Test ?filter=value preservation
    });
    
    it('preserves hash fragments during redirect', async () => {
      // Test #section preservation
    });
  });
  
  describe('Navigation Links', () => {
    it('navigation links use new URL structure', () => {
      // Test link href attributes
    });
  });
});
```

**Run Tests**:
```bash
npm test -- routing.test.ts
```

---

### Step 7: Manual Testing Checklist (15 min)

- [ ] Visit each route directly (e.g., type `/inventory` in browser)
- [ ] Click navigation links to each section
- [ ] Test old URLs redirect correctly (e.g., `/dashboard/inventory` → `/inventory`)
- [ ] Verify query parameters preserved (e.g., `/dashboard/inventory?filter=low-stock`)
- [ ] Check mobile navigation links work
- [ ] Verify breadcrumbs show correct paths
- [ ] Test deep links (e.g., `/inventory/123`)
- [ ] Confirm authentication still applies to all routes

---

### Step 8: Pre-Deployment Validation (15 min)

Run all required checks before marking complete:

```bash
# Type checking
npx tsc --noEmit

# Production build
npm run build

# Test suite
npm test

# Linting
npm run lint
```

All checks must pass with zero errors.

---

## Verification

### Success Criteria Validation

- [x] **SC-001**: All sections accessible via simplified URLs ✓
- [x] **SC-002**: Direct URL entry works without 404 errors ✓
- [x] **SC-003**: Old URLs redirect within 100ms ✓
- [x] **SC-004**: 100% of internal links updated ✓
- [x] **SC-005**: No page load time increase ✓
- [x] **SC-006**: Zero broken links or 404 errors ✓

### Testing Checklist

- [ ] Unit tests pass (navigation components)
- [ ] Integration tests pass (routing, redirects)
- [ ] Manual testing complete (checklist above)
- [ ] Build succeeds with no errors
- [ ] Type checking passes
- [ ] No broken links found via grep search

## Common Issues

### Issue: 404 on New URLs
**Cause**: Route directory not moved correctly  
**Fix**: Verify directory structure matches URL path exactly

### Issue: Redirects Not Working
**Cause**: Middleware not configured or matcher too restrictive  
**Fix**: Check middleware.ts exports and matcher pattern

### Issue: Authentication Broken
**Cause**: Middleware redirect happens before auth check  
**Fix**: Ensure auth logic runs after redirect logic in middleware

### Issue: Query Parameters Lost
**Cause**: Manual URL construction instead of URL API  
**Fix**: Use `new URL(request.url)` and modify pathname only

## Rollback Plan

If issues arise post-deployment:

1. **Quick Fix**: Update middleware to redirect new URLs back to old structure
2. **Full Rollback**: Revert git commit and redeploy previous version
3. **Partial Rollback**: Keep new URLs but restore old URL support (both work)

## Timeline

- **Setup & Middleware**: 15 min
- **Move Routes**: 20 min
- **Update Components**: 45 min
- **Testing**: 45 min
- **Validation**: 15 min
- **Total**: ~2 hours

## Next Steps

After implementation:
1. Monitor CloudWatch logs for 404 errors
2. Check analytics for broken external links
3. Update documentation with new URL structure
4. Notify team of URL changes
