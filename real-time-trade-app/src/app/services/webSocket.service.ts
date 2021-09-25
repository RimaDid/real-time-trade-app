import { IsinDataService } from './isin-data.service';
import { Injectable } from '@angular/core';
import { webSocket, WebSocketSubject } from 'rxjs/webSocket';
import { environment } from '../../environments/environment';
import { Observable, timer, Subject, EMPTY, BehaviorSubject } from 'rxjs';
import { retryWhen, tap, delayWhen, switchAll, catchError, first } from 'rxjs/operators';

export const WS_ENDPOINT = environment.wsEndpoint;
export const RECONNECT_INTERVAL = environment.reconnectInterval;

@Injectable({
  providedIn: 'root'
})
export class WebSocketService {

  private socket$: WebSocketSubject<unknown> | undefined = undefined;
  private messagesSubject$ = new Subject<any>();
  public messages$ = this.messagesSubject$.pipe(switchAll(), catchError(e => { throw e }));

  private retryError = new BehaviorSubject<boolean>(false);
  public retryError$ = this.retryError.asObservable();
  

  constructor(private isinService: IsinDataService) {
  }


  /**
   * Creates a new WebSocket subject and send it to the messages subject
   * @param cfg if true the observable will be retried.
   */
  public connect(cfg: { reconnect: boolean } = { reconnect: false }): void {
    if (!this.socket$ || this.socket$.closed) {
      this.socket$ = this.getNewWebSocket(cfg.reconnect);
      const messages = this.socket$.pipe(
        cfg.reconnect ? this.reconnect : (o) => o,
        tap({
          error: error => console.log(error),
        }), 
        catchError(_ => EMPTY));
      this.messagesSubject$.next(messages);
    }
  }

  /**
   * Retry a given observable by a time span
   * @param observable the observable to be retried
   */
  private reconnect(observable: Observable<any>): Observable<any> {
    return observable.pipe(
        retryWhen((errors) => errors.pipe(
            tap((val) => {
              console.log('[WebSocketService] Try to reconnect', val, this);
            }),
            delayWhen((_) => timer(RECONNECT_INTERVAL)),
        )),
    );
  }

  close(): void {
    this.socket$?.complete();
    this.socket$ = undefined;
  }

  sendMessage(msg: any): void {
    this.socket$?.next(msg);
  }

  /**
   * Return a custom WebSocket subject which reconnects after failure
   */
  private getNewWebSocket(attemptToReconnect = false): WebSocketSubject<unknown> {
    return webSocket({
      url: WS_ENDPOINT,
      openObserver: {
        next: () => {
          console.log('[WebSocketService]: connection ok');
          if (attemptToReconnect) {
            this.retryError.next(false);
            console.log('connected after retry')
            this.maintainSubscription();
          }
        }
      },
      closeObserver: {
        next: () => {
          console.log('[WebSocketService]: connection closed');
          this.socket$ = undefined;
          this.connect({ reconnect: true});
          this.retryError.next(true);
        },
      },

    });
  }

  private maintainSubscription(): void {
    this.isinService.subscribedIsins$.pipe(first()).subscribe((stocks) => {
      stocks.forEach(({isin}) => this.sendMessage({"subscribe": isin}))
    });
  }

}