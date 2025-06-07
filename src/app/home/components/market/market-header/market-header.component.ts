import {
  Component,
  ElementRef,
  HostListener,
  Input,
  ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-market-header',
  imports: [CommonModule],
  templateUrl: './market-header.component.html',
  styleUrl: './market-header.component.scss',
})
export class MarketHeaderComponent {
  @ViewChild('searchBox') searchBoxRef!: ElementRef;

  @Input() averageChange24h: number | null = null;

  private _searchActive = false;

  toggleSearch(): void {
    this.searchActive = !this.searchActive;
  }

  @HostListener('document:click', ['$event'])
  onOutsideClick(event: MouseEvent): void {
    if (!this.searchBoxRef.nativeElement.contains(event.target)) {
      this.searchActive = false;
    }
  }

  get searchActive(): boolean {
    return this._searchActive;
  }

  set searchActive(value: boolean) {
    if (this._searchActive !== value) {
      this._searchActive = value;
    }
  }

  get hideHeadline(): boolean {
    const width = typeof window !== 'undefined' ? window.innerWidth : 1000;
    return this._searchActive && width < 450;
  }

  get averageChangeClass(): string {
    if (this.averageChange24h === null) return '';
    return this.averageChange24h < 0 ? 'text-red' : 'text-green';
  }
}
