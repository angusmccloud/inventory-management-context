/**
 * Layout Component Type Definitions
 * Feature: 008-common-components
 * 
 * Layout and container components: Card, LoadingSpinner
 */

import * as React from 'react';

/**
 * Card elevation/shadow levels
 */
export type CardElevation = 
  | 'flat'       // No shadow (border only)
  | 'low'        // Subtle shadow (default)
  | 'medium'     // Moderate shadow (elevated)
  | 'high';      // Strong shadow (modal, dropdown)

/**
 * Card padding size
 */
export type CardPadding = 
  | 'none'       // p-0 (custom content handles padding)
  | 'sm'         // p-3
  | 'md'         // p-4 (default)
  | 'lg';        // p-6

/**
 * Card component props
 * Container component for grouping related content.
 * 
 * @example
 * <Card elevation="low" padding="md">
 *   <h3>Card Title</h3>
 *   <p>Card content goes here...</p>
 * </Card>
 * 
 * @example
 * <Card interactive onClick={() => router.push(`/items/${item.id}`)}>
 *   <ItemSummary item={item} />
 * </Card>
 */
export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Card content
   */
  children: React.ReactNode;
  
  /**
   * Shadow/elevation level
   * @default 'low'
   */
  elevation?: CardElevation;
  
  /**
   * Internal padding size
   * @default 'md'
   */
  padding?: CardPadding;
  
  /**
   * Interactive card (adds hover effect, cursor pointer)
   * Use when card is clickable (navigates or opens modal)
   * @default false
   */
  interactive?: boolean;
  
  /**
   * Additional CSS classes
   */
  className?: string;
}

/**
 * Spinner size variants
 */
export type SpinnerSize = 
  | 'sm'         // 16px (inline with text)
  | 'md'         // 24px (default)
  | 'lg'         // 32px (large buttons, cards)
  | 'xl';        // 48px (page-level loading)

/**
 * LoadingSpinner component props
 * Animated loading indicator.
 * 
 * @example
 * <LoadingSpinner size="md" />
 * 
 * @example
 * <LoadingSpinner size="xl" center label="Loading inventory..." />
 * 
 * @example
 * {isLoading && <LoadingSpinner size="sm" />}
 */
export interface LoadingSpinnerProps {
  /**
   * Spinner size
   * @default 'md'
   */
  size?: SpinnerSize;
  
  /**
   * Accessible label for screen readers
   * @default 'Loading...'
   */
  label?: string;
  
  /**
   * Center spinner in container (applies flex centering to wrapper)
   * @default false
   */
  center?: boolean;
  
  /**
   * Additional CSS classes
   */
  className?: string;
}
