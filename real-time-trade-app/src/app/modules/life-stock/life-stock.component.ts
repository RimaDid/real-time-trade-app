import { AfterViewInit, Component, OnDestroy } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { tap, takeUntil, auditTime } from 'rxjs/operators';
import { Stock } from 'src/app/models/stock';
import { IsinDataService } from 'src/app/services/isin-data.service';
import { WebSocketService } from 'src/app/services/webSocket.service';

@Component({
  selector: 'app-life-stock',
  templateUrl: './life-stock.component.html',
  styleUrls: ['./life-stock.component.scss'],
})
export class LifeStockComponent implements AfterViewInit, OnDestroy {

  stocks: Stock[] = [];
  isinList$: Observable<string[]>;
  showInputField = false;
  validIsin = false;
  inputIsin = '';

  private ngDestroyed$ = new Subject<boolean>();

  constructor(private wsService: WebSocketService, private isinService: IsinDataService) {
    this.getStocks();
    this.isinList$ = this.isinService.getISINList();
    this.isinService.subscribedIsins$.pipe(takeUntil(this.ngDestroyed$)).subscribe((stocks) => {
      this.stocks = stocks;
    });
  }

  ngAfterViewInit(): void {
    this.wsService.connect();
  }

  ngOnDestroy(): void {
    this.ngDestroyed$.next(true);
    this.ngDestroyed$.complete();
  }

  getStocks(): void {
    this.wsService.messages$.pipe(
      takeUntil(this.ngDestroyed$),
      auditTime(2000),
      tap((messageEvent) => {
        const stockUpdate = messageEvent as Stock;
        this.isinService.updateSubscribedIsins(stockUpdate);
      }),
    ).subscribe();
    
  }

  subscribedIsin(isin: string): boolean {
    return this.stocks.find((stock) => stock.isin === isin) ?  true : false;
  }

  subscribeIsin(isin: string) {
    if(this.subscribedIsin(isin)) {
      return;
    }
    this.wsService.sendMessage({"subscribe": isin});
  }

  unsubscribeFromIsin(isin: string) {
    this.wsService.sendMessage({"unsubscribe": isin});
    setTimeout(() => {
      this.isinService.unsusbscribeIsins(isin);
    }, 2000);
  }

  validateIsin() {
    const regex = new RegExp('^(XS|AD|AE|AF|AG|AI|AL|AM|AO|AQ|AR|AS|AT|AU|AW|AX|AZ|BA|BB|BD|BE|BF|BG|BH|BI|BJ|BL|BM|BN|BO|BQ|BR|BS|BT|BV|BW|BY|BZ|CA|CC|CD|CF|CG|CH|CI|CK|CL|CM|CN|CO|CR|CU|CV|CW|CX|CY|CZ|DE|DJ|DK|DM|DO|DZ|EC|EE|EG|EH|ER|ES|ET|FI|FJ|FK|FM|FO|FR|GA|GB|GD|GE|GF|GG|GH|GI|GL|GM|GN|GP|GQ|GR|GS|GT|GU|GW|GY|HK|HM|HN|HR|HT|HU|ID|IE|IL|IM|IN|IO|IQ|IR|IS|IT|JE|JM|JO|JP|KE|KG|KH|KI|KM|KN|KP|KR|KW|KY|KZ|LA|LB|LC|LI|LK|LR|LS|LT|LU|LV|LY|MA|MC|MD|ME|MF|MG|MH|MK|ML|MM|MN|MO|MP|MQ|MR|MS|MT|MU|MV|MW|MX|MY|MZ|NA|NC|NE|NF|NG|NI|NL|NO|NP|NR|NU|NZ|OM|PA|PE|PF|PG|PH|PK|PL|PM|PN|PR|PS|PT|PW|PY|QA|RE|RO|RS|RU|RW|SA|SB|SC|SD|SE|SG|SH|SI|SJ|SK|SL|SM|SN|SO|SR|SS|ST|SV|SX|SY|SZ|TC|TD|TF|TG|TH|TJ|TK|TL|TM|TN|TO|TR|TT|TV|TW|TZ|UA|UG|UM|US|UY|UZ|VA|VC|VE|VG|VI|VN|VU|WF|WS|YE|YT|ZA|ZM|ZW)([0-9A-Z]{9})([0-9]{1})$');
    this.validIsin = regex.test(this.inputIsin);
  }

}
