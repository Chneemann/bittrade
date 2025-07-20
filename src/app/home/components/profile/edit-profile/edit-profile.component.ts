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
import {
  Observable,
  finalize,
  BehaviorSubject,
  catchError,
  tap,
  EMPTY,
  timer,
} from 'rxjs';
import {
  UserProfileUpdate,
  UserProfileVerificationStatus,
} from '../../../models/user.model';
import { UserService } from '../../../services/user.service';
import {
  noSpecialCharsValidator,
  passwordsMatchValidator,
  strictEmailValidator,
} from '../../../../shared/validators/form-validators';
import { environment } from '../../../../../environments/environment';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

const FormControlNames = {
  Username: 'username',
  Email: 'email',
  NewPassword: 'newPassword',
  ConfirmPassword: 'confirmPassword',
  MismatchPassword: 'passwordsMismatch',
  ConfirmWithoutPassword: 'confirmWithoutPassword',
} as const;

type FormControlName = (typeof FormControlNames)[keyof typeof FormControlNames];

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
export class EditProfileComponent implements OnInit {
  private destroyRef = inject(DestroyRef);

  FormControlNames = FormControlNames;

  form!: FormGroup<{
    [FormControlNames.Username]: FormControl<string>;
    [FormControlNames.Email]: FormControl<string>;
    [FormControlNames.NewPassword]: FormControl<string>;
    [FormControlNames.ConfirmPassword]: FormControl<string>;
    [FormControlNames.MismatchPassword]: FormControl<boolean>;
    [FormControlNames.ConfirmWithoutPassword]: FormControl<boolean>;
  }>;

  feedbackMessages: { type: 'success' | 'error'; message: string }[] = [];

  UserProfileVerificationStatus = UserProfileVerificationStatus;
  verificationStatus:
    | UserProfileVerificationStatus.UNVERIFIED
    | UserProfileVerificationStatus.PENDING
    | UserProfileVerificationStatus.VERIFIED =
    UserProfileVerificationStatus.UNVERIFIED;

  focusedFields: Record<FormControlName, boolean> = {
    [FormControlNames.Username]: false,
    [FormControlNames.Email]: false,
    [FormControlNames.NewPassword]: false,
    [FormControlNames.ConfirmPassword]: false,
    [FormControlNames.MismatchPassword]: false,
    [FormControlNames.ConfirmWithoutPassword]: false,
  };

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

  private loadUserProfile(): void {
    this.userProfile$ = this.userService.userProfile$;
    this.userProfile$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((profile) => {
        if (profile && !this.originalProfile) {
          this.originalProfile = { ...profile };
          this.form.patchValue({
            [FormControlNames.Username]: profile.username,
            [FormControlNames.Email]: profile.email,
          });
          this.form.controls[FormControlNames.Username].markAsTouched();
          this.form.controls[FormControlNames.Email].markAsTouched();
          this.form.markAsPristine();
        }
      });
  }

  private createProfileForm(): void {
    this.form = this.formBuilder.nonNullable.group(
      {
        [FormControlNames.Username]: [
          '',
          [Validators.minLength(8), noSpecialCharsValidator],
        ],
        [FormControlNames.Email]: ['', [strictEmailValidator]],
        [FormControlNames.NewPassword]: ['', [Validators.minLength(8)]],
        [FormControlNames.ConfirmPassword]: [''],
        [FormControlNames.MismatchPassword]: [false],
        [FormControlNames.ConfirmWithoutPassword]: [false],
      },
      {
        validators: [passwordsMatchValidator],
      }
    );
  }

  onSubmit() {
    if (this.hasInvalidChangedFields() || this.loadingSubject.value) return;
    this.loadingSubject.next(true);
    this.feedbackMessages = [];

    const updated = this.buildUpdatePayload();
    this.updateUserProfile(updated);
  }

  private buildUpdatePayload(): Partial<UserProfileUpdate> {
    const rawValue = this.form.getRawValue();
    const payload: UserProfileUpdate = {
      username: rawValue[FormControlNames.Username],
      email: rawValue[FormControlNames.Email],
    };

    if (this.isPasswordValidAndConfirmed()) {
      payload.password = rawValue[FormControlNames.NewPassword];
    }

    return payload;
  }

