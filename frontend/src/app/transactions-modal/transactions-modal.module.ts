import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { TransactionsModalPageRoutingModule } from './transactions-modal-routing.module';

import { TransactionsModalPage } from './transactions-modal.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    TransactionsModalPageRoutingModule
  ],
  declarations: [TransactionsModalPage]
})
export class TransactionsModalPageModule {}
