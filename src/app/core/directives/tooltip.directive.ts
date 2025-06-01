import {
  Directive,
  ElementRef,
  Input,
  HostListener,
  OnDestroy,
  Renderer2,
} from '@angular/core';
import { Subscription, Observable } from 'rxjs';

@Directive({
  selector: '[appTooltip]',
  standalone: true,
})
export class TooltipDirective implements OnDestroy {
  @Input('appTooltip') tooltipText$!: Observable<string>;

  private tooltipElement: HTMLElement | null = null;
  private subscription: Subscription | null = null;

  constructor(private elRef: ElementRef, private renderer: Renderer2) {}

  @HostListener('mouseenter')
  onMouseEnter() {
    this.createTooltip();
  }

  @HostListener('mouseleave')
  onMouseLeave() {
    this.destroyTooltip();
  }

  @HostListener('window:scroll')
  @HostListener('window:resize')
  onScrollOrResize() {
    if (this.tooltipElement) {
      this.positionTooltip();
    }
  }

  ngOnDestroy() {
    this.destroyTooltip();
  }

  private createTooltip() {
    if (this.tooltipElement || !this.tooltipText$) return;

    const tooltip = this.renderer.createElement('div');
    this.renderer.setStyle(tooltip, 'position', 'absolute');

    this.renderer.setStyle(tooltip, 'width', '100%');
    this.renderer.setStyle(tooltip, 'max-width', '260px');

    this.renderer.setStyle(tooltip, 'padding', '4px 8px');
    this.renderer.setStyle(tooltip, 'border-radius', '4px');

    this.renderer.setStyle(tooltip, 'font-size', '14px');
    this.renderer.setStyle(tooltip, 'font-weight', '400');
    this.renderer.setStyle(tooltip, 'color', 'var(--color-font-primary)');
    this.renderer.setStyle(tooltip, 'background', 'var(--color-gray)');

    this.renderer.setStyle(tooltip, 'z-index', '1000');
    this.renderer.setStyle(tooltip, 'pointer-events', 'none');
    this.renderer.setStyle(tooltip, 'transition', 'opacity 0.2s ease-in-out');
    this.renderer.setStyle(tooltip, 'opacity', '0');

    this.renderer.setStyle(tooltip, 'white-space', 'normal');
    this.renderer.setStyle(tooltip, 'word-break', 'break-word');

    document.body.appendChild(tooltip);
    this.tooltipElement = tooltip;

    this.positionTooltip();
    this.renderer.setStyle(tooltip, 'opacity', '1');

    this.subscription = this.tooltipText$.subscribe((text) => {
      if (this.tooltipElement) {
        this.tooltipElement.innerHTML = text;
        this.positionTooltip();
      }
    });
  }

  private destroyTooltip() {
    if (this.tooltipElement) {
      this.renderer.setStyle(this.tooltipElement, 'opacity', '0');
      setTimeout(() => {
        if (this.tooltipElement) {
          this.tooltipElement.remove();
          this.tooltipElement = null;
        }
      }, 200);
    }
    this.subscription?.unsubscribe();
    this.subscription = null;
  }

  private positionTooltip() {
    if (!this.tooltipElement) return;

    const hostRect = this.elRef.nativeElement.getBoundingClientRect();
    this.renderer.setStyle(this.tooltipElement, 'display', 'block');
    const tooltipRect = this.tooltipElement.getBoundingClientRect();

    const viewportWidth =
      window.innerWidth || document.documentElement.clientWidth;
    const viewportHeight =
      window.innerHeight || document.documentElement.clientHeight;

    const scrollX = window.scrollX || window.pageXOffset;
    const scrollY = window.scrollY || window.pageYOffset;

    let top = hostRect.top - tooltipRect.height - 8;
    let left = hostRect.left + (hostRect.width - tooltipRect.width) / 2;

    if (top < 0) {
      top = hostRect.bottom + 8;
    }

    if (left + tooltipRect.width > viewportWidth) {
      left = viewportWidth - tooltipRect.width - 8;
    }

    if (left < 0) {
      left = 8;
    }

    if (top + tooltipRect.height > viewportHeight + scrollY) {
      top = viewportHeight + scrollY - tooltipRect.height - 8;
      if (top < scrollY) {
        top = scrollY + 8;
      }
    }

    this.renderer.setStyle(this.tooltipElement, 'top', `${top + scrollY}px`);
    this.renderer.setStyle(this.tooltipElement, 'left', `${left + scrollX}px`);
  }
}
