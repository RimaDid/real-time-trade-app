import { StockComponent } from './../../components/stock/stock.component';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LifeStockComponent } from './life-stock.component';
import { FormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    component: LifeStockComponent,
  },
];

@NgModule({
  declarations: [
    LifeStockComponent,
    StockComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    RouterModule.forChild(routes)
  ]
})
export class LifeStockModule { }
