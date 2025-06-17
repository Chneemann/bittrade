import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { PrimaryButtonComponent } from '../../../../shared/components/buttons/primary-button/primary-button.component';

@Component({
  selector: 'app-deposit-withdraw',
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    PrimaryButtonComponent,
  ],
  templateUrl: './deposit-withdraw.component.html',
  styleUrl: './deposit-withdraw.component.scss',
})
export class DepositWithdrawComponent implements OnInit {
  amountControl = new FormControl('100');

  balance = 1000;
  min = 10;
  max = 10000;
  mode: 'deposit' | 'withdraw' = 'deposit';

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.updateMode();
  }

  get rawAmount(): string {
    return this.amountControl.value ?? '0';
  }

  get amount(): number {
    return parseFloat(this.rawAmount.replace(/,/g, '')) || 0;
  }

  get displayValue(): string {
    return this.amount.toLocaleString('en-US');
  }

  get isInvalid(): boolean {
    return this.amount < this.min || this.amount > this.max;
  }

  get formattedAmount(): string {
    return this.amount.toLocaleString('en-US');
  }

  updateMode() {
    this.mode = this.router.url.includes('withdraw') ? 'withdraw' : 'deposit';
  }

  onInputChange(event: Event) {
    const input = (event.target as HTMLInputElement).value.replace(
      /[^0-9]/g,
      ''
    );
    this.amountControl.setValue(input);
  }

  onBlur() {
    if (this.amount < this.min) {
      this.amountControl.setValue(this.min.toString());
    } else if (this.amount > this.max) {
      this.amountControl.setValue(this.max.toString());
    }
  }

  blockNonNumeric(event: KeyboardEvent) {
    const allowedKeys = [
      'Backspace',
      'Delete',
      'ArrowLeft',
      'ArrowRight',
      'Tab',
    ];
    if (
      allowedKeys.includes(event.key) ||
      (event.ctrlKey && ['a', 'c', 'v', 'x'].includes(event.key.toLowerCase()))
    ) {
      return;
    }

    if (!/^[0-9]$/.test(event.key)) {
      event.preventDefault();
    }
  }

  applyPercentage(percent: number) {
    if (percent === 0) {
      this.amountControl.setValue(this.min.toString());
      return;
    }

    const base = this.mode === 'deposit' ? this.max : this.balance;
    const value = Math.floor((base * percent) / 100);
    this.amountControl.setValue(value.toString());
  }

  submit() {
    if (!this.isInvalid) {
      console.log(`${this.mode.toUpperCase()}: $${this.formattedAmount}`);
      this.amountControl.setValue('0');
    }
  }
}
