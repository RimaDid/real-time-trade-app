import { Stock } from './../../models/stock';
import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';

@Component({
  selector: 'app-stock',
  templateUrl: './stock.component.html',
  styleUrls: ['./stock.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class StockComponent implements OnInit, OnChanges {
  @Input() stock!: Stock | null;

  @Output() unsubscribeStock = new EventEmitter();

  priceActivity = 0;

  positivePriceActivity = false;

  constructor() { }

  ngOnInit(): void {
  }

  ngOnChanges(changes: SimpleChanges): void {
    if(changes.stock) {
      this.priceActivity = this.priceActivityInPrecentage();
    }
  }

  private priceActivityInPrecentage(): number {
    if(!this.stock || !this.stock.previousPrice) {
      return 0.00;
    }
    const diff = this.stock.price - this.stock.previousPrice;
    this.positivePriceActivity =  diff > 0;
    return diff * 100 / this.stock.previousPrice;
  }

  parceNumber(num: number | undefined): string {
    if (num === undefined) {
      return'-';
    }
    const strNum = num.toString();
    return parseFloat(strNum).toFixed(2);
  }

}
