import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class AuthService {
  // TODO: implement real authentication
  isLoggedIn(): boolean {
    return true;
  }
}
