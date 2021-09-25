import { IsinDataService } from './services/isin-data.service';
import { Stock } from './models/stock';
import { Component } from '@angular/core';
import { WebSocketService, RECONNECT_INTERVAL } from './services/webSocket.service';
import { debounceTime, map, takeUntil, tap } from 'rxjs/operators';
import { of, timer } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'Real Time Stock';
  toastr = this.wsService.retryError$;

  constructor(private wsService: WebSocketService) {
  }
}
