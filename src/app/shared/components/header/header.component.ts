import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import {
  combineLatest,
  filter,
  map,
  Observable,
  of,
  shareReplay,
  startWith,
  Subject,
  takeUntil,
  tap,
} from 'rxjs';
import { IconButtonComponent } from '../buttons/icon-button/icon-button.component';
import { CoinUpdateService } from '../../../home/services/coin-update.service';
import { CommonModule } from '@angular/common';
import { CoinList, CoinListResponse } from '../../../home/models/coin.model';
import { CoinListService } from '../../../home/services/coin-list.service';
import { TooltipDirective } from '../../../core/directives/tooltip.directive';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

type RouteConfig = {
  dataKey: string | null;
  title: string;
  icon?: string;
};

@Component({
  selector: 'app-header',
  imports: [CommonModule, IconButtonComponent, TooltipDirective],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
})
export class HeaderComponent implements OnInit {
  private destroyRef = inject(DestroyRef);

  currentPath: string = '';
  showRefreshButton: boolean = false;

  lastUpdate$!: Observable<number | null>;

  canUpdate$!: Observable<boolean>;
  cooldownRemaining$!: Observable<number>;
  lastUpdateTimestamp$!: Observable<number | null>;
  refreshTooltipText$!: Observable<string>;
  emptyTooltip$ = of('');

  private readonly routeConfigs: { [path: string]: RouteConfig } = {
    'home/market': {
      dataKey: 'cachedCoinPrices',
      title: 'Market',
    },
    'home/portfolio': {
      dataKey: 'cachedCoinPrices',
      title: 'Portfolio',
    },
    'home/history': {
      dataKey: null,
      title: 'Transaction History',
    },
    'home/profile/edit': {
      dataKey: null,
      title: 'Edit Profile',
    },
    'home/profile': {
      dataKey: null,
      title: 'Profile',
    },
    'home/deposit': {
      dataKey: null,
      title: 'Deposit',
    },
    'home/withdraw': {
      dataKey: null,
      title: 'Withdraw',
    },
    'home/legal-notice': {
      dataKey: null,
      title: 'Legal Notice',
    },
    'home/privacy-policy': {
      dataKey: null,
      title: 'Privacy Policy',
    },
  };

  constructor(
    private router: Router,
    private coinListService: CoinListService,
    private coinUpdateService: CoinUpdateService
  ) {}

  ngOnInit(): void {
    this.lastUpdate$ = this.coinUpdateService.lastUpdate$;
    this.subscribeToRouteChanges();
    this.loadAndProcessCoinList();
  }

  private subscribeToRouteChanges(): void {
    this.router.events
      .pipe(
        filter((event) => event instanceof NavigationEnd),
        startWith(this.router.url),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(() => {
        this.currentPath = this.router.url.substring(1);
        this.updateObservables();
      });
  }

  private loadAndProcessCoinList(): void {
    this.loadCoinList()
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        tap((response) => {
          response.forEach((coin) => {
            this.addCoinRoute(coin);
          });
        })
      )
      .subscribe();
  }

  private addCoinRoute(coin: CoinList): void {
    const cleanName = coin.name.trim().toLowerCase();
    const paths = [
      `home/coin/${cleanName}`,
      `home/coin/transactions/${cleanName}`,
      `home/buy/${cleanName}`,
      `home/sell/${cleanName}`,
    ];

    for (const path of paths) {
      this.routeConfigs[path] = {
        dataKey: `cachedCoin${coin.name}`,
        title: `${coin.name} (${coin.symbol})`,
        icon: cleanName,
      };
    }
  }

  private loadCoinList(): Observable<CoinListResponse> {
    return this.coinListService
      .getCoinList()
      .pipe(shareReplay({ bufferSize: 1, refCount: true }));
  }

  private findMatchingConfig(): [string, RouteConfig] | undefined {
    return Object.entries(this.routeConfigs).find(
      ([key]) =>
        this.currentPath === key || this.currentPath.startsWith(key + '/')
    );
  }

  private updateObservables(): void {
    const matching = this.findMatchingConfig();
    this.showRefreshButton = !!matching;

    if (matching) {
      this.canUpdate$ = this.coinUpdateService.canUpdate();
      this.cooldownRemaining$ = this.coinUpdateService.getCooldownRemaining();
      this.lastUpdateTimestamp$ =
        this.coinUpdateService.getLastUpdateTimestamp();
      this.refreshTooltipText$ = this.tooltipText();
    } else {
      this.canUpdate$ = of(false);
      this.cooldownRemaining$ = of(0);
      this.lastUpdateTimestamp$ = of(null);
      this.refreshTooltipText$ = of('');
    }
  }

  tooltipText(): Observable<string> {
    return combineLatest([
      this.cooldownRemaining$,
      this.lastUpdateTimestamp$,
    ]).pipe(
      map(([cooldown, timestamp]) => {
        const lastUpdated = timestamp
          ? new Date(timestamp).toLocaleString()
          : 'never';
        return cooldown === 0
          ? `You're good to go – click to update!<br><i>Last updated: ${lastUpdated}</i>`
          : `You can update in ${cooldown} seconds.<br><i>Last updated: ${lastUpdated}</i>`;
      })
    );
  }

  onUpdatePricesClick(): void {
    const config = this.findMatchingConfig()?.[1];
    if (!config || !config.dataKey) return;
    this.coinUpdateService.triggerUpdatePrices();
  }

  goHistoryBack(): void {
    if (!this.showBackButton) return;
    window.history.back();
  }

  get routeTitle(): string | undefined {
    return this.findMatchingConfig()?.[1].title;
  }

  get routeIcon(): string | undefined {
    return this.findMatchingConfig()?.[1].icon;
  }

  get showBackButton(): boolean {
    const backButtonPaths = [
      'home/coin',
      'home/coin/transactions',
      'home/deposit',
      'home/withdraw',
      'home/buy',
      'home/sell',
      'home/legal-notice',
      'home/privacy-policy',
      'home/profile/edit',
    ];
    return backButtonPaths.some(
      (path) =>
        this.currentPath === path || this.currentPath.startsWith(path + '/')
    );
  }
}
