import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ColoredCoinsPageRoutingModule } from './colored-coins-routing.module';

import { ColoredCoinsPage } from './colored-coins.page';

import { NgxPaginationModule } from 'ngx-pagination';
import { SharedPipeModule } from '../modules/sharePipe.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ColoredCoinsPageRoutingModule,
    SharedPipeModule,
    NgxPaginationModule
  ],
  declarations: [ColoredCoinsPage]
})
export class ColoredCoinsPageModule {}
