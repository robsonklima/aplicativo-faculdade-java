import { Component } from '@angular/core';
import { ViewController } from 'ionic-angular';

import { AppVersion } from '@ionic-native/app-version';

import moment from 'moment';

@Component({
  selector: 'sobre-page',
  templateUrl: 'sobre.html'
})
export class SobrePage {
  versaoApp: string;
  anoAtual: string;

  constructor(
    private viewCtrl: ViewController,
    private appVersion: AppVersion
  ) { }

  ionViewWillEnter() {
    this.appVersion.getVersionNumber().then((versaoApp) => {
      this.versaoApp = versaoApp;
    }).catch(() => {

    });

    this.anoAtual = moment().format('YYYY');
  }

  public fecharModal() {
    this.viewCtrl.dismiss();
  }
}