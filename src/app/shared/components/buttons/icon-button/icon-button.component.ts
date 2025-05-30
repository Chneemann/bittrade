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
  @Input() hidden?: boolean = false;
  @Input() disabled?: boolean = false;

  VALID_ICONS = ['back', 'refresh'];

  isValidIcon(): boolean {
    return this.VALID_ICONS.includes(this.icon);
  }

  getIconPath(): string {
    return `assets/img/small-button/${this.icon}.svg`;
  }
}
