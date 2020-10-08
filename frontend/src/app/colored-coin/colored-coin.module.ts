import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ColoredCoinPageRoutingModule } from './colored-coin-routing.module';

import { ColoredCoinPage } from './colored-coin.page';
import { NgxQRCodeModule } from 'ngx-qrcode2';
import { SharedPipeModule } from '../modules/sharePipe.module';
import { NgxPaginationModule } from 'ngx-pagination';


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ColoredCoinPageRoutingModule,
    NgxQRCodeModule,
    SharedPipeModule,
    NgxPaginationModule
  ],
  declarations: [ColoredCoinPage]
})
export class ColoredCoinPageModule {}
