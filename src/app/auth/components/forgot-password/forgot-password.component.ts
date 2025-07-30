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
  FORGOT_PASSWORD_FORM_FIELDS,
  ForgotPasswordFormField,
  ForgotPasswordForm,
  ForgotPasswordCredentials,
  AUTH_FIELD_LABELS,
} from '../../models/auth.model';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';
import { PrimaryButtonComponent } from '../../../shared/components/buttons/primary-button/primary-button.component';
import { Router, RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { extractErrorMessage } from '../../utils/error-utils';
import {
  extractFormErrors,
  determineInputClasses,
} from '../../utils/form-utils';

@Component({
  selector: 'app-forgot-password',
  imports: [
    CommonModule,
    RouterLink,
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
      Object.keys(this.FIELD).map((key) => [key, false])
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
    this.createForgotPasswordForm();
  }

  // Public methods
  async onSubmit(): Promise<void> {
    if (this.form.invalid) return;

    const credentials = this.form.value as ForgotPasswordForm;
    await this.performResetPassword(
      credentials,
      AuthLoadingState.ForgotPassword
    );
  }

  // Public helper methods
  getFormErrors(controlName: string): string[] {
    return extractFormErrors(controlName, this.form, this.LABEL);
  }

  getFieldInputClasses(
    field: ForgotPasswordFormField
  ): Record<string, boolean> {
    const control = this.form.controls[field];
    const focused = this.fieldFocusStates[field];
    return determineInputClasses(control, focused);
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
  private createForgotPasswordForm(): void {
    this.form = this.formBuilder.nonNullable.group({
      [this.FIELD.email]: ['', [Validators.required, strictEmailValidator]],
    });
  }

  private async performResetPassword(
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
      this.httpErrorMessage = extractErrorMessage(error);
    } finally {
      this.loadingState = AuthLoadingState.None;
      this.form.enable();
    }
  }

  // Getters
  get isButtonLoading(): boolean {
    return this.loadingState === AuthLoadingState.ForgotPassword;
  }

  get isButtonDisabled(): boolean {
    return this.form.invalid;
  }
}
