/**
 * Text Component Type Definitions
 * Feature: 008-common-components
 * 
 * Typography component with semantic variants for consistent text rendering.
 */

import * as React from 'react';

/**
 * Semantic text variants mapping to typography scale
 */
export type TextVariant = 
  | 'h1'         // Page title (2xl-3xl)
  | 'h2'         // Section heading (xl-2xl)
  | 'h3'         // Subsection heading (lg-xl)
  | 'h4'         // Card/group title (base-lg)
  | 'h5'         // Small heading (sm-base)
  | 'h6'         // Tiny heading (xs-sm)
  | 'body'       // Default body text (base)
  | 'bodySmall'  // Smaller body text (sm)
  | 'caption'    // Fine print, metadata (xs)
  | 'label';     // Form labels (sm, semibold)

/**
 * Text color variants (theme-aware)
 */
export type TextColor =
  | 'primary'    // text-text-primary (main content)
  | 'secondary'  // text-text-secondary (supporting text)
  | 'tertiary'   // text-text-tertiary (subtle text)
  | 'inverse'    // text-text-inverse (light text on dark)
  | 'success'    // text-success (positive messaging)
  | 'warning'    // text-warning (caution messaging)
  | 'error'      // text-error (error messaging)
  | 'info';      // text-info (informational)

/**
 * Font weight options
 */
export type FontWeight = 'normal' | 'medium' | 'semibold' | 'bold';

/**
 * Text component props (polymorphic - can render as any HTML element)
 */
export interface TextProps<T extends React.ElementType = 'p'> {
  /**
   * HTML element or React component to render as
   * @default 'p'
   * @example
   * <Text as="h1" variant="h1">Page Title</Text>
   * <Text as="span" variant="caption">Metadata</Text>
   */
  as?: T;
  
  /**
   * Semantic variant (determines font size, weight, line height)
   * @default 'body'
   */
  variant?: TextVariant;
  
  /**
   * Text color (theme-aware)
   * @default 'primary'
   */
  color?: TextColor;
  
  /**
   * Text content
   */
  children: React.ReactNode;
  
  /**
   * Additional CSS classes
   */
  className?: string;
  
  /**
   * Font weight override (use sparingly - variant determines weight by default)
   */
  weight?: FontWeight;
}

/**
 * Polymorphic text props with proper element props forwarding
 */
export type PolymorphicTextProps<T extends React.ElementType = 'p'> = 
  TextProps<T> & Omit<React.ComponentPropsWithoutRef<T>, keyof TextProps<T>>;
