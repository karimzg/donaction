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
    - `validateFunctions` (*Function[]*): Array of validation functions to apply.
    - `fieldName` (*string*): The name of the field.
    - `regExp` (*RegExp*, optional): Optional regex for additional validation.

#### Lifecycle
- **`blur` event:** Validates the input when the user leaves the field.
- **`input` event:** Validates the input in real-time.
- **`triggerValidation` subscription:** Triggers validation when the observable changes.

#### Returns
- A `destroy` method to remove event listeners when the directive is removed.

## Regular Expressions
- `stringRegExp`: Matches strings that contain invalid characters.
- `stringWithoutNumbersRegExp`: Matches strings that contain numbers.
- `emailRegExp`: Validates an email format.
- `sirenRegExp`: Validates a SIREN number (9 digits).

## Exports
- Validators: `validateAmount`, `validateDate`, `validateDateMajor`, `validateSiren`, `validateTrue`, `validateEmail`, `validateString`, `validateRequired`
- Regular Expressions: `stringRegExp`, `emailRegExp`, `stringWithoutNumbersRegExp`
- `validator` action.

## Notes
- Ensure proper configuration for field validation.
- Regular expressions can be customized based on the field requirements.

---
**Author:** _Klubr_
**Last Updated:** _02_January_2025_

**Related Files:**
- `./useSponsorshipForm.svelte`
- `../../../utils/eventBus`
- `./initListeners`
