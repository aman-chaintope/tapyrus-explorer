import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ColoredCoinPage } from './colored-coin.page';

const routes: Routes = [
  {
    path: '',
    component: ColoredCoinPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ColoredCoinPageRoutingModule {}
