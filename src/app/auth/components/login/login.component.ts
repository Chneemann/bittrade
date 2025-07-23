import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { PrimaryButtonComponent } from '../../../shared/components/buttons/primary-button/primary-button.component';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../../environments/environment';
import {
  AuthLoadingState,
  LOGIN_FORM_FIELDS,
  LoginForm,
  LoginFormField,
} from '../../models/auth.model';

@Component({
  selector: 'app-login',
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    ReactiveFormsModule,
    PrimaryButtonComponent,
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent implements OnInit {
  public FIELD = LOGIN_FORM_FIELDS;

  public LoadingState = AuthLoadingState;
  loadingState: AuthLoadingState = AuthLoadingState.None;

  fieldFocusStates: Record<LoginFormField, boolean> = Object.fromEntries(
    Object.keys(LOGIN_FORM_FIELDS).map((key) => [key, false])
  ) as Record<LoginFormField, boolean>;

  form!: FormGroup<{
    [K in keyof LoginForm]: FormControl<LoginForm[K]>;
  }>;

  httpErrorMessage: string = '';

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.createLoginForm();
  }

  // Public methods
  async onSubmit(): Promise<void> {
    if (this.form.invalid) return;

    const credentials = this.form.value as LoginForm;
    await this.performLogin(credentials, AuthLoadingState.UserSignIn);
  }

  async onGuestLogin(): Promise<void> {
    const guestCredentials: LoginForm = {
      [LOGIN_FORM_FIELDS.email]: environment.guestEmail,
      [LOGIN_FORM_FIELDS.password]: environment.guestPassword,
    };
    await this.performLogin(guestCredentials, AuthLoadingState.GuestSignIn);
  }

  // Public helper methods
  getInputClassesForField(field: LoginFormField): { [key: string]: boolean } {
    const control = this.form.controls[field];
    const focused = this.fieldFocusStates[field];
    return this.getInputClasses(control, focused);
  }

  getAriaDescribedBy(field: LoginFormField): string | null {
    return this.getFormErrors(field).length ? `${field}-errors` : null;
  }

  getFormErrors(controlName: LoginFormField): string[] {
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
        default:
          return 'Invalid input';
      }
    });
  }

  // Private helper methods
  private createLoginForm(): void {
    this.form = this.formBuilder.nonNullable.group({
      [LOGIN_FORM_FIELDS.email]: ['', [Validators.required, Validators.email]],
      [LOGIN_FORM_FIELDS.password]: [
        '',
        [Validators.required, Validators.minLength(8)],
      ],
    });
  }

  private async performLogin(
    credentials: LoginForm,
    loadingKey: Exclude<AuthLoadingState, AuthLoadingState.None>
  ): Promise<void> {
    this.loadingState = loadingKey;
    this.form.disable();

    try {
      await firstValueFrom(this.authService.login(credentials));
      await this.router.navigate(['/home/portfolio/']);
    } catch (error: unknown) {
      this.httpErrorMessage = this.extractErrorMessage(error);
    } finally {
      this.loadingState = AuthLoadingState.None;
      this.form.enable();
    }
  }

  private extractErrorMessage(error: unknown): string {
    if (error instanceof Error) {
      return error.message;
    }
    return 'Unknown error';
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

  // Getters
  get isSignInLoading(): boolean {
    return this.loadingState === AuthLoadingState.UserSignIn;
  }

  get isGuestLoading(): boolean {
    return this.loadingState === AuthLoadingState.GuestSignIn;
  }

  get isSignInButtonDisabled(): boolean {
    return this.form.invalid || this.isSignInLoading || this.isGuestLoading;
  }

  get isGuestLoginDisabled(): boolean {
    if (!this.form) return false;
    const { email, password } = this.form.value;
    return !!email || !!password;
  }
}
