import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-selection-tabs',
  imports: [CommonModule],
  templateUrl: './selection-tabs.component.html',
  styleUrl: './selection-tabs.component.scss',
})
export class SelectionTabsComponent {
  @Input() options: string[] = [];
  @Input() activeOption: string = '';

  @Output() optionSelected = new EventEmitter<string>();

  selectOption(option: string) {
    this.activeOption = option;
    this.optionSelected.emit(option);
  }
}
