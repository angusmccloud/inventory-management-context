# Research: NFC Inventory Tap

**Feature**: 006-nfc-inventory-tap  
**Date**: December 26, 2025  
**Phase**: 0 (Pre-Design Research)

## Overview

This document resolves technical unknowns identified in the planning phase, particularly around:
1. Cryptographically secure URL ID generation
2. Atomic inventory adjustments with DynamoDB
3. NFC standards and URL format compatibility
4. Unauthenticated API security patterns
5. Mobile browser NFC behavior

## Research Areas

### 1. Cryptographically Secure URL ID Generation

**Question**: What's the best approach for generating non-guessable URL IDs that are also user-friendly?

**Decision**: Use base62-encoded UUID v4 (22 characters)

**Rationale**:
- UUID v4 provides 122 bits of entropy (cryptographically secure randomness)
- Base62 encoding (alphanumeric: a-z, A-Z, 0-9) is URL-safe without encoding
- 22 characters is short enough for NFC tag memory and QR codes (future)
- Node.js `crypto.randomUUID()` is built-in and meets FIPS 140-2 standards
- Collision probability is negligible (1 in 5.3×10^36 for UUID v4)

**Implementation**:
```typescript
import { randomUUID } from 'crypto';

function generateUrlId(): string {
  const uuid = randomUUID(); // e.g., "550e8400-e29b-41d4-a716-446655440000"
  // Convert to base62 for shorter, URL-friendly format
  return uuidToBase62(uuid); // e.g., "2gSZw8ZQPb7D5kN3X8mQ7"
}
```

**Alternatives Considered**:
- Nanoid: Good but requires dependency; UUID is built-in
- Random bytes + base64: URL encoding issues (needs escaping)
- Sequential IDs: Guessable, security risk

**References**:
- RFC 4122: UUID specification
- OWASP: Sufficient entropy requirements (>= 128 bits)

---

### 2. Atomic Inventory Adjustments with DynamoDB

**Question**: How do we handle concurrent adjustments to prevent race conditions while enforcing minimum quantity of 0?

**Decision**: Use DynamoDB UpdateExpression with conditional checks

**Rationale**:
- DynamoDB's atomic operations prevent race conditions
- `SET` with conditional expression can enforce minimum bounds
- Single API call (no read-modify-write cycle)
- Optimistic locking via version numbers if needed

