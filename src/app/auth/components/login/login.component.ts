import { CommonModule } from '@angular/common';
import { Component, DestroyRef, inject, OnInit } from '@angular/core';
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
import { firstValueFrom, timer } from 'rxjs';
import { environment } from '../../../../environments/environment';
import {
  AUTH_FIELD_LABELS,
  AuthLoadingState,
  LOGIN_FORM_FIELDS,
  LoginCredentials,
  LoginForm,
  LoginFormField,
} from '../../models/auth.model';
import { strictEmailValidator } from '../../../shared/validators/form-validators';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { extractErrorMessage } from '../../utils/error-utils';
import {
  extractFormErrors,
  determineInputClasses,
} from '../../utils/form-utils';

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
  private destroyRef = inject(DestroyRef);

  public FIELD = LOGIN_FORM_FIELDS;
  public LABEL = AUTH_FIELD_LABELS;

  public LoadingState = AuthLoadingState;
  loadingState: AuthLoadingState = AuthLoadingState.None;

  fieldFocusStates: Record<LoginFormField, boolean> = Object.fromEntries(
    Object.keys(this.FIELD).map((key) => [key, false])
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
    this.getRememberedEmail();
  }

  // Public methods
  async onSubmit(): Promise<void> {
    if (this.form.invalid) return;

    const credentials = this.form.value as LoginForm;
    await this.performLogin(credentials, AuthLoadingState.UserSignIn);
  }

  async onGuestLogin(): Promise<void> {
    const guestCredentials: LoginCredentials = {
      [this.FIELD.email]: environment.guestEmail,
      [this.FIELD.password]: environment.guestPassword,
    };
    await this.performLogin(guestCredentials, AuthLoadingState.GuestSignIn);
  }

  // Public helper methods
  getFormErrors(controlName: string): string[] {
    return extractFormErrors(controlName, this.form, this.LABEL);
  }

  getRememberedEmail(): void | null {
    const rememberedEmail = localStorage.getItem('rememberedEmail');
    if (rememberedEmail) {
      this.form.patchValue({
        [this.FIELD.email]: rememberedEmail,
        [this.FIELD.remember]: true,
      });
    }
  }

  getFieldInputClasses(field: LoginFormField): Record<string, boolean> {
    const control = this.form.controls[field];
    const focused = this.fieldFocusStates[field];
    return determineInputClasses(control, focused);
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
      [this.FIELD.email]: ['', [Validators.required, strictEmailValidator]],
      [this.FIELD.password]: [
        '',
        [Validators.required, Validators.minLength(8)],
      ],
      [this.FIELD.remember]: [false],
    });
  }

  private async performLogin(
    credentials: LoginCredentials & Partial<Pick<LoginForm, 'remember'>>,
    loadingKey: Exclude<AuthLoadingState, AuthLoadingState.None>
  ): Promise<void> {
    this.loadingState = loadingKey;
    this.form.disable();

    const loginData = {
      ...credentials,
      email: credentials.email.toLowerCase(),
    };

    try {
      await firstValueFrom(this.authService.login(loginData));
      this.rememberMe(credentials);
      await this.router.navigate(['/home/portfolio/']);
    } catch (error: unknown) {
      this.httpErrorMessage = extractErrorMessage(error);
      timer(5000)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe(() => {
          this.httpErrorMessage = '';
        });
    } finally {
      this.loadingState = AuthLoadingState.None;
      this.form.enable();
    }
  }

  private rememberMe(credentials: LoginCredentials): void {
    if ('remember' in credentials && credentials.remember) {
      localStorage.setItem('rememberedEmail', credentials.email);
    } else {
      localStorage.removeItem('rememberedEmail');
    }
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
