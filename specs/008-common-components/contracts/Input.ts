/**
 * Input, TextArea, and Select Component Type Definitions
 * Feature: 008-common-components
 * 
 * Form input components with validation states and consistent styling.
 */

import * as React from 'react';

/**
 * Input component types (HTML5 input types)
 */
export type InputType = 
  | 'text'
  | 'number'
  | 'email'
  | 'password'
  | 'tel'
  | 'url';

/**
 * Input validation state (visual feedback only)
 */
export type InputValidationState = 
  | 'default'    // Normal state
  | 'success'    // Valid input (green border)
  | 'error';     // Invalid input (red border)

/**
 * Input size variants
 */
export type InputSize = 
  | 'sm'         // Small: px-3 py-1.5 text-sm
  | 'md'         // Medium: px-4 py-2 text-base (default)
  | 'lg';        // Large: px-4 py-3 text-lg

/**
 * Base input props (shared between Input, TextArea, and Select)
 */
export interface BaseInputProps {
  /**
   * Input label (associated via htmlFor or wrapper)
   */
  label?: string;
  
  /**
   * Help text shown below input (neutral)
   */
  helpText?: string;
  
  /**
   * Error message (sets validationState to 'error', shown in red)
   */
  error?: string;
  
  /**
   * Success message (sets validationState to 'success', shown in green)
   */
  success?: string;
  
  /**
   * Validation state (visual only, doesn't block submission)
   * Auto-set when error or success props provided
   */
  validationState?: InputValidationState;
  
  /**
   * Input size
   * @default 'md'
   */
  size?: InputSize;
  
  /**
   * Required field indicator (shows asterisk on label)
   * @default false
   */
  required?: boolean;
  
  /**
   * Additional CSS classes for input element
   */
  className?: string;
  
  /**
   * Additional CSS classes for wrapper div
   */
  wrapperClassName?: string;
}

/**
 * Input component props (single-line text input)
 * 
 * @example
 * <Input 
 *   label="Item Name" 
 *   placeholder="Enter item name"
 *   value={name}
 *   onChange={(e) => setName(e.target.value)}
 *   required
 * />
 * 
 * @example
 * <Input 
 *   type="number"
 *   label="Quantity" 
 *   value={quantity}
 *   onChange={(e) => setQuantity(Number(e.target.value))}
 *   error={quantityError}
 *   helpText="Minimum quantity is 1"
 * />
 */
export interface InputProps extends BaseInputProps, Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  /**
   * Input type
   * @default 'text'
   */
  type?: InputType;
  
  /**
   * Icon to display inside input (left side)
   */
  leftIcon?: React.ReactNode;
  
  /**
   * Icon to display inside input (right side)
   */
  rightIcon?: React.ReactNode;
}

/**
 * TextArea component props (multi-line text input)
 * 
 * @example
 * <TextArea 
 *   label="Notes" 
 *   placeholder="Add optional notes..."
 *   value={notes}
 *   onChange={(e) => setNotes(e.target.value)}
 *   rows={4}
 * />
 * 
 * @example
 * <TextArea 
 *   label="Description" 
 *   value={description}
 *   onChange={(e) => setDescription(e.target.value)}
 *   autoResize
 *   maxLength={500}
 * />
 */
export interface TextAreaProps extends BaseInputProps, React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  /**
   * Number of visible text rows
   * @default 3
   */
  rows?: number;
  
  /**
   * Auto-resize based on content
   * @default false
   */
  autoResize?: boolean;
}

/**
 * Select option value type
 */
export interface SelectOption<T = string> {
  /**
   * Display label
   */
  label: string;
  
  /**
   * Option value
   */
  value: T;
  
  /**
   * Disable this option
   * @default false
   */
  disabled?: boolean;
}

/**
 * Select component props (dropdown selection)
 * 
 * @example
 * const options = [
 *   { label: 'Pantry', value: 'pantry' },
 *   { label: 'Fridge', value: 'fridge' },
 *   { label: 'Freezer', value: 'freezer' },
 * ];
 * 
 * <Select 
 *   label="Storage Location"
 *   options={options}
 *   value={location}
 *   onChange={setLocation}
 *   placeholder="Select location..."
 *   required
 * />
 */
export interface SelectProps<T = string> extends BaseInputProps, Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'size' | 'onChange'> {
  /**
   * Select options
   */
  options: SelectOption<T>[];
  
  /**
   * Placeholder option (shown when no value selected)
   */
  placeholder?: string;
  
  /**
   * Selected value
   */
  value?: T;
  
  /**
   * Change handler (receives typed value, not event)
   */
  onChange?: (value: T) => void;
}
