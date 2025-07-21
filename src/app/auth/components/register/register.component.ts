import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { strictEmailValidator } from '../../../shared/validators/form-validators';

@Component({
  selector: 'app-register',
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss',
})
export class RegisterComponent {
  form!: FormGroup<{
    email: FormControl<string>;
  }>;

  emailFieldFocused: boolean = false;

  constructor(private formBuilder: FormBuilder) {}

  ngOnInit(): void {
    this.createRegisterForm();
  }

  async onSubmit(): Promise<void> {
    if (this.form.invalid) return;
  }

  private createRegisterForm(): void {
    this.form = this.formBuilder.nonNullable.group({
      email: ['', [strictEmailValidator]],
    });
  }

  private getInputClasses(
    control: FormControl,
    focused: boolean
  ): { [key: string]: boolean } {
    return {
      focused: focused || !!control.value,
      valid: control.valid && control.touched,
      invalid: control.invalid && control.touched && control.dirty,
    };
  }

  getFormErrors(controlName: 'email'): string[] {
    const control = this.form.controls[controlName];
    if (!(control.touched && control.dirty) || !control.errors) return [];

    return Object.entries(control.errors).map(([key]) => {
      switch (key) {
        case 'required':
          return `Please enter your ${controlName}`;
        case 'email':
          return 'This is not a valid email format';
        case 'minlength':
          return `${controlName} is too short, min 8 characters`;
        default:
          return 'Invalid input';
      }
    });
  }

  get emailInputClasses() {
    return this.getInputClasses(
      this.form.controls.email,
      this.emailFieldFocused
    );
  }
}
