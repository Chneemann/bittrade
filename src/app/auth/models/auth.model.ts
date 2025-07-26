export enum AuthLoadingState {
  None = 'none',
  UserSignIn = 'userSignIn',
  GuestSignIn = 'guestSignIn',
  UserSignUp = 'userSignUp',
}

// Login

export interface LoginForm {
  email: string;
  password: string;
}

export const LOGIN_FORM_FIELDS = {
  email: 'email',
  password: 'password',
} as const;

export const LOGIN_FIELD_LABELS = {
  email: 'Email Address',
  password: 'Password',
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
