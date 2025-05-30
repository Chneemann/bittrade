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
import { PrimaryButtonComponent } from '../../../shared/components/buttons/primary-button/primary-button.component';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { LoginLoadingState, LoginCredentials } from '../../models/auth.model';

@Component({
  selector: 'app-login',
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    PrimaryButtonComponent,
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent {
  form!: FormGroup<{
    email: FormControl<string>;
    password: FormControl<string>;
  }>;

  loadingState: LoginLoadingState = LoginLoadingState.None;
  public LoadingState = LoginLoadingState;

  emailFieldFocused: boolean = false;
  passwordFieldFocused: boolean = false;
  httpErrorMessage: string = '';

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.createLoginForm();
  }

  async onSubmit(): Promise<void> {
    if (this.form.invalid) return;

    const credentials = this.form.value as LoginCredentials;
    await this.performLogin(credentials, LoginLoadingState.UserSignIn);
  }

  async onGuestLogin(): Promise<void> {
    const guestCredentials: LoginCredentials = {
      email: environment.guestEmail,
      password: environment.guestPassword,
    };
    await this.performLogin(guestCredentials, LoginLoadingState.GuestSignIn);
  }

  get isSignInLoading(): boolean {
    return this.loadingState === LoginLoadingState.UserSignIn;
  }

  get isGuestLoading(): boolean {
    return this.loadingState === LoginLoadingState.GuestSignIn;
  }

  get isSignInButtonDisabled(): boolean {
    return this.form.invalid || this.isSignInLoading || this.isGuestLoading;
  }

  get isGuestLoginDisabled(): boolean {
    const email = this.form?.value.email ?? '';
    const password = this.form?.value.password ?? '';
    return email.length > 0 || password.length > 0;
  }

  get emailInputClasses() {
    return this.getInputClasses(
      this.form.controls.email,
      this.emailFieldFocused
    );
  }
  get passwordInputClasses() {
    return this.getInputClasses(
      this.form.controls.password,
      this.passwordFieldFocused
    );
  }

  getFormErrors(controlName: 'email' | 'password'): string[] {
    const control = this.form.controls[controlName];
    if (!(control.touched && control.dirty) || !control.errors) return [];

    return Object.entries(control.errors).map(([key]) => {
      switch (key) {
        case 'required':
          return `Please enter your ${controlName}`;
        case 'email':
          return 'This is not a valid email format';
        case 'minlength':
          return `${controlName} is too short, min 8 characters`;
        default:
          return 'Invalid input';
      }
    });
  }

  private async performLogin(
    credentials: LoginCredentials,
    loadingKey: Exclude<LoginLoadingState, LoginLoadingState.None>
  ): Promise<void> {
    this.loadingState = loadingKey;
    this.form.disable();

    try {
      await firstValueFrom(this.authService.login(credentials));
      await this.router.navigate(['/home/']);
    } catch (error: unknown) {
      this.httpErrorMessage = this.extractErrorMessage(error);
    } finally {
      this.loadingState = LoginLoadingState.None;
      this.form.enable();
    }
  }

  private extractErrorMessage(error: unknown): string {
    if (error instanceof Error) {
      return error.message;
    }
    return 'Unknown error';
  }

  private createLoginForm(): void {
    this.form = this.formBuilder.nonNullable.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
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
}
