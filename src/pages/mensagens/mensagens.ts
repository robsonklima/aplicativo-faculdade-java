import { Component } from '@angular/core';
import { AlertController, ToastController, NavParams } from 'ionic-angular';
import { MensagemTecnico } from '../../models/mensagem-tecnico';
import { MensagemTecnicoService } from '../../services/mensagem-tecnico';
import { DadosGlobais } from '../../models/dados-globais';
import { DadosGlobaisService } from '../../services/dados-globais';


@Component({
  selector: 'mensagens-page',
  templateUrl: 'mensagens.html'
})
export class MensagensPage {
  dg: DadosGlobais;
  mensagensTecnico: MensagemTecnico[] = [];

  constructor(
    private alertCtrl: AlertController,
    private toastCtrl: ToastController,
    private navParams: NavParams,
    private mensagemTecnicoService: MensagemTecnicoService,
    private dadosGlobaisService: DadosGlobaisService
  ) {
    this.mensagensTecnico = this.navParams.get('mensagensTecnico');
  }

  ionViewWillEnter() {
    this.carregarDadosGlobais()
      .then(() => {})
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

  public marcarMensagemLida(mensagemTecnico: MensagemTecnico, i: number) {
    const confirmacao = this.alertCtrl.create({
      title: 'Confirmar Leitura',
      message: 'Deseja confirmar a leitura desta mensagem?',
      buttons: [
        {
          text: 'Cancelar',
          handler: () => {}
        },
        {
          text: 'Confirmar',
          handler: () => {
            mensagemTecnico.codUsuarioCad = this.dg.usuario.codUsuario;

            this.mensagemTecnicoService.enviarMensagemTecnicoApi(mensagemTecnico).subscribe((res) => {
              if (res) {
                if (res.indexOf('00 - ') > -1) {
                  setTimeout(() => { this.exibirToast('Mensagem ' + mensagemTecnico.assunto + ' marcada como lida').then(() => {
                    this.mensagensTecnico.splice(i, 1);
                  }) }, 500);
                } else {
                  this.exibirToast('Ocorreu um erro');
                }
              }
            },
            err => {
                this.exibirToast(err);
            });
          }
        }
      ]
    });

    confirmacao.present();
  }

  public ajuda() {
    const confirmacao = this.alertCtrl.create({
      title: 'Mensagens',
      message: `As mensagens permitem que você receba informações importantes sobre os processos de trabalho da sua filial. 
                Ao confirmar a leitura, você torna seu coordenador ciente sobre o recebimento das orientações necessárias,
                garantindo o alinhado da sua operação.`,
      buttons: [
        {
          text: 'Ok',
          handler: () => {}
        }
      ]
    });

    confirmacao.present();
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