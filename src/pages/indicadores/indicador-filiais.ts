import { Component, ViewChild } from '@angular/core';
import { Chart } from 'chart.js';

import { IndicadorService } from '../../services/indicador';
import { Config } from '../../config/config';

@Component({
  selector: 'indicador-filiais-page',
  templateUrl: 'indicador-filiais.html'
})
export class IndicadorFiliaisPage {

  grfSLAFiliaisLabels: string[] = [];
  grfSLAFiliaisValues: number[] = [];
  grfSLAFiliaisColors: string[] = [];
  @ViewChild('grfSLAFiliais') grfSLAFiliais;

  grfPendenciaFiliaisLabels: string[] = [];
  grfPendenciaFiliaisValues: number[] = [];
  grfPendenciaFiliaisColors: string[] = [];
  @ViewChild('grfPendenciaFiliais') grfPendenciaFiliais;

  grfReincidenciaFiliaisLabels: string[] = [];
  grfReincidenciaFiliaisValues: number[] = [];
  grfReincidenciaFiliaisColors: string[] = [];
  @ViewChild('grfReincidenciaFiliais') grfReincidenciaFiliais;
  
  constructor(
    private indicadorService: IndicadorService
  ) {}

  ionViewDidLoad() {
    this.carregarSLAFiliaisApi()
      .then(() => this.carregarSLAFiliaisGrafico())
      .then(() => this.carregarPendenciaFiliaisApi())
      .then(() => this.carregarPendenciaFiliaisGrafico())
      .then(() => this.carregarReincidenciaFiliaisApi())
      .then(() => this.carregarReincidenciaFiliaisGrafico());    
  }

  private carregarSLAFiliaisApi(): Promise<any> {
    return new Promise((resolve, reject) => {
      this.indicadorService.buscarGrfSLAFilialApi()
        .subscribe(dados => {
          dados.forEach((d, i) => {
            this.grfSLAFiliaisLabels.push(d.nomeFilial);
            this.grfSLAFiliaisValues.push(Number(d.percentual));
            if (d.percentual > Config.PERC_SLA_ACEITAVEL) {
              this.grfSLAFiliaisColors.push('rgba(75, 192, 192, 0.2)');
            } else {
              this.grfSLAFiliaisColors.push('rgba(255, 0, 0, 0.2)');
            }
          });

          resolve();
        },
        err => {
          reject();
        });
    });
  }

  private carregarSLAFiliaisGrafico() {
    this.grfSLAFiliais = new Chart(this.grfSLAFiliais.nativeElement, {
      type: 'bar',
      barChartLegend: false,
      data: {
        labels: this.grfSLAFiliaisLabels,
        datasets: [{
          label: '%',
          data: this.grfSLAFiliaisValues,
          backgroundColor: this.grfSLAFiliaisColors,
          borderWidth: 1
        }]
      },
      options: { legend: false, scales: { yAxes: [{ ticks: { beginAtZero: true } }] } }
    });
  }

  private carregarPendenciaFiliaisApi(): Promise<any> {
    return new Promise((resolve, reject) => {
      this.indicadorService.buscarGrfPendenciaFilialApi()
      .subscribe(dados => {
        dados.forEach((d, i) => {
          this.grfPendenciaFiliaisLabels.push(d.nomeFilial);
          this.grfPendenciaFiliaisValues.push(Number(d.percentual));
          if (d.percentual < Config.PERC_PEND_ACEITAVEL) {
            this.grfPendenciaFiliaisColors.push('rgba(75, 192, 192, 0.2)');
          } else {
            this.grfPendenciaFiliaisColors.push('rgba(255, 0, 0, 0.2)');
          }
        });

        resolve();
      },
      err => {
        reject();
      });
    });
  }

  private carregarPendenciaFiliaisGrafico() {
    this.grfPendenciaFiliais = new Chart(this.grfPendenciaFiliais.nativeElement, {
      type: 'bar',
      data: {
        labels: this.grfPendenciaFiliaisLabels,
        datasets: [{
          label: '%',
          data: this.grfPendenciaFiliaisValues,
          backgroundColor: this.grfPendenciaFiliaisColors,
          borderWidth: 1
        }]
      },
      options: { legend: false, scales: { yAxes: [{ ticks: { beginAtZero: true } }] } }
    });
  }

  private carregarReincidenciaFiliaisApi(): Promise<any> {
    return new Promise((resolve, reject) => {
      this.indicadorService.buscarGrfReincidenciaFilialApi()
        .subscribe(dados => {
          dados.forEach((d, i) => {
            this.grfReincidenciaFiliaisLabels.push(d.nomeFilial);
            this.grfReincidenciaFiliaisValues.push(Number(d.percentual));
            if (d.percentual > Config.PERC_REINC_ACEITAVEL) {
              this.grfReincidenciaFiliaisColors.push('rgba(75, 192, 192, 0.2)');
            } else {
              this.grfReincidenciaFiliaisColors.push('rgba(255, 0, 0, 0.2)');
            }
          });

          resolve();
        },
        err => {
          reject();
        });
    });
  }

  private carregarReincidenciaFiliaisGrafico() {
    this.grfReincidenciaFiliais = new Chart(this.grfReincidenciaFiliais.nativeElement, {
      type: 'bar',
      data: {
        labels: this.grfReincidenciaFiliaisLabels,
        datasets: [{
          label: '%',
          data: this.grfReincidenciaFiliaisValues,
          backgroundColor: this.grfReincidenciaFiliaisColors,
          borderWidth: 1
        }]
      },
      options: { legend: false, scales: { yAxes: [{ ticks: { beginAtZero: true } }] } }
    });
  }
}