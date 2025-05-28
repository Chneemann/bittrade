export enum LoginLoadingState {
  None = 'none',
  UserSignIn = 'userSignIn',
  GuestSignIn = 'guestSignIn',
}

export interface LoginCredentials {
  email: string;
  password: string;
}
