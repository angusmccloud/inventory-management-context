/**
 * Navigation Component Type Definitions
 * Feature: 008-common-components
 * 
 * Navigation components: Link, TabNavigation, PageHeader
 */

import * as React from 'react';

/**
 * Link visual variants
 */
export type LinkVariant = 
  | 'default'    // Standard link (underline on hover)
  | 'primary'    // Primary color, bold
  | 'subtle';    // No underline, subtle color

/**
 * Link component props
 * Styled anchor element with consistent appearance.
 * 
 * @example
 * <Link href="/dashboard">Go to Dashboard</Link>
 * 
 * @example
 * <Link href="https://example.com" external>
 *   View Documentation
 * </Link>
 * 
 * @example
 * <Link href="/settings" variant="subtle">Settings</Link>
 */
export interface LinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  /**
   * Link destination
   */
  href: string;
  
  /**
   * Link content
   */
  children: React.ReactNode;
  
  /**
   * Link visual variant
   * @default 'default'
   */
  variant?: LinkVariant;
  
  /**
   * External link (opens in new tab, shows external icon)
   * Auto-detected from href if not specified (http/https external domains)
   * @default false (determined automatically from href)
   */
  external?: boolean;
  
  /**
   * Show external link icon
   * @default true (when external is true)
   */
  showExternalIcon?: boolean;
  
  /**
   * Additional CSS classes
   */
  className?: string;
}

/**
 * Tab item definition
 */
export interface Tab {
  /**
   * Unique tab identifier
   */
  id: string;
  
  /**
   * Tab label (visible text)
   */
  label: string;
  
  /**
   * Tab icon (optional, shown before label)
   */
  icon?: React.ReactNode;
  
  /**
   * Disable this tab
   * @default false
   */
  disabled?: boolean;
  
  /**
   * Badge count (optional, shown after label)
   */
  badge?: number;
}

/**
 * TabNavigation component props
 * Tab-based content switching with keyboard navigation.
 * 
 * @example
 * const tabs = [
 *   { id: 'inventory', label: 'Inventory', icon: <BoxIcon /> },
 *   { id: 'shopping', label: 'Shopping List', badge: 5 },
 *   { id: 'members', label: 'Members' },
 * ];
 * 
 * <TabNavigation 
 *   tabs={tabs}
 *   activeTab={activeTab}
 *   onChange={setActiveTab}
 * />
 * 
 * @example
 * <TabNavigation 
 *   tabs={settingsTabs}
 *   activeTab={currentSection}
 *   onChange={handleSectionChange}
 *   orientation="vertical"
 * />
 */
export interface TabNavigationProps {
  /**
   * Array of tab definitions
   */
  tabs: Tab[];
  
  /**
   * Currently active tab ID
   */
  activeTab: string;
  
  /**
   * Tab change handler
   */
  onChange: (tabId: string) => void;
  
  /**
   * Tab orientation
   * @default 'horizontal'
   */
  orientation?: 'horizontal' | 'vertical';
  
  /**
   * Additional CSS classes
   */
  className?: string;
}

/**
 * Breadcrumb item definition
 */
export interface Breadcrumb {
  /**
   * Breadcrumb label
   */
  label: string;
  
  /**
   * Breadcrumb link destination (if clickable)
   * If not provided, breadcrumb is rendered as plain text (current page)
   */
  href?: string;
}

/**
 * PageHeader component props
 * Page title header with optional breadcrumbs, description, and actions.
 * 
 * @example
 * <PageHeader 
 *   title="Inventory"
 *   description="Manage your household items and supplies"
 *   action={
 *     <Button variant="primary" onClick={() => setShowAddForm(true)}>
 *       Add Item
 *     </Button>
 *   }
 * />
 * 
 * @example
 * <PageHeader 
 *   breadcrumbs={[
 *     { label: 'Dashboard', href: '/dashboard' },
 *     { label: 'Settings', href: '/settings' },
 *     { label: 'Members' },
 *   ]}
 *   title="Family Members"
 *   action={<Button onClick={handleInvite}>Invite Member</Button>}
 *   secondaryActions={[
 *     <IconButton icon={<CogIcon />} aria-label="Settings" key="settings" />
 *   ]}
 * />
 */
export interface PageHeaderProps {
  /**
   * Page title (main heading)
   */
  title: string;
  
  /**
   * Page description (optional subtitle/supporting text)
   */
  description?: string;
  
  /**
   * Breadcrumb navigation (optional, shown above title)
   */
  breadcrumbs?: Breadcrumb[];
  
  /**
   * Primary action button (top-right)
   */
  action?: React.ReactNode;
  
  /**
   * Additional actions (shown after primary action)
   */
  secondaryActions?: React.ReactNode[];
  
  /**
   * Additional CSS classes
   */
  className?: string;
}
