import { Component } from '@angular/core';
import { ViewController, ModalController, Platform } from 'ionic-angular';

import { AjudaPage } from '../ajuda/ajuda';
import { ProblemaPage } from '../problema/problema';

import { Config } from "../../config/config";

import { InAppBrowser } from '@ionic-native/in-app-browser';

@Component({
  selector: 'home-mais-opcoes-page',
  templateUrl: 'home-mais-opcoes.html'
})
export class HomeMaisOpcoesPage {
  constructor(
    private viewCtrl: ViewController,
    private modalCtrl: ModalController,
    private platform: Platform,
    private inAppBrowser: InAppBrowser
  ) {}

  public telaAjuda() {
    const modal = this.modalCtrl.create(AjudaPage);

    this.viewCtrl.dismiss().then(() => {
      modal.present();
    }).catch();

    modal.onDidDismiss(() => {});
  }

  public telaVersoes() {
    this.platform.ready().then(() => {
      this.viewCtrl.dismiss().then(() => {
        this.inAppBrowser.create(Config.URL_CONTROLE_VERSOES);
      }).catch();
    }).catch();
  }

  public telaProblema() {
    const modal = this.modalCtrl.create(ProblemaPage);

    this.viewCtrl.dismiss().then(() => {
      modal.present();
    }).catch();

    modal.onDidDismiss(() => {});
  }
}