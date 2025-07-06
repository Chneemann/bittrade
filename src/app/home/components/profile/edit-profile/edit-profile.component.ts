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
import { Subject, Observable, takeUntil } from 'rxjs';
import { UserProfile } from '../../../models/user.model';
import { UserService } from '../../../services/user.service';

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
  }>;

  successMessage = '';
  errorMessage = '';

  usernameFieldFocused = false;
  emailFieldFocused = false;

  private originalProfile: Partial<UserProfile> | null = null;

  userProfile$!: Observable<UserProfile | null>;

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
    this.form = this.formBuilder.nonNullable.group({
      username: ['', [Validators.minLength(8)]],
      email: ['', [Validators.email]],
    });
  }

  onSubmit() {
    if (this.form.invalid) return;

    const updated = this.form.getRawValue();
    this.originalProfile = {
      ...this.originalProfile!,
      ...updated,
    };

    this.form.markAsPristine();
    console.log('Profile Updated:', updated);
  }

  getFormErrors(controlName: 'username' | 'email'): string[] {
    const control = this.form.controls[controlName];
    if (!(control.touched && control.dirty) || !control.errors) return [];

    return Object.entries(control.errors).map(([key]) => {
      switch (key) {
        case 'required':
          return `Please enter your ${controlName}`;
        case 'email':
          return 'This is not a valid email format';
        case 'minlength':
          return `Your ${controlName} is too short, min 8 characters`;
        default:
          return 'Invalid input';
      }
    });
  }

  private getInputClasses(
    control: FormControl,
    focused: boolean
  ): { [key: string]: boolean } {
    return {
      focused: focused || !!control.value,
      valid: control.valid && control.touched,
      invalid: control.invalid && control.touched && control.dirty,
    };
  }

  hasProfileChanged(): boolean {
    if (!this.originalProfile) return false;

    const current = this.form.getRawValue();
    return (
      current.username !== this.originalProfile.username ||
      current.email !== this.originalProfile.email
    );
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
}
