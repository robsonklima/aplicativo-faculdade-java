import { Component } from '@angular/core';
import { NavController, ToastController, LoadingController } from 'ionic-angular';

import { DadosGlobais } from '../../models/dados-globais';
import { IndicadorService } from '../../services/indicador';
import { DadosGlobaisService } from '../../services/dados-globais';

@Component({
  selector: 'indicador-acumulado-tecnico-page',
  templateUrl: 'indicador-acumulado-tecnico.html'
})
export class IndicadorAcumuladoTecnicoPage {
  dg: DadosGlobais;
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
    private toastCtrl: ToastController,
    private loadingCtrl: LoadingController,
    private navCtrl: NavController,
    private indicadorService: IndicadorService,
    private dadosGlobaisService: DadosGlobaisService
  ) {}

  ionViewWillEnter() {
    this.carregarDadosGlobais()
      .then(() => this.carregarGrfAcumuladoTecnicoApi())
      .then(() => this.carregarGrfPecasMaisTrocadasTecnicoApi())
      .then(() => this.carregarGrfPecasMaisPendenciadasTecnicoApi())
      .catch(() => {});
  }

  private carregarGrfAcumuladoTecnicoApi(): Promise<any> {
    return new Promise((resolve, reject) => {
      const loader = this.loadingCtrl.create({
        content: 'Carregando...'
      });
      loader.present();

      this.indicadorService.buscarGrfAcumuladoTecnicoApi(this.dg.usuario.codTecnico)
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

        loader.dismiss();
        resolve(dados);
      },
      err => {
        this.exibirToast("Não foi possível carregar os dados acumulados").then(() => {
          this.navCtrl.pop();
          reject(new Error(err.message));
        }).catch(() => {})
      });
    });
  }

  private carregarGrfPecasMaisTrocadasTecnicoApi(): Promise<any> {
    return new Promise((resolve, reject) => {
      this.indicadorService.buscarGrfPecasMaisTrocadasTecnicoApi()
        .subscribe(dados => {
          if (dados) {
            dados.forEach((d, i) => {
              this.pecasMaisTrocadas.push(d);
            });
          }

          resolve(dados);
        },
        err => {
          this.exibirToast("Não foi possível carregar as peças mais trocadas").then(() => {
            reject(new Error(err.message));
          }).catch(() => {})
        });      
    });
  }

  private carregarGrfPecasMaisPendenciadasTecnicoApi(): Promise<any> {
    return new Promise((resolve, reject) => {
      this.indicadorService.buscarGrfPecasMaisPendenciadasTecnicoApi()
        .subscribe(dados => {
          if (dados) {
            dados.forEach((d, i) => {
              this.pecasMaisPendenciadas.push(d);
            });
          }

          resolve(dados);
        },
        err => {
          this.exibirToast("Não foi possível carregar as peças mais pendenciadas").then(() => {
            reject(new Error(err.message));
          }).catch(() => {})
        });      
    });
  }

  private carregarDadosGlobais(): Promise<DadosGlobais> {
    return new Promise((resolve, reject) => {
      this.dadosGlobaisService.buscarDadosGlobaisStorage()
        .then((dados) => {
          if (dados)
            this.dg = dados;
            resolve(this.dg);
        })
        .catch((err) => {
          reject(new Error(err.message))
        });
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