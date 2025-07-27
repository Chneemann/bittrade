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
import {
  noSpecialCharsValidator,
  registerPasswordsMatchValidator,
  strictEmailValidator,
} from '../../../shared/validators/form-validators';
import { PrimaryButtonComponent } from '../../../shared/components/buttons/primary-button/primary-button.component';
import {
  AuthLoadingState,
  RegisterFormField,
  REGISTER_FORM_FIELDS,
  RegisterForm,
  REGISTER_FIELD_LABELS,
} from '../../models/auth.model';
import { RouterLink } from '@angular/router';
import { firstValueFrom, timer } from 'rxjs';
import { AuthService } from '../../services/auth.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-register',
  imports: [
    CommonModule,
    RouterLink,
    FormsModule,
    ReactiveFormsModule,
    PrimaryButtonComponent,
  ],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss',
})
export class RegisterComponent implements OnInit {
  private destroyRef = inject(DestroyRef);

  public FIELD = REGISTER_FORM_FIELDS;
  public LABEL = REGISTER_FIELD_LABELS;

  public LoadingState = AuthLoadingState;
  loadingState: AuthLoadingState = AuthLoadingState.None;

  fieldFocusStates: Record<RegisterFormField, boolean> = Object.fromEntries(
    Object.keys(REGISTER_FORM_FIELDS).map((key) => [key, false])
  ) as Record<RegisterFormField, boolean>;

  form!: FormGroup<{
    [K in keyof RegisterForm]: FormControl<RegisterForm[K]>;
  }>;

  httpErrorMessage: string = '';
  registrationSuccess = false;

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.createRegisterForm();
  }

  // Public methods
  async onSubmit(): Promise<void> {
    if (this.form.invalid) return;

    const credentials = this.form.value as RegisterForm;
    await this.performRegister(credentials, AuthLoadingState.UserSignUp);
  }

  // Public helper methods
  getFormErrors(controlName: RegisterFormField): string[] {
    const control = this.form.controls[controlName];

    if (!(control.touched && control.dirty) || !control.errors) return [];

    const label = REGISTER_FIELD_LABELS[controlName] ?? controlName;

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

  getInputClassesForField(field: RegisterFormField): {
    [key: string]: boolean;
  } {
    const control = this.form.controls[field];
    const focused = this.fieldFocusStates[field];
    return this.getInputClasses(control, focused);
  }

  getAriaDescribedBy(field: RegisterFormField): string | null {
    return this.getFormErrors(field).length ? `${field}-errors` : null;
  }

  getStatusIcon(field: RegisterFormField): 'success' | 'error' | null {
    const control = this.form.controls[field];
    if (control.valid && (control.touched || control.dirty)) return 'success';
    if (this.getFormErrors(field).length > 0) return 'error';
    return null;
  }

  // Private helper methods
  private createRegisterForm(): void {
    this.form = this.formBuilder.nonNullable.group(
      {
        [REGISTER_FORM_FIELDS.username]: [
          '',
          [
            Validators.required,
            Validators.minLength(8),
            noSpecialCharsValidator,
          ],
        ],
        [REGISTER_FORM_FIELDS.email]: [
          '',
          [Validators.required, strictEmailValidator],
        ],
        [REGISTER_FORM_FIELDS.password]: [
          '',
          [Validators.required, Validators.minLength(8)],
        ],
        [REGISTER_FORM_FIELDS.confirmPassword]: [''],
      },
      {
        validators: [registerPasswordsMatchValidator],
      }
    );
  }

  private async performRegister(
    credentials: RegisterForm,
    loadingKey: Exclude<AuthLoadingState, AuthLoadingState.None>
  ): Promise<void> {
    this.loadingState = loadingKey;
    this.form.disable();

    credentials.email = credentials.email.toLowerCase();

    try {
      await firstValueFrom(this.authService.register(credentials));
      this.registrationSuccess = true;
      this.form.reset();
    } catch (error: unknown) {
      this.httpErrorMessage = this.extractErrorMessage(error);
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
  get isSignUpLoading(): boolean {
    return this.loadingState === AuthLoadingState.UserSignUp;
  }

  get isSignUpButtonDisabled(): boolean {
    return this.form.invalid || this.isSignUpLoading;
  }
}
