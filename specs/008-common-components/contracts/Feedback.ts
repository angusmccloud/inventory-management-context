/**
 * Feedback Component Type Definitions
 * Feature: 008-common-components
 * 
 * Components for user feedback: Alert, Badge, EmptyState
 */

import * as React from 'react';
import { ButtonVariant } from './Button';

/**
 * Alert severity levels
 */
export type AlertSeverity = 
  | 'info'       // Informational (blue)
  | 'success'    // Success message (green)
  | 'warning'    // Warning/caution (yellow)
  | 'error';     // Error message (red)

/**
 * Alert component props
 * Contextual message display for notifications and feedback.
 * 
 * @example
 * <Alert severity="success" title="Item Added">
 *   {item.name} has been added to your inventory.
 * </Alert>
 * 
 * @example
 * <Alert severity="error" dismissible onDismiss={handleDismiss}>
 *   Failed to save changes. Please try again.
 * </Alert>
 */
export interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Alert severity (determines color, icon, and ARIA attributes)
   */
  severity: AlertSeverity;
  
  /**
   * Alert title (optional, displayed as bold text above message)
   */
  title?: string;
  
  /**
   * Alert message content
   */
  children: React.ReactNode;
  
  /**
   * Show close/dismiss button
   * @default false
   */
  dismissible?: boolean;
  
  /**
   * Callback when alert is dismissed (close button clicked)
   */
  onDismiss?: () => void;
  
  /**
   * Additional CSS classes
   */
  className?: string;
}

/**
 * Badge visual variants
 */
export type BadgeVariant = 
  | 'default'    // Neutral gray
  | 'primary'    // Brand blue
  | 'success'    // Green (positive status)
  | 'warning'    // Yellow (caution status)
  | 'error'      // Red (negative status)
  | 'info';      // Light blue (informational)

/**
 * Badge size variants
 */
export type BadgeSize = 
  | 'sm'         // px-2 py-0.5 text-xs
  | 'md'         // px-2.5 py-0.5 text-sm (default)
  | 'lg';        // px-3 py-1 text-base

/**
 * Badge component props
 * Small status or count indicator.
 * 
 * @example
 * <Badge variant="success">Active</Badge>
 * <Badge variant="error">Removed</Badge>
 * <Badge variant="primary">{unreadCount}</Badge>
 * 
 * @example
 * <Badge variant="warning" dot />  {/* Dot indicator only */}
 */
export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  /**
   * Badge variant (determines color)
   * @default 'default'
   */
  variant?: BadgeVariant;
  
  /**
   * Badge size
   * @default 'md'
   */
  size?: BadgeSize;
  
  /**
   * Badge content (text or number)
   */
  children?: React.ReactNode;
  
  /**
   * Dot indicator only (no text, shows colored dot)
   * @default false
   */
  dot?: boolean;
  
  /**
   * Additional CSS classes
   */
  className?: string;
}

/**
 * EmptyState component props
 * Placeholder displayed when no data is available in a list or view.
 * 
 * @example
 * <EmptyState 
 *   icon={<BoxIcon />}
 *   title="No Inventory Items"
 *   description="Add your first item to get started."
 *   action={{
 *     label: "Add Item",
 *     onClick: () => setShowAddForm(true),
 *     variant: "primary"
 *   }}
 * />
 * 
 * @example
 * <EmptyState 
 *   icon={<UserGroupIcon />}
 *   title="No Members Yet"
 *   description="Invite family members to collaborate."
 *   action={{
 *     label: "Invite Member",
 *     onClick: handleInvite
 *   }}
 *   secondaryAction={{
 *     label: "Learn More",
 *     onClick: () => router.push('/docs/members')
 *   }}
 * />
 */
export interface EmptyStateProps {
  /**
   * Icon to display (React element, usually from Heroicons)
   */
  icon?: React.ReactNode;
  
  /**
   * Primary message title
   */
  title: string;
  
  /**
   * Supporting description text
   */
  description?: string;
  
  /**
   * Primary action button
   */
  action?: {
    /**
     * Button label
     */
    label: string;
    
    /**
     * Click handler
     */
    onClick: () => void;
    
    /**
     * Button variant
     * @default 'primary'
     */
    variant?: ButtonVariant;
  };
  
  /**
   * Secondary action button (link-style, shown below primary)
   */
  secondaryAction?: {
    /**
     * Link label
     */
    label: string;
    
    /**
     * Click handler
     */
    onClick: () => void;
  };
  
  /**
   * Additional CSS classes
   */
  className?: string;
}
