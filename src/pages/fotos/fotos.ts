import { Component } from '@angular/core';
import { ViewController, NavParams, ToastController, AlertController } from 'ionic-angular';

import { Camera } from "@ionic-native/camera";

import { Chamado } from '../../models/chamado';
import { Foto } from '../../models/foto';

import { ChamadoService } from '../../services/chamado';

@Component({
  selector: 'fotos-page',
  templateUrl: 'fotos.html'
})
export class FotosPage {
  chamado: Chamado;
  foto: Foto;

  constructor(
      private viewCtrl: ViewController,
      private navParams: NavParams,
      private toastCtrl: ToastController,
      private alertCtrl: AlertController,
      private camera: Camera,
      private chamadoService: ChamadoService
  ) { 
    this.chamado = this.navParams.get('chamado');
  }
  
  public tirarFoto() {
    this.camera.getPicture({
      quality: 80,
      destinationType: this.camera.DestinationType.DATA_URL,
      encodingType: this.camera.EncodingType.JPEG,
      mediaType: this.camera.MediaType.PICTURE,
      correctOrientation: true,
      targetWidth: 720,
      targetHeight: 480
    }).then(imageData => {
      this.exibirToast("Foto adicionada com sucesso").then(() => {
        this.foto = new Foto();
        this.foto.nome = this.chamado.codOs.toString() + '_' 
          + this.chamado.rats[0].numRat + '_' + new Date().getUTCMilliseconds().toString();
        this.foto.str = 'data:image/jpeg;base64,' + imageData;

        this.chamado.rats[0].fotos.push(this.foto);
        this.chamadoService.atualizarChamado(this.chamado);

        this.camera.cleanup();
      }).catch(() => {});
    }).catch(err => {
      this.exibirToast(err);
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
            this.chamado.rats[0].fotos.splice(i, 1);

            this.exibirToast('Foto removida com sucesso')
              .then(() => {
                this.chamadoService.atualizarChamado(this.chamado);
              })
              .catch(() => {});
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

  public fecharModal() {
    this.viewCtrl.dismiss();
  }
}