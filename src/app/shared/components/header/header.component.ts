import { Component } from '@angular/core';
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
import { CoinListResponse } from '../../../home/models/coin.model';
import { CoinsService } from '../../../home/services/coins.service';
import { TooltipDirective } from '../../../core/directives/tooltip.directive';

type RouteConfig = {
  dataKey: string;
  title: string;
  icon?: string;
};

@Component({
  selector: 'app-header',
  imports: [CommonModule, IconButtonComponent, TooltipDirective],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
})
export class HeaderComponent {
  currentPath: string = '';
  showRefreshButton: boolean = false;

  private destroy$ = new Subject<void>();
  canUpdate$!: Observable<boolean>;
  cooldownRemaining$!: Observable<number>;
  lastUpdateTimestamp$!: Observable<number | null>;
  refreshTooltipText$!: Observable<string>;

  private readonly routeConfigs: { [path: string]: RouteConfig } = {
    'home/market': {
      dataKey: 'cachedCoinPrices',
      title: 'Market',
    },
  };

  constructor(
    private router: Router,
    private coinsService: CoinsService,
    private coinUpdateService: CoinUpdateService
  ) {}

  ngOnInit(): void {
    this.subscribeToRouteChanges();
    this.loadAndProcessCoinList();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private subscribeToRouteChanges(): void {
    this.router.events
      .pipe(
        filter((event) => event instanceof NavigationEnd),
        startWith(this.router.url),
        takeUntil(this.destroy$)
      )
      .subscribe(() => {
        this.currentPath = this.router.url.substring(1);
        this.updateObservables();
      });
  }

  private loadAndProcessCoinList(): void {
    this.loadCoinList()
      .pipe(
        takeUntil(this.destroy$),
        tap((response) => {
          this.addCoinsFromList(response);
          this.updateObservables();
        })
      )
      .subscribe();
  }

  private loadCoinList(): Observable<CoinListResponse> {
    return this.coinsService
      .getCoinList()
      .pipe(shareReplay({ bufferSize: 1, refCount: true }));
  }

  private addCoinsFromList(response: CoinListResponse): void {
    response.forEach((coin) => {
      const cleanName = coin.name.trim().toLowerCase();
      const path = `home/coin/${cleanName}`;
      this.routeConfigs[path] = {
        dataKey: `cachedCoin${coin.name}`,
        title: `${coin.name} (${coin.symbol})`,
        icon: cleanName,
      };
    });
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
      const [, config] = matching;
      const key = config.dataKey;

      this.canUpdate$ = this.coinUpdateService.canUpdate(key);
      this.cooldownRemaining$ =
        this.coinUpdateService.getCooldownRemaining(key);
      this.lastUpdateTimestamp$ =
        this.coinUpdateService.getLastUpdateTimestamp(key);
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
    if (!config) return;
    this.coinUpdateService.triggerUpdatePrices(config.dataKey);
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
    const backButtonPaths = ['home/coin'];
    return backButtonPaths.some(
      (path) =>
        this.currentPath === path || this.currentPath.startsWith(path + '/')
    );
  }
}
