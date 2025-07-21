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
  strictEmailValidator,
} from '../../../shared/validators/form-validators';
import { PrimaryButtonComponent } from '../../../shared/components/buttons/primary-button/primary-button.component';
import { LoginLoadingState } from '../../models/auth.model';

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
    username: FormControl<string>;
    email: FormControl<string>;
  }>;

  loadingState: LoginLoadingState = LoginLoadingState.None;
  public LoadingState = LoginLoadingState;

  usernameFieldFocused: boolean = false;
  emailFieldFocused: boolean = false;

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
    this.form = this.formBuilder.nonNullable.group({
      username: ['', [Validators.minLength(8), noSpecialCharsValidator]],
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

  getFormErrors(controlName: 'email' | 'username'): string[] {
    const control = this.form.controls[controlName];
    if (!(control.touched && control.dirty) || !control.errors) return [];

    return Object.entries(control.errors).map(([key]) => {
      switch (key) {
        case 'required':
          return `Please enter your ${controlName}`;
        case 'email':
          return 'This is not a valid email format';
        case 'noSpecialChars':
          return 'Special characters are not allowed';
        case 'minlength':
          return `${controlName} is too short, min 8 characters`;
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
}
