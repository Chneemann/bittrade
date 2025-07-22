import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import {
  noSpecialCharsValidator,
  registerPasswordsMatchValidator,
  strictEmailValidator,
} from '../../../shared/validators/form-validators';
import { PrimaryButtonComponent } from '../../../shared/components/buttons/primary-button/primary-button.component';
import {
  LoginLoadingState,
  RegisterFormField,
  REGISTER_FORM_FIELDS,
  RegisterForm,
} from '../../models/auth.model';

@Component({
  selector: 'app-register',
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    PrimaryButtonComponent,
  ],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss',
})
export class RegisterComponent {
  form!: FormGroup<{
    [K in keyof RegisterForm]: FormControl<RegisterForm[K]>;
  }>;
  public FIELD = REGISTER_FORM_FIELDS;

  loadingState: LoginLoadingState = LoginLoadingState.None;
  public LoadingState = LoginLoadingState;

  usernameFieldFocused: boolean = false;
  emailFieldFocused: boolean = false;
  passwordFieldFocused: boolean = false;
  confirmPasswordFieldFocused: boolean = false;

  constructor(private formBuilder: FormBuilder) {}

  ngOnInit(): void {
    this.createRegisterForm();
  }

  async onSubmit(): Promise<void> {
    if (this.form.invalid) return;

    this.loadingState = LoginLoadingState.UserSignUp;
    this.form.disable();
  }

  private createRegisterForm(): void {
    this.form = this.formBuilder.nonNullable.group(
      {
        username: [
          '',
          [
            Validators.required,
            Validators.minLength(8),
            noSpecialCharsValidator,
          ],
        ],
        email: ['', [Validators.required, strictEmailValidator]],
        password: ['', [Validators.required, Validators.minLength(8)]],
        confirmPassword: [''],
      },
      {
        validators: [registerPasswordsMatchValidator],
      }
    );
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

  getFormErrors(controlName: RegisterFormField): string[] {
    const control = this.form.controls[controlName];
    if (!(control.touched && control.dirty) || !control.errors) return [];

    const name = controlName.charAt(0).toUpperCase() + controlName.slice(1);

    return Object.entries(control.errors).map(([key]) => {
      switch (key) {
        case 'required':
          return `Please enter your ${name}`;
        case 'email':
          return 'This is not a valid email format';
        case 'noSpecialChars':
          return 'Special characters are not allowed';
        case 'minlength':
          return `${name} is too short, min 8 characters`;
        case 'passwordMismatch':
          return 'Passwords do not match';
        default:
          return 'Invalid input';
      }
    });
  }

  get isSignUpLoading(): boolean {
    return this.loadingState === LoginLoadingState.UserSignUp;
  }

  get isSignUpButtonDisabled(): boolean {
    return this.form.invalid || this.isSignUpLoading;
  }

  get usernameInputClasses(): { [key: string]: boolean } {
    return this.getInputClasses(
      this.form.controls.username,
      this.usernameFieldFocused
    );
  }

  get emailInputClasses(): { [key: string]: boolean } {
    return this.getInputClasses(
      this.form.controls.email,
      this.emailFieldFocused
    );
  }

  get passwordInputClasses(): { [key: string]: boolean } {
    return this.getInputClasses(
      this.form.controls.password,
      this.passwordFieldFocused
    );
  }

  get confirmPasswordInputClasses(): { [key: string]: boolean } {
    return this.getInputClasses(
      this.form.controls.confirmPassword,
      this.confirmPasswordFieldFocused
    );
  }
}
