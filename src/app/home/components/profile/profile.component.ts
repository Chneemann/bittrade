import { Component, OnInit } from '@angular/core';
import { PrimaryButtonComponent } from '../../../shared/components/buttons/primary-button/primary-button.component';
import { RouterLink } from '@angular/router';
import { UserService } from '../../services/user.service';
import { Observable } from 'rxjs';
import { CommonModule } from '@angular/common';
import { UserProfile } from '../../models/user.model';
import { LoadingComponent } from '../../../shared/components/loading/loading.component';

@Component({
  selector: 'app-profile',
  imports: [CommonModule, RouterLink, PrimaryButtonComponent, LoadingComponent],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss',
})
export class ProfileComponent implements OnInit {
  userProfile$!: Observable<UserProfile | null>;

  constructor(private userService: UserService) {}

  ngOnInit(): void {
    this.userProfile$ = this.userService.userProfile$;
  }
}
