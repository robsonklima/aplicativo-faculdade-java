import { Component } from '@angular/core';
import { NavParams, ViewController, AlertController, Platform } from 'ionic-angular';
import { Camera } from '@ionic-native/camera';

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
  ) {
    this.laudo = this.navParams.get('laudo');
  }

  ionViewWillEnter() {
    this.situacao = new LaudoSituacao();
    this.situacao.fotos = [];
    this.obterQtdFotosLaudo();
    this
  }

  public criarSituacao(form: NgForm) {
    this.situacao.causa = form.value.causa;
    this.situacao.acao = form.value.acao;

    this.laudo.situacoes.push(this.situacao);
    this.fecharModal()
  }

  public selecionarFoto(sourceType: number) {
    this.platform.ready().then(() => {
      this.camera.getPicture({
        quality: 80,
        destinationType: this.camera.DestinationType.DATA_URL,
        encodingType: this.camera.EncodingType.JPEG,
        mediaType: this.camera.MediaType.PICTURE,
        correctOrientation: true,
        targetWidth: 720,
        targetHeight: 480,
        sourceType: sourceType,
        allowEdit: true
      }).then(imageData => {
        this.foto = new Foto();
        this.foto.nome = moment().format('YYYYMMDDHHmmss') + '_' + this.laudo.codOS + '_LAUDO';
        this.foto.str = 'data:image/jpeg;base64,' + imageData;
        this.foto.modalidade = "LAUDO_SIT_" + (this.laudo.situacoes.length + 1);
        this.situacao.fotos.push(this.foto);
        this.camera.cleanup();
        this.qtdFotosLaudo = this.qtdFotosLaudo + 1;
      }).catch(err => { });
    })
    .catch(() => {});
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

  public fecharModal() {
    this.viewCtrl.dismiss(this.laudo);
  }
}