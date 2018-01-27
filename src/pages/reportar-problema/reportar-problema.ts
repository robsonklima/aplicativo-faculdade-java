import { Component } from '@angular/core';
import { LoadingController, ToastController } from 'ionic-angular';
import { NgForm } from '@angular/forms';

import { DadosGlobais } from '../../models/dados-globais';
import { DadosGlobaisService } from '../../services/dados-globais';

@Component({
  selector: 'reportar-problema-page',
  templateUrl: 'reportar-problema.html'
})
export class ReportarProblemaPage {
  dadosGlobais: DadosGlobais;

  constructor(
    private loadingCtrl: LoadingController,
    private toastCtrl: ToastController,
    private dadosGlobaisService: DadosGlobaisService
  ) { }

  ionViewWillEnter() {
    this.carregarDadosGlobais();
  }

  private carregarDadosGlobais() {
    this.dadosGlobaisService.buscarDadosGlobaisStorage()
      .then((dados: DadosGlobais) => {
        if (dados) 
          this.dadosGlobais = dados;
      })
      .catch((err) => {});
  }

  public reportarProblema(form: NgForm) {
    const loading = this.loadingCtrl.create({ 
      content: 'Processando...' 
    });
    loading.present();

    // let problema = new Problema();
    // problema.problemaRelatado = form.value.problemaReportado;

    this.exibirToast(form.value.problemaReportado);  
    loading.dismiss();

    // this.problemaService.reportarProblema(problema).subscribe((resultado) => {
    //   if (resultado)
    //     loading.dismiss().then(() => {
    //       this.exibirToast(resultado);
    //       form.reset();
    //     });
    //   }),
    //   err => {
    //     loading.dismiss().then(() => {
    //       this.exibirToast('Não foi possível enviar sua mensagem');
    //     });
    //   }
  }

  private exibirToast(mensagem: string): Promise<any> {
    return new Promise((resolve, reject) => {
      const toast = this.toastCtrl.create({
        message: mensagem, duration: 2500, position: 'bottom'
      });

      resolve(toast.present());
    });
  }
}