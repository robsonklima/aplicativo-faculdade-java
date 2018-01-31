import { Component } from '@angular/core';
import { ViewController } from 'ionic-angular';

import { AppVersion } from '@ionic-native/app-version';

@Component({
  selector: 'sobre-page',
  templateUrl: 'sobre.html'
})
export class SobrePage {
  versaoApp: string;

  constructor(
    private viewCtrl: ViewController,
    private appVersion: AppVersion
  ) { }

  ionViewWillEnter() {
    this.appVersion.getVersionNumber().then((versaoApp) => {
      this.versaoApp = versaoApp;
    }).catch(() => {

    });
  }

  public fecharModal() {
    this.viewCtrl.dismiss();
  }
}