import {
  DEFAULT_VALUES,
  FORM_CONFIG,
  isBeingFilled,
  triggerValidation,
} from './useSponsorshipForm.svelte';
import { setFieldError } from './fieldErrors.svelte';
import eventBus from '../../../utils/eventBus';
import { EVENT_CONTEXT } from './initListeners';

// ─── Constants ───────────────────────────────────────────────────────────────
const MIN_DONATION_AMOUNT = 10;
const MIN_FIELD_LENGTH = 2;
const MIN_AGE = 18;
const MAX_AGE = 110;
const DEBOUNCE_DELAY = 150;

// ─── Regex Patterns ──────────────────────────────────────────────────────────

/**
 * Matches strings containing INVALID characters (outside the allowed set).
 * Allowed: word chars (\w), spaces, commas, dots, hyphens, slashes, accented letters (éàçèë).
 * Uses a negative lookahead: if the entire string is ONLY allowed chars, it won't match.
 * When this regex matches → the string contains forbidden chars and is INVALID.
 */
const INVALID_CHARS_REGEXP = /^(?![\w\s,.\-/éàçèë]+$)[\s\S]+$/;

/** Matches any character that is NOT a letter, space, apostrophe, or hyphen (rejects numbers & specials). */
const STRING_WITHOUT_NUMBERS_REGEXP = /[^A-Za-z\s'-]/;

/**
 * Email validation regex.
 * Requires: local-part@domain.tld
 * - No spaces allowed
 * - Domain must have at least one dot
 * - TLD must be at least 2 characters
 * Note: French postal codes only (01-95). DOM-TOM codes are handled separately by the backend.
 */
const EMAIL_REGEXP = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/** French metropolitan postal code: 01000-95999. */
const POSTAL_CODE_REGEXP = /^(([0-8][0-9])|(9[0-5]))[0-9]{3}$/;

/** SIREN: exactly 9 digits. */
const SIREN_REGEXP = /^\d{9}$/;

/** French phone: metropolitan (0X) + international (+33/0033) + DOM-TOM territories. */
const PHONE_REGEXP =
  /^(?:(?:\+|00)33[1-9]\d{8}|0[1-9]\d{8}|(?:\+|00)(?:590|596|594|262|269)\d{9}|(?:\+|00)(?:687|689|681|508)\d{6})$/;

const validateAmount = (value: number, fieldName: string) => {
  if (value === 0 || isNaN(value)) return 'Ce champ est obligatoire';
  if (isNaN(value) || String(value).includes('e')) return `${fieldName} non valide`;
  if (value < MIN_DONATION_AMOUNT) return `Le montant minimum est de ${MIN_DONATION_AMOUNT} €`;
  return '';
};

const validateSiren = (value: number) => {
  if (isNaN(value) || String(value).includes('e')) return `Siren non valide`;
  if (!SIREN_REGEXP.test(value.toString()))
    return `Le numéro Siren doit contenir exactement 9 chiffres`;
  return '';
};

const validateTrue = (value: boolean) => {
  if (!value) return 'Ce champ est obligatoire';
  return '';
};

const validateDateMajor = (value: string) => {
  const birthdate = new Date(String(value));
  const today = new Date();
  let age = today.getFullYear() - birthdate.getFullYear();
  const monthDifference = today.getMonth() - birthdate.getMonth();
  if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < birthdate.getDate())) {
    age--;
  }
  if (age < MIN_AGE) {
    return 'Vous devez être majeur(e)';
  }
  if (age > MAX_AGE) {
    return 'Date non valide';
  }
  return '';
};

const validateDate = (value: string, fieldName: string) => {
  const temp = new Date(String(value));
  if (String(value).trim().length === 0) return 'Ce champ est obligatoire';
  if (isNaN(Number(temp))) return `${fieldName} non valide`;
  return '';
};

function validateString(value: string, fieldName: string, regExp: RegExp) {
  if (regExp?.test(value.trim())) return `${fieldName} non valide`;
  return '';
}

function validateEmail(value: string) {
  if (!EMAIL_REGEXP.test(value.trim())) return `E-mail non valide`;
  return '';
}

function validatePhone(value: string) {
  if (!value || value.trim().length === 0) return '';
  const cleaned = value.replace(/[\s.\-()]/g, '');
  if (!PHONE_REGEXP.test(cleaned)) return 'Numéro de téléphone non valide';
  return '';
}

function formatPhone(value: string): string {
  const digits = value.replace(/[^\d+]/g, '');
  if (!digits) return '';
  if (digits.startsWith('+33') && digits.length > 3) {
    const rest = digits.slice(3);
    const first = rest.slice(0, 1);
    const remaining = rest.slice(1).match(/.{1,2}/g) || [];
    return ('+33 ' + first + (remaining.length ? ' ' + remaining.join(' ') : '')).trim();
  }
  if (digits.startsWith('+') || digits.startsWith('00')) {
    return digits;
  }
  if (digits.startsWith('0') && digits.length > 1) {
    const parts = digits.match(/.{1,2}/g) || [];
    return parts.join(' ');
  }
  return value;
}

