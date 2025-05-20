import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { LargeButtonComponent } from '../../../shared/components/buttons/large-button/large-button.component';

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
  form: FormGroup = new FormGroup({});

  emailFieldFocused: boolean = false;
  passwordFieldFocused: boolean = false;

  constructor(private formBuilder: FormBuilder) {}

  ngOnInit(): void {
    this.createLoginForm();
  }

  private createLoginForm(): void {
    this.form = this.formBuilder.group({
      email: ['', [Validators.required]],
      password: ['', Validators.required],
      keepLoggedIn: [false],
    });
  }

  async onSubmit(): Promise<void> {
    if (this.form.invalid) return;
    console.log(this.form.value);
  }
}
