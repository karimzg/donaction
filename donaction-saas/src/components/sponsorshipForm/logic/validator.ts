import {
  DEFAULT_VALUES,
  FORM_CONFIG,
  isBeingFilled,
  triggerValidation
} from './useSponsorshipForm.svelte';
import { setFieldError } from './fieldErrors.svelte';
import eventBus from '../../../utils/eventBus';
import { EVENT_CONTEXT } from './initListeners';

const MIN_DONATION_AMOUNT = 10;
const MIN_FIELD_LENGTH = 2;
const MAX_AGE = 110;

const stringRegExp = /^(?![\w\s,.\-/éàçèë]+$)[\s\S]+$/;
const stringWithoutNumbersRegExp = /[^A-Za-z\s'-]/;
const emailRegExp = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const postalCodeRegExp = /^(([0-8][0-9])|(9[0-5]))[0-9]{3}$/;

const sirenRegExp = /^\d{9}$/;

const validateAmount = (value: number, fieldName: string) => {
  if (value === 0 || isNaN(value)) return 'Ce champ est obligatoire';
  if (isNaN(value) || String(value).includes('e')) return `${fieldName} non valide`;
  if (value < MIN_DONATION_AMOUNT) return `Le montant minimum est de ${MIN_DONATION_AMOUNT} €`;
  return '';
};

const validateSiren = (value: number) => {
  if (isNaN(value) || String(value).includes('e')) return `Siren non valide`;
  if (!sirenRegExp.test(value.toString()))
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
  if (age < 18) {
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
  if (!emailRegExp?.test(value.trim())) return `E-mail non valide`;
  return '';
}

function validatePostalCode(value: string) {
  if (!postalCodeRegExp?.test(value.trim())) return `Code postal non valide`;
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

const dirtyKeys = [
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
  'Code postal'
];

function validator(
  node: HTMLInputElement,
  {
    validateFunctions,
    fieldName,
    regExp
  }: {
    validateFunctions: [Function];
    fieldName: string;
    regExp?: RegExp;
  }
) {
  isBeingFilled.set(true);
  let isTouched = false;

  // Get parent form-group for touched class
  const formGroup = node.closest('.don-form-group') || node.closest('.inputField') || node.closest('.don-checkbox-row');

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

    // Fallback: update legacy <small> element if present (backward compatibility)
    const errorEl = node.type === 'checkbox'
      ? node.nextElementSibling?.nextElementSibling
      : node.nextElementSibling;

    if (errorEl && errorEl.tagName === 'SMALL') {
      errorEl.textContent = message;
    }
  }

  function validate(isTyping: boolean = false) {
    let message = '';
    for (const fn of validateFunctions) {
      message = fn(node.type === 'checkbox' ? node.checked : node.value, fieldName, regExp);
      if (message) break;
    }

    if (fieldName === 'E-mail' && !message) {
      eventBus.emit(`${EVENT_CONTEXT}emailUpdated`, node.value);
    }

    if (dirtyKeys.includes(fieldName)) {
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
    debounceTimer = setTimeout(() => validate(true), 150);
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
    }
  };
}

export {
  validator,
  emailRegExp,
  stringRegExp,
  validateDate,
  validateTrue,
  validateEmail,
  validateSiren,
  validateString,
  validateAmount,
  validateRequired,
  eighteenYearsAgo,
  validateDateMajor,
  validatePostalCode,
  stringWithoutNumbersRegExp
};
