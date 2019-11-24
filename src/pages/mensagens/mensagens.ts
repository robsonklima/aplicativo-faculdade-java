import { Component } from '@angular/core';
import { NavParams, NavController, LoadingController, AlertController } from 'ionic-angular';
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
    private dadosGlobaisService: DadosGlobaisService,
    private loadingCtrl: LoadingController,
    private alertCtrl: AlertController
  ) {
    this.mensagensTecnico = this.navParams.get('mensagensTecnico');
  }

  ngOnInit() {
    const loading = this.loadingCtrl.create({ 
      content: 'Carregando mensagens...' 
    });
    loading.present();

    this.carregarDadosGlobais()
      .then(() => this.carregarMensagensTecnico().catch(() => {}))
      .then(() => loading.dismiss())
      .catch(() => { loading.dismiss() });
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
        }, () => {
          this.exibirAlerta('Erro ao carregar dados do servidor');
          this.navCtrl.pop();
        });
    });
  }

  private exibirAlerta(msg: string) {
    const alerta = this.alertCtrl.create({
      title: 'Alerta!',
      subTitle: msg,
      buttons: ['OK']
    });

    alerta.present();
  }
}