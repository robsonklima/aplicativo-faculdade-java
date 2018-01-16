import { Component } from '@angular/core';
import { AlertController, NavParams, ToastController, ViewController } from 'ionic-angular';

import { Peca } from "../../models/peca";

@Component({
  selector: 'peca-page',
  templateUrl: 'peca.html'
})
export class PecaPage {
  peca: Peca;

  constructor(
    private viewCtrl: ViewController,
    private alertCtrl: AlertController,
    private toastCtrl: ToastController,
    private navParams: NavParams,
  ) {
    this.peca = this.navParams.get('peca');
  }

  public fecharModal() {
    this.viewCtrl.dismiss();
  }
}