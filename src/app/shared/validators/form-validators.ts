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
