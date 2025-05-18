import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-large-button',
  imports: [CommonModule],
  templateUrl: './large-button.component.html',
  styleUrl: './large-button.component.scss',
})
export class LargeButtonComponent {
  @Input() type: string = '';
  @Input() value: string = '';
  @Input() disabled: boolean = false;
}
