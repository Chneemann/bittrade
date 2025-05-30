import { CommonModule } from '@angular/common';
import {
  Component,
  Input,
  OnChanges,
  SimpleChanges,
  OnDestroy,
  ChangeDetectionStrategy,
} from '@angular/core';
import { BehaviorSubject, Subscription, timer } from 'rxjs';

@Component({
  selector: 'app-primary-button',
  imports: [CommonModule],
  templateUrl: './primary-button.component.html',
  styleUrl: './primary-button.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PrimaryButtonComponent implements OnChanges, OnDestroy {
  @Input() type: string = '';
  @Input() value: string = '';
  @Input() disabled: boolean = false;
  @Input() loading: boolean = false;
  @Input() loadingMessage: string = 'Loading...';

  displayedText$ = new BehaviorSubject<string>('');
  private subscription?: Subscription;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['loading']) {
      if (this.loading) {
        this.startLoadingAnimation();
      } else {
        this.stopLoadingAnimation();
        this.displayedText$.next(this.value);
      }
    }
  }

  startLoadingAnimation(): void {
    this.stopLoadingAnimation();

    const text = this.loadingMessage;
    let index = 0;

    this.subscription = timer(0, 100).subscribe(() => {
      this.displayedText$.next(text.slice(0, ++index));

      if (index === text.length) {
        this.subscription?.unsubscribe();
        setTimeout(() => this.loading && this.startLoadingAnimation(), 500);
      }
    });
  }

  stopLoadingAnimation(): void {
    this.subscription?.unsubscribe();
  }

  ngOnDestroy(): void {
    this.stopLoadingAnimation();
  }
}
