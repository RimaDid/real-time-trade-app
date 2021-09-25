import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LifeStockComponent } from './life-stock.component';

describe('LifeStockComponent', () => {
  let component: LifeStockComponent;
  let fixture: ComponentFixture<LifeStockComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LifeStockComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LifeStockComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
