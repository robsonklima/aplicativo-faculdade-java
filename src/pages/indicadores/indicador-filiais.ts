import { Component, ViewChild } from '@angular/core';
import { Chart } from 'chart.js';

@Component({
  selector: 'indicador-filiais-page',
  templateUrl: 'indicador-filiais.html'
})
export class IndicadorFiliaisPage {

  grfSLAFiliaisLabels: string[] = [];
  grfSLAFiliaisValues: number[] = [];
  @ViewChild('grfSLAFiliais') grfSLAFiliais;

  grfPendenciaFiliaisLabels: string[] = [];
  grfPendenciaFiliaisValues: number[] = [];
  @ViewChild('grfPendenciaFiliais') grfPendenciaFiliais;

  grfReincidenciaFiliaisLabels: string[] = [];
  grfReincidenciaFiliaisValues: number[] = [];
  @ViewChild('grfReincidenciaFiliais') grfReincidenciaFiliais;
  
  constructor() {}

  ionViewDidLoad() {
    this.carregarGrfSLAFiliais();
    this.carregarGrfPendenciaFiliais();
    this.carregargrfSLAReincidenciaFiliais();
  }

  private carregarGrfSLAFiliais() {
    this.grfSLAFiliaisLabels = ['FRS', 'FBA', 'FCA,', 'FSC', 'FBU'];
    this.grfSLAFiliaisValues = [90, 95, 92, 90, 87];

    this.grfSLAFiliais = new Chart(this.grfSLAFiliais.nativeElement, {
      type: 'bar',
      barChartLegend: false,
      data: {
        labels: this.grfSLAFiliaisLabels,
        datasets: [{
          label: 'Percentual',
          data: this.grfSLAFiliaisValues,
          backgroundColor: [
            'rgba(255, 0, 0, 0.2)', 'rgba(75, 192, 192, 0.2)', 'rgba(75, 192, 192, 0.2)', 
            'rgba(255, 0, 0, 0.2)', 'rgba(255, 0, 0, 0.2)'
          ],
          borderWidth: 1
        }]
      },
      options: { legend: false, scales: { yAxes: [{ ticks: { beginAtZero: true } }] } }
    });
  }

  private carregarGrfPendenciaFiliais() {
    this.grfPendenciaFiliaisLabels = ['FRS', 'FSC', 'FBU', 'FAM', 'FMA'];
    this.grfPendenciaFiliaisValues = [98, 95, 92, 80, 76];

    this.grfPendenciaFiliais = new Chart(this.grfPendenciaFiliais.nativeElement, {
      type: 'bar',
      data: {
        labels: this.grfPendenciaFiliaisLabels,
        datasets: [{
          label: 'Percentual',
          data: this.grfPendenciaFiliaisValues,
          backgroundColor: [
            'rgba(75, 192, 192, 0.2)', 'rgba(75, 192, 192, 0.2)', 'rgba(75, 192, 192, 0.2)',
            'rgba(255, 0, 0, 0.2)', 'rgba(255, 0, 0, 0.2)'
          ],
          borderWidth: 1
        }]
      },
      options: { legend: false, scales: { yAxes: [{ ticks: { beginAtZero: true } }] } }
    });
  }

  private carregargrfSLAReincidenciaFiliais() {
    this.grfReincidenciaFiliaisLabels = ['FRS', 'FSC', 'FBU', 'FAM', 'FMA'];
    this.grfReincidenciaFiliaisValues = [98, 95, 92, 80, 76];

    this.grfReincidenciaFiliais = new Chart(this.grfReincidenciaFiliais.nativeElement, {
      type: 'bar',
      data: {
        labels: this.grfReincidenciaFiliaisLabels,
        datasets: [{
          label: 'Percentual',
          data: this.grfReincidenciaFiliaisValues,
          backgroundColor: [
            'rgba(75, 192, 192, 0.2)', 'rgba(75, 192, 192, 0.2)', 'rgba(75, 192, 192, 0.2)',
            'rgba(255, 0, 0, 0.2)', 'rgba(255, 0, 0, 0.2)'
          ],
          borderWidth: 1
        }]
      },
      options: { legend: false, scales: { yAxes: [{ ticks: { beginAtZero: true } }] } }
    });
  }
}