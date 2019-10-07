import { Component } from '@angular/core';
import { NavParams, ViewController, AlertController, Platform, ToastController } from 'ionic-angular';

import { Camera } from '@ionic-native/camera';
import { AndroidPermissions } from '@ionic-native/android-permissions';

import { Laudo } from '../../models/laudo';
import { Foto } from '../../models/foto';

import moment from 'moment';
import { LaudoSituacao } from '../../models/laudo-situacao';
import { NgForm } from '@angular/forms';


@Component({
  selector: 'situacao-page',
  templateUrl: 'situacao.html'
})
export class SituacaoPage {
  laudo: Laudo;
  situacao: LaudoSituacao;
  foto: Foto;
  qtdFotosLaudo: number;

  constructor(
    private navParams: NavParams,
    private viewCtrl: ViewController,
    private alertCtrl: AlertController,
    private camera: Camera,
    private platform: Platform,
    private toastCtrl: ToastController,
    private androidPermissions: AndroidPermissions,
  ) {
    this.laudo = this.navParams.get('laudo');

    platform.ready().then(() => {
      androidPermissions.requestPermissions([androidPermissions.PERMISSION.CAMERA]);
    });
  }

  ionViewWillEnter() {
    this.situacao = new LaudoSituacao();
    this.situacao.fotos = [];
    this.obterQtdFotosLaudo();
  }

  public criarSituacao(form: NgForm) {
    this.situacao.causa = form.value.causa;
    this.situacao.acao = form.value.acao;

    this.laudo.situacoes.push(this.situacao);
    this.fecharModal()
  }

  public selecionarFoto(sourceType: number) {
    this.platform.ready().then(() => {
      this.androidPermissions.checkPermission(this.androidPermissions.PERMISSION.CAMERA).then(
        result => {
          this.androidPermissions.requestPermission(this.androidPermissions.PERMISSION.CAMERA).then(() => {
            this.camera.getPicture({
              quality: 80,
              destinationType: this.camera.DestinationType.DATA_URL,
              encodingType: this.camera.EncodingType.JPEG,
              mediaType: this.camera.MediaType.PICTURE,
              targetWidth: 720,
              targetHeight: 480,
              sourceType: sourceType
            }).then(imageData => {
              this.foto = new Foto();
              this.foto.nome = moment().format('YYYYMMDDHHmmss') + '_' + this.laudo.codOS + '_LAUDO';
              this.foto.str = 'data:image/jpeg;base64,' + imageData;
              this.foto.modalidade = "LAUDO_SIT_" + (this.laudo.situacoes.length + 1);
              this.situacao.fotos.push(this.foto);
              this.qtdFotosLaudo = this.qtdFotosLaudo + 1;
              this.camera.cleanup();
            }).catch(err => {});
          }).catch(() => {});
        }).catch(() => {});
      },
      err => {
        this.androidPermissions.requestPermission(this.androidPermissions.PERMISSION.CAMERA);
        this.exibirToast('Erro ao acessar a câmera.');
      }
    );
  }

  public removerFoto(i: number) {
    const confirmacao = this.alertCtrl.create({
      title: 'Confirmação',
      message: 'Deseja excluir esta foto?',
      buttons: [
        {
          text: 'Cancelar',
          handler: () => { }
        },
        {
          text: 'Confirmar',
          handler: () => {
            this.situacao.fotos.splice(i, 1);
          }
        }
      ]
    });

    confirmacao.present();
  }

  private obterQtdFotosLaudo() {
    this.qtdFotosLaudo = 0;

    this.laudo.situacoes.forEach(situacao => {
      this.qtdFotosLaudo = this.qtdFotosLaudo + situacao.fotos.length;
    });
  }

  private exibirToast(mensagem: string): Promise<any> {
    return new Promise((resolve, reject) => {
      const toast = this.toastCtrl.create({
        message: mensagem, duration: 3000, position: 'bottom'
      });

      resolve(toast.present());
    });
  }

  public fecharModal() {
    this.viewCtrl.dismiss(this.laudo);
  }
}