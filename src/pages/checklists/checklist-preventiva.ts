import { Component, OnInit, ViewChild } from '@angular/core';
import { NavParams, AlertController, ViewController, ToastController, Slides } from 'ionic-angular';
import { Chamado } from '../../models/chamado';
import { Config } from '../../models/config';


@Component({
  selector: 'checklist-preventiva-page',
  templateUrl: 'checklist-preventiva.html'
})
export class ChecklistPreventivaPage {
  @ViewChild(Slides) slides: Slides;
  tituloSlide: string;
  chamado: Chamado;

  constructor(
    private navParams: NavParams,
    private alertCtrl: AlertController,
    private viewCtrl: ViewController,
    private toastCtrl: ToastController
  ) {
    this.chamado = this.navParams.get('chamado');
  }

  ionViewWillEnter() {
    this.configurarSlide();
    console.log(this.chamado);
  }

  public fecharModalConfirmacao() {
    const confirmacao = this.alertCtrl.create({
      title: 'Confirmação',
      message: 'Ao sair você perderá as informações inseridas?',
      buttons: [
        {
          text: 'Cancelar',
          handler: () => { }
        },
        {
          text: 'Confirmar',
          handler: () => {
            this.viewCtrl.dismiss();
          }
        }
      ]
    });

    confirmacao.present();
  }

  public salvarChecklist() {
    //if (!this.validarCamposObrigatorios()) return;

    const confirm = this.alertCtrl.create({
      title: 'Finalizar Checklist e Salvar?',
      message: 'Você deseja finalizar este checklist?',
      buttons: [
        {
          text: 'Não',
          handler: () => {}
        },
        {
          text: 'Sim',
          handler: () => {
            //this.loadingFactory.exibir("Enviando dados... Por favor aguarde");

            // this.auditoriaService.enviarAuditoriaApi(this.auditoria).subscribe(() => {
            //   this.navCtrl.popToRoot().then(() => {
            //     this.loadingFactory.encerrar();
            //     this.exibirToast('Auditoria enviada com sucesso');
            //   });
            // }, err => {
            //   this.loadingFactory.encerrar();
            //   this.exibirToast('Erro ao enviar auditoria. Tente novamente', Config.TOAST.ERROR);
            // });
          }
        }
      ]
    });
    confirm.present();
  }

  private configurarSlide() {
    let i = this.slides.getActiveIndex();

    switch (i) {
      case 0:
        this.tituloSlide = `Ambiente`;
        this.slides.lockSwipeToPrev(true);
        this.slides.lockSwipeToNext(false);
      break;

      case 1:
        this.tituloSlide = `Imagens`;
        this.slides.lockSwipeToPrev(false);
        this.slides.lockSwipeToNext(false);
      break;

      case 2:
        this.tituloSlide = `Checklist`;
        this.slides.lockSwipeToPrev(false);
        this.slides.lockSwipeToNext(true);
      break;
    }
  }

  private exibirToast(mensagem: string): Promise<any> {
    return new Promise((resolve, reject) => {
      const toast = this.toastCtrl.create({
        message: mensagem, duration: Config.TOAST.DURACAO, position: 'bottom'
      });

      resolve(toast.present());
    });
  }
}