  private updateUserProfile(updated: Partial<UserProfileUpdate>) {
    this.userService
      .updateProfile(updated)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        tap((profile) => this.handleSuccess(profile)),
        catchError((err) => this.handleError(err)),
        finalize(() => this.loadingSubject.next(false))
      )
      .subscribe();
  }

  private handleSuccess(profile: UserProfileUpdate) {
    const previousUsername = this.originalProfile?.username;
    const previousVerified = (this.originalProfile as any)?.verified;

    const currentUsername = profile.username;
    const currentVerified = (profile as any)?.verified;

    const previousEmail = this.originalProfile?.email;
    const currentEmail = profile.email;

    if (currentUsername && currentUsername !== previousUsername) {
      this.showFeedbackMessage('success', 'Username successfully updated.');
    }

    if (currentVerified === true && previousVerified !== true) {
      this.showFeedbackMessage('success', 'Profile successfully verified.');
    }

    if (currentEmail && currentEmail !== previousEmail) {
      this.showFeedbackMessage('success', 'Email address updated.');
    }

    if (this.isPasswordValidAndConfirmed()) {
      this.showFeedbackMessage('success', 'Password successfully updated.');
      this.form.controls[FormControlNames.NewPassword].reset();
      this.form.controls[FormControlNames.ConfirmPassword].reset();
    }

    this.form.markAsPristine();
    this.originalProfile = { ...profile };
  }

  private handleError(err: unknown): Observable<never> {
    this.showFeedbackMessage(
      'error',
      'Failed to update profile. Please try again.'
    );
    console.error('Error updating profile:', err);
    return EMPTY;
  }

  private showFeedbackMessage(type: 'success' | 'error', message: string) {
    const msg = { type, message };
    this.feedbackMessages.push(msg);

    timer(5000)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.feedbackMessages = this.feedbackMessages.filter((m) => m !== msg);
      });
  }

  private isPasswordValidAndConfirmed(): boolean {
    const rawValue = this.form.getRawValue();
    const newPassword = rawValue[FormControlNames.NewPassword];
    const confirmPassword = rawValue[FormControlNames.ConfirmPassword];
    return !!newPassword && newPassword === confirmPassword;
  }

  getFormErrors(controlName: FormControlName): string[] {
    const control = this.form.controls[controlName];
    const errors: string[] = [];

    const fieldLabels: Record<FormControlName, string> = {
      [FormControlNames.Username]: 'Username',
      [FormControlNames.Email]: 'Email',
      [FormControlNames.NewPassword]: 'Password',
      [FormControlNames.ConfirmPassword]: 'Password',
      [FormControlNames.MismatchPassword]: '',
      [FormControlNames.ConfirmWithoutPassword]: '',
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
        break;
      }
    }

    if (
      controlName === FormControlNames.ConfirmPassword &&
      this.form.errors?.[FormControlNames.MismatchPassword] &&
      (control.touched ||
        this.form.controls[FormControlNames.NewPassword].touched)
    ) {
      return ['Passwords do not match'];
    }

    if (
      controlName === FormControlNames.ConfirmPassword &&
      this.form.errors?.[FormControlNames.ConfirmWithoutPassword] &&
      control.touched
    ) {
      return ['Please enter a new password first'];
    }

    return errors;
  }

  getInputClasses(controlName: FormControlName): { [key: string]: boolean } {
    const control = this.form.controls[controlName];
    const controlValue = control.value;
    const isConfirmWithoutNew =
      controlName === FormControlNames.ConfirmPassword &&
      this.form.errors?.[FormControlNames.ConfirmWithoutPassword] &&
      control.touched;
    const isPasswordMismatch =
      controlName === FormControlNames.ConfirmPassword &&
      this.form.errors?.[FormControlNames.MismatchPassword] &&
      (control.touched ||
        this.form.controls[FormControlNames.NewPassword].touched);

    return {
      focused: this.focusedFields[controlName] || !!controlValue,
      valid:
        control.valid &&
        control.touched &&
        !!controlValue &&
        !isPasswordMismatch,
      invalid:
        ((control.invalid && control.touched && control.dirty) ||
          isPasswordMismatch ||
          isConfirmWithoutNew) &&
        !!controlValue,
    };
  }

  onVerificationClick(): void {
    if (this.verificationStatus !== UserProfileVerificationStatus.UNVERIFIED)
      return;

    this.verificationStatus = UserProfileVerificationStatus.PENDING;

    timer(5000)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.verificationStatus = UserProfileVerificationStatus.VERIFIED;
        this.updateUserProfile({ verified: true });
      });
  }

  hasProfileChanged(): boolean {
    if (!this.originalProfile) return false;

    const current = this.form.getRawValue();
    const usernameChanged =
      current[FormControlNames.Username] !== this.originalProfile.username;
    const emailChanged =
      current[FormControlNames.Email] !== this.originalProfile.email;

    const passwordChanged =
      current[FormControlNames.NewPassword]?.length > 0 &&
      current[FormControlNames.NewPassword] ===
        current[FormControlNames.ConfirmPassword];

    return usernameChanged || emailChanged || passwordChanged;
  }

  hasInvalidChangedFields(): boolean {
    if (!this.originalProfile) return true;

    const current = this.form.getRawValue();

    const usernameChanged =
      current[FormControlNames.Username] !== this.originalProfile.username;
    const emailChanged =
      current[FormControlNames.Email] !== this.originalProfile.email;

    const passwordChanged =
      current[FormControlNames.NewPassword]?.length > 0 &&
      current[FormControlNames.NewPassword] ===
        current[FormControlNames.ConfirmPassword];

    if (
      usernameChanged &&
      this.form.controls[FormControlNames.Username].invalid
    )
      return true;

    if (emailChanged && this.form.controls[FormControlNames.Email].invalid)
      return true;

    if (
      passwordChanged &&
      (this.form.controls[FormControlNames.NewPassword].invalid ||
        this.form.controls[FormControlNames.ConfirmPassword].invalid)
    )
      return true;

    return false;
  }

  onFocus(controlName: FormControlName) {
    this.focusedFields[controlName] = true;
  }

  onBlur(controlName: FormControlName) {
    this.focusedFields[controlName] = false;
  }

  getErrorId(controlName: FormControlName): string | null {
    return this.getFormErrors(controlName).length
      ? `${controlName}-errors`
      : null;
  }

  get isGuestUser(): boolean {
    return this.originalProfile?.email === environment.guestEmail;
  }

  get passwordConfirmationValid(): boolean {
    const np = this.form.controls[FormControlNames.NewPassword];
    const cp = this.form.controls[FormControlNames.ConfirmPassword];
    return this.form.valid && np.touched && cp.touched && !!cp.value;
  }
}
