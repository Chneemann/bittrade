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
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { timer } from 'rxjs';
import { passwordsMatchValidator } from '../../../shared/validators/form-validators';
import {
  AUTH_FIELD_LABELS,
  AuthLoadingState,
  RESET_PASSWORD_FORM_FIELDS,
  ResetPasswordFormField,
  ResetPasswordForm,
} from '../../models/auth.model';
import { AuthService } from '../../services/auth.service';
import { extractErrorMessage } from '../../utils/error-utils';
import {
  extractFormErrors,
  determineInputClasses,
} from '../../utils/form-utils';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-reset-password',
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    ReactiveFormsModule,
    PrimaryButtonComponent,
  ],
  templateUrl: './reset-password.component.html',
  styleUrl: './reset-password.component.scss',
})
export class ResetPasswordComponent implements OnInit {
  private destroyRef = inject(DestroyRef);

  public FIELD = RESET_PASSWORD_FORM_FIELDS;
  public LABEL = AUTH_FIELD_LABELS;

  public LoadingState = AuthLoadingState;
  loadingState: AuthLoadingState = AuthLoadingState.None;

  fieldFocusStates: Record<ResetPasswordFormField, boolean> =
    Object.fromEntries(
      Object.keys(this.FIELD).map((key) => [key, false])
    ) as Record<ResetPasswordFormField, boolean>;

  form!: FormGroup<{
    [K in keyof ResetPasswordForm]: FormControl<ResetPasswordForm[K]>;
  }>;

  httpErrorMessage: string = '';
  passwordResetSuccess = false;

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.createResetPasswordForm();
  }

  // Public methods
  async onSubmit(): Promise<void> {
    if (this.form.invalid) return;

    const credentials = this.form.value as ResetPasswordForm;
    await this.performResetPassword(credentials, AuthLoadingState.UserSignUp);
  }

  // Public helper methods
  getFormErrors(controlName: string): string[] {
    return extractFormErrors(controlName, this.form, this.LABEL);
  }

  getFieldInputClasses(field: ResetPasswordFormField): Record<string, boolean> {
    const control = this.form.controls[field];
    const focused = this.fieldFocusStates[field];
    return determineInputClasses(control, focused);
  }

  getAriaDescribedBy(field: ResetPasswordFormField): string | null {
    return this.getFormErrors(field).length ? `${field}-errors` : null;
  }

  getStatusIcon(field: ResetPasswordFormField): 'success' | 'error' | null {
    const control = this.form.controls[field];
    if (control.valid && (control.touched || control.dirty)) return 'success';
    if (this.getFormErrors(field).length > 0) return 'error';
    return null;
  }

  // Private helper methods
  private createResetPasswordForm(): void {
    this.form = this.formBuilder.nonNullable.group(
      {
        [this.FIELD.password]: [
          '',
          [Validators.required, Validators.minLength(8)],
        ],
        [this.FIELD.confirmPassword]: [''],
      },
      {
        validators: [passwordsMatchValidator],
      }
    );
  }

  private async performResetPassword(
    credentials: ResetPasswordForm,
    loadingKey: Exclude<AuthLoadingState, AuthLoadingState.None>
  ): Promise<void> {
    this.loadingState = loadingKey;
    this.form.disable();

    try {
      // TODO: implement password reset
      this.passwordResetSuccess = true;
      this.form.reset();
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

  // Getters
  get isUpdatingPassword(): boolean {
    return this.loadingState === AuthLoadingState.UserSignUp;
  }

  get isButtonDisabled(): boolean {
    return this.form.invalid || this.isUpdatingPassword;
  }
}
