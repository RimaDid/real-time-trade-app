import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http'
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { Stock } from '../models/stock';

export type  Isin= {
  isin : string[]
};

@Injectable({
  providedIn: 'root'
})
export class IsinDataService {
  readonly url ='./assets/isin.json'

  private subscribedIsins = new BehaviorSubject<Stock[]>([]);

  get subscribedIsins$(): Observable<Stock[]> {
    return this.subscribedIsins.asObservable();
  }

  constructor(private http: HttpClient) { }


  /**
   * List of predefined ISINs
   */
  getISINList(): Observable<string[]> {
    return this.http.get<Isin>(this.url).pipe(
     map((isin: any) => isin.isin as string[]),
     catchError(_ => throwError('Error occured while fetching isins')),
    );
  }

  /**
   * Add a newly subscribed or update and existing stock
   * @param newStockUpdate new update reveived from the websoket of a subscribed isin
   */
  updateSubscribedIsins(newStockUpdate: Stock): void {
    const subscribedIsinsStock = this.subscribedIsins.getValue();
    const stockIndex = subscribedIsinsStock.findIndex((stock) => stock.isin === newStockUpdate.isin);
    if(stockIndex > -1) {
      subscribedIsinsStock[stockIndex] = {previousPrice: subscribedIsinsStock[stockIndex].price, ...newStockUpdate};
    } else {
      subscribedIsinsStock.push(newStockUpdate);
    }
    this.subscribedIsins.next(subscribedIsinsStock);
  }

  /**
   * Delete a stock from the subscribed Isisn list
   * @param isin the isin of the unsubscribed stock
   */
  unsusbscribeIsins(isin: string): void {
    const subscribedIsinsStock = this.subscribedIsins.getValue().filter((stock) => stock.isin !== isin);
    this.subscribedIsins.next(subscribedIsinsStock);
  }
}
