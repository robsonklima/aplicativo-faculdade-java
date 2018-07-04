import { Component, ViewChild } from '@angular/core';

import { Chart } from 'chart.js';
import { Config } from '../../config/config';

import { DadosGlobais } from '../../models/dados-globais';
import { DadosGlobaisService } from '../../services/dados-globais';
import { IndicadorService } from '../../services/indicador';

@Component({
  selector: 'indicador-filiais-page',
  templateUrl: 'indicador-filiais.html'
})
export class IndicadorFiliaisPage {
  dg: DadosGlobais;
  
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

  grfDispBBFilialLabels: string[] = [];
  grfDispBBFilialValues: number[] = [];
  grfDispBBFilialColors: string[] = [];
  @ViewChild('grfDispBBFilial') grfDispBBFilial;
  
  constructor(
    private indicadorService: IndicadorService,
    private dgService: DadosGlobaisService
  ) {}

  ionViewDidLoad() {
    this.carregarDadosGlobais()
      .then(() => this.carregarSLAFiliaisApi())
      .then(() => this.carregarSLAFiliaisGrafico())
      .then(() => this.carregarPendenciaFiliaisApi())
      .then(() => this.carregarPendenciaFiliaisGrafico())
      .then(() => this.carregarReincidenciaFiliaisApi())
      .then(() => this.carregarReincidenciaFiliaisGrafico())
      .then(() => this.carregarDispBBFilialApi())
      .then(() => this.carregarDispBBFilialGrafico())
      .catch(() => {});   
  }

  private carregarDadosGlobais(): Promise<DadosGlobais> {
    return new Promise((resolve, reject) => {
      this.dgService.buscarDadosGlobaisStorage()
        .then((dados) => {
          if (dados)
            this.dg = dados;
            resolve(dados);
        })
        .catch((err) => {
          reject(new Error(err.message))
        });
    });
  }

  private carregarSLAFiliaisApi(): Promise<any> {
    return new Promise((resolve, reject) => {
      this.indicadorService.buscarGrfSLAFilialApi()
        .subscribe(dados => {
          dados.forEach((d, i) => {
            if (d.percentual == 0) { return; }
            
            this.grfSLAFiliaisLabels.push(d.nomeFilial);
            this.grfSLAFiliaisValues.push(Number(d.percentual));
            if (Number(d.percentual) > Config.PERC_SLA_ACEITAVEL) {
              this.grfSLAFiliaisColors.push(Config.COR_RGB.VERDE);
            } else {
              this.grfSLAFiliaisColors.push(Config.COR_RGB.VERMELHO);
            }
          });
          
          resolve(dados);
        },
        err => { reject(); });
    });
  }

  private carregarSLAFiliaisGrafico() {
    this.grfSLAFiliais = new Chart(this.grfSLAFiliais.nativeElement, {
      type: 'line',
      data: {
        labels: this.grfSLAFiliaisLabels,
        datasets: [
          {
            label: "%",
            fill: true,
            lineTension: 0,
            backgroundColor: Config.COR_RGB.CINZA,
            borderColor: this.grfSLAFiliaisColors,
            //borderCapStyle: 'butt',
            //borderJoinStyle: 'miter',
            borderDash: [],
            borderDashOffset: 1.0,
            pointBorderColor: this.grfSLAFiliaisColors,
            pointBackgroundColor: this.grfSLAFiliaisColors,
            pointBorderWidth: 3,
            pointHoverRadius: 3,
            pointHoverBackgroundColor: this.grfSLAFiliaisColors,
            pointHoverBorderColor: this.grfSLAFiliaisColors,
            pointHoverBorderWidth: 2,
            pointRadius: 3,
            pointHitRadius: 3,
            data: this.grfSLAFiliaisValues,
            spanGaps: true
          }
        ]
      },
      options: { legend: false, scales: { xAxes: [{ display: false }] } }
    });
  }

  private carregarPendenciaFiliaisApi(): Promise<any> {
    return new Promise((resolve, reject) => {
      this.indicadorService.buscarGrfPendenciaFilialApi()
      .subscribe(dados => {
        dados.forEach((d, i) => {
          if (d.percentual == 0) { return; }

          this.grfPendenciaFiliaisLabels.push(d.nomeFilial);
          this.grfPendenciaFiliaisValues.push(Number(d.percentual));
          if (d.percentual < Config.PERC_PEND_ACEITAVEL) {
            this.grfPendenciaFiliaisColors.push(Config.COR_RGB.VERDE);
          } else {
            this.grfPendenciaFiliaisColors.push(Config.COR_RGB.VERMELHO);
          }
        });

        resolve(dados);
      },
      err => { reject(); });
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
            if (d.percentual == 0) { return; }

            this.grfReincidenciaFiliaisLabels.push(d.nomeFilial);
            this.grfReincidenciaFiliaisValues.push(Number(d.percentual));
            if (d.percentual < Config.PERC_REINC_ACEITAVEL) {
              this.grfReincidenciaFiliaisColors.push(Config.COR_RGB.VERDE);
            } else {
              this.grfReincidenciaFiliaisColors.push(Config.COR_RGB.VERMELHO);
            }
          });

          resolve(dados);
        },
        err => { reject(); });
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

  private carregarDispBBFilialApi(): Promise<any> {
    return new Promise((resolve, reject) => {
      this.indicadorService.buscarGrfDispBBFilialApi(this.dg.usuario.filial.codFilial)
        .subscribe(dados => {
          dados.forEach((d, i) => {
            this.grfDispBBFilialLabels.push(d[0].replace('DISP.', 'D') + '-' + d[2].substring(0, 4));
            this.grfDispBBFilialValues.push(Number(d[1]));

            if (Number(d[1]) > Number(d[3])) {
              this.grfDispBBFilialColors.push(Config.COR_RGB.VERDE);
            } else {
              this.grfDispBBFilialColors.push(Config.COR_RGB.VERMELHO);
            }
          });
          
          resolve(dados);
        },
        err => { reject(); });
    });
  }

  private carregarDispBBFilialGrafico() {
    this.grfDispBBFilial = new Chart(this.grfDispBBFilial.nativeElement, {
      type: 'bar',
      data: {
        labels: this.grfDispBBFilialLabels,
        datasets: [{
          label: '%',
          data: this.grfDispBBFilialValues,
          backgroundColor: this.grfDispBBFilialColors,
          borderWidth: 1
        }]
      },
      options: { legend: false, scales: { yAxes: [{ ticks: { beginAtZero: true } }] } }
    });
  }
}