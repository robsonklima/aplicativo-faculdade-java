import { Component } from '@angular/core';
import { LoadingController, NavController, ToastController } from 'ionic-angular';

import { IndicadorService } from '../../services/indicador';

@Component({
  selector: 'indicador-acumulado-tecnico',
  templateUrl: 'indicador-acumulado-tecnico.html'
})
export class IndicadorAcumuladoTecnicoPage {
  desvioMediaAtendimentosDia: string = "";
  mediaAtendimentosDia: string = "";
  qtdOSCorretiva: string = "";
  qtdOSGeral: string = "";
  qtdOSOutrasIntervencoes: string = "";
  qtdOSPreventiva: string = "";
  desvioMediaAtendimentosDiaMelhorTecnico: string = "";
  mediaAtendimentosDiaMelhorTecnico: string = "";
  qtdOSCorretivaMelhorTecnico: string = "";
  qtdOSGeralMelhorTecnico: string = "";
  qtdOSOutrasIntervencoesMelhorTecnico: string = "";
  qtdOSPreventivaMelhorTecnico: string = "";
  qtdPecasTrocadas: string = "";
  percChamadosFechadosPecasTrocadas: string = "";
  pecasMaisTrocadas: any[] = [];
  pecasMaisPendenciadas: any[] = [];

  constructor(
    private loadingCtrl: LoadingController,
    private toastCtrl: ToastController,
    private navCtrl: NavController,
    private indicadorService: IndicadorService
  ) {}

  ionViewWillEnter() {
    const loading = this.loadingCtrl.create({ 
      content: 'Aguarde...' 
    });
    loading.present();

    this.indicadorService.buscarGrfAcumuladoTecnicoApi()
      .subscribe(dados => {
        if (dados.length > 0) {
          this.qtdOSGeral = dados[0].qtdOSGeral;
          this.qtdOSCorretiva = dados[0].qtdOSCorretiva;
          this.qtdOSPreventiva = dados[0].qtdOSPreventiva;
          this.qtdOSOutrasIntervencoes = dados[0].qtdOSOutrasIntervencoes;
          this.mediaAtendimentosDia = dados[0].mediaAtendimentosDia;
          this.desvioMediaAtendimentosDia = dados[0].desvioMediaAtendimentosDia;
          
          this.qtdOSGeralMelhorTecnico = dados[0].qtdOSGeralMelhorTecnico;
          this.qtdOSCorretivaMelhorTecnico = dados[0].qtdOSCorretivaMelhorTecnico;
          this.qtdOSPreventivaMelhorTecnico = dados[0].qtdOSPreventivaMelhorTecnico;
          this.qtdOSOutrasIntervencoesMelhorTecnico = dados[0].qtdOSOutrasIntervencoesMelhorTecnico;
          this.desvioMediaAtendimentosDiaMelhorTecnico = dados[0].desvioMediaAtendimentosDiaMelhorTecnico;
          this.mediaAtendimentosDiaMelhorTecnico = dados[0].mediaAtendimentosDiaMelhorTecnico;

          this.qtdPecasTrocadas = dados[0].qtdPecasTrocadas;
          this.percChamadosFechadosPecasTrocadas = dados[0].percChamadosFechadosPecasTrocadas;
        }

        this.indicadorService.buscarGrfPecasMaisTrocadasTecnicoApi()
          .subscribe(dados => {
            if (dados) {
              dados.forEach((d, i) => {
                this.pecasMaisTrocadas.push(d);
              });
            }

            this.indicadorService.buscarGrfPecasMaisPendenciadasTecnicoApi()
              .subscribe(dados => {
                if (dados) {
                  dados.forEach((d, i) => {
                    this.pecasMaisPendenciadas.push(d);
                  });
                }

                loading.dismiss();
              },
              err => {
                this.exibirToast("Não foi possível carregar as peças mais pendenciadas");
                loading.dismiss();
              });
          },
          err => {
            this.exibirToast("Não foi possível carregar as peças mais trocadas");
            loading.dismiss();
          });
      },
      err => {
        loading.dismiss();

        this.exibirToast("Não foi possível carregar os dados acumulados")
          .then(() => {
            this.navCtrl.pop();
          })
          .catch(() => {})
      });
  }

  public exibirToast(message: string): Promise<any> {    
    return new Promise((resolve, reject) => {
      const toast = this.toastCtrl.create({
        message: message, duration: 2000, position: 'bottom'
      });

      resolve(toast.present());
    });
  }
}