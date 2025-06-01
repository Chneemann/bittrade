import { Injectable } from '@angular/core';
import {
  map,
  Observable,
  startWith,
  Subject,
  timer,
  shareReplay,
  of,
  switchMap,
  concat,
} from 'rxjs';

@Injectable({ providedIn: 'root' })
export class CoinUpdateService {
  private readonly COOLDOWN_MS = 60 * 60 * 1000; // 1 hour

  private readonly updatePricesSubject = new Subject<void>();
  readonly updatePrices$ = this.updatePricesSubject.asObservable();

  constructor() {}

  private getTimestamp(storageKey: string): number | null {
    try {
      const val = localStorage.getItem(storageKey);
      if (!val) return null;
      const parsedData = JSON.parse(val);
      return parsedData.timestamp ?? null;
    } catch {
      return null;
    }
  }

  public canUpdate(storageKey: string): Observable<boolean> {
    return this.updatePrices$.pipe(
      startWith(null),
      switchMap(() => {
        const last = this.getTimestamp(storageKey);
        if (!last) return of(false);

        const elapsed = Date.now() - last;
        return elapsed >= this.COOLDOWN_MS
          ? of(true)
          : concat(
              of(false),
              timer(this.COOLDOWN_MS - elapsed).pipe(map(() => true))
            );
      }),
      shareReplay({ bufferSize: 1, refCount: true })
    );
  }

  public getCooldownRemaining(storageKey: string): Observable<number> {
    return timer(0, 1000).pipe(
      map(() => {
        const lastUpdate = this.getTimestamp(storageKey);
        if (!lastUpdate) return 0;
        const timeElapsed = Date.now() - lastUpdate;
        const timeLeft = this.COOLDOWN_MS - timeElapsed;
        return timeLeft > 0 ? Math.ceil(timeLeft / 1000) : 0;
      })
    );
  }

  public getLastUpdateTimestamp(storageKey: string): Observable<number | null> {
    return this.updatePrices$.pipe(
      startWith(null),
      map(() => this.getTimestamp(storageKey))
    );
  }

  public triggerUpdatePrices(storageKey: string): void {
    const now = Date.now();
    const last = this.getTimestamp(storageKey);
    const elapsedSinceLast = last ? now - last : this.COOLDOWN_MS;

    if (elapsedSinceLast >= this.COOLDOWN_MS) {
      localStorage.setItem(storageKey, JSON.stringify({ timestamp: now }));
      this.updatePricesSubject.next();
    }
  }
}
