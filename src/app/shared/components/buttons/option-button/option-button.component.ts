import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-option-button',
  imports: [],
  templateUrl: './option-button.component.html',
  styleUrl: './option-button.component.scss',
})
export class OptionButtonComponent {
  @Input() options: { value: any; label: string; mobileLabel?: string }[] = [];
  @Input() selectedValue: any;

  @Output() selectionChange = new EventEmitter<any>();

  onSelect(value: any) {
    this.selectionChange.emit(value);
  }
}
