import { Component } from '@angular/core';
import { LoadingController, AlertController } from 'ionic-angular';

import { IndicadorService } from '../../services/indicador';

@Component({
  selector: 'indicador-acumulado-tecnico',
  templateUrl: 'indicador-acumulado-tecnico.html'
})
export class IndicadorAcumuladoTecnicoPage {
  desvioMediaAtendimentosDia: string;
  mediaAtendimentosDia: string;
  qtdOSCorretiva: string;
  qtdOSGeral: string;
  qtdOSOutrasIntervencoes: string;
  qtdOSPreventiva: string;

  constructor(
    private loadingCtrl: LoadingController,
    private alertCtrl: AlertController,
    private indicadorService: IndicadorService
  ) {}

  ionViewWillEnter() {
    const loading = this.loadingCtrl.create({ 
      content: 'Aguarde...' 
    });
    loading.present();

    this.indicadorService.buscarGrfAcumuladoTecnicoApi()
      .subscribe(dados => {
        if (dados) {
          this.qtdOSGeral = dados[0].qtdOSGeral;
          this.qtdOSCorretiva = dados[0].qtdOSCorretiva;
          this.qtdOSPreventiva = dados[0].qtdOSPreventiva;
          this.qtdOSOutrasIntervencoes = dados[0].qtdOSOutrasIntervencoes;
          this.mediaAtendimentosDia = dados[0].mediaAtendimentosDia;
          this.desvioMediaAtendimentosDia = dados[0].desvioMediaAtendimentosDia;
        }

        loading.dismiss();
      },
      err => {
        this.exibirAlerta("Não foi possível buscar os dados acumulados");
        loading.dismiss();
      });
  }

  exibirAlerta(msg: string) {
    const alerta = this.alertCtrl.create({
      title: 'Alerta!',
      subTitle: msg,
      buttons: ['OK']
    });

    alerta.present();
  }
}