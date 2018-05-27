import { Component, ViewChild } from '@angular/core';
import { Chart } from 'chart.js';

@Component({
  selector: 'indicador-tecnico-page',
  templateUrl: 'indicador-tecnico.html'
})
export class IndicadorTecnicoPage {
  grfSLATecnicoLabels: string[] = [];
  grfSLATecnicoValues: number[] = [];
  @ViewChild('grfSLATecnico') grfSLATecnico;

  constructor() {}

  ionViewDidLoad() {
    this.carregarGrfSLATecnico();
  }

  private carregarGrfSLATecnico() {
    this.grfSLATecnicoLabels = ['Fora do Prazo', 'No Prazo'];
    this.grfSLATecnicoValues = [4, 96];

    this.grfSLATecnico = new Chart(this.grfSLATecnico.nativeElement, {
      type: 'doughnut',
      data: {
        labels: this.grfSLATecnicoLabels,
        datasets: [{
          label: 'Percentual',
          data: this.grfSLATecnicoValues,
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