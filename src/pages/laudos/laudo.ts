import { Component, ViewChild } from '@angular/core';
import { NavParams, Slides, ToastController, AlertController, NavController } from 'ionic-angular';
import { ChamadoService } from '../../services/chamado';
import { Laudo } from '../../models/laudo';
import { Chamado } from '../../models/chamado';
import { NgForm } from '@angular/forms';
import { Camera } from '@ionic-native/camera';
import { Foto } from '../../models/foto';

@Component({
  selector: 'laudo-page',
  templateUrl: 'laudo.html'
})
export class LaudoPage {
  @ViewChild(Slides) slides: Slides;
  tituloSlide: string;
  laudo: Laudo;
  chamado: Chamado;
  foto: Foto;

  constructor(
    private navCtrl: NavController,
    private navParams: NavParams,
    private toastCtrl: ToastController,
    private alertCtrl: AlertController,
    private chamadoService: ChamadoService,
    private camera: Camera
  ) {
    this.laudo = this.navParams.get('laudo');
  }

  ionViewDidLoad() {
    this.carregarChamado();
  }

  ionViewWillEnter() {
    this.configurarSlide(this.slides.getActiveIndex());
  }

  private carregarChamado(): Promise<any> {
    return new Promise((resolve, reject) => {
      this.chamadoService.buscarChamadoApi(this.laudo.codOS).subscribe(chamado => {
        this.chamado = chamado;

        resolve(chamado);
      }, err => {});
    });
  }

  public salvarLaudo(form: NgForm) {
    this.laudo.observacoes = form.value.observacoes;
    this.laudo.testeFuncional = form.value.testeFuncional;
    this.laudo.eventosErro = form.value.eventosErro;
    this.laudo.acoes = form.value.acoes;
    this.laudo.conclusao = form.value.conclusao;

    this.exibirToast('Laudo atualizado com sucesso').then(() => {
      this.configurarSlide(this.slides.getActiveIndex());
      this.slides.slideTo(2, 500);
    }).catch(() => {});
  }

  public enviarLaudo() {
    const confirmacao = this.alertCtrl.create({
      title: 'Confirmação',
      message: 'Deseja enviar o laudo agora?',
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


            // AQUI REGRA DE SALVAR


            setTimeout(() => { this.exibirToast('Laudo ' + this.laudo.codOS + ' enviado com sucesso').then(() => {
              this.navCtrl.popToRoot();
            }) }, 500);
          }
        }
      ]
    });

    confirmacao.present();
  }

  public tirarFoto() {
    this.camera.getPicture({
      quality: 80,
      destinationType: this.camera.DestinationType.DATA_URL,
      encodingType: this.camera.EncodingType.JPEG,
      mediaType: this.camera.MediaType.PICTURE,
      correctOrientation: true,
      targetWidth: 720,
      targetHeight: 480,
      allowEdit: true
    }).then(imageData => {
      this.foto = new Foto();
      this.foto.nome = this.chamado.codOs.toString() + '_LAUDO_' + new Date().getUTCMilliseconds().toString();
      this.foto.str = 'data:image/jpeg;base64,' + imageData;
      this.foto.modalidade = "LAUDO";
      this.laudo.fotos.push(this.foto);
      this.camera.cleanup();
    }).catch(err => {
      setTimeout(() => { this.exibirToast(err) }, 500);
    });
  }

  public selecionarFotoGaleria() {
    this.camera.getPicture({
      quality: 80,
      destinationType: this.camera.DestinationType.DATA_URL,
      encodingType: this.camera.EncodingType.JPEG,
      mediaType: this.camera.MediaType.PICTURE,
      correctOrientation: true,
      targetWidth: 720,
      targetHeight: 480,
      sourceType: 0,
      allowEdit: true
    }).then(imageData => {
      this.foto = new Foto();
      this.foto.nome = this.chamado.codOs.toString() + '_LAUDO_' + new Date().getUTCMilliseconds().toString();
      this.foto.str = 'data:image/jpeg;base64,' + imageData;
      this.foto.modalidade = "LAUDO";
      this.laudo.fotos.push(this.foto);
      this.camera.cleanup();
    }).catch(err => {
      setTimeout(() => { this.exibirToast(err) }, 500);
    });
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

  private exibirToast(mensagem: string): Promise<any> {
    return new Promise((resolve, reject) => {
      const toast = this.toastCtrl.create({
        message: mensagem, duration: 3000, position: 'bottom'
      });

      resolve(toast.present());
    });
  }

  public alterarSlide() {
    this.configurarSlide(this.slides.getActiveIndex());
  }

  private configurarSlide(i: number) {
    switch (i) {
      case 0:
        this.tituloSlide = (i + 1) + ". " + "Informações";
        break;

      case 1:
        this.tituloSlide = (i + 1) + ". " + "Roteiro de Análise";
        if (!this.laudo.observacoes || !this.laudo.testeFuncional || !this.laudo.eventosErro || !this.laudo.acoes || !this.laudo.conclusao) {
          this.slides.lockSwipeToNext(true);
        } else {
          this.slides.lockSwipeToNext(false);
        }
        break;

      case 2:
        this.tituloSlide = (i + 1) + ". " + "Fotos";
        break;

      case 3:
        this.tituloSlide = (i + 1) + ". " + "Envio";
        break;
    }
  }
}