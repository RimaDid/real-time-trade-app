import { TestBed } from '@angular/core/testing';
import { WebSocketSubject } from 'rxjs/webSocket';
import { WebSocketService } from './webSocket.service';


xdescribe('WebSocketService', () => {
  let wsService: WebSocketService;
  let wsSubject;
  let socketMock: any;

  beforeEach(() => {
    function WebSocketStub() {
      socketMock = {
        url: 'ws://localhost:8888',
        readyState: WebSocket.CONNECTING,
        send: jasmine.createSpy('send'),
        close: jasmine.createSpy('close').and.callFake(function () {
          socketMock.readyState = WebSocket.CLOSING;
        })
      };

      return socketMock;
    }

    WebSocketStub['OPEN'] = WebSocket.OPEN;
    WebSocketStub['CLOSED'] = WebSocket.CLOSED;

    TestBed.configureTestingModule({
      providers: [
        WebSocketService,
        {
          provide: Window,
          useValue: {WebSocket: WebSocketStub},
        }
      ]
    });

    wsService = TestBed.get(WebSocketService);
    wsSubject = wsService.connect({reconnect: true});
  })


  it('should send the message on the websocket.send', () => {
    const message = {key: 'hello'};

   // wsSubject.next(message);

    expect(socketMock.send.calls.count()).toEqual(0);

    socketMock.readyState = WebSocket.OPEN;
   // wsSubject.next(message);

    expect(socketMock.send.calls.argsFor(0)).toEqual(['{"key":"hello"}']);
  });
});
