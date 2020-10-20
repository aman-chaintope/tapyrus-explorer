import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HttpClient, HttpParams } from '@angular/common/http';
import { NavController } from '@ionic/angular';

@Component({
  selector: 'app-address',
  templateUrl: './address.page.html',
  styleUrls: ['./address.page.scss'],
})
export class AddressPage implements OnInit {
  block = {};
  qrcode = 'tapyrus:';
  address = '';
  balanced: number;
  received: number;
  sent: number;
  txidsCount = 0;
  result: any;
  transactions = [];
  unspentDatas = [];
  outputs = [];
  copied = false;
  perPage = 25; // default with 20 per page
  page = 1; // default start with page 1
  pages = 1; // number of pages
  txCount = 0;

  constructor(
    private activatedRoute: ActivatedRoute,
    private httpClient: HttpClient,
    private navCtrl: NavController
  ) { }

  ngOnInit() {
    this.address = this.activatedRoute.snapshot.paramMap.get('address');
    this.qrcode = 'tapyrus:' + this.address;
    this.getAddressInfo();
  }

  goToTransaction(txid: string) {
    this.navCtrl.navigateForward(`/transactions/${txid}`);
  }

  goToAddressPage(hash: string) {
    this.navCtrl.navigateForward(`/addresses/${hash}`);
  }

  copyAddress() {
    const textArea = document.createElement('textarea');
    textArea.value = this.address;

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

  onPageChange(pageNumber: number) {
    this.page = pageNumber;
    this.getAddressInfo();
  }

  onPerPageChange() {
    this.page = 1;
    this.getAddressInfo();
  }

  calculatePagination() {
    this.pages = Math.ceil(this.txCount / this.perPage);
  }

  getAddressInfo() {
    this.httpClient.get(`http://localhost:3001/address/${this.address}`, {
      params: new HttpParams({
        fromObject: {
          page: this.page.toString(),
          perPage: this.perPage.toString(),
        },
      }),
    }).subscribe(
      data => {
        this.received = data[2];
        this.balanced = data[0] / 100000000;
        this.sent = this.received - this.balanced;
        this.result = data[1];
        this.txCount = data[3];

        if (this.result) {
          this.txidsCount = this.result.length;

          this.result.map((transaction) => {
            const outputs = [], amounts = [];
            for (const vout of transaction['vout']) {
              for (const address of vout.scriptPubKey.addresses) {
                outputs.push(address);
              }
              amounts.push(vout.value);
            }
            transaction['outputs'] = outputs;
            transaction['amounts'] = amounts;
            console.log(transaction);
            return transaction;
          });

          this.transactions = this.result;
          // this.getTransactionsInfo(this.result);
        }
        /*if (this.unspentDatas) {
          this.calculateBalanceAndTotal();
        } else {
          this.balanced = 0;
        }*/
        this.calculatePagination();
      },
      err => {
        console.log(err);
      }
    );
  }

  getTransactionsInfo(txids = []) {
    this.transactions = [];
    for (const txid of txids) {
      this.httpClient.get(`http://localhost:3001/transaction/${txid.tx_hash}/get`).subscribe(
        data => {
          this.httpClient.get(`http://localhost:3001/block/${data['blockhash']}`).subscribe(
            block => {
              data['blockheight'] = block['height'];
              this.transactions.push(data);
              if (txid === (txids[txids.length - 1])) {
                this.transactions = this.transactions.sort( (transaction1, transaction2) => transaction2.time - transaction1.time);
              }
            }, err => {
              console.log(err);
            });
        },
        err => {
          console.log(err);
        }
      );
    }
  }

  calculateBalanceAndTotal() {
    let amount = 0;
    for (const unspend of this.unspentDatas) {
      amount += unspend.amount;
    }

    this.balanced = amount;
    this.sent = this.received - this.balanced;
  }

}
