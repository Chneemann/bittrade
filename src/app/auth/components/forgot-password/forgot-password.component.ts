import { Component } from '@angular/core';
import {
  FormGroup,
  FormControl,
  FormBuilder,
  Validators,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { strictEmailValidator } from '../../../shared/validators/form-validators';
import {
  AuthLoadingState,
  LOGIN_FORM_FIELDS,
  FORGOT_PASSWORD_FORM_FIELDS,
  ForgotPasswordFormField,
  ForgotPasswordForm,
  ForgotPasswordCredentials,
  AUTH_FIELD_LABELS,
} from '../../models/auth.model';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';
import { PrimaryButtonComponent } from '../../../shared/components/buttons/primary-button/primary-button.component';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-forgot-password',
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    PrimaryButtonComponent,
  ],
  templateUrl: './forgot-password.component.html',
  styleUrl: './forgot-password.component.scss',
})
export class ForgotPasswordComponent {
  public FIELD = FORGOT_PASSWORD_FORM_FIELDS;
  public LABEL = AUTH_FIELD_LABELS;

  public LoadingState = AuthLoadingState;
  loadingState: AuthLoadingState = AuthLoadingState.None;

  fieldFocusStates: Record<ForgotPasswordFormField, boolean> =
    Object.fromEntries(
      Object.keys(FORGOT_PASSWORD_FORM_FIELDS).map((key) => [key, false])
    ) as Record<ForgotPasswordFormField, boolean>;

  form!: FormGroup<{
    [K in keyof ForgotPasswordForm]: FormControl<ForgotPasswordForm[K]>;
  }>;

  httpErrorMessage: string = '';
  passwordResetSuccess = false;

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

    const credentials = this.form.value as ForgotPasswordForm;
    await this.performReset(credentials, AuthLoadingState.ForgotPassword);
  }

  // Public helper methods
  getFormErrors(controlName: ForgotPasswordFormField): string[] {
    const control = this.form.controls[controlName];

    if (!(control.touched && control.dirty) || !control.errors) return [];

    const label = AUTH_FIELD_LABELS[controlName] ?? controlName;

    return Object.entries(control.errors)
      .filter(([key]) => key !== 'required')
      .map(([key]) => {
        switch (key) {
          case 'email':
            return 'This is not a valid email format';
          case 'minlength':
            return `${label} is too short, min 8 characters`;
          case 'passwordMismatch':
            return 'Passwords do not match';
          default:
            return 'Invalid input';
        }
      });
  }

  getInputClassesForField(field: ForgotPasswordFormField): {
    [key: string]: boolean;
  } {
    const control = this.form.controls[field];
    const focused = this.fieldFocusStates[field];
    return this.getInputClasses(control, focused);
  }

  getAriaDescribedBy(field: ForgotPasswordFormField): string | null {
    return this.getFormErrors(field).length ? `${field}-errors` : null;
  }

  getStatusIcon(field: ForgotPasswordFormField): 'success' | 'error' | null {
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
    });
  }

  private async performReset(
    credentials: ForgotPasswordCredentials,
    loadingKey: Exclude<AuthLoadingState, AuthLoadingState.None>
  ): Promise<void> {
    this.loadingState = loadingKey;
    this.form.disable();

    const forgotPasswordData = {
      ...credentials,
      email: credentials.email.toLowerCase(),
    };

    try {
      await firstValueFrom(this.authService.passwordReset(forgotPasswordData));
      this.passwordResetSuccess = true;
      this.form.reset();
    } catch (error: unknown) {
      this.httpErrorMessage = this.extractErrorMessage(error);
    } finally {
      this.loadingState = AuthLoadingState.None;
      this.form.enable();
    }
  }

  private extractErrorMessage(error: unknown): string {
    const err = (error as any)?.error;
    if (err && typeof err === 'object') {
      const firstError = Object.values(err).flat()[0];
      if (typeof firstError === 'string') {
        return firstError;
      }
    }
    if (typeof err === 'string') return err;
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
  get isButtonLoading(): boolean {
    return this.loadingState === AuthLoadingState.ForgotPassword;
  }

  get isButtonDisabled(): boolean {
    return this.form.invalid;
  }
}
