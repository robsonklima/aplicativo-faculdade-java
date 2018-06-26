import { Component, ViewChild } from '@angular/core';
import { ToastController } from 'ionic-angular';

import { Chart } from 'chart.js';
import { DadosGlobaisService } from '../../services/dados-globais';
import { IndicadorService } from '../../services/indicador';
import { DadosGlobais } from '../../models/dados-globais';

@Component({
  selector: 'indicador-tecnico-page',
  templateUrl: 'indicador-tecnico.html'
})
export class IndicadorTecnicoPage {
  dg: DadosGlobais;

  grfSLATecnicoLabels: string[] = [];
  grfSLATecnicoValues: number[] = [];
  grfSLATecnicoColors: string[] = [];
  @ViewChild('grfSLATecnico') grfSLATecnico;

  grfPendenciaTecnicoLabels: string[] = [];
  grfPendenciaTecnicoValues: number[] = [];
  grfPendenciaTecnicoColors: string[] = [];
  @ViewChild('grfPendenciaTecnico') grfPendenciaTecnico;

  grfReincidenciaTecnicoLabels: string[] = [];
  grfReincidenciaTecnicoValues: number[] = [];
  grfReincidenciaTecnicoColors: string[] = [];
  @ViewChild('grfReincidenciaTecnico') grfReincidenciaTecnico;

  constructor(
    private toastCtrl: ToastController,
    private dadosGlobaisService: DadosGlobaisService,
    private indicadorService: IndicadorService
  ) {}

  ionViewDidLoad() {
    this.carregarDadosGlobais()
      .then(() => this.carregarSLATecnicoApi(this.dg.usuario.codTecnico))
      .then(() => this.carregarSLATecnicoGrafico())
      .then(() => this.carregarPendenciaTecnicoApi(this.dg.usuario.codTecnico))
      .then(() => this.carregarPendenciaTecnicoGrafico())
      .then(() => this.carregarReincidenciaTecnicoApi(this.dg.usuario.codTecnico))
      .then(() => this.carregarReincidenciaTecnicoGrafico())
      .catch(() => {});
  }

  private carregarSLATecnicoApi(codTecnico: number): Promise<any> {
    return new Promise((resolve, reject) => {
      this.indicadorService.buscarGrfSLATecnicoApi(codTecnico)
      .subscribe(dados => {
        dados.forEach((d, i) => {
          this.grfSLATecnicoLabels.push('Fora do Prazo');
          this.grfSLATecnicoValues.push(Number(d.percForaPrazo));
          this.grfSLATecnicoColors.push('rgba(255, 0, 0, 0.2)');

          this.grfSLATecnicoLabels.push('No Prazo');
          this.grfSLATecnicoValues.push(Number(d.percNoPrazo));
          this.grfSLATecnicoColors.push('rgba(75, 192, 192, 0.2)');
        });
        
        resolve();
      },
      err => {
        this.exibirToast(err.message);
        reject();
      });
    });
  }

  private carregarSLATecnicoGrafico() {
    this.grfSLATecnico = new Chart(this.grfSLATecnico.nativeElement, {
      type: 'doughnut',
      data: {
        labels: this.grfSLATecnicoLabels,
        datasets: [{
          label: 'Percentual',
          data: this.grfSLATecnicoValues,
          backgroundColor: this.grfSLATecnicoColors
        }]
      }
    });
  }

  private carregarPendenciaTecnicoApi(codTecnico: number): Promise<any> {
    return new Promise((resolve, reject) => {
      this.indicadorService.buscarGrfPendenciaTecnicoApi(codTecnico)
      .subscribe(dados => {
        dados.forEach((d, i) => {
          this.grfPendenciaTecnicoLabels.push('Fora do Prazo');
          this.grfPendenciaTecnicoValues.push(Number(d.percentualChamadosPendentes.replace(',', '.')));
          this.grfPendenciaTecnicoColors.push('rgba(255, 0, 0, 0.2)');

          this.grfPendenciaTecnicoLabels.push('No Prazo');
          this.grfPendenciaTecnicoValues.push(Number(d.percentualChamadosNaoPendentes.replace(',', '.')));
          this.grfPendenciaTecnicoColors.push('rgba(75, 192, 192, 0.2)');
        });

        resolve();
      },
      err => {
        this.exibirToast(err.message);
        reject();
      });
    });
  }

  private carregarPendenciaTecnicoGrafico() {
    this.grfPendenciaTecnico = new Chart(this.grfPendenciaTecnico.nativeElement, {
      type: 'doughnut',
      data: {
        labels: this.grfPendenciaTecnicoLabels,
        datasets: [{
          label: 'Percentual',
          data: this.grfPendenciaTecnicoValues,
          backgroundColor: this.grfPendenciaTecnicoColors
        }]
      }
    });
  }

  private carregarReincidenciaTecnicoApi(codTecnico: number): Promise<any> {
    return new Promise((resolve, reject) => {
      this.indicadorService.buscarGrfReincidenciaTecnicoApi(codTecnico)
      .subscribe(dados => {
        dados.forEach((d, i) => {
          this.grfReincidenciaTecnicoLabels.push('Fora do Prazo');
          this.grfReincidenciaTecnicoValues.push(Number(d.percChamadosReincidentes.replace(',', '.')));
          this.grfReincidenciaTecnicoColors.push('rgba(255, 0, 0, 0.2)');

          this.grfReincidenciaTecnicoLabels.push('No Prazo');
          this.grfReincidenciaTecnicoValues.push(Number(d.percChamadosNaoReincidentes.replace(',', '.')));
          this.grfReincidenciaTecnicoColors.push('rgba(75, 192, 192, 0.2)');
        });

        resolve();
      },
      err => {
        this.exibirToast(err.message);
        reject();
      });
    });
  }

  private carregarReincidenciaTecnicoGrafico() {
    this.grfReincidenciaTecnico = new Chart(this.grfReincidenciaTecnico.nativeElement, {
      type: 'doughnut',
      data: {
        labels: this.grfReincidenciaTecnicoLabels,
        datasets: [{
          label: 'Percentual',
          data: this.grfReincidenciaTecnicoValues,
          backgroundColor: this.grfReincidenciaTecnicoColors
        }]
      }
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