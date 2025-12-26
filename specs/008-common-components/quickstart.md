# Quickstart Guide: Common Component Library

**Feature**: 008-common-components  
**Audience**: Developers implementing features  
**Date**: December 26, 2025

## Overview

The common component library provides 13 standardized UI components for building consistent interfaces across the inventory management application. All components are theme-aware, accessible, and fully typed with TypeScript.

## Installation & Import

Components are located in `components/common/` and exported via barrel file:

```typescript
import { Button, Input, Card, Text, Badge } from '@/components/common';
```

## Quick Reference

| Component | Purpose | Key Props | Example Use Case |
|-----------|---------|-----------|------------------|
| **Text** | Typography | `variant`, `color`, `as` | Headings, body text, captions |
| **Button** | Primary actions | `variant`, `loading`, `disabled` | Save, delete, submit forms |
| **IconButton** | Icon-only actions | `icon`, `aria-label`, `variant` | Edit, delete in list items |
| **Card** | Content containers | `elevation`, `padding`, `interactive` | Item cards, info panels |
| **Input** | Text/number fields | `label`, `error`, `validationState` | Form fields |
| **Select** | Dropdown selection | `options`, `value`, `onChange` | Location picker, role selector |
| **Badge** | Status indicators | `variant`, `size` | Active/removed, role badges |
| **EmptyState** | No-data placeholders | `title`, `description`, `action` | Empty lists |
| **Alert** | Notifications | `severity`, `title`, `dismissible` | Success/error messages |
| **LoadingSpinner** | Loading indicators | `size`, `center` | Data loading states |
| **TabNavigation** | Tab switching | `tabs`, `activeTab`, `onChange` | Multi-section pages |
| **Link** | Styled anchors | `href`, `variant`, `external` | Navigation links |
| **PageHeader** | Page titles | `title`, `description`, `action` | Page headings with actions |

---

## Component Examples

### 1. Text Component

```typescript
import { Text } from '@/components/common';

// Page title
<Text as="h1" variant="h1" color="primary">
  Inventory Management
</Text>

// Section heading
<Text as="h2" variant="h2">
  Recent Items
</Text>

// Body text
<Text variant="body" color="secondary">
  Manage your household items and supplies.
</Text>

// Caption/metadata
<Text variant="caption" color="tertiary">
  Last updated {lastUpdated}
</Text>

// Form label
<Text variant="label" as="label" htmlFor="item-name">
  Item Name
</Text>
```

**Typography Scale**:
- `h1`: Page titles (2xl-3xl)
- `h2`: Section headings (xl-2xl)
- `h3`: Subsection headings (lg-xl)
- `h4`: Card titles (base-lg)
- `body`: Default text (base)
- `caption`: Fine print (xs)
- `label`: Form labels (sm, semibold)

---

### 2. Button Component

```typescript
import { Button } from '@/components/common';
import { PlusIcon, TrashIcon } from '@heroicons/react/24/outline';

// Primary action (main CTA)
<Button variant="primary" onClick={handleSave} loading={isSaving}>
  Save Changes
</Button>

// Secondary action
<Button variant="secondary" onClick={handleCancel}>
  Cancel
</Button>

// Destructive action
<Button variant="danger" onClick={handleDelete}>
  Delete Item
</Button>

// With icons
<Button 
  variant="primary" 
  leftIcon={<PlusIcon className="h-5 w-5" />}
  onClick={handleAdd}
>
  Add Item
</Button>

// Loading state (shows spinner, disables button)
<Button variant="primary" loading disabled>
  Saving...
</Button>

// Full width (mobile forms)
<Button variant="primary" fullWidth onClick={handleSubmit}>
  Submit
</Button>

// Different sizes
<Button size="sm">Small</Button>
<Button size="md">Medium (default)</Button>
<Button size="lg">Large</Button>
```

---

### 3. IconButton Component

```typescript
import { IconButton } from '@/components/common';
import { PencilIcon, TrashIcon, XMarkIcon } from '@heroicons/react/24/outline';

// Edit action
<IconButton 
  icon={<PencilIcon className="h-5 w-5" />}
  aria-label="Edit item"
  variant="secondary"
  onClick={() => setEditMode(true)}
/>

// Delete action
<IconButton 
  icon={<TrashIcon className="h-5 w-5" />}
  aria-label="Delete item"
  variant="danger"
  onClick={handleDelete}
  loading={isDeleting}
/>

// Close/dismiss
<IconButton 
  icon={<XMarkIcon className="h-5 w-5" />}
  aria-label="Close modal"
  variant="secondary"
  size="sm"
  onClick={onClose}
/>
```

