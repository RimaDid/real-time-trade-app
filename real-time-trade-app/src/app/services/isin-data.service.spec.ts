import { Stock } from './../models/stock';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

import { TestBed } from '@angular/core/testing';

import { Isin, IsinDataService } from './isin-data.service';

describe('IsinDataService', () => {
  let httpMock: HttpTestingController;
  let isinService: IsinDataService;


  beforeEach(() => {
    //Configures testing app module
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [IsinDataService]
    });

    //Instantaites HttpClient, HttpTestingController and IsinListService
    httpMock = TestBed.inject(HttpTestingController);
    isinService = TestBed.inject(IsinDataService);
  });

  afterEach(() => {
    httpMock.verify(); //Verifies that no requests are outstanding.
  });

  describe('#getIsisnsList', () => {
    let dummyIsins: Isin;
    beforeEach(() => {
      //Dummy data to be returned by request.
       dummyIsins = {
         isin: [
        "isin1",
        "isin2",
      ]};
    });

    it('should be created', () => {
      expect(isinService).toBeTruthy();
    });

    it('should return a list of ISINs by calling once', () => {
      isinService.getISINList().subscribe(
        (res) => {
          console.log("res", res)
          expect(res).toEqual(dummyIsins.isin, 'should return expected ISINs')},
        fail
      );

      const req = httpMock.expectOne(isinService.url);
      expect(req.request.method).toEqual('GET');

      req.flush(dummyIsins); //Return isins
    });
    
    it('should be OK returning no ISINs', () => {
      isinService.getISINList().subscribe(
        resp => expect(resp.length).toEqual(0, 'should have empty ISINs array'),
        fail
      );

      const req = httpMock.expectOne(isinService.url);
      req.flush([]); //Return empty data
    });

    it('should return a list of ISINs when called multiple times', () => {
      isinService.getISINList().subscribe();
      isinService.getISINList().subscribe(
        resp => expect(resp).toEqual(dummyIsins.isin, 'should return expected isins'),
        fail
      );

      const requests = httpMock.match(isinService.url);
      expect(requests.length).toEqual(2, 'calls to getAllEmployees()');

      requests[0].flush([]); //Return Empty body for first call
      requests[1].flush(dummyIsins); //Return expectedresp in second call
    });
  });

  describe('#Subscribed Isins data manipulaion', () => {
    it('should add a stock to the subscribed isin observable if not exist', () => {
      const dummyStock: Stock  = {isin: '', bid: 0 , ask: 0, price:45};
      isinService.updateSubscribedIsins(dummyStock);
      isinService.subscribedIsins$.subscribe((res) => expect(res.length).toEqual(1))
    });

    it('should update an existing stock values', () => {
      const dummyStock1: Stock  = {isin: '', bid: 0 , ask: 0, price:45};
      const dummyStock2: Stock  = {isin: '', bid: 0 , ask: 0, price:450};
      isinService.updateSubscribedIsins(dummyStock1);
      isinService.updateSubscribedIsins(dummyStock2);
      isinService.subscribedIsins$.subscribe((res) => {
        expect(res.length).toEqual(1);
        expect(res[0].price).toEqual(450);
      });
    });

    it('should delete an existing stock values from subscribed isins mlist on unsubscption', () => {
      const dummyStock1: Stock  = {isin: '', bid: 0 , ask: 0, price:45};
      isinService.updateSubscribedIsins(dummyStock1);
      isinService.unsusbscribeIsins(dummyStock1.isin);
      isinService.subscribedIsins$.subscribe((res) => {
        expect(res.length).toEqual(0);
      });
    });

  });
});