import { FormControl, FormGroup } from '@angular/forms';

export function extractFormErrors(
  controlName: string,
  form: FormGroup,
  labels: Record<string, string>
): string[] {
  const control = form.controls[controlName];

  if (!(control.touched && control.dirty) || !control.errors) return [];

  const label = labels[controlName] ?? controlName;

  return Object.entries(control.errors)
    .filter(([key]) => key !== 'required')
    .map(([key]) => {
      switch (key) {
        case 'email':
          return 'This is not a valid email format';
        case 'noSpecialChars':
          return 'Special characters are not allowed';
        case 'minlength':
          return `${label} is too short, min 8 characters`;
        case 'passwordMismatch':
          return 'Passwords do not match';
        default:
          return 'Invalid input';
      }
    });
}

export function determineInputClasses(
  control: FormControl,
  focused: boolean
): { [key: string]: boolean } {
  const hasErrors = Object.keys(control.errors ?? {}).some(
    (e) => e !== 'required'
  );

  return {
    focused: focused || !!control.value,
    valid: control.valid && control.touched,
    invalid: hasErrors && control.touched && control.dirty,
  };
}