**Important**: `aria-label` is **required** for IconButton (accessibility).

---

### 4. Card Component

```typescript
import { Card, Text } from '@/components/common';

// Basic card
<Card elevation="low" padding="md">
  <Text variant="h4">Card Title</Text>
  <Text variant="body" color="secondary">
    Card content goes here...
  </Text>
</Card>

// Interactive card (clickable, shows hover effect)
<Card 
  interactive 
  onClick={() => router.push(`/items/${item.id}`)}
>
  <ItemSummary item={item} />
</Card>

// No shadow (flat)
<Card elevation="flat" padding="lg">
  <FormFields />
</Card>

// Custom padding
<Card padding="none">
  <div className="p-4 border-b">Header</div>
  <div className="p-4">Body</div>
</Card>
```

---

### 5. Input Component

```typescript
import { Input } from '@/components/common';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';

// Basic text input
<Input 
  label="Item Name"
  placeholder="Enter item name"
  value={name}
  onChange={(e) => setName(e.target.value)}
  required
/>

// Input with validation error
<Input 
  label="Email"
  type="email"
  value={email}
  onChange={(e) => setEmail(e.target.value)}
  error={emailError}
  helpText="We'll never share your email"
/>

// Input with success state
<Input 
  label="Password"
  type="password"
  value={password}
  onChange={(e) => setPassword(e.target.value)}
  success="Strong password!"
/>

// Number input
<Input 
  label="Quantity"
  type="number"
  value={quantity}
  onChange={(e) => setQuantity(Number(e.target.value))}
  min={1}
  required
/>

// With icon
<Input 
  placeholder="Search items..."
  leftIcon={<MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />}
  value={searchQuery}
  onChange={(e) => setSearchQuery(e.target.value)}
/>
```

---

### 6. Select Component

```typescript
import { Select } from '@/components/common';

// Basic select
const locationOptions = [
  { label: 'Pantry', value: 'pantry' },
  { label: 'Fridge', value: 'fridge' },
  { label: 'Freezer', value: 'freezer' },
];

<Select 
  label="Storage Location"
  options={locationOptions}
  value={location}
  onChange={setLocation}
  placeholder="Select location..."
  required
/>

// With validation
<Select 
  label="Role"
  options={roleOptions}
  value={role}
  onChange={setRole}
  error={roleError}
  helpText="Choose member's access level"
/>

// Disabled option
const options = [
  { label: 'Available', value: 'available' },
  { label: 'Out of Stock', value: 'out-of-stock', disabled: true },
];
```

---

### 7. Badge Component

```typescript
import { Badge } from '@/components/common';

// Status badges
<Badge variant="success">Active</Badge>
<Badge variant="error">Removed</Badge>
<Badge variant="warning">Pending</Badge>
<Badge variant="info">New</Badge>

// Count badge
<Badge variant="primary">{unreadCount}</Badge>

// Different sizes
<Badge size="sm" variant="success">Small</Badge>
<Badge size="md" variant="success">Medium (default)</Badge>
<Badge size="lg" variant="success">Large</Badge>

// Dot indicator only (no text)
<Badge variant="success" dot />
```

**Usage in MemberCard**:
```typescript
<Badge variant={member.role === 'admin' ? 'primary' : 'default'}>
  {member.role}
</Badge>
<Badge variant={member.status === 'active' ? 'success' : 'error'}>
  {member.status}
</Badge>
```

---

### 8. EmptyState Component

```typescript
import { EmptyState } from '@/components/common';
import { BoxIcon, UserGroupIcon } from '@heroicons/react/24/outline';

// Inventory empty state
<EmptyState 
  icon={<BoxIcon className="h-12 w-12" />}
  title="No Inventory Items"
  description="Add your first item to get started tracking your inventory."
  action={{
    label: "Add Item",
    onClick: () => setShowAddForm(true),
    variant: "primary"
  }}
/>

// With secondary action
<EmptyState 
  icon={<UserGroupIcon className="h-12 w-12" />}
  title="No Members Yet"
  description="Invite family members to collaborate on inventory management."
  action={{
    label: "Invite Member",
    onClick: handleInvite
  }}
  secondaryAction={{
    label: "Learn More",
    onClick: () => router.push('/docs/members')
  }}
/>
```

---

### 9. Alert Component

```typescript
import { Alert } from '@/components/common';

// Success notification
<Alert severity="success" title="Item Added">
  {item.name} has been added to your inventory.
</Alert>

// Error message
<Alert severity="error">
  Failed to save changes. Please try again.
</Alert>

// Warning
<Alert severity="warning" title="Low Stock">
  {item.name} is running low. Current quantity: {item.quantity}
</Alert>

// Dismissible alert
<Alert 
  severity="info" 
  dismissible 
  onDismiss={() => setShowAlert(false)}
>
  You have {pendingInvitations} pending invitations.
</Alert>
```

