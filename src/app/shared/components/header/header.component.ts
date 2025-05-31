import { Component } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { filter, Observable, of, Subject, takeUntil } from 'rxjs';
import { IconButtonComponent } from '../buttons/icon-button/icon-button.component';
import { CoinUpdateService } from '../../../home/services/coin-update.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-header',
  imports: [CommonModule, IconButtonComponent],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
})
export class HeaderComponent {
  currentPath: string = '';
  showBackButton: boolean = false;
  showRefreshButton: boolean = false;

  private destroy$ = new Subject<void>();
  canUpdate$!: Observable<boolean>;
  cooldownRemaining$!: Observable<number>;

  private readonly dataKeys: { [path: string]: string } = {
    'home/market': 'cachedCoinPrices',
  };

  constructor(
    private router: Router,
    private coinUpdateService: CoinUpdateService
  ) {}

  ngOnInit(): void {
    this.getCurrentPath();
    this.updateObservables();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private updateObservables(): void {
    const key = this.dataKeys[this.currentPath];
    this.showRefreshButton = !!key;

    if (key) {
      this.canUpdate$ = this.coinUpdateService.canUpdate(key);
      this.cooldownRemaining$ =
        this.coinUpdateService.getCooldownRemaining(key);
    } else {
      this.canUpdate$ = of(false);
      this.cooldownRemaining$ = of(0);
    }
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
        this.updateObservables();
      });
  }

  onUpdatePricesClick(): void {
    const key = this.dataKeys[this.currentPath];
    if (!key) {
      return;
    }
    this.coinUpdateService.triggerUpdatePrices(key);
  }

  goBack(): void {
    if (!this.showBackButton) return;
    window.history.back();
  }

  get title(): string {
    const titles: { [key: string]: string } = {
      'home/market': 'Market',
    };

    return titles[this.currentPath];
  }
}
