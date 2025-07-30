export enum AuthLoadingState {
  None = 'none',
  UserSignIn = 'userSignIn',
  GuestSignIn = 'guestSignIn',
  UserSignUp = 'userSignUp',
  ForgotPassword = 'forgotPassword',
}

export enum FieldNames {
  Email = 'email',
  Password = 'password',
  ConfirmPassword = 'confirmPassword',
  Username = 'username',
  Remember = 'remember',
}

export const AUTH_FIELD_LABELS: Record<FieldNames, string> = {
  [FieldNames.Username]: 'Username',
  [FieldNames.Email]: 'Email Address',
  [FieldNames.Password]: 'Password',
  [FieldNames.ConfirmPassword]: 'Confirm Password',
  [FieldNames.Remember]: 'Remember Me',
};

type FormFields<T> = keyof T;

// --- Login ---

export interface LoginForm {
  readonly email: string;
  readonly password: string;
  readonly remember: boolean;
}

export type LoginCredentials = Omit<LoginForm, 'remember'>;

export const LOGIN_FORM_FIELDS = {
  email: FieldNames.Email,
  password: FieldNames.Password,
  remember: FieldNames.Remember,
} as const;

export type LoginFormField = FormFields<typeof LOGIN_FORM_FIELDS>;

// --- Register ---

export interface RegisterForm {
  readonly username: string;
  readonly email: string;
  readonly password: string;
  readonly confirmPassword: string;
}

export type RegisterCredentials = Omit<RegisterForm, 'confirmPassword'>;

export const REGISTER_FORM_FIELDS = {
  username: FieldNames.Username,
  email: FieldNames.Email,
  password: FieldNames.Password,
  confirmPassword: FieldNames.ConfirmPassword,
} as const;

export type RegisterFormField = FormFields<typeof REGISTER_FORM_FIELDS>;

// --- Password Reset: Request (forgot password) ---

export interface PasswordResetRequestForm {
  readonly email: string;
}

export type PasswordResetRequestCredentials = PasswordResetRequestForm;

export const PASSWORD_RESET_REQUEST_FORM_FIELDS = {
  email: FieldNames.Email,
} as const;

export type PasswordResetRequestFormField = FormFields<
  typeof PASSWORD_RESET_REQUEST_FORM_FIELDS
>;

// --- Password Reset: Confirm (set new password) ---

export interface PasswordResetConfirmForm {
  readonly password: string;
  readonly confirmPassword: string;
}

export type PasswordResetConfirmCredentials = PasswordResetConfirmForm;

export const PASSWORD_RESET_CONFIRM_FORM_FIELDS = {
  password: FieldNames.Password,
  confirmPassword: FieldNames.ConfirmPassword,
} as const;

export type PasswordResetConfirmFormField = FormFields<
  typeof PASSWORD_RESET_CONFIRM_FORM_FIELDS
>;
