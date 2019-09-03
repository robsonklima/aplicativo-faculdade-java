import { Component } from '@angular/core';
import { NavParams, NavController } from 'ionic-angular';
import { DadosGlobais } from '../../models/dados-globais';
import { MensagemTecnico } from '../../models/mensagem-tecnico';
import { MensagemPage } from './mensagem';

import { DadosGlobaisService } from '../../services/dados-globais';
import { MensagemTecnicoService } from '../../services/mensagem-tecnico';


@Component({
  selector: 'mensagens-page',
  templateUrl: 'mensagens.html'
})
export class MensagensPage {
  dg: DadosGlobais;
  mensagensTecnico: MensagemTecnico[] = [];

  constructor(
    private navCtrl: NavController,
    private navParams: NavParams,
    private mtService: MensagemTecnicoService,
    private dadosGlobaisService: DadosGlobaisService
  ) {
    this.mensagensTecnico = this.navParams.get('mensagensTecnico');
  }

  ionViewWillEnter() {
    this.carregarDadosGlobais()
      .then(() => this.carregarMensagensTecnico().catch(() => {}))
      .catch(() => {});
  }

  private carregarDadosGlobais(): Promise<boolean> {
    return new Promise((resolve, reject) => {
      this.dadosGlobaisService.buscarDadosGlobaisStorage().then((dados) => {
        this.dg = dados;

        resolve(true);
      })
      .catch((err) => { reject(false) });
    });
  }

  public telaMensagemTecnico(mensagemTecnico: MensagemTecnico) {
    this.navCtrl.push(MensagemPage, { mensagemTecnico: mensagemTecnico });
  }

  public carregarMensagensTecnico(): Promise<any> {
    return new Promise((resolve, reject) => {
      this.mtService.buscarMensagensTecnicoApi(this.dg.usuario.codUsuario)
        .subscribe(mt => {
          this.mensagensTecnico = mt;

          resolve();
        }, err => {});
    });
  }
}