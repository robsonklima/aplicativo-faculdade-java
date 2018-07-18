import { Component } from '@angular/core';
import { ViewController } from 'ionic-angular';

@Component({
  selector: 'meus-chamados-page',
  templateUrl: 'meus-chamados.html'
})
export class MeusChamadosPage {
  constructor(
    private viewCtrl: ViewController
  ) {}

  public fecharModal() {
    this.viewCtrl.dismiss();
  }
}