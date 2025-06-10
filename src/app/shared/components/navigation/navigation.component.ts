import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { NavigationEnd, Router, RouterModule } from '@angular/router';
import { filter, Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-navigation',
  imports: [CommonModule, RouterModule],
  templateUrl: './navigation.component.html',
  styleUrl: './navigation.component.scss',
})
export class NavigationComponent implements OnInit, OnDestroy {
  currentPath: string = '';

  private destroy$ = new Subject<void>();

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.getCurrentPath();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  getCurrentPath(): void {
    this.currentPath = this.router.url.substring(1);
    this.router.events
      .pipe(
        filter((event) => event instanceof NavigationEnd),
        takeUntil(this.destroy$)
      )
      .subscribe(() => {
        this.currentPath = this.router.url.substring(1);
      });
  }
}
