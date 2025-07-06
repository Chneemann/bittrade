import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { BackendApiService } from '../../core/services/backend-api.service';
import { UserProfile } from '../models/user.model';
import { switchMap, take, tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private userProfileSubject = new BehaviorSubject<UserProfile | null>(null);
  public userProfile$ = this.userProfileSubject.asObservable();

  constructor(private backendApi: BackendApiService) {}

  getProfile(): Observable<UserProfile> {
    return this.backendApi
      .get<UserProfile>('/auth/me/')
      .pipe(tap((profile) => this.userProfileSubject.next(profile)));
  }

  loadProfile(): Observable<UserProfile | null> {
    return this.userProfile$.pipe(
      take(1),
      switchMap((profile) => {
        if (!profile) return this.getProfile();
        return of(profile);
      })
    );
  }

  updateProfile(updatedProfile: Partial<UserProfile>): Observable<UserProfile> {
    return this.backendApi
      .patch<UserProfile, Partial<UserProfile>>(
        '/auth/me/update/',
        updatedProfile
      )
      .pipe(tap((profile) => this.userProfileSubject.next(profile)));
  }

  setProfile(profile: UserProfile): void {
    this.userProfileSubject.next(profile);
  }

  clearProfile(): void {
    this.userProfileSubject.next(null);
  }
}
