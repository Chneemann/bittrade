import { Component, Input } from '@angular/core';
import { PrimaryButtonComponent } from '../../buttons/primary-button/primary-button.component';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-success-modal',
  imports: [CommonModule, PrimaryButtonComponent],
  templateUrl: './success-modal.component.html',
  styleUrl: './success-modal.component.scss',
})
export class SuccessModalComponent {
  @Input() mode!: 'buy' | 'sell' | 'deposit' | 'withdraw';
  @Input() transactionResult: any;
  @Input() coinSymbol?: string;
  @Input() show: boolean = false;

  constructor(private router: Router) {}

  closeSuccess(): void {
    this.show = false;
  }

  goToPortfolio(): void {
    this.closeSuccess();
    this.router.navigate(['/home/portfolio/']);
  }

  get isBuyOrSell(): boolean {
    return this.mode === 'buy' || this.mode === 'sell';
  }

  get isDepositOrWithdraw(): boolean {
    return this.mode === 'deposit' || this.mode === 'withdraw';
  }
}
