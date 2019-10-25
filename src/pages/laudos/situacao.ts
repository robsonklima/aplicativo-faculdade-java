import { Component } from '@angular/core';
import { NavParams, ViewController, AlertController, Platform } from 'ionic-angular';

import { Camera } from '@ionic-native/camera';
import { AndroidPermissions } from '@ionic-native/android-permissions';
import { Diagnostic } from '@ionic-native/diagnostic';

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
    private diagnostic: Diagnostic,
    private navParams: NavParams,
    private viewCtrl: ViewController,
    private alertCtrl: AlertController,
    private camera: Camera,
    private platform: Platform,
    private androidPerm: AndroidPermissions,
  ) {
    this.laudo = this.navParams.get('laudo');
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
      if (!this.platform.is('cordova')) return;

      this.diagnostic.requestRuntimePermissions([
        this.diagnostic.permission.WRITE_EXTERNAL_STORAGE,
        this.diagnostic.permission.CAMERA
      ]).then(() => {
        this.androidPerm.requestPermissions([
          this.androidPerm.PERMISSION.WRITE_EXTERNAL_STORAGE,
          this.androidPerm.PERMISSION.CAMERA
        ]).then(() => {
          this.camera.getPicture({
            quality: 80,
            targetWidth: 320,
            destinationType: this.camera.DestinationType.DATA_URL,
            encodingType: this.camera.EncodingType.JPEG,
            mediaType: this.camera.MediaType.PICTURE,
            saveToPhotoAlbum: false,
            sourceType: 1
          }).then(imageData => {
            this.foto = new Foto();
              this.foto.nome = moment().format('YYYYMMDDHHmmss') + '_' + this.laudo.codOS + '_LAUDO';
              this.foto.str = 'data:image/jpeg;base64,' + imageData;
              this.foto.modalidade = "LAUDO_SIT_" + (this.laudo.situacoes.length + 1);
              this.situacao.fotos.push(this.foto);
              this.qtdFotosLaudo = this.qtdFotosLaudo + 1;
              this.camera.cleanup().catch();
          }).catch(() => { this.exibirAlerta('Erro ao acessar a câmera. Favor tentar novamente') });
        }).catch(() => { this.exibirAlerta('Erro ao acessar a câmera. Favor tentar novamente') });
      }).catch(() => { this.exibirAlerta('Erro ao acessar a câmera. Favor tentar novamente') });
    }).catch(() => { this.exibirAlerta('Erro ao acessar a câmera. Favor tentar novamente') });
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

  private exibirAlerta(msg: string) {
    const alerta = this.alertCtrl.create({
      title: 'Alerta!',
      subTitle: msg,
      buttons: ['OK']
    });

    alerta.present();
  }

  public fecharModal() {
    this.viewCtrl.dismiss(this.laudo);
  }
}