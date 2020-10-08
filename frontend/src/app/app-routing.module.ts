import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    redirectTo: '/blocks',
    pathMatch: 'full'
  },
  {
    path: 'blocks',
    loadChildren: () => import('./blocks/blocks.module').then( m => m.BlocksPageModule)
  },
  {
    path: 'blocks/:hash',
    loadChildren: () => import('./block/block.module').then( m => m.BlockPageModule)
  },
  {
    path: 'block-rawdata',
    loadChildren: () => import('./block-rawdata/block-rawdata.module').then( m => m.BlockRawdataPageModule)
  },
  {
    path: 'transactions',
    loadChildren: () => import('./transactions/transactions.module').then( m => m.TransactionsPageModule)
  },
  {
    path: 'transactions/:txid',
    loadChildren: () => import('./transaction/transaction.module').then( m => m.TransactionPageModule)
  },
  {
    path: 'transaction-rawdata',
    loadChildren: () => import('./transaction-rawdata/transaction-rawdata.module').then( m => m.TransactionRawdataPageModule)
  },
  {
    path: 'addresses/:address',
    loadChildren: () => import('./address/address.module').then( m => m.AddressPageModule)
  },
  {
    path: 'colored-coins',
    loadChildren: () => import('./colored-coins/colored-coins.module').then( m => m.ColoredCoinsPageModule)
  },
  {
    path: 'colored-coin/:coinId',
    loadChildren: () => import('./colored-coin/colored-coin.module').then( m => m.ColoredCoinPageModule)
  },
  {
    path: 'transactions-modal',
    loadChildren: () => import('./transactions-modal/transactions-modal.module').then( m => m.TransactionsModalPageModule)
  }
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {}
