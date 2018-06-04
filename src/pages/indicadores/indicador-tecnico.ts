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

  grfSLAMelhorTecnicoLabels: string[] = [];
  grfSLAMelhorTecnicoValues: number[] = [];
  @ViewChild('grfSLAMelhorTecnico') grfSLAMelhorTecnico;

  grfPendenciaTecnicoLabels: string[] = [];
  grfPendenciaTecnicoValues: number[] = [];
  @ViewChild('grfPendenciaTecnico') grfPendenciaTecnico;

  grfPendenciaMelhorTecnicoLabels: string[] = [];
  grfPendenciaMelhorTecnicoValues: number[] = [];
  @ViewChild('grfPendenciaMelhorTecnico') grfPendenciaMelhorTecnico;

  grfReincidenciaTecnicoLabels: string[] = [];
  grfReincidenciaTecnicoValues: number[] = [];
  @ViewChild('grfReincidenciaTecnico') grfReincidenciaTecnico;

  grfReincidenciaMelhorTecnicoLabels: string[] = [];
  grfReincidenciaMelhorTecnicoValues: number[] = [];
  @ViewChild('grfReincidenciaMelhorTecnico') grfReincidenciaMelhorTecnico;

  constructor(
    private indicadorService: IndicadorService
  ) {}

  ionViewDidLoad() {
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
        
        this.carregarGrfSLATecnico();
      },
      err => {});

    //this.carregarGrfSLATecnico();
    
    //this.carregarGrfSLAMelhorTecnico();
    //this.carregarGrfPendenciaTecnico();
    //this.carregarGrfPendenciaMelhorTecnico();
    //this.carregarGrfReincidenciaTecnico();
    //this.carregarGrfReincidenciaMelhorTecnico();
  }

  private carregarGrfSLATecnico() {
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

  private carregarGrfSLAMelhorTecnico() {
    this.grfSLAMelhorTecnicoLabels = ['Fora do Prazo', 'No Prazo'];
    this.grfSLAMelhorTecnicoValues = [1, 99];

    this.grfSLAMelhorTecnico = new Chart(this.grfSLAMelhorTecnico.nativeElement, {
      type: 'doughnut',
      data: {
        labels: this.grfSLAMelhorTecnicoLabels,
        datasets: [{
          label: 'Percentual',
          data: this.grfSLAMelhorTecnicoValues,
          backgroundColor: [
            'rgba(255, 0, 0, 0.2)', 'rgba(75, 192, 192, 0.2)'
          ],
          hoverBackgroundColor: [
            'rgba(255, 0, 0, 0.8)', 'rgba(75, 192, 192, 0.8)'
          ]
        }]
      }
    });
  }

  private carregarGrfPendenciaTecnico() {
    this.grfPendenciaTecnicoLabels = ['Fora do Prazo', 'No Prazo'];
    this.grfPendenciaTecnicoValues = [12, 88];

    this.grfPendenciaTecnico = new Chart(this.grfPendenciaTecnico.nativeElement, {
      type: 'doughnut',
      data: {
        labels: this.grfPendenciaTecnicoLabels,
        datasets: [{
          label: 'Percentual',
          data: this.grfPendenciaTecnicoValues,
          backgroundColor: [
            'rgba(255, 0, 0, 0.2)', 'rgba(75, 192, 192, 0.2)'
          ],
          hoverBackgroundColor: [
            'rgba(255, 0, 0, 0.8)', 'rgba(75, 192, 192, 0.8)'
          ]
        }]
      }
    });
  }

  private carregarGrfPendenciaMelhorTecnico() {
    this.grfPendenciaMelhorTecnicoLabels = ['Fora do Prazo', 'No Prazo'];
    this.grfPendenciaMelhorTecnicoValues = [22, 78];

    this.grfPendenciaMelhorTecnico = new Chart(this.grfPendenciaMelhorTecnico.nativeElement, {
      type: 'doughnut',
      data: {
        labels: this.grfPendenciaMelhorTecnicoLabels,
        datasets: [{
          label: 'Percentual',
          data: this.grfPendenciaMelhorTecnicoValues,
          backgroundColor: [
            'rgba(255, 0, 0, 0.2)', 'rgba(75, 192, 192, 0.2)'
          ],
          hoverBackgroundColor: [
            'rgba(255, 0, 0, 0.8)', 'rgba(75, 192, 192, 0.8)'
          ]
        }]
      }
    });
  }

  private carregarGrfReincidenciaTecnico() {
    this.grfReincidenciaTecnicoLabels = ['Fora do Prazo', 'No Prazo'];
    this.grfReincidenciaTecnicoValues = [32, 68];

    this.grfReincidenciaTecnico = new Chart(this.grfReincidenciaTecnico.nativeElement, {
      type: 'doughnut',
      data: {
        labels: this.grfReincidenciaTecnicoLabels,
        datasets: [{
          label: 'Percentual',
          data: this.grfReincidenciaTecnicoValues,
          backgroundColor: [
            'rgba(255, 0, 0, 0.2)', 'rgba(75, 192, 192, 0.2)'
          ],
          hoverBackgroundColor: [
            'rgba(255, 0, 0, 0.8)', 'rgba(75, 192, 192, 0.8)'
          ]
        }]
      }
    });
  }

  private carregarGrfReincidenciaMelhorTecnico() {
    this.grfReincidenciaMelhorTecnicoLabels = ['Fora do Prazo', 'No Prazo'];
    this.grfReincidenciaMelhorTecnicoValues = [32, 68];

    this.grfReincidenciaMelhorTecnico = new Chart(this.grfReincidenciaMelhorTecnico.nativeElement, {
      type: 'doughnut',
      data: {
        labels: this.grfReincidenciaMelhorTecnicoLabels,
        datasets: [{
          label: 'Percentual',
          data: this.grfReincidenciaMelhorTecnicoValues,
          backgroundColor: [
            'rgba(255, 0, 0, 0.2)', 'rgba(75, 192, 192, 0.2)'
          ],
          hoverBackgroundColor: [
            'rgba(255, 0, 0, 0.8)', 'rgba(75, 192, 192, 0.8)'
          ]
        }]
      }
    });
  }
}