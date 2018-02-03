import { Component } from '@angular/core';
import { ViewController, NavController } from 'ionic-angular';

import { AjudaTopico } from '../../models/ajuda-topico';

import { AjudaDetalhePage } from './ajuda-detalhe';

@Component({
  selector: 'ajuda-lista-page',
  templateUrl: 'ajuda-lista.html'
})
export class AjudaListaPage {
  topicos: AjudaTopico[] = [
    {
      enunciado: 'Como fechar um chamado?',
      titulo: 'Fechamento de Chamados',
      texto: 'Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo. Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt.'
    },
    {
      enunciado: 'Como consultar o histórico do equipamento?',
      titulo: 'Histórico do Equipamento',
      texto: 'Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo. Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt.'
    },
    {
      enunciado: 'Como interpretar a listagem de chamados?',
      titulo: '',
      texto: ''
    },
    {
      enunciado: 'Como atualizar os dados da RAT?',
      titulo: '',
      texto: ''
    },
    {
      enunciado: 'Como inserir um detalhe?',
      titulo: '',
      texto: ''
    },
    {
      enunciado: 'Como inserir uma peça?',
      titulo: '',
      texto: ''
    },
    {
      enunciado: 'Como acessar a rota no mapa?',
      titulo: '',
      texto: ''
    },
    {
      enunciado: 'Como consultar a lista de peças?',
      titulo: '',
      texto: ''
    },
    {
      enunciado: 'Como informar um problema no app?',
      titulo: '',
      texto: ''
    },
    {
      enunciado: 'Como verificar a versão do app?',
      titulo: '',
      texto: ''
    },
    {
      enunciado: 'Como confirmar a leitura de um chamado?',
      titulo: '',
      texto: ''
    }
  ];

  constructor(
    private viewCtrl: ViewController,
    private navCtrl: NavController
  ) {}

  public telaAjudaDetalhe(topico: AjudaTopico) {
    this.navCtrl.push(AjudaDetalhePage, { topico: topico });
  }

  public fecharModal() {
    this.viewCtrl.dismiss();
  }
}