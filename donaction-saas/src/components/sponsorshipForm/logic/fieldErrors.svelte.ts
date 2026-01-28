/**
 * Centralized reactive store for form field errors.
 * Used by validator action to set errors and FormError component to display them.
 *
 * @example
 * // In validator.ts
 * setFieldError('email', 'Email invalide');
 *
 * // In FormError.svelte
 * <FormError inputId="email" />  // Auto-displays error from store
 */

// Reactive store mapping field IDs to error messages
export const fieldErrors = $state<Record<string, string>>({});

/**
 * Set error message for a specific field
 * @param fieldId - The input's id attribute
 * @param message - Error message (empty string to clear)
 */
export function setFieldError(fieldId: string, message: string): void {
  if (fieldId) {
    fieldErrors[fieldId] = message;
  }
}

/**
 * Get error message for a specific field
 * @param fieldId - The input's id attribute
 * @returns Error message or empty string
 */
export function getFieldError(fieldId: string): string {
  return fieldErrors[fieldId] || '';
}

/**
 * Clear all field errors (useful on form reset)
 */
export function clearAllFieldErrors(): void {
  Object.keys(fieldErrors).forEach((key) => {
    fieldErrors[key] = '';
  });
}

/**
 * Clear error for a specific field
 * @param fieldId - The input's id attribute
 */
export function clearFieldError(fieldId: string): void {
  if (fieldId && fieldId in fieldErrors) {
    fieldErrors[fieldId] = '';
  }
}
