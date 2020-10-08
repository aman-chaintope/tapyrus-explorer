import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { TransactionsModalPage } from './transactions-modal.page';

const routes: Routes = [
  {
    path: '',
    component: TransactionsModalPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TransactionsModalPageRoutingModule {}
