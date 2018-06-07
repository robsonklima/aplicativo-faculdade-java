import { Component, ViewChild } from '@angular/core';
import { Chart } from 'chart.js';

import { IndicadorService } from '../../services/indicador';

@Component({
  selector: 'indicador-tecnico-page',
  templateUrl: 'indicador-tecnico.html'
})
export class IndicadorTecnicoPage {
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
    private indicadorService: IndicadorService
  ) {}

  ionViewDidLoad() {
    this.carregarSLATecnicoApi()
      .then(() => this.carregarSLATecnicoGrafico())
      .then(() => this.carregarPendenciaTecnicoApi())
      .then(() => this.carregarPendenciaTecnicoGrafico())
      .then(() => this.carregarReincidenciaTecnicoApi())
      .then(() => this.carregarReincidenciaTecnicoGrafico());
  }

  private carregarSLATecnicoApi(): Promise<any> {
    return new Promise((resolve, reject) => {
      this.indicadorService.buscarGrfSLATecnicoApi()
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

  private carregarPendenciaTecnicoApi(): Promise<any> {
    return new Promise((resolve, reject) => {
      this.indicadorService.buscarGrfPendenciaTecnicoApi()
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

  private carregarReincidenciaTecnicoApi(): Promise<any> {
    return new Promise((resolve, reject) => {
      this.indicadorService.buscarGrfReincidenciaTecnicoApi()
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
}