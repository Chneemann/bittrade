import { Component } from '@angular/core';
import {
  FormGroup,
  FormControl,
  FormBuilder,
  Validators,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { strictEmailValidator } from '../../../../shared/validators/form-validators';
import {
  AuthLoadingState,
  AUTH_FIELD_LABELS,
  PASSWORD_RESET_REQUEST_FORM_FIELDS,
  PasswordResetRequestCredentials,
  PasswordResetRequestForm,
  PasswordResetRequestFormField,
} from '../../../models/auth.model';
import { AuthService } from '../../../services/auth.service';
import { CommonModule } from '@angular/common';
import { PrimaryButtonComponent } from '../../../../shared/components/buttons/primary-button/primary-button.component';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { extractErrorMessage } from '../../../utils/error-utils';
import {
  extractFormErrors,
  determineInputClasses,
} from '../../../utils/form-utils';
import { SuccessModalComponent } from '../../../shared/components/success-modal/success-modal.component';

@Component({
  selector: 'app-password-reset-request',
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    PrimaryButtonComponent,
    SuccessModalComponent,
  ],
  templateUrl: './password-reset-request.component.html',
  styleUrl: './password-reset-request.component.scss',
})
export class PasswordResetRequestComponent {
  public FIELD = PASSWORD_RESET_REQUEST_FORM_FIELDS;
  public LABEL = AUTH_FIELD_LABELS;

  public LoadingState = AuthLoadingState;
  loadingState: AuthLoadingState = AuthLoadingState.None;

  fieldFocusStates: Record<PasswordResetRequestFormField, boolean> =
    Object.fromEntries(
      Object.keys(this.FIELD).map((key) => [key, false])
    ) as Record<PasswordResetRequestFormField, boolean>;

  form!: FormGroup<{
    [K in keyof PasswordResetRequestForm]: FormControl<
      PasswordResetRequestForm[K]
    >;
  }>;

  httpErrorMessage = '';
  passwordResetSuccess = false;

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.createForm();
  }

  async onSubmit(): Promise<void> {
    if (this.form.invalid) return;

    const credentials = this.form.value as PasswordResetRequestCredentials;
    await this.performPasswordResetRequest(
      { ...credentials, email: credentials.email.toLowerCase() },
      AuthLoadingState.ForgotPassword
    );
  }

  getFormErrors(controlName: string): string[] {
    return extractFormErrors(controlName, this.form, this.LABEL);
  }

  getFieldInputClasses(
    field: PasswordResetRequestFormField
  ): Record<string, boolean> {
    const control = this.form.controls[field];
    const focused = this.fieldFocusStates[field];
    return determineInputClasses(control, focused);
  }

  getAriaDescribedBy(field: PasswordResetRequestFormField): string | null {
    return this.getFormErrors(field).length ? `${field}-errors` : null;
  }

  getStatusIcon(
    field: PasswordResetRequestFormField
  ): 'success' | 'error' | null {
    const control = this.form.controls[field];
    if (control.valid && (control.touched || control.dirty)) return 'success';
    if (this.getFormErrors(field).length > 0) return 'error';
    return null;
  }

  private createForm(): void {
    this.form = this.formBuilder.nonNullable.group({
      [this.FIELD.email]: ['', [Validators.required, strictEmailValidator]],
    });
  }

  private async performPasswordResetRequest(
    credentials: PasswordResetRequestCredentials,
    loadingKey: Exclude<AuthLoadingState, AuthLoadingState.None>
  ): Promise<void> {
    this.loadingState = loadingKey;
    this.form.disable();

    try {
      await firstValueFrom(this.authService.passwordReset(credentials));
      this.passwordResetSuccess = true;
      this.form.reset();
    } catch (error: unknown) {
      this.httpErrorMessage = extractErrorMessage(error);
    } finally {
      this.loadingState = AuthLoadingState.None;
      this.form.enable();
    }
  }

  get isButtonLoading(): boolean {
    return this.loadingState === AuthLoadingState.ForgotPassword;
  }

  get isButtonDisabled(): boolean {
    return this.form.invalid;
  }
}
