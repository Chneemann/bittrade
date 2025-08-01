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
import { PrimaryButtonComponent } from '../../../../shared/components/buttons/primary-button/primary-button.component';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { firstValueFrom, timer } from 'rxjs';
import { passwordsMatchValidator } from '../../../../shared/validators/form-validators';
import {
  AUTH_FIELD_LABELS,
  AuthLoadingState,
  PASSWORD_RESET_CONFIRM_FORM_FIELDS,
  PasswordResetConfirmCredentials,
  PasswordResetConfirmForm,
  PasswordResetConfirmFormField,
} from '../../../models/auth.model';
import { AuthService } from '../../../services/auth.service';
import { extractErrorMessage } from '../../../utils/error-utils';
import {
  extractFormErrors,
  determineInputClasses,
} from '../../../utils/form-utils';
import { ActivatedRoute } from '@angular/router';
import { SuccessModalComponent } from '../../../shared/components/success-modal/success-modal.component';

@Component({
  selector: 'app-password-reset-confirm',
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    PrimaryButtonComponent,
    SuccessModalComponent,
  ],
  templateUrl: './password-reset-confirm.component.html',
  styleUrl: './password-reset-confirm.component.scss',
})
export class PasswordResetConfirmComponent implements OnInit {
  private destroyRef = inject(DestroyRef);

  public FIELD = PASSWORD_RESET_CONFIRM_FORM_FIELDS;
  public LABEL = AUTH_FIELD_LABELS;

  public LoadingState = AuthLoadingState;
  loadingState: AuthLoadingState = AuthLoadingState.None;

  fieldFocusStates: Record<PasswordResetConfirmFormField, boolean> =
    Object.fromEntries(
      Object.keys(this.FIELD).map((key) => [key, false])
    ) as Record<PasswordResetConfirmFormField, boolean>;

  form!: FormGroup<{
    [K in keyof PasswordResetConfirmForm]: FormControl<
      PasswordResetConfirmForm[K]
    >;
  }>;

  httpErrorMessage = '';
  passwordResetSuccess = false;

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.createForm();
  }

  async onSubmit(): Promise<void> {
    if (this.form.invalid) return;

    const credentials = this.form.value as PasswordResetConfirmCredentials;
    await this.performPasswordResetConfirm(
      credentials,
      AuthLoadingState.UserSignUp
    );
  }

  getFormErrors(controlName: string): string[] {
    return extractFormErrors(controlName, this.form, this.LABEL);
  }

  getFieldInputClasses(
    field: PasswordResetConfirmFormField
  ): Record<string, boolean> {
    const control = this.form.controls[field];
    const focused = this.fieldFocusStates[field];
    return determineInputClasses(control, focused);
  }

  getAriaDescribedBy(field: PasswordResetConfirmFormField): string | null {
    return this.getFormErrors(field).length ? `${field}-errors` : null;
  }

  getStatusIcon(
    field: PasswordResetConfirmFormField
  ): 'success' | 'error' | null {
    const control = this.form.controls[field];
    if (control.valid && (control.touched || control.dirty)) return 'success';
    if (this.getFormErrors(field).length > 0) return 'error';
    return null;
  }

  private createForm(): void {
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

  private getUidAndTokenFromUrl(): { uid: string; token: string } {
    const uid = this.route.snapshot.queryParamMap.get('uid') || '';
    const token = this.route.snapshot.queryParamMap.get('token') || '';
    return { uid, token };
  }

  private async performPasswordResetConfirm(
    credentials: PasswordResetConfirmCredentials,
    loadingKey: Exclude<AuthLoadingState, AuthLoadingState.None>
  ): Promise<void> {
    this.loadingState = loadingKey;
    this.form.disable();

    const { uid, token } = this.getUidAndTokenFromUrl();
    const payload = {
      uid,
      token,
      new_password: credentials.password,
    };

    try {
      await firstValueFrom(this.authService.passwordResetConfirm(payload));
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

  get isUpdatingPassword(): boolean {
    return this.loadingState === AuthLoadingState.UserSignUp;
  }

  get isButtonDisabled(): boolean {
    return this.form.invalid || this.isUpdatingPassword;
  }
}
