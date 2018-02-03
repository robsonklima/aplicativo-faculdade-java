import { Component } from '@angular/core';
import { ViewController, NavController } from 'ionic-angular';

import { AjudaDetalhePage } from './ajuda-detalhe';

@Component({
  selector: 'ajuda-lista-page',
  templateUrl: 'ajuda-lista.html'
})
export class AjudaListaPage {
  itens = [
    'Como fechar um chamado?',
    'Como consultar o histórico do equipamento?',
    'Como interpretar a listagem de chamados?',
    'Como atualizar os dados da RAT?',
    'Como inserir um detalhe?',
    'Como inserir uma peça?',
    'Como acessar a rota no mapa?',
    'Como consultar a lista de peças?',
    'Como informar um problema no app?',
    'Como verificar a versão do app?',
    'Como confirmar a leitura de um chamado?'
  ];

  constructor(
    private viewCtrl: ViewController,
    private navCtrl: NavController
  ) {}

  public telaAjudaDetalhe(item: any) {
    this.navCtrl.push(AjudaDetalhePage, { item: item });
  }

  public fecharModal() {
    this.viewCtrl.dismiss();
  }
}