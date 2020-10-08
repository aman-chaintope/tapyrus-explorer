import { Component, OnInit } from '@angular/core';

import { Platform, MenuController } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss']
})
export class AppComponent implements OnInit {
  public selectedIndex = 1;
  public appPages = [
    {
      title: 'Blocks',
      url: '/blocks',
      icon: 'mail'
    },
    {
      title: 'Txns',
      url: '/transactions',
      icon: 'paper-plane'
    },
    {
      title: 'Coins',
      url: '/colored-coins',
      icon: 'paper-plane'
    }
  ];
  public menuToggle = false;

  constructor(
    private platform: Platform,
    private splashScreen: SplashScreen,
    private statusBar: StatusBar,
    private menu: MenuController
  ) {
    this.initializeApp();
  }

  initializeApp() {
    this.platform.ready().then(() => {
      this.statusBar.styleDefault();
      this.splashScreen.hide();
    });
  }

  ngOnInit() {
    const path = window.location.pathname.split('blocks/')[1];
    if (path !== undefined) {
      this.selectedIndex = this.appPages.findIndex(page => page.title.toLowerCase() === path.toLowerCase());
    }
  }

  openFirst() {
    if (this.menuToggle) {
      // this.menu.enable(false, 'side-menu');
      this.menu.close('side-menu');
      this.menuToggle = false;
    } else {
      this.menu.enable(true, 'side-menu');
      this.menu.open('side-menu');
      this.menuToggle = true;
    }
  }

  goTo(url: string) {
    const win = window.open(url, '_blank');
    win.focus();
  }
}
