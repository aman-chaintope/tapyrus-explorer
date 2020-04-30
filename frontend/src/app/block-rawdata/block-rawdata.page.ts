import { Component, OnInit, Input } from '@angular/core';
import { NavParams } from '@ionic/angular';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-block-rawdata',
  templateUrl: './block-rawdata.page.html',
  styleUrls: ['./block-rawdata.page.scss'],
})
export class BlockRawdataPage implements OnInit {

  @Input() blockHash: string;
  blockRawData = '';
  copied = false;

  constructor(
    private navParams: NavParams,
    private httpClient: HttpClient
  ) { }

  ngOnInit() {
    this.blockHash = this.navParams.get('blockHash');
    this.getBlockRawData();
  }

  getBlockRawData() {
    this.httpClient.get(`http://localhost:3001/block/${this.blockHash}/rawData`).subscribe(
      data => {
        const result: any = data || '';
        this.blockRawData = result;
      },
      err => {
        console.log(err);
      }
    );
  }

  copyBlockRawData() {
    const textArea = document.createElement('textarea');
    textArea.value = this.blockRawData;

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

}