import { Component } from '@angular/core';
import { ViewController, ToastController, NavParams, LoadingController, AlertController } from 'ionic-angular';

import { Localizacao } from '../../models/localizacao';
import { Chamado } from '../../models/chamado';

import { DadosGlobais } from '../../models/dados-globais';
import { DadosGlobaisService } from '../../services/dados-globais';
import { LocalizacaoService } from '../../services/localizacao';

@Component({
  selector: 'localizacao-envio-page',
  templateUrl: 'localizacao-envio.html'
})
export class LocalizacaoEnvioPage {
  dg: DadosGlobais;
  localizacao: Localizacao = new Localizacao();
  chamado: Chamado = new Chamado();

  constructor(
    private navParams: NavParams,
    private viewCtrl: ViewController,
    private toastCtrl: ToastController,
    private alertCtrl: AlertController,
    private loadingCtrl: LoadingController,
    private dadosGlobaisService: DadosGlobaisService,
    private localizacaoService: LocalizacaoService
  ) {
    this.localizacao.latitude = this.navParams.get('lat');
    this.localizacao.longitude = this.navParams.get('lng');
    this.chamado = this.navParams.get('chamado');
  }

  ionViewWillEnter() {
    this.carregarDadosGlobais();
  }

  private carregarDadosGlobais() {
    this.dadosGlobaisService.buscarDadosGlobaisStorage()
      .then((dados: DadosGlobais) => {
        if (dados) 
          this.dg = dados;
          this.localizacao.codUsuario = this.dg.usuario.codUsuario;
      })
      .catch((err) => {});
  }

  public enviarLocalizacaoParaFilial() {
    const alerta = this.alertCtrl.create({
      title: 'Confirmação',
      message: 'Deseja enviar a sua localização para o e-mail da sua filial?',
      buttons: [
        {
          text: 'Cancelar',
          handler: () => { }
        },
        {
          text: 'Enviar',
          handler: () => {
            const loader = this.loadingCtrl.create({
              content: 'Aguarde... Enviando sua localização'
            });
            loader.present();

            this.localizacaoService.enviarLocalizacao(this.localizacao)
              .subscribe(() => {
                this.exibirToast('Sua localização foi enviada com sucesso!');
                loader.dismiss().then(() => this.fecharModal());
              },
              err => {
                this.exibirToast('Não foi possível enviar a sua localização!');
                loader.dismiss();
              });
          }
        }
      ]
    });

    alerta.present();
  }

  public fecharModal() {
    this.viewCtrl.dismiss();
  }

  private exibirToast(mensagem: string): Promise<any> {
    return new Promise((resolve, reject) => {
      const toast = this.toastCtrl.create({
        message: mensagem, duration: 3000, position: 'bottom'
      });

      resolve(toast.present());
    });
  }
}