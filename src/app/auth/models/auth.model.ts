export enum LoginLoadingState {
  None = 'none',
  UserSignIn = 'userSignIn',
  GuestSignIn = 'guestSignIn',
  UserSignUp = 'userSignUp',
}

export interface LoginCredentials {
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

export type RegisterFormField = keyof typeof REGISTER_FORM_FIELDS;
