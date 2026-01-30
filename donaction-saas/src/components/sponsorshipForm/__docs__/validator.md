# Sponsorship Form Validation

This module provides validation functions and utilities for managing form inputs in the sponsorship form.

## File Overview
- **Purpose:** Ensures form inputs meet specified requirements, dynamically validates fields, and integrates with event-based updates.
- **Dependencies:**
    - `isBeingFilled`, `triggerValidation` (from `./useSponsorshipForm.svelte`)
    - `eventBus` (from `../../../utils/eventBus`)
    - `EVENT_CONTEXT` (from `./initListeners`)

## Validators
### `validateAmount`
**Type:** `function`
- **Parameters:**
    - `value` (*number*): The input value to validate.
    - `fieldName` (*string*): The name of the field.
- **Returns:**
    - An error message string if validation fails; otherwise, an empty string.

### `validateSiren`
**Type:** `function`
- **Parameters:**
    - `value` (*number*): The SIREN number to validate.
- **Returns:**
    - An error message string if validation fails; otherwise, an empty string.

### `validateTrue`
**Type:** `function`
- **Parameters:**
    - `value` (*boolean*): The boolean value to validate.
- **Returns:**
    - An error message string if validation fails; otherwise, an empty string.

### `validateDateMajor`
**Type:** `function`
- **Parameters:**
    - `value` (*string*): The date string to validate.
- **Returns:**
    - An error message string if validation fails; otherwise, an empty string.

### `validateDate`
**Type:** `function`
- **Parameters:**
    - `value` (*string*): The date string to validate.
    - `fieldName` (*string*): The name of the field.
- **Returns:**
    - An error message string if validation fails; otherwise, an empty string.

### `validateString`
**Type:** `function`
- **Parameters:**
    - `value` (*string*): The string to validate.
    - `fieldName` (*string*): The name of the field.
    - `regExp` (*RegExp*): The regular expression to validate against.
- **Returns:**
    - An error message string if validation fails; otherwise, an empty string.

### `validateEmail`
**Type:** `function`
- **Parameters:**
    - `value` (*string*): The email string to validate.
- **Returns:**
    - An error message string if validation fails; otherwise, an empty string.

### `validateRequired`
**Type:** `function`
- **Parameters:**
    - `value` (*string*): The input value to validate.
- **Returns:**
    - An error message string if validation fails; otherwise, an empty string.

## Directive
### `validator`
**Type:** `Svelte action`
- Dynamically validates an input element using specified functions.

#### Parameters
- `node` (*HTMLInputElement*): The input element.
- `config` (*object*):
    - `validateFunctions` (*ValidateFn[]*): Array of typed validation functions `(value, fieldName, regExp?) => string`.
    - `fieldName` (*string*): The name of the field.
    - `regExp` (*RegExp*, optional): Optional regex for additional validation.

#### Lifecycle
- **`blur` event:** Validates the input when the user leaves the field.
- **`input` event:** Debounced (150ms) — clears errors while typing, does not show new errors mid-keystroke.
- **`triggerValidation` subscription:** Triggers full validation on form submit.
- **`destroy`:** Clears debounce timer, removes listeners, unsubscribes.

#### Returns
- A `destroy` method to remove event listeners when the directive is removed.

## Regular Expressions
- `STRING_REGEXP`: Negative lookahead — matches strings containing chars outside `[\w\s,.\-/éàçèë]`. When it matches, the string is **invalid**.
- `STRING_WITHOUT_NUMBERS_REGEXP`: Matches any char that is not a letter, space, apostrophe, or hyphen. Used to reject names with numbers/specials.
- `EMAIL_REGEXP`: Validates email format. Requires `local@domain.tld` with TLD ≥ 2 chars.
- `SIREN_REGEXP`: Validates a SIREN number (exactly 9 digits).
- `POSTAL_CODE_REGEXP`: French metropolitan postal codes (01000–95999). DOM-TOM handled server-side.
- `PHONE_REGEXP`: French phone — metropolitan + international (+33/0033) + DOM-TOM territories.

## Utilities
- `sanitizeInput(value: string)`: Escapes HTML entities (`<`, `>`, `"`, `'`) for XSS defense-in-depth.

## Exports
- Validators: `validateAmount`, `validateDate`, `validateDateMajor`, `validateSiren`, `validateTrue`, `validateEmail`, `validatePhone`, `formatPhone`, `validateString`, `validateRequired`, `validatePostalCode`, `eighteenYearsAgo`
- Regular Expressions: `STRING_REGEXP`, `EMAIL_REGEXP`, `STRING_WITHOUT_NUMBERS_REGEXP`
- Utilities: `sanitizeInput`
- `validator` action.

## Notes
- Ensure proper configuration for field validation.
- Regular expressions can be customized based on the field requirements.

---
**Author:** _Klubr_
**Last Updated:** _30_January_2026_

**Related Files:**
- `./useSponsorshipForm.svelte`
- `../../../utils/eventBus`
- `./initListeners`
