import { Component, OnInit, Input } from '@angular/core';
import { NavParams, ModalController, NavController } from '@ionic/angular';
import { HttpClient } from '@angular/common/http';


@Component({
  selector: 'app-transactions-modal',
  templateUrl: './transactions-modal.page.html',
  styleUrls: ['./transactions-modal.page.scss'],
})

export class TransactionsModalPage implements OnInit {

  @Input() coins: [string];
  txRawData = '';
  copied = false;

  constructor(
    private navParams: NavParams,
    private httpClient: HttpClient,
    private modalCtrl: ModalController,
    private navCtrl: NavController,
  ) { }

  ngOnInit() {
    this.coins = this.navParams.get('coins');
  }

  goToCoin(coinId: string) {
    this.dismiss();
    this.navCtrl.navigateForward(`/colored-coin/${coinId}`);
  }

  copyTxRawData() {
    const textArea = document.createElement('textarea');
    textArea.value = this.txRawData;

    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();

    try {
      document.execCommand('copy');
      this.copied = true;
      setTimeout(() => { this.copied = false; }, 800);
    } catch (err) {
      console.error('Fallback: Oops, unable to copy', err);
    }

    document.body.removeChild(textArea);
  }

  dismiss() {
    this.modalCtrl.dismiss();
  }
}
