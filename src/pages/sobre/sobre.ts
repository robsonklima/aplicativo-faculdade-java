import { Component } from '@angular/core';
import { ViewController } from 'ionic-angular';

import { DadosGlobais } from '../../models/dados-globais';
import { DadosGlobaisService } from '../../services/dados-globais';

@Component({
  selector: 'sobre-page',
  templateUrl: 'sobre.html'
})
export class SobrePage {
  dadosGlobais: DadosGlobais;

  constructor(
    private viewCtrl: ViewController,
    private dadosGlobaisService: DadosGlobaisService
  ) { }

  ionViewWillEnter() {
    this.carregarDadosGlobais();
  }

  private carregarDadosGlobais() {
    this.dadosGlobaisService.buscarDadosGlobaisStorage()
      .then((dados: DadosGlobais) => {
        if (dados) 
          this.dadosGlobais = dados;
      })
      .catch((err) => {});
  }

  public fecharModal() {
    this.viewCtrl.dismiss();
  }
}