import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
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
export class EditProfileComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

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
    if (this.form.invalid || this.loadingSubject.value) return;
    this.loadingSubject.next(true);
    this.feedbackMessages = [];

    const rawValue = this.form.getRawValue();

    const updated: UserProfileUpdate = {
      username: rawValue[FormControlNames.Username],
      email: rawValue[FormControlNames.Email],
    };

    if (
      rawValue[FormControlNames.NewPassword] &&
      rawValue[FormControlNames.NewPassword] ===
        rawValue[FormControlNames.ConfirmPassword]
    ) {
      updated.password = rawValue[FormControlNames.NewPassword];
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
      this.showFeedbackMessage(
        'success',
        'Please check your email to confirm the new address.'
      );
    }

    if ((profile as any)?.verified === true) {
      this.showFeedbackMessage('success', 'Profile successfully verified.');
    }

    if (
      rawValue[FormControlNames.NewPassword] &&
      rawValue[FormControlNames.NewPassword] ===
        rawValue[FormControlNames.ConfirmPassword]
    ) {
      this.showFeedbackMessage('success', 'Password successfully updated.');
      this.form.controls[FormControlNames.NewPassword].reset();
      this.form.controls[FormControlNames.ConfirmPassword].reset();
    }
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
    this.feedbackMessages.push({ type, message });
    setTimeout(() => {
      this.feedbackMessages = [];
    }, 5000);
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

    setTimeout(() => {
      this.verificationStatus = UserProfileVerificationStatus.VERIFIED;
      this.updateUserProfile({ verified: true });
    }, 5000);
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