function validatePostalCode(value: string) {
  if (!POSTAL_CODE_REGEXP.test(value.trim())) return `Code postal non valide`;
  return '';
}

function validateRequired(value: string) {
  if (value.trim().length < MIN_FIELD_LENGTH) return 'Ce champ est obligatoire';
  return '';
}

function eighteenYearsAgo() {
  const now = new Date();
  now.setFullYear(now.getFullYear() - 18);
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0'); // Les mois sont de 0 à 11, donc ajoutez 1 et formatez
  const day = String(now.getDate()).padStart(2, '0'); // Formatez le jour avec un zéro initial si nécessaire
  return `${year}-${month}-${day}`;
}

const DIRTY_KEYS = [
  'E-mail',
  'Numéro de rue',
  'Nom de rue',
  'Raison sociale',
  'Siren',
  'Forme juridique',
  'Prénom',
  'Nom',
  'Ville',
  'Date de naissance',
  'Code postal',
] as const;

/** Type for validation functions used by the validator action. */
type ValidateFn = (value: string | boolean | number, fieldName: string, regExp?: RegExp) => string;

/**
 * Sanitize user input to prevent XSS when storing in state.
 * Svelte auto-escapes in templates, but this adds defense-in-depth.
 */
function sanitizeInput(value: string): string {
  return value
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
}

function validator(
  node: HTMLInputElement,
  {
    validateFunctions,
    fieldName,
    regExp,
  }: {
    validateFunctions: ValidateFn[];
    fieldName: string;
    regExp?: RegExp;
  },
) {
  isBeingFilled.set(true);
  let isTouched = false;

  // Get parent form-group for touched class
  const formGroup =
    node.closest('.don-form-group') ||
    node.closest('.inputField') ||
    node.closest('.don-checkbox-row');

  function markTouched() {
    if (!isTouched) {
      isTouched = true;
      formGroup?.classList.add('touched');
    }
  }

  function setValidationState(message: string) {
    // Update parent class for CSS-driven styling
    if (message) {
      formGroup?.classList.add('invalid');
      formGroup?.classList.remove('valid');
    } else {
      formGroup?.classList.remove('invalid');
      formGroup?.classList.add('valid');
    }

    // Update error store (for FormError components with inputId)
    const inputId = node.id;
    if (inputId) {
      setFieldError(inputId, message);
    }
  }

  function validate(isTyping: boolean = false) {
    // Sanitize text input before validation (C3: XSS defense-in-depth)
    const rawValue = node.type === 'checkbox' ? node.checked : node.value;
    const sanitizedValue = typeof rawValue === 'string' ? sanitizeInput(rawValue) : rawValue;

    let message = '';
    for (const fn of validateFunctions) {
      message = fn(sanitizedValue, fieldName, regExp);
      if (message) break;
    }

    if (fieldName === 'E-mail' && !message) {
      eventBus.emit(`${EVENT_CONTEXT}emailUpdated`, node.value);
    }

    if (DIRTY_KEYS.includes(fieldName as (typeof DIRTY_KEYS)[number])) {
      if (FORM_CONFIG.myLast && !FORM_CONFIG.dirty) {
        FORM_CONFIG.dirty = Object.keys(FORM_CONFIG.myLast).some((_) => {
          return FORM_CONFIG.myLast[_] !== DEFAULT_VALUES[_];
        });
      }
    }

    // While typing: only clear errors when fixed (don't show new errors mid-keystroke)
    if (isTyping) {
      if (!message) {
        setValidationState('');
      }
    } else {
      // On blur or form submit: show full validation state
      setValidationState(message);
    }
  }

  function handleBlur() {
    markTouched();
    validate();
  }

  let debounceTimer: ReturnType<typeof setTimeout>;

  function handleInput() {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => validate(true), DEBOUNCE_DELAY);
  }

  node.addEventListener('blur', handleBlur);
  node.addEventListener('input', handleInput);

  const unsubscribe = triggerValidation.subscribe((_) => {
    if (_ > 0) {
      // Form submit: mark as touched and validate
      markTouched();
      validate();
    }
  });

  return {
    destroy() {
      clearTimeout(debounceTimer);
      node.removeEventListener('blur', handleBlur);
      node.removeEventListener('input', handleInput);
      unsubscribe();
    },
  };
}

export {
  validator,
  EMAIL_REGEXP,
  INVALID_CHARS_REGEXP,
  validateDate,
  validateTrue,
  validateEmail,
  validatePhone,
  formatPhone,
  validateSiren,
  validateString,
  validateAmount,
  validateRequired,
  eighteenYearsAgo,
  validateDateMajor,
  validatePostalCode,
  STRING_WITHOUT_NUMBERS_REGEXP,
  sanitizeInput,
};
