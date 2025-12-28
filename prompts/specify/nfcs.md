Focus **only** on the NFC-based household inventory adjustment feature described below.  
Do **not** restate or redefine the overall tech stack, authentication system, or unrelated application features.

---

## Feature Summary

Design a feature that allows household inventory items to be adjusted by tapping a **passive NFC tag** with any phone.

Tapping the tag opens a minimal, no-auth web page at **inventoryhq.io** that:
- immediately adjusts the inventory quantity
- clearly communicates what change occurred
- allows further `+ / -` adjustments from the same page

This feature is intended for **household use**, prioritizing simplicity and usability over strong security guarantees.

---

## Core Constraints

- No authentication required
- No app installation, all web-based like the rest of the ap
- No background or silent execution (browser opening is acceptable)
- No per-device setup
- Passive NFC tags only

---

## NFC Model

- Each NFC tag stores a URL of the form: https://inventoryhq.io/t/{urlId}

Copy code
- `urlId` is:
- long, random, non-guessable
- treated as a shared secret
- not derived from itemId or householdId
- rotatable if compromised (tag can be reprogrammed)
- Multiple urlIds may map to the same inventory item
- Users can get and generate URLs from inventory page


---

## User Experience Requirements

When a user taps a tag:

1. The page automatically applies a default inventory adjustment (`-1`)
2. The page displays:
 - item name
 - a clear message describing the change  
   (e.g. “Took 1 Paper Towel — now down to 3”)
 - current quantity
 - `+` and `-` buttons for further adjustments
3. Each `+` / `-` press applies an immediate adjustment
4. User may continue adjusting without reloading the page

---

## Behavioral Requirements

- Inventory quantity must never drop below a minimum of 0
- Adjustments must be atomic and safe against concurrent updates
- Unknown or inactive urlIds should return a simple error page

No debounce window or rate limiting is required beyond basic safety.
