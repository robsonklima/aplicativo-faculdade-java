import { Component } from '@angular/core';
import { ViewController, ModalController } from 'ionic-angular';

import { MeusChamadosPage } from '../chamados/meus-chamados';

@Component({
  selector: 'chamados-mais-opcoes-page',
  templateUrl: 'chamados-mais-opcoes.html'
})
export class ChamadosMaisOpcoesPage {
  constructor(
    private viewCtrl: ViewController,
    private modalCtrl: ModalController
  ) {}

  public telaMeusChamados() {
    const modal = this.modalCtrl.create(MeusChamadosPage);

    this.viewCtrl.dismiss().then(() => {
      modal.present();
    }).catch();

    modal.onDidDismiss(() => {});
  }
}