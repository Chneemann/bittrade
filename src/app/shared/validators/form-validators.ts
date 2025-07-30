import { AbstractControl, ValidationErrors } from '@angular/forms';

export function strictEmailValidator(
  control: AbstractControl
): ValidationErrors | null {
  const email = control.value;
  if (!email) return null;

  const emailRegex = /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,3}$/;
  return emailRegex.test(email) ? null : { email: true };
}

export function noSpecialCharsValidator(
  control: AbstractControl
): ValidationErrors | null {
  const value = control.value;
  if (!value) return null;

  const regex = /^[a-zA-Z0-9_]+$/;
  return regex.test(value) ? null : { noSpecialChars: true };
}

export function passwordsMatchValidator(
  control: AbstractControl
): ValidationErrors | null {
  const password = control.get('password')?.value;
  const confirmPassword = control.get('confirmPassword')?.value;

  if (password !== confirmPassword) {
    control.get('confirmPassword')?.setErrors({ passwordMismatch: true });
    return { passwordMismatch: true };
  } else {
    const errors = control.get('confirmPassword')?.errors;
    if (errors) {
      delete errors['passwordMismatch'];
      if (Object.keys(errors).length === 0) {
        control.get('confirmPassword')?.setErrors(null);
      } else {
        control.get('confirmPassword')?.setErrors(errors);
      }
    }
    return null;
  }
}

export function newPasswordsMatchValidator(
  control: AbstractControl
): ValidationErrors | null {
  const newPassword = control.get('newPassword')?.value;
  const confirmPassword = control.get('confirmPassword')?.value;

  if (confirmPassword && !newPassword) {
    return { confirmWithoutNew: true };
  }

  if (newPassword && confirmPassword && newPassword !== confirmPassword) {
    return { passwordsMismatch: true };
  }

  return null;
}
