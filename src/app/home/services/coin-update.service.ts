import { Injectable } from '@angular/core';
import {
  map,
  Observable,
  timer,
  shareReplay,
  of,
  switchMap,
  concat,
  BehaviorSubject,
  filter,
} from 'rxjs';

@Injectable({ providedIn: 'root' })
export class CoinUpdateService {
  private readonly COOLDOWN_MS = 60 * 60 * 1000; // 1 hour

  private lastUpdateSubject = new BehaviorSubject<number | null>(null);
  lastUpdate$ = this.lastUpdateSubject.asObservable();

  constructor() {}

  public setLastUpdate(timestamp: number) {
    this.lastUpdateSubject.next(timestamp);
  }

  public canUpdate(): Observable<boolean> {
    return this.lastUpdate$.pipe(
      filter((last): last is number => last !== null),
      switchMap((last) => {
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

  public getCooldownRemaining(): Observable<number> {
    return this.lastUpdate$.pipe(
      filter((last): last is number => last !== null),
      switchMap((last) =>
        timer(0, 1000).pipe(
          map(() => {
            const timeElapsed = Date.now() - last;
            const timeLeft = this.COOLDOWN_MS - timeElapsed;
            return timeLeft > 0 ? Math.ceil(timeLeft / 1000) : 0;
          })
        )
      )
    );
  }

  public getLastUpdateTimestamp(): Observable<number> {
    return this.lastUpdate$.pipe(
      filter((last): last is number => last !== null)
    );
  }

  public triggerUpdatePrices(): void {
    // TODO
  }
}
