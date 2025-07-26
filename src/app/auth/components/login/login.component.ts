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
  LOGIN_FIELD_LABELS,
  LOGIN_FORM_FIELDS,
  LoginCredentials,
  LoginForm,
  LoginFormField,
} from '../../models/auth.model';
import { strictEmailValidator } from '../../../shared/validators/form-validators';

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
  public LABEL = LOGIN_FIELD_LABELS;

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
    const guestCredentials: LoginCredentials = {
      [LOGIN_FORM_FIELDS.email]: environment.guestEmail,
      [LOGIN_FORM_FIELDS.password]: environment.guestPassword,
    };
    await this.performLogin(guestCredentials, AuthLoadingState.GuestSignIn);
  }

  // Public helper methods
  getFormErrors(controlName: LoginFormField): string[] {
    const control = this.form.controls[controlName];

    if (!(control.touched && control.dirty) || !control.errors) return [];

    const label = LOGIN_FIELD_LABELS[controlName] ?? controlName;

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

  getInputClassesForField(field: LoginFormField): { [key: string]: boolean } {
    const control = this.form.controls[field];
    const focused = this.fieldFocusStates[field];
    return this.getInputClasses(control, focused);
  }

  getAriaDescribedBy(field: LoginFormField): string | null {
    return this.getFormErrors(field).length ? `${field}-errors` : null;
  }

  getStatusIcon(field: LoginFormField): 'success' | 'error' | null {
    const control = this.form.controls[field];
    if (control.valid && (control.touched || control.dirty)) return 'success';
    if (this.getFormErrors(field).length > 0) return 'error';
    return null;
  }

  // Private helper methods
  private createLoginForm(): void {
    this.form = this.formBuilder.nonNullable.group({
      [LOGIN_FORM_FIELDS.email]: [
        '',
        [Validators.required, strictEmailValidator],
      ],
      [LOGIN_FORM_FIELDS.password]: [
        '',
        [Validators.required, Validators.minLength(8)],
      ],
    });
  }

  private async performLogin(
    credentials: LoginCredentials,
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
    const hasErrors = Object.keys(control.errors ?? {}).some(
      (e) => e !== 'required'
    );

    return {
      focused: focused || !!control.value,
      valid: control.valid && control.touched,
      invalid: hasErrors && control.touched && control.dirty,
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
