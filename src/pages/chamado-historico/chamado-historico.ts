import { Chamado } from '../../models/chamado';
import { Component } from '@angular/core';
import { NavParams, ViewController } from 'ionic-angular';

@Component({
  selector: 'chamado-historico-page',
  templateUrl: 'chamado-historico.html'
})
export class ChamadoHistoricoPage {
  chamado: Chamado;

  constructor(
    private viewCtrl: ViewController,
    private navParams: NavParams
  ) {
    this.chamado = this.navParams.get('chamado');
  }

  fecharModal() {
    this.viewCtrl.dismiss();
  }
}