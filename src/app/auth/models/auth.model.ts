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
