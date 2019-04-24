import { Component } from '@angular/core';
import { Laudo } from '../../models/laudo';
import { NavParams, NavController } from 'ionic-angular';
import { LaudoPage } from './laudo';

@Component({
  selector: 'laudos-page',
  templateUrl: 'laudos.html'
})
export class LaudosPage {
  laudos: Laudo[] = [];

  constructor(
    private navParams: NavParams,
    private navCtrl: NavController
  ) {
    this.laudos = this.navParams.get('laudos');
  }

  public telaLaudo(laudo: Laudo) {
    this.navCtrl.push(LaudoPage, { laudo: laudo});
  }
}