**Accessibility**: 
- `error`/`warning` use `role="alert"` (interrupts screen readers)
- `info`/`success` use `role="status"` (polite announcement)

---

### 10. LoadingSpinner Component

```typescript
import { LoadingSpinner } from '@/components/common';

// Inline spinner
{isLoading && <LoadingSpinner size="sm" />}

// Button loading state (use Button's loading prop instead)
<Button variant="primary" loading>Saving...</Button>

// Page-level loading
<LoadingSpinner size="xl" center label="Loading inventory..." />

// Card loading state
<Card>
  {isLoading ? (
    <LoadingSpinner size="md" center />
  ) : (
    <ItemList items={items} />
  )}
</Card>
```

---

### 11. TabNavigation Component

```typescript
import { TabNavigation } from '@/components/common';
import { BoxIcon, ShoppingCartIcon, UserGroupIcon } from '@heroicons/react/24/outline';

const tabs = [
  { 
    id: 'inventory', 
    label: 'Inventory', 
    icon: <BoxIcon className="h-5 w-5" /> 
  },
  { 
    id: 'shopping', 
    label: 'Shopping List', 
    badge: 5  // Shows count badge
  },
  { 
    id: 'members', 
    label: 'Members' 
  },
];

<TabNavigation 
  tabs={tabs}
  activeTab={activeTab}
  onChange={setActiveTab}
/>

// Conditional tab content
{activeTab === 'inventory' && <InventoryList />}
{activeTab === 'shopping' && <ShoppingList />}
{activeTab === 'members' && <MemberList />}
```

**Accessibility**: Supports keyboard navigation (Arrow keys, Home, End).

---

### 12. Link Component

```typescript
import { Link } from '@/components/common';

// Internal link
<Link href="/dashboard">Go to Dashboard</Link>

// External link (auto-detected, shows icon)
<Link href="https://docs.example.com" external>
  View Documentation
</Link>

// Subtle variant (no underline)
<Link href="/settings" variant="subtle">Settings</Link>

// Primary variant (bold, brand color)
<Link href="/help" variant="primary">Get Help</Link>

// Suppress external icon
<Link href="https://example.com" external showExternalIcon={false}>
  External Site
</Link>
```

---

### 13. PageHeader Component

```typescript
import { PageHeader, Button } from '@/components/common';

// Basic page header
<PageHeader 
  title="Inventory"
  description="Manage your household items and supplies"
/>

// With action button
<PageHeader 
  title="Shopping List"
  description="Items you need to purchase"
  action={
    <Button variant="primary" onClick={() => setShowAddForm(true)}>
      Add Item
    </Button>
  }
/>

// With breadcrumbs
<PageHeader 
  breadcrumbs={[
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Settings', href: '/settings' },
    { label: 'Members' },  // Current page (no href)
  ]}
  title="Family Members"
  description="Manage family member access and roles"
  action={<Button onClick={handleInvite}>Invite Member</Button>}
/>

// With multiple actions
<PageHeader 
  title="Reference Data"
  action={<Button variant="primary">Add Store</Button>}
  secondaryActions={[
    <IconButton 
      icon={<CogIcon />} 
      aria-label="Settings" 
      key="settings" 
    />
  ]}
/>
```

---

## Common Patterns

### Form with Validation

```typescript
import { Input, Select, Button, Alert } from '@/components/common';

function AddItemForm() {
  const [formData, setFormData] = useState({ name: '', quantity: 1, location: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [success, setSuccess] = useState(false);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (formData.quantity < 1) newErrors.quantity = 'Quantity must be at least 1';
    if (!formData.location) newErrors.location = 'Location is required';
    return newErrors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors = validate();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      await createItem(formData);
      setSuccess(true);
      setFormData({ name: '', quantity: 1, location: '' });
      setErrors({});
    } catch (err) {
      setErrors({ submit: 'Failed to add item' });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {success && (
        <Alert severity="success" dismissible onDismiss={() => setSuccess(false)}>
          Item added successfully!
        </Alert>
      )}

      <Input 
        label="Item Name"
        value={formData.name}
        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        error={errors.name}
        required
      />

      <Input 
        label="Quantity"
        type="number"
        value={formData.quantity}
        onChange={(e) => setFormData({ ...formData, quantity: Number(e.target.value) })}
        error={errors.quantity}
        min={1}
        required
      />

      <Select 
        label="Storage Location"
        options={locationOptions}
        value={formData.location}
        onChange={(location) => setFormData({ ...formData, location })}
        error={errors.location}
        placeholder="Select location..."
        required
      />

      <Button type="submit" variant="primary" fullWidth>
        Add Item
      </Button>
    </form>
  );
}
```

