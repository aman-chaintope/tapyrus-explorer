import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ColoredCoinsPage } from './colored-coins.page';

const routes: Routes = [
  {
    path: '',
    component: ColoredCoinsPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ColoredCoinsPageRoutingModule {}