**Implementation**:
```typescript
async function adjustInventory(itemId: string, familyId: string, delta: number): Promise<number> {
  const params = {
    TableName: 'InventoryManagement',
    Key: {
      PK: `FAMILY#${familyId}`,
      SK: `ITEM#${itemId}`
    },
    UpdateExpression: 'SET quantity = if_not_exists(quantity, :zero) + :delta, updatedAt = :now',
    ConditionExpression: 'quantity + :delta >= :zero', // Prevent negative
    ExpressionAttributeValues: {
      ':delta': delta,
      ':zero': 0,
      ':now': new Date().toISOString()
    },
    ReturnValues: 'ALL_NEW'
  };
  
  try {
    const result = await docClient.update(params);
    return result.Attributes.quantity;
  } catch (err) {
    if (err.name === 'ConditionalCheckFailedException') {
      // Would go below 0, return current quantity (0)
      const current = await getItem(itemId, familyId);
      return current.quantity; // Should be 0
    }
    throw err;
  }
}
```

**Alternatives Considered**:
- DynamoDB Transactions: Overkill for single-item update
- Application-level locking: Adds complexity, not serverless-friendly
- Read-modify-write: Race condition risk

**References**:
- AWS DynamoDB UpdateItem documentation
- DynamoDB atomic counters best practices

---

### 3. NFC Standards and URL Format

**Question**: What URL format is compatible with passive NFC tags and both iOS/Android?

**Decision**: Use NDEF URI record with full HTTPS URL

**Rationale**:
- NDEF (NFC Data Exchange Format) is universal standard
- Both iOS (Core NFC) and Android support URI records
- Full URL (https://inventoryhq.io/t/{urlId}) is most compatible
- iOS requires user-facing browser open (no background processing)
- Android also defaults to browser for http/https URIs

**URL Format**:
```
https://inventoryhq.io/t/2gSZw8ZQPb7D5kN3X8mQ7
```

**NFC Tag Requirements**:
- Type: NTAG213/215/216 (standard passive NFC tags)
- Memory: NTAG213 (144 bytes) is sufficient for our URLs (~60 bytes)
- Encoding: UTF-8 text with NDEF URI record
- Programming: Standard NFC writing apps (NFC Tools, TagWriter, etc.)

**Browser Behavior**:
- **iOS**: Opens Safari automatically when NFC tag is detected
- **Android**: Opens default browser with URL
- **No app installation**: Both platforms open web page directly
- **No background execution**: User must be on lock screen or home screen

**Alternatives Considered**:
- NFC app links: Requires native app (out of scope)
- Custom URI schemes: Not universally supported
- QR codes: Different feature (may add later)

**References**:
- NFC Forum NDEF specification
- Apple Core NFC documentation
- Android NFC best practices

---

### 4. Unauthenticated API Security Patterns

**Question**: How do we secure the NFC adjustment endpoint without authentication while preventing abuse?

**Decision**: Multi-layered approach combining several techniques

**Security Layers**:

1. **URL ID as Bearer Token**
   - 122 bits of entropy makes guessing infeasible
   - Possession of URL = authorization (like a physical key)
   - Rotation mechanism for compromised URLs

2. **Family Isolation**
   - URL ID maps to specific familyId in DynamoDB
   - All queries filtered by familyId
   - Zero cross-family access risk

3. **HTTPS Required**
   - TLS encryption prevents URL sniffing
   - HSTS header enforced at CloudFront level

4. **Rate Limiting (Optional for MVP)**
   - CloudFront rate-based rules (if needed)
   - Lambda-level throttling via DynamoDB query count
   - Household use expected to be low-volume

5. **Logging and Monitoring**
   - CloudWatch logs for all accesses
   - Alarm on suspicious patterns (high frequency from single URL)
   - Audit trail for rotation decisions

**Trade-offs Accepted**:
- No user attribution (can't identify who made adjustment)
- URL sharing is intentional (household members share access)
- Physical tag theft = access (mitigated by rotation)

**Not Implemented** (out of scope):
- CAPTCHA: Bad UX for frequent household use
- Device fingerprinting: Privacy concerns, overkill
- Time-based expiry: Tags should work indefinitely

**Alternatives Considered**:
- JWT tokens: Requires auth flow, defeats simplicity goal
- IP-based restrictions: Fails for mobile networks
- Geofencing: Privacy issues, complex implementation

**References**:
- OWASP API Security Top 10
- AWS WAF rate-based rules
- Bearer token best practices

---

### 5. Mobile Browser NFC Behavior

**Question**: How do iOS and Android handle NFC tag taps and browser opening?

**Research Findings**:

**iOS (iPhone 7+ with iOS 14+)**:
- Automatic NFC scanning when phone is unlocked
- No app required (built into iOS)
- Opens Safari directly when NDEF URI detected
- URL opens as standard web page (can add to home screen)
- Works from lock screen (shows notification to tap)
- Requires physical proximity (< 4cm typically)

**Android (NFC-enabled devices with Android 5.0+)**:
- Automatic NFC detection when screen is on
- Opens default browser (Chrome, Firefox, etc.)
- Background tag reading not supported for URIs
- URL opens immediately without confirmation
- Works with screen on (any app or home screen)

**Progressive Web App Considerations**:
- NFC page could be PWA-capable (add to home screen)
- Not required for MVP but enables offline capability later
- Would need service worker and manifest.json

**Testing Requirements**:
- Test on iOS Safari (primary target)
- Test on Android Chrome (primary target)
- Verify HTTPS requirement (http:// may not work on iOS)
- Test various NFC tag positions (different item types)

**Edge Cases**:
- Airplane mode: NFC works offline (local adjustment queues?)
- Low battery: NFC disabled on some devices
- Case interference: Metal cases may block NFC signal
- Multiple tags: User must tap single tag (no collision handling needed)

**Alternatives Considered**:
- Native app with Core NFC/Android NFC: Requires app install (out of scope)
- QR code fallback: Could add later, not for initial MVP
- Bluetooth beacons: Different technology, more complex

**References**:
- Apple Core NFC documentation
- Android NFC developer guide
- Can I Use: NFC browser support

---

## Summary of Decisions

| Area | Decision | Rationale |
|------|----------|-----------|
| URL ID Generation | Base62-encoded UUID v4 (22 chars) | 122 bits entropy, URL-safe, built-in crypto |
| Atomic Adjustments | DynamoDB UpdateExpression with conditions | Native atomicity, no race conditions |
| NFC Format | NDEF URI record with full HTTPS URL | Universal iOS/Android compatibility |
| Security Model | URL as bearer token + family isolation | Balances household UX with security |
| Browser Behavior | Direct browser open (no app) | Matches platform defaults, simplest UX |

## Open Questions (None)

All technical unknowns have been resolved. Ready to proceed to Phase 1 (Design).

## References

- AWS DynamoDB Developer Guide
- NFC Forum NDEF Specification
- Apple Core NFC Documentation
- Android NFC Guide
- OWASP API Security Project
- Node.js Crypto Module Documentation
