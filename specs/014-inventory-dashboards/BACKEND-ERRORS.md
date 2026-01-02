# Backend Compilation Errors - SPEC 014

**Note**: These errors exist in the backend codebase and are NOT related to the frontend fixes completed in this session. These appear to be systematic issues that need to be addressed across multiple handlers.

## Error Categories

### 1. Logger Import Pattern (Multiple files)
**Files Affected**: 
- `dashboardAccessHandler.ts`
- `dashboardAdjustmentHandler.ts`
- `dashboardHandler.ts`

**Error**: 
```typescript
Module has no default export. Did you mean to use 'import { logger } from ...' instead?
```

**Fix**: Change all logger imports from:
```typescript
import logger from '../lib/logger';
```
To:
```typescript
import { logger } from '../lib/logger';
```

---

### 2. Error Response Function Signature
**Files Affected**: All dashboard handlers

**Error**: 
```typescript
Expected 3-5 arguments, but got 2.
```

**Current Usage**:
```typescript
return errorResponse('Dashboard not found', 404);
```

**Required Signature** (based on error):
```typescript
// Need to check actual errorResponse function signature
// Likely needs: errorResponse(message, statusCode, correlationId?, headers?, additionalData?)
```

**Action**: Review `src/lib/response.ts` and update all errorResponse calls to match the required signature.

---

### 3. Auth Context Handling
**Files Affected**: `dashboardHandler.ts`

**Error**:
```typescript
Argument of type 'Promise<AuthContext | null>' is not assignable to parameter of type 'AuthContext'.
```

**Issue**: `authContext` is a Promise but being used synchronously.

**Fix**: Add `await`:
```typescript
// Before
const adminCheck = requireAdmin(authContext);

// After  
const authContext = await extractAuthContext(event);
const adminCheck = requireAdmin(authContext);
```

---

### 4. Service Method Invocation
**Files Affected**: All dashboard handlers

**Error**:
```typescript
Property 'getDashboardPublic' does not exist on type 'DashboardService'. 
Did you mean to access the static member 'DashboardService.getDashboardPublic' instead?
```

**Issue**: Methods are static but being called on instance.

**Fix**: Change all service calls from:
```typescript
await dashboardService.getDashboardPublic(dashboardId);
```
To:
```typescript
await DashboardService.getDashboardPublic(dashboardId);
```

---

### 5. Path Parameters Access Pattern
**Files Affected**: All dashboard handlers

**Error**:
```typescript
Property 'dashboardId' comes from an index signature, so it must be accessed with ['dashboardId'].
```

**Fix**: Change from:
```typescript
const dashboardId = event.pathParameters?.dashboardId;
```
To:
```typescript
const dashboardId = event.pathParameters?.['dashboardId'];
```

---

### 6. Dashboard Model - Duplicate Keys
**File**: `src/models/dashboard.ts`

**Error**: 
```typescript
An object literal cannot have multiple properties with the same name.
```

**Lines**: 226, 273, 317 - `ExpressionAttributeValues` defined multiple times

**Fix**: Merge duplicate `ExpressionAttributeValues` objects into single definition.

---

### 7. Dashboard Service - Inventory Adjustment
**File**: `src/services/dashboardService.ts`

**Error**: 
```typescript
Expected 4 arguments, but got 3.
Property 'newQuantity' does not exist on type 'InventoryItem'.
Property 'itemName' does not exist on type 'InventoryItem'.
```

**Issue**: `InventoryService.adjustQuantity` signature mismatch and return type issues.

**Fix**: 
1. Check `InventoryService.adjustQuantity` signature and add missing 4th argument
2. Update response mapping to use correct property names from `InventoryItem` type:
```typescript
// Before
newQuantity: result.newQuantity,
message: `${action} ${absAdjustment} ${result.itemName}...`,

// After (assuming InventoryItem has 'quantity' and 'name')
newQuantity: result.quantity,
message: `${action} ${absAdjustment} ${result.name}...`,
```

---

### 8. Dashboard ID Parsing
**File**: `src/lib/dashboardId.ts`

**Error**: 
```typescript
'randomPart' is possibly 'undefined'.
```

**Fix**: Add validation before accessing:
```typescript
const [familyId, randomPart] = parts;

if (!familyId || !randomPart) {
  throw new Error('Invalid dashboard ID format: missing components');
}

// Now TypeScript knows they're not undefined
if (!uuidRegex.test(familyId)) {
  // ...
}
```

---

## Recommended Approach

These are systematic issues that should be fixed in a separate task/PR:

1. **Create a dedicated PR** for "Backend TypeScript Strict Mode Fixes"
2. **Fix patterns globally** using search/replace:
   - Logger imports
   - Path parameter access
   - Service method invocations
3. **Review utility functions** for signature changes:
   - `errorResponse`
   - `handleWarmup`
   - `requireAdmin`
4. **Fix data access patterns** in models and services

## Impact Assessment

**Frontend**: ✅ No impact - frontend builds successfully  
**Backend**: ⚠️ Build will fail until these issues are resolved  
**Runtime**: ❓ May work despite compile errors if transpilation succeeds  
**Tests**: ⚠️ Test suite likely failing

## Priority

🔴 **HIGH** - These errors prevent backend deployment and should be fixed before production release.

However, they are NOT blockers for frontend review and testing since:
- Frontend builds successfully
- Frontend can be tested against existing backend endpoints
- Backend fixes can be done in parallel with frontend review
