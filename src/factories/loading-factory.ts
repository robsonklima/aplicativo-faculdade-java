import { Injectable } from '@angular/core';
import { Loading, LoadingController } from 'ionic-angular';


@Injectable()
export class LoadingFactory {
  loading: Loading;

  constructor(
    private loadingCtrl: LoadingController
  ) {}

  exibir(conteudo: string='Aguarde') {
    this.loading = this.loadingCtrl.create({ content: conteudo });

    this.loading.present();
  }

  alterar(novoConteudo: string) {
    this.loading.setContent(novoConteudo);
  }

  encerrar() {
    this.loading.dismiss();
  }
}