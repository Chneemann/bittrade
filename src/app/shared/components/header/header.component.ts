import { Component } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { filter, Subject, takeUntil } from 'rxjs';
import { IconButtonComponent } from '../buttons/icon-button/icon-button.component';

@Component({
  selector: 'app-header',
  imports: [IconButtonComponent],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
})
export class HeaderComponent {
  currentPath: string = '';
  showBackButton: boolean = false;

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

  goBack(): void {
    if (!this.showBackButton) return;
    window.history.back();
  }

  get title(): string {
    const titles: { [key: string]: string } = {
      'home/market': 'Market',
    };

    return titles[this.currentPath] || 'Seite';
  }
}
