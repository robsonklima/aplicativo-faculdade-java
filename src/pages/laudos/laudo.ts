import { Component, ViewChild } from '@angular/core';
import { NavParams, Slides, ToastController, AlertController, ViewController } from 'ionic-angular';
import { Laudo } from '../../models/laudo';
import { Chamado } from '../../models/chamado';
import { NgForm } from '@angular/forms';
import { Camera } from '@ionic-native/camera';
import { Foto } from '../../models/foto';

import moment from 'moment';
import { ChamadoService } from '../../services/chamado';

@Component({
  selector: 'laudo-page',
  templateUrl: 'laudo.html'
})
export class LaudoPage {
  @ViewChild(Slides) slides: Slides;
  tituloSlide: string;
  chamado: Chamado;
  laudo: Laudo;
  foto: Foto;

  constructor(
    private chamadoService: ChamadoService,
    private navParams: NavParams,
    private toastCtrl: ToastController,
    private alertCtrl: AlertController,
    private viewCtrl: ViewController,
    private camera: Camera
  ) {
    this.chamado = this.navParams.get('chamado');
  }

  ionViewWillEnter() {
    this.laudo = new Laudo();

    this.configurarSlide(this.slides.getActiveIndex());    
  }

  public criarLaudo(form: NgForm) {
    this.laudo.observacoes = form.value.observacoes;
    this.laudo.testeFuncional = form.value.testeFuncional;
    this.laudo.eventosErro = form.value.eventosErro;
    this.laudo.acoes = form.value.acoes;
    this.laudo.conclusao = form.value.conclusao;
    this.laudo.fotos = [];
    
    this.configurarSlide(this.slides.getActiveIndex());
    this.slides.slideTo(1, 500);
  }

  public salvarLaudo() {
    const confirmacao = this.alertCtrl.create({
      title: 'Confirmação',
      message: 'Deseja salvar este laudo?',
      buttons: [
        {
          text: 'Cancelar',
          handler: () => {}
        },
        {
          text: 'Confirmar',
          handler: () => {
            if (this.laudo.fotos.length == 0) {
              this.exibirToast('Favor anexar as fotos do laudo');
              return
            }

            this.chamado.laudos.push(this.laudo);
            this.chamadoService.atualizarChamado(this.chamado);
            this.fecharModal();
          }
        }
      ]
    });

    confirmacao.present();
  }

  public selecionarFoto(sourceType: number) {
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
      this.foto.modalidade = "LAUDO";
      this.laudo.fotos.push(this.foto);
      this.camera.cleanup();
    }).catch(err => {});
  }

  public removerFoto(i: number) {
    const confirmacao = this.alertCtrl.create({
      title: 'Confirmação',
      message: 'Deseja excluir esta foto?',
      buttons: [
        {
          text: 'Cancelar',
          handler: () => {}
        },
        {
          text: 'Confirmar',
          handler: () => {
            this.laudo.fotos.splice(i, 1);
          }
        }
      ]
    });

    confirmacao.present();
  }

  public alterarSlide() {
    this.configurarSlide(this.slides.getActiveIndex());
  }

  private configurarSlide(i: number) {
    switch (i) {
      case 0:
        this.tituloSlide = (i + 1) + ". " + "Roteiro de Análise";
        if (!this.laudo.observacoes || !this.laudo.testeFuncional || !this.laudo.eventosErro || !this.laudo.acoes || !this.laudo.conclusao) {
          this.slides.lockSwipeToNext(true);
        } else {
          this.slides.lockSwipeToNext(false);
        }
        break;
      case 1:
        this.tituloSlide = (i + 1) + ". " + "Fotos";
        this.slides.lockSwipeToPrev(false);
        this.slides.lockSwipeToNext(false);
        break;
      case 2:
        this.tituloSlide = (i + 1) + ". " + "Salvar";
        this.slides.lockSwipeToPrev(false);
        this.slides.lockSwipeToNext(false);
        break;
    }
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
    this.viewCtrl.dismiss();
  }
}