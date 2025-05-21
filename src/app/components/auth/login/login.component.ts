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
import { LargeButtonComponent } from '../../../shared/components/buttons/large-button/large-button.component';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    LargeButtonComponent,
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent {
  form!: FormGroup;

  isLoading = false;
  emailFieldFocused: boolean = false;
  passwordFieldFocused: boolean = false;

  constructor(private formBuilder: FormBuilder, private router: Router) {}

  ngOnInit(): void {
    this.createLoginForm();
  }

  async onSubmit(): Promise<void> {
    if (this.form.invalid) return;

    this.isLoading = true;
    this.form.disable();
    try {
      // TODO Login logic
      // await this.authService.login(credentials);
      this.router.navigate(['/home/']);
    } catch (error) {
      // Error handling
      this.form.reset();
    } finally {
      this.isLoading = false;
      this.form.enable();
    }
  }

  get emailInputClasses(): { [key: string]: boolean } {
    return this.getInputClasses(
      this.form.get('email') as FormControl,
      this.emailFieldFocused
    );
  }

  get passwordInputClasses(): { [key: string]: boolean } {
    return this.getInputClasses(
      this.form.get('password') as FormControl,
      this.passwordFieldFocused
    );
  }

  private createLoginForm(): void {
    this.form = this.formBuilder.group({
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

  getFormErrors(controlName: string): string[] {
    const control = this.form.get(controlName);
    if (!control || !control.errors || !(control.touched && control.dirty))
      return [];

    const errors: string[] = [];
    if (control.errors['required'])
      errors.push(`Please enter your ${controlName}`);
    if (control.errors['email'])
      errors.push('This is not a valid email format');
    if (control.errors['minlength'])
      errors.push(`${controlName} is too short, min 8 characters`);

    return errors;
  }
}
