import { Component } from '@angular/core';
import { ViewController, ModalController } from 'ionic-angular';

import { ChamadosFechadosPage } from '../chamados/chamados-fechados';

@Component({
  selector: 'chamados-mais-opcoes-page',
  templateUrl: 'chamados-mais-opcoes.html'
})
export class ChamadosMaisOpcoesPage {
  constructor(
    private viewCtrl: ViewController,
    private modalCtrl: ModalController
  ) {}

  public telaChamadosFechados() {
    const modal = this.modalCtrl.create(ChamadosFechadosPage);

    this.viewCtrl.dismiss().then(() => {
      modal.present();
    }).catch();

    modal.onDidDismiss(() => {});
  }
}