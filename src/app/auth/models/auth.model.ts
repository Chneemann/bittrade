export enum AuthLoadingState {
  None = 'none',
  UserSignIn = 'userSignIn',
  GuestSignIn = 'guestSignIn',
  UserSignUp = 'userSignUp',
  ForgotPassword = 'forgotPassword',
}

// Login

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface LoginForm {
  email: string;
  password: string;
  remember: boolean;
}

export const LOGIN_FORM_FIELDS = {
  email: 'email',
  password: 'password',
  remember: 'remember',
} as const;

export const LOGIN_FIELD_LABELS = {
  email: 'Email Address',
  password: 'Password',
  remember: 'Remember me',
} as const;

export type LoginFormField = keyof typeof LOGIN_FORM_FIELDS;

// Register

export interface RegisterCredentials {
  username: string;
  email: string;
  password: string;
}

export interface RegisterForm {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export const REGISTER_FORM_FIELDS = {
  username: 'username',
  email: 'email',
  password: 'password',
  confirmPassword: 'confirmPassword',
} as const;

export const REGISTER_FIELD_LABELS = {
  username: 'Username',
  email: 'Email Address',
  password: 'Password',
  confirmPassword: 'Confirm Password',
} as const;

export type RegisterFormField = keyof typeof REGISTER_FORM_FIELDS;

// Forgot Password

export interface ForgotPasswordCredentials {
  email: string;
}

export interface ForgotPasswordForm {
  email: string;
}

export const FORGOT_PASSWORD_FORM_FIELDS = {
  email: 'email',
} as const;

export const FORGOT_PASSWORD_FIELD_LABELS = {
  email: 'Email Address',
} as const;

export type ForgotPasswordFormField = keyof typeof FORGOT_PASSWORD_FORM_FIELDS;
