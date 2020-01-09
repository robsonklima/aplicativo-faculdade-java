import { Injectable } from '@angular/core';
import { Config } from '../models/config';
import { Toast, ToastController } from 'ionic-angular';


@Injectable()
export class ToastFactory {
  toast: Toast;

  constructor(
    private toastCtrl: ToastController
  ) {}

  exibirToast(mensagem: string, tipo: string='info', posicao: string=null) {
    try {
      this.toast.dismiss();
    } catch(e) {}

    this.toast = this.toastCtrl.create({
      message: mensagem, 
      duration: Config.TOAST.DURACAO, 
      position: posicao || 'bottom', 
      cssClass: 'toast-' + tipo
    });
    
    this.toast.present();
  }
}