### List with Empty State

```typescript
import { Card, EmptyState, LoadingSpinner } from '@/components/common';

function InventoryList({ familyId }: { familyId: string }) {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadItems();
  }, [familyId]);

  if (loading) {
    return <LoadingSpinner size="xl" center label="Loading inventory..." />;
  }

  if (items.length === 0) {
    return (
      <EmptyState 
        icon={<BoxIcon className="h-12 w-12" />}
        title="No Inventory Items"
        description="Add your first item to get started."
        action={{
          label: "Add Item",
          onClick: () => setShowAddForm(true)
        }}
      />
    );
  }

  return (
    <div className="grid gap-4">
      {items.map(item => (
        <Card key={item.itemId} interactive>
          <ItemDetails item={item} />
        </Card>
      ))}
    </div>
  );
}
```

### Status Indicators with Badges

```typescript
import { Card, Text, Badge } from '@/components/common';

function MemberCard({ member }: { member: Member }) {
  const roleVariant = member.role === 'admin' ? 'primary' : 'default';
  const statusVariant = member.status === 'active' ? 'success' : 'error';

  return (
    <Card elevation="low">
      <div className="flex items-start justify-between">
        <div>
          <Text variant="h4">{member.name}</Text>
          <Text variant="body" color="secondary">{member.email}</Text>
        </div>
        <div className="flex gap-2">
          <Badge variant={roleVariant}>{member.role}</Badge>
          <Badge variant={statusVariant}>{member.status}</Badge>
        </div>
      </div>
    </Card>
  );
}
```

---

## Theme Integration

All components automatically respect the theme system (`lib/theme.ts`):

- **Dark mode**: Handled via CSS custom properties, no component-specific logic
- **Color variants**: Use theme tokens (`bg-primary`, `text-text-primary`, etc.)
- **Consistency**: Changing theme colors updates all components automatically

**Example theme token usage**:
```typescript
// Button primary variant uses:
className="bg-primary text-primary-contrast hover:bg-primary-hover"

// Theme system provides different values for light/dark mode automatically
```

---

## Accessibility Checklist

All common components include built-in accessibility features:

- ✅ **Keyboard navigation**: Tab, Enter, Space, Arrow keys
- ✅ **Screen reader support**: ARIA labels, roles, live regions
- ✅ **Focus indicators**: Visible focus rings on all interactive elements
- ✅ **Color contrast**: WCAG 2.1 AA compliant (4.5:1 ratio minimum)
- ✅ **Error announcements**: Validation errors linked via `aria-describedby`

**Testing accessibility**:
```bash
# Run automated accessibility tests
npm test -- --testNamePattern="accessibility"

# Manual testing with screen reader
# macOS: VoiceOver (Cmd+F5)
# Windows: NVDA or JAWS
```

---

## Performance Best Practices

1. **Tree-shaking**: Import only needed components
   ```typescript
   // ✅ Good (tree-shakeable)
   import { Button, Input } from '@/components/common';
   
   // ❌ Avoid (imports everything)
   import * as Components from '@/components/common';
   ```

2. **Memoization**: Components are already memoized where beneficial
   ```typescript
   // No need to wrap in React.memo - already optimized
   <Button variant="primary">Click me</Button>
   ```

3. **Bundle size**: Components are lightweight (<10KB each)

---

## Migration from One-Off Implementations

### Before (one-off button):
```typescript
<button 
  onClick={handleSave}
  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:bg-gray-400"
  disabled={isSaving}
>
  {isSaving ? 'Saving...' : 'Save'}
</button>
```

### After (common Button):
```typescript
<Button variant="primary" onClick={handleSave} loading={isSaving}>
  Save
</Button>
```

**Benefits**:
- 60% less code
- Automatic theme integration
- Built-in accessibility
- Consistent styling across app
- Loading state included

---

## Getting Help

- **API Reference**: See JSDoc comments in component files
- **Type Definitions**: Located in `/contracts/` directory
- **Examples**: Check existing usage in inventory/shopping list features
- **Issues**: Component not meeting your needs? Extend via composition pattern

---

**Next Steps**: 
1. Start with Button and Input in your feature
2. Replace one-off implementations gradually
3. Refer to this guide for prop usage and patterns
4. Check accessibility with automated tests
