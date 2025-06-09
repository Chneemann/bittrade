import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-icon-button',
  imports: [],
  templateUrl: './icon-button.component.html',
  styleUrl: './icon-button.component.scss',
})
export class IconButtonComponent {
  @Input() icon: string = '';
  @Input() tooltip?: string = '';
  @Input() disabled?: boolean = false;

  VALID_ICONS = ['back', 'refresh', 'forward', 'search', 'close'];

  isValidIcon(): boolean {
    return this.VALID_ICONS.includes(this.icon);
  }

  getIconPath(): string {
    return `assets/img/icon-button/${this.icon}.svg`;
  }
}
