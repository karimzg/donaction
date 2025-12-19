import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export const passwordStrengthValidator = (): ValidatorFn => {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;
    if (!value) {
      return null;
    }

    const hasDigit = /[0-9]/.test(value);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(value);
    const hasLowerCase = /[a-z]/.test(value);
    const hasUpperCase = /[A-Z]/.test(value);
    const hasMinLength = value.length >= 8;

    const valid = hasDigit && hasSpecialChar && hasLowerCase && hasUpperCase && hasMinLength;
    return valid ? null : {passwordStrength: true};
  };
};

export const passwordMatchValidator = (control: AbstractControl): { [key: string]: boolean } | null => {
  const password = control.get('password')?.value;
  const confirmPassword = control.get('passwordConfirmation')?.value;
  if (password !== confirmPassword) {
    control.get('passwordConfirmation')?.setErrors({mismatch: true});
    return {mismatch: true}
  } else {
    control.get('passwordConfirmation')?.setErrors(null);
  }
  if (control.get('password')?.value === '' || control.get('passwordConfirmation')?.value === '') {
    return {mismatch: true}
  }
  return null
}

export const differentPasswordValidator = (control: AbstractControl): { [key: string]: boolean } | null => {
  const currentPassword = control.get('currentPassword')?.value;
  const newPassword = control.get('password')?.value;

  if (currentPassword === newPassword) {
    control.get('password')?.setErrors({sameAsOld: true});
    return {sameAsOld: true}
  } else {
    if (control.get('password')?.hasError('sameAsOld')) {
      control.get('password')?.setErrors(null);
      return null
    }
  }
  if (control.get('currentPassword')?.value === '' || control.get('newPassword')?.value === '') {
    return {mismatch: true}
  }
  return null
}
