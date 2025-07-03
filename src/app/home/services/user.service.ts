import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BackendApiService } from '../../core/services/backend-api.service';
import { UserProfile } from '../models/user.model';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  constructor(private backendApi: BackendApiService) {}

  getProfile(): Observable<UserProfile> {
    return this.backendApi.get<UserProfile>('/auth/me/');
  }
}
