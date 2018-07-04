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
      .then(() => {
        this.carregarSLAFiliaisApi()
          .then(() => this.carregarSLAFiliaisGrafico()).catch(() => {});
        
        this.carregarPendenciaFiliaisApi()
          .then(() => this.carregarPendenciaFiliaisGrafico()).catch(() => {});

        this.carregarReincidenciaFiliaisApi()
          .then(() => this.carregarReincidenciaFiliaisGrafico()).catch(() => {});
          
        this.carregarDispBBFilialApi()
          .then(() => this.carregarDispBBFilialGrafico()).catch(() => {});
      })
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

            let label: string = d.nomeFilial;
            let value: number = Number(d.percentual);
            let color: string;
            
            if (value > 95) {
              color = Config.COR_RGB.VERDE;
            } else if (value > 90.01 && value <= 95) {
              color = Config.COR_RGB.LARANJA;
            } else {
              color = Config.COR_RGB.VERMELHO;
            }

            if (label.indexOf(this.dg.usuario.filial.nomeFilial) == 0) {
              color = Config.COR_RGB.AZUL;
              label = "MINHA FILIAL";
            } 

            this.grfSLAFiliaisLabels.push(label);
            this.grfSLAFiliaisValues.push(value);
            this.grfSLAFiliaisColors.push(color);
          });
          
          resolve(dados);
        },
        err => { reject(); });
    });
  }

  private carregarSLAFiliaisGrafico() {
    var horizontalBarChartData = {
			labels: this.grfSLAFiliaisLabels,
			datasets: [{
				label: '%',
				backgroundColor: this.grfSLAFiliaisColors,
				borderColor: this.grfSLAFiliaisColors,
				borderWidth: 1,
				data: this.grfSLAFiliaisValues
			}]
		};

    this.grfSLAFiliais = new Chart(this.grfSLAFiliais.nativeElement, {
      type: 'horizontalBar',
      data: horizontalBarChartData,
      options: {
        elements: {
          rectangle: {
            borderWidth: 2,
          }
        },
        responsive: true, 
        maintainAspectRatio: false,
        legend: false,
        title: {
          display: false,
          text: 'SLA por Filiais'
        },
        scales: { 
          xAxes: [{ ticks: { beginAtZero: false } }]
        }
      }
    });
  }

  private carregarPendenciaFiliaisApi(): Promise<any> {
    return new Promise((resolve, reject) => {
      this.indicadorService.buscarGrfPendenciaFilialApi()
      .subscribe(dados => {
        dados.forEach((d, i) => {
          if (d.percentual == 0) { return; }

          let label: string = d.nomeFilial;
          let value: number = Number(d.percentual);
          let color: string;
          
          if (value <= 3) {
            color = Config.COR_RGB.VERDE;
          } else if (value > 3 && value < 5) {
            color = Config.COR_RGB.LARANJA;
          } else {
            color = Config.COR_RGB.VERMELHO;
          }

          if (label.indexOf(this.dg.usuario.filial.nomeFilial) == 0) {
            color = Config.COR_RGB.AZUL;
            label = "MINHA FILIAL";
          } 

          this.grfPendenciaFiliaisLabels.push(label);
          this.grfPendenciaFiliaisValues.push(value);
          this.grfPendenciaFiliaisColors.push(color);
        });

        resolve(dados);
      },
      err => { reject(); });
    });
  }

  private carregarPendenciaFiliaisGrafico() {
    var horizontalBarChartData = {
			labels: this.grfPendenciaFiliaisLabels,
			datasets: [{
				label: '%',
				backgroundColor: this.grfPendenciaFiliaisColors,
				borderColor: this.grfPendenciaFiliaisColors,
				borderWidth: 1,
				data: this.grfPendenciaFiliaisValues
			}]
		};

    this.grfPendenciaFiliais = new Chart(this.grfPendenciaFiliais.nativeElement, {
      type: 'horizontalBar',
      data: horizontalBarChartData,
      options: {
        elements: {
          rectangle: {
            borderWidth: 2,
          }
        },
        responsive: true, 
        maintainAspectRatio: false,
        legend: false,
        title: {
          display: false,
          text: 'Pendência por Filiais'
        },
        scales: { 
          xAxes: [{ ticks: { beginAtZero: false } }]
        }
      }
    });
  }

  private carregarReincidenciaFiliaisApi(): Promise<any> {
    return new Promise((resolve, reject) => {
      this.indicadorService.buscarGrfReincidenciaFilialApi()
        .subscribe(dados => {
          dados.forEach((d, i) => {
            if (d.percentual == 0) { return; }

            let label: string = d.nomeFilial;
            let value: number = Number(d.percentual);
            let color: string;
            
            if (value < 35) {
              color = Config.COR_RGB.VERDE;
            } else {
              color = Config.COR_RGB.VERMELHO;
            }

            if (label.indexOf(this.dg.usuario.filial.nomeFilial) == 0) {
              color = Config.COR_RGB.AZUL;
              label = "MINHA FILIAL";
            } 

            this.grfReincidenciaFiliaisLabels.push(label);
            this.grfReincidenciaFiliaisValues.push(value);
            this.grfReincidenciaFiliaisColors.push(color);
          });

          resolve(dados);
        },
        err => { reject(); });
    });
  }

  private carregarReincidenciaFiliaisGrafico() {
    var horizontalBarChartData = {
			labels: this.grfReincidenciaFiliaisLabels,
			datasets: [{
				label: '%',
				backgroundColor: this.grfReincidenciaFiliaisColors,
				borderColor: this.grfReincidenciaFiliaisColors,
				borderWidth: 1,
				data: this.grfReincidenciaFiliaisValues
			}]
		};

    this.grfReincidenciaFiliais = new Chart(this.grfReincidenciaFiliais.nativeElement, {
      type: 'horizontalBar',
      data: horizontalBarChartData,
      options: {
        elements: {
          rectangle: {
            borderWidth: 2,
          }
        },
        responsive: true, 
        maintainAspectRatio: false,
        legend: false,
        title: {
          display: false,
          text: 'Reincidência por Filiais'
        },
        scales: { 
          xAxes: [{ ticks: { beginAtZero: false } }]
        }
      }
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