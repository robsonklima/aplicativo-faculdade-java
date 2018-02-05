import { Component } from '@angular/core';
import { ViewController, NavParams } from 'ionic-angular';

import { Chamado } from '../../models/chamado';

@Component({
  selector: 'fotos-page',
  templateUrl: 'fotos.html'
})
export class FotosPage {
  chamado: Chamado;

  constructor(
      private viewCtrl: ViewController,
      private navParams: NavParams
  ) { 
    this.chamado = this.navParams.get('chamado');
  }
  

  public fecharModal() {
    this.viewCtrl.dismiss();
  }
}