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
  showRefreshButton: boolean = false;

  private destroy$ = new Subject<void>();
  canUpdate$!: Observable<boolean>;
  cooldownRemaining$!: Observable<number>;

  private readonly dataKeys: { [path: string]: string } = {
    'home/market': 'cachedCoinPrices',
    'home/coin/bitcoin': 'cachedCoinBitcoin',
  };

  private readonly titles: { [path: string]: string } = {
    'home/market': 'Market',
    'home/coin': 'Coin Detail',
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

  private findMatchingKey(map: { [key: string]: string }): string | undefined {
    return Object.keys(map).find(
      (key) =>
        this.currentPath === key || this.currentPath.startsWith(key + '/')
    );
  }

  private updateObservables(): void {
    const matchingKey = this.findMatchingKey(this.dataKeys);
    this.showRefreshButton = !!matchingKey;

    if (matchingKey) {
      const dataKey = this.dataKeys[matchingKey];
      this.canUpdate$ = this.coinUpdateService.canUpdate(dataKey);
      this.cooldownRemaining$ =
        this.coinUpdateService.getCooldownRemaining(dataKey);
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
    const matchingKey = this.findMatchingKey(this.dataKeys);
    if (!matchingKey) {
      return;
    }
    this.coinUpdateService.triggerUpdatePrices(this.dataKeys[matchingKey]);
  }

  goHistoryBack(): void {
    if (!this.showBackButton) return;
    window.history.back();
  }

  get title(): string | undefined {
    const matchingKey = this.findMatchingKey(this.titles);
    return matchingKey ? this.titles[matchingKey] : undefined;
  }

  get dataKey(): string | undefined {
    const matchingKey = this.findMatchingKey(this.dataKeys);
    return matchingKey ? this.dataKeys[matchingKey] : undefined;
  }

  get showBackButton(): boolean {
    const backButtonPaths = ['home/coin'];
    return backButtonPaths.some(
      (path) =>
        this.currentPath === path || this.currentPath.startsWith(path + '/')
    );
  }
}
