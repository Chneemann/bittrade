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
import { PrimaryButtonComponent } from '../../../../shared/components/buttons/primary-button/primary-button.component';
import {
  Subject,
  Observable,
  takeUntil,
  finalize,
  BehaviorSubject,
  catchError,
  tap,
  EMPTY,
} from 'rxjs';
import { UserProfileUpdate } from '../../../models/user.model';
import { UserService } from '../../../services/user.service';
import {
  noSpecialCharsValidator,
  passwordsMatchValidator,
  strictEmailValidator,
} from '../../../../shared/validators/form-validators';
import { environment } from '../../../../../environments/environment';

@Component({
  selector: 'app-edit-profile',
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    PrimaryButtonComponent,
  ],
  templateUrl: './edit-profile.component.html',
  styleUrl: './edit-profile.component.scss',
})
export class EditProfileComponent {
  private destroy$ = new Subject<void>();

  form!: FormGroup<{
    username: FormControl<string>;
    email: FormControl<string>;
    newPassword: FormControl<string>;
    confirmPassword: FormControl<string>;
  }>;

  feedbackMessages: { type: 'success' | 'error'; message: string }[] = [];

  usernameFieldFocused = false;
  emailFieldFocused = false;
  newPasswordFieldFocused = false;
  confirmPasswordFieldFocused = false;

  private originalProfile: Partial<UserProfileUpdate> | null = null;

  userProfile$!: Observable<UserProfileUpdate | null>;

  private loadingSubject = new BehaviorSubject<boolean>(false);
  updatingProfile$ = this.loadingSubject.asObservable();

  constructor(
    private formBuilder: FormBuilder,
    private userService: UserService
  ) {}

  ngOnInit(): void {
    this.createProfileForm();
    this.loadUserProfile();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadUserProfile(): void {
    this.userProfile$ = this.userService.userProfile$;
    this.userProfile$.pipe(takeUntil(this.destroy$)).subscribe((profile) => {
      if (profile) {
        this.originalProfile = { ...profile };
        this.form.patchValue({
          username: profile.username,
          email: profile.email,
        });
        this.form.controls.username.markAsTouched();
        this.form.controls.email.markAsTouched();

        this.form.markAsPristine();
      }
    });
  }

  private createProfileForm(): void {
    this.form = this.formBuilder.nonNullable.group(
      {
        username: ['', [Validators.minLength(8), noSpecialCharsValidator]],
        email: ['', [strictEmailValidator]],
        newPassword: ['', [Validators.minLength(8)]],
        confirmPassword: [''],
      },
      {
        validators: [passwordsMatchValidator],
      }
    );
  }

  onSubmit() {
    if (this.form.invalid || this.loadingSubject.value) return;

    this.loadingSubject.next(true);
    this.feedbackMessages = [];

    const rawValue = this.form.getRawValue();

    const updated: UserProfileUpdate = {
      username: rawValue.username,
      email: rawValue.email,
    };

    if (
      rawValue.newPassword &&
      rawValue.newPassword === rawValue.confirmPassword
    ) {
      updated.password = rawValue.newPassword;
    }

    this.updateUserProfile(updated);
  }

  private updateUserProfile(updated: Partial<UserProfileUpdate>) {
    this.userService
      .updateProfile(updated)
      .pipe(
        takeUntil(this.destroy$),
        tap((profile) => this.handleSuccess(profile)),
        catchError((err) => this.handleError(err)),
        finalize(() => this.loadingSubject.next(false))
      )
      .subscribe();
  }

  private handleSuccess(profile: UserProfileUpdate) {
    this.originalProfile = { ...profile };
    this.form.markAsPristine();

    const rawValue = this.form.getRawValue();

    if ((profile as any)?.email_verification_required) {
      this.feedbackMessages.push({
        type: 'success',
        message: 'Please check your email to confirm the new address.',
      });
    }

    if (
      rawValue.newPassword &&
      rawValue.newPassword === rawValue.confirmPassword
    ) {
      this.feedbackMessages.push({
        type: 'success',
        message: 'Password successfully updated.',
      });
      this.form.controls.newPassword.reset();
      this.form.controls.confirmPassword.reset();
    }
  }

  private handleError(err: unknown): Observable<never> {
    this.feedbackMessages.push({
      type: 'error',
      message: 'Failed to update profile. Please try again.',
    });
    console.error('Error updating profile:', err);
    return EMPTY;
  }

  getFormErrors(controlName: keyof typeof this.form.controls): string[] {
    const control = this.form.controls[controlName];
    const errors: string[] = [];

    const fieldLabels: Record<string, string> = {
      username: 'Username',
      email: 'Email',
      newPassword: 'Password',
      confirmPassword: 'Password',
    };

    const label = fieldLabels[controlName] ?? controlName;

    if (control.touched && control.dirty && control.errors) {
      for (const errorKey of Object.keys(control.errors)) {
        switch (errorKey) {
          case 'required':
            errors.push(`Please enter your ${label}`);
            break;
          case 'email':
            errors.push('This is not a valid email format');
            break;
          case 'noSpecialChars':
            errors.push('Special characters are not allowed');
            break;
          case 'minlength':
            errors.push(`${label} is too short, minimum 8 characters`);
            break;
          default:
            errors.push('Invalid input');
        }
      }
    }

    if (
      controlName === 'confirmPassword' &&
      this.form.errors?.['passwordsMismatch'] &&
      (control.touched || this.form.controls['newPassword'].touched)
    ) {
      errors.push('Passwords do not match');
    }

    return errors;
  }

  private getInputClasses(
    control: FormControl,
    focused: boolean,
    controlName?: string
  ): { [key: string]: boolean } {
    const isPasswordMismatch =
      controlName === 'confirmPassword' &&
      this.form.errors?.['passwordsMismatch'] &&
      (control.touched || this.form.controls['newPassword'].touched);

    return {
      focused: focused || !!control.value,
      valid: control.valid && control.touched && !isPasswordMismatch,
      invalid:
        (control.invalid && control.touched && control.dirty) ||
        isPasswordMismatch,
    };
  }

  hasProfileChanged(): boolean {
    if (!this.originalProfile) return false;

    const current = this.form.getRawValue();

    const usernameChanged = current.username !== this.originalProfile.username;
    const emailChanged = current.email !== this.originalProfile.email;

    const passwordChanged =
      current.newPassword?.length > 0 &&
      current.newPassword === current.confirmPassword;

    return usernameChanged || emailChanged || passwordChanged;
  }

  get isGuestUser(): boolean {
    return this.originalProfile?.email === environment.guestEmail;
  }

  get usernameInputClasses() {
    return this.getInputClasses(
      this.form.controls.username,
      this.usernameFieldFocused
    );
  }
  get emailInputClasses() {
    return this.getInputClasses(
      this.form.controls.email,
      this.emailFieldFocused
    );
  }

  get newPasswordInputClasses() {
    return this.getInputClasses(
      this.form.controls.newPassword,
      this.newPasswordFieldFocused
    );
  }

  get confirmPasswordInputClasses() {
    return this.getInputClasses(
      this.form.controls.confirmPassword,
      this.confirmPasswordFieldFocused,
      'confirmPassword'
    );
  }